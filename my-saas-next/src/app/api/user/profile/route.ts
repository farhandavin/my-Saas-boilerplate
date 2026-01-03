
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '@/lib/middleware/auth';
import { z } from 'zod';

// Schema for validation
const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  twoFactorEnabled: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .limit(1);

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Split name into first/last for the UI if stored as one string
    // Assuming 'name' column stores full name or just first name if last name isn't separate in older schema
    const nameParts = (userData.name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return NextResponse.json({
      firstName,
      lastName,
      email: userData.email,
      phone: userData.phone || '',
      bio: userData.bio || '',
      language: userData.language || 'en',
      timezone: userData.timezone || 'UTC',
      twoFactorEnabled: userData.twoFactorEnabled || false,
      image: userData.image,
    });
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = profileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
    }

    const { data } = result;
    const fullName = `${data.firstName} ${data.lastName || ''}`.trim();

    // Update user
    await db.update(users)
      .set({
        name: fullName,
        phone: data.phone,
        bio: data.bio,
        language: data.language,
        timezone: data.timezone,
        twoFactorEnabled: data.twoFactorEnabled,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
