// app/api/subscription/validate/route.ts
import { NextRequest, NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({ success: true, isActive: false })
}