import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Admin credentials - MUST be set in environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    // Credential verification
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Set admin cookie
      const cookieStore = await cookies()
      cookieStore.set('admin_token', 'admin_authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return NextResponse.json({ 
        success: true, 
        message: "Admin authenticated successfully" 
      })
    } else {
      // Invalid credentials
      return NextResponse.json({ 
        error: "Invalid email or password" 
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

