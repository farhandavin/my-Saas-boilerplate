const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createCheckoutSession = async (req, res) => {
  const { userId } = req.body; // Kita kirim ID user dari frontend

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription', // Mode langganan
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Pro Plan Subscription',
              description: 'Access to premium features',
            },
            unit_amount: 1000, // $10.00 (Dalam sen)
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      // Metadata penting untuk webhook nanti tahu siapa yang bayar
      metadata: {
        userId: userId.toString(), 
      },
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?payment=cancelled`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};