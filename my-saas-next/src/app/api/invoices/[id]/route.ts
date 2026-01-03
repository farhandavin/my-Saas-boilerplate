
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/middleware/auth';
import { InvoiceService } from '@/services/invoiceService';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await getAuthUser(req);
    if (!authResult?.user || !authResult.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // RBAC: Manager/Admin/Owner
    const member = authResult.user.teamMembers.find((tm: any) => tm.teamId === authResult.teamId);
    if (!member || !member.role || !['OWNER', 'ADMIN', 'MANAGER'].includes(member.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const invoice = await InvoiceService.getInvoiceById(id, authResult.teamId);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await getAuthUser(req);
    if (!authResult?.user || !authResult.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const member = authResult.user.teamMembers.find((tm: any) => tm.teamId === authResult.teamId);
    if (!member || !member.role || !['OWNER', 'ADMIN', 'MANAGER'].includes(member.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const invoice = await InvoiceService.updateInvoice(id, authResult.teamId, body);
    
    if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await getAuthUser(req);
    if (!authResult?.user || !authResult.teamId) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const member = authResult.user.teamMembers.find((tm: any) => tm.teamId === authResult.teamId);
    if (!member || !member.role || !['OWNER', 'ADMIN', 'MANAGER'].includes(member.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    const { id } = await params;
    const deleted = await InvoiceService.deleteInvoice(id, authResult.teamId);
    if (!deleted) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}
