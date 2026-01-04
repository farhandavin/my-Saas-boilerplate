
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/middleware/auth';
import { InvoiceService } from '@/services/invoiceService';

export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthUser(req);
    if (!authResult?.user || !authResult.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC: Manager or Admin only for now? Or Member can view?
    // Plan says "Manager Role". Let's restrict edits to Manager+, but viewing might be open?
    // For MVP, allow all team members to view, but only Manager/Admin to create.
    
    // Actually, invoices are financial. Maybe restrict to Manager/Admin?
    // Let's restrict to Manager/Admin for MVP to be safe.
    // UPDATE: Staff role needs access now.
    const member = authResult.user.teamMembers.find((tm: any) => tm.teamId === authResult.teamId);
    if (!member || !member.role || !['OWNER', 'ADMIN', 'MANAGER', 'STAFF'].includes(member.role)) {
       // Assuming 'OWNER' is also superadmin equivalent or part of allowed roles
       // The enum is OWNER, ADMIN, MANAGER, MEMBER.
       // So OWNER, ADMIN, MANAGER are allowed. MEMBER is not.
         return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const invoices = await InvoiceService.getInvoices(authResult.teamId);
    return NextResponse.json({ invoices });
  } catch (error: unknown) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthUser(req);
    if (!authResult?.user || !authResult.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const member = authResult.user.teamMembers.find((tm: any) => tm.teamId === authResult.teamId);
    if (!member || !member.role || !['OWNER', 'ADMIN', 'MANAGER', 'STAFF'].includes(member.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    
    // Ensure dueDate is converted to a Date object if present
    const payload = {
      ...body,
      teamId: authResult.teamId,
    };
    
    if (body.dueDate && typeof body.dueDate === 'string') {
      payload.dueDate = new Date(body.dueDate);
    }

    const invoice = await InvoiceService.createInvoice(payload);

    return NextResponse.json({ invoice });
  } catch (error: unknown) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
