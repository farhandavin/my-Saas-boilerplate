// src/app/api/ai/pre-check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withTeam } from '@/lib/middleware/auth';
import { PreCheckService } from '@/services/preCheckService';
import { DocumentCategory, DOCUMENT_TYPES } from '@/types/ceoDigest';
import { getErrorMessage } from '@/lib/error-utils';


// POST - Validate a document
export const POST = withTeam(
  async (req: NextRequest, context) => {
    try {
      const body = await req.json();
      const { content, documentType, category } = body;

      if (!content || !documentType || !category) {
        return NextResponse.json(
          { error: 'Content, documentType, dan category wajib diisi' },
          { status: 400 }
        );
      }

      // Validate category
      const validCategories: DocumentCategory[] = ['financial', 'legal', 'operational', 'communication'];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: `Category tidak valid. Pilih: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }

      const result = await PreCheckService.validateDocument(
        content,
        documentType,
        category as DocumentCategory
      );

      // Log pre-check activity
      // TODO: Add to audit log

      return NextResponse.json({
        success: true,
        data: result
      });
    } catch (error: unknown) {
      console.error('Pre-check error:', error);
      return NextResponse.json(
        { error: getErrorMessage(error) || 'Gagal validasi dokumen' },
        { status: 500 }
      );
    }
  }
);

// GET - Get available document types per category
export const GET = withTeam(
  async (req: NextRequest, context) => {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') as DocumentCategory | null;

    if (category) {
      return NextResponse.json({
        success: true,
        category,
        types: PreCheckService.getDocumentTypes(category)
      });
    }

    return NextResponse.json({
      success: true,
      categories: DOCUMENT_TYPES
    });
  }
);
