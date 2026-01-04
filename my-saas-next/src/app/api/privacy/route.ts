import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/middleware/auth';
import { maskPII, getMaskingSummary } from '@/lib/pii-masking';
import { PrivacyService } from '@/services/privacyService';
import { getErrorMessage } from '@/lib/error-utils';


// GET - Get privacy rules and test masking
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthUser(req);
    if (!authResult?.user || !authResult?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = authResult;
    const rules = await PrivacyService.getRules(teamId);

    // Map DB rules to frontend format
    const formattedRules = rules.map(r => ({
      entityType: r.name,
      pattern: r.pattern,
      sensitivity: 'high', // Use DB category or default mapping if needed
      enabled: r.isEnabled,
      maskingMethod: r.maskingMethod,
    }));

    return NextResponse.json({
      success: true,
      globalEnabled: process.env.PII_MASKING_ENABLED !== 'false', // Feature flag
      rules: formattedRules,
      stats: {
        activeRules: rules.filter(r => r.isEnabled).length,
        totalRules: rules.length,
      },
    });
  } catch (error: unknown) {
    console.error('Privacy rules fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch privacy rules', details: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// POST - Test PII masking on sample text
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthUser(req);
    if (!authResult?.user || !authResult?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Get REAL rules from DB
    const dbRules = await PrivacyService.getRules(authResult.teamId);

    // Map to PII library format
    const customRules = dbRules.map(r => ({
      entityType: r.name,
      pattern: new RegExp(r.pattern, 'g'),
      enabled: r.isEnabled ?? true,
      maskingMethod: r.maskingMethod as any // cast string to union type
    }));

    // Apply PII masking with DB rules
    const result = maskPII(text, customRules);
    const summary = getMaskingSummary(result);

    return NextResponse.json({
      success: true,
      original: text,
      masked: result.maskedText,
      entitiesFound: result.entitiesFound.map(e => ({
        entityType: e.entityType,
        masked: e.masked,
      })),
      processingTimeMs: result.processingTimeMs,
      summary,
    });
  } catch (error: unknown) {
    console.error('PII masking error:', error);
    return NextResponse.json(
      { error: 'Failed to process text', details: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// PUT - Update privacy rules
export async function PUT(req: NextRequest) {
  try {
    const authResult = await getAuthUser(req);
    if (!authResult?.user || !authResult?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();


    // Check if it's a rule update
    if (body.ruleName) {
      await PrivacyService.updateRule(authResult.teamId, body.ruleName, {
        isEnabled: body.enabled !== undefined ? body.enabled : body.isEnabled, // Handle both just in case
        maskingMethod: body.maskingMethod
      });
      return NextResponse.json({ success: true });
    }

    // Handle Global Toggle (if needed) or other put requests
    // Currently global toggle is env var, but maybe we want a DB override?
    // User requested "Real Implementation", so let's stick to Rules first.

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error('Privacy rules update error:', error);
    return NextResponse.json(
      { error: 'Failed to update privacy rules', details: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
