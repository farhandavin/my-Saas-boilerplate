import { NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';
import { getErrorMessage } from '@/lib/error-utils';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await AuthService.register(body);
    
    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil",
      data: result
    }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}