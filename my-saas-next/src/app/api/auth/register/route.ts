import { NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await AuthService.registerUser(body);
    
    return NextResponse.json({
      success: true,
      message: "Registration successful",
      data: result
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 400 }
    );
  }
}