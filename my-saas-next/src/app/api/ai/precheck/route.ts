import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/middleware/auth';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { getErrorMessage } from '@/lib/error-utils';


export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthUser(req);
     if (!authResult?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, category, documentType } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Dynamic prompt based on category
    const systemPrompt = `You are an expert AI Auditor and Compliance Officer specialized in ${category} documents, specifically ${documentType}.
Your task is to validate the following document content against standard business SOPs and compliance rules for this category.

Output Format: JSON object with the following structure:
{
  "score": number (0-100),
  "overallStatus": "approved" | "needs-review" | "rejected",
  "validations": {
    "format": { "passed": boolean, "message": string },
    "consistency": { "passed": boolean, "message": string },
    "compliance": { "passed": boolean, "message": string }
  },
  "sensitiveDataFound": boolean,
  "suggestions": string[],
  "risks": [
    { "issue": string, "severity": "high"|"medium"|"low", "recommendation": string }
  ]
}

Validation Criteria:
1. Format: Is the document structure correct for a ${documentType}?
2. Consistency: Are facts/numbers consistent throughout?
3. Compliance: Does it follow standard business rules? (e.g. Invoices need proper tax details, Contracts need liability clauses)
4. Verify no critical missing information.

Content to Validate:
${content.slice(0, 10000)} // truncate to avoid token limits
`;

    // Generate validation result
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: systemPrompt,
    });

    let validationResult;
    try {
        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
        validationResult = JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse AI response", text);
        // Fallback structure
        validationResult = {
            score: 70,
            overallStatus: 'needs-review',
            validations: {
                format: { passed: true, message: "AI Analysis format error" },
                consistency: { passed: true, message: "Could not verify" },
                compliance: { passed: false, message: "Manual review recommended" }
            },
            sensitiveDataFound: false,
            suggestions: ["Please review manually - AI output parsing failed"],
            risks: []
        };
    }

    return NextResponse.json({
      success: true,
      data: validationResult
    });

  } catch (error: unknown) {
    console.error('AI Pre-Check error:', error);
    return NextResponse.json(
      { error: 'Validation failed', details: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
