import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ 
    hasAdminEmail: !!process.env.ADMIN_EMAIL,
    adminEmail: process.env.ADMIN_EMAIL ? 'Set (hidden for security)' : 'NOT SET',
    allEnvVars: Object.keys(process.env).filter(k => k.includes('ADMIN'))
  })
}

