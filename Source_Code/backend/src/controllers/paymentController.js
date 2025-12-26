// backend/src/controllers/paymentController.js
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = require("../config/prismaClient");

/**
 * HELPER: Team Ownership Validation
 * Ensures the requesting user is the 'OWNER' before allowing billing changes.
 */
const validateTeamOwner = async (userId, teamId) => {
  if (!userId || !teamId) {
    throw new Error("Invalid User ID or Team ID.");
  }

  const member = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: { userId, teamId }
    },
    include: { team: true },
  });

  if (!member || member.role !== "OWNER") {
    throw new Error("Access Denied: Only team owners can manage billing.");
  }

  return member.team;
};

/**
 * 1. CREATE CHECKOUT SESSION
 * Initiates the Stripe payment flow for subscriptions.
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { priceId, teamId, planType } = req.body;

    // Validate Input
    if (!teamId || !priceId) {
      return res.status(400).json({ error: "Missing required fields: teamId or priceId." });
    }

    // Security Check
    const team = await validateTeamOwner(userId, teamId);

    // Persistent Customer Management
    let customerId = team.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: team.name,
        metadata: { teamId: team.id },
      });
      customerId = customer.id;

      // Save Customer ID to your DB for future use
      await prisma.team.update({
        where: { id: team.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create the Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customerId,
      
      line_items: [{ price: priceId, quantity: 1 }],
      
      // Used by Webhook to identify the correct database record
      client_reference_id: team.id,

      metadata: {
        teamId: team.id,
        planType: planType || "PRO", 
      },

      success_url: `${process.env.CLIENT_URL}/dashboard/${team.slug || ''}?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard/${team.slug || ''}/billing?payment=cancelled`,
    });

    res.json({ url: session.url, id: session.id });
  } catch (error) {
    console.error("❌ Checkout Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 2. CREATE CUSTOMER PORTAL SESSION
 * Allows users to update cards, see invoices, and cancel via Stripe's UI.
 */
exports.createPortalSession = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { teamId } = req.body;

    const team = await validateTeamOwner(userId, teamId);

    if (!team.stripeCustomerId) {
      return res.status(400).json({ error: "This team has no billing history." });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: team.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/dashboard/${team.slug || ''}/billing`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Portal Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 3. CANCEL SUBSCRIPTION (Manual API call)
 * Use this if you want a custom "Cancel" button in your own UI.
 */
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { teamId } = req.body;

    const team = await validateTeamOwner(userId, teamId);

    if (!team.stripeSubscriptionId) {
      return res.status(400).json({ error: "No active subscription found." });
    }

    // cancel_at_period_end = true keeps the features active until the month ends
    await stripe.subscriptions.update(team.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({ message: "Subscription will cancel at the end of the current billing cycle." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 4. RESUME SUBSCRIPTION
 * If the user clicks "Cancel" but changes their mind before the month is over.
 */
exports.resumeSubscription = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { teamId } = req.body;

    const team = await validateTeamOwner(userId, teamId);

    if (!team.stripeSubscriptionId) {
      return res.status(400).json({ error: "No subscription record found." });
    }

    await stripe.subscriptions.update(team.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    res.json({ message: "Subscription successfully resumed." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};