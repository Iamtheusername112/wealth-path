"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Shield, Loader2, Lock, Mail, Building2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

export function AdminLoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Authentication successful. Welcome, Administrator.")
        router.push('/admin')
        router.refresh()
      } else {
        toast.error(data.error || "Invalid credentials. Access denied.")
      }
    } catch (error) {
      console.error('Admin login error:', error)
      toast.error("Authentication failed. Please verify your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md px-4">
      {/* Logo & Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-700 rounded-full flex items-center justify-center shadow-2xl">
            <Building2 className="h-10 w-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">CapitalPath</h1>
        <p className="text-gold-300 text-sm tracking-wider uppercase">
          Administrative Portal
        </p>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-2xl border-2 border-gold-600/30 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
          <CardHeader className="space-y-3 pb-6 pt-8">
            <div className="w-14 h-14 bg-gradient-to-br from-navy-600 to-navy-800 rounded-lg flex items-center justify-center mx-auto shadow-lg">
              <Shield className="h-8 w-8 text-gold-400" />
            </div>
            <CardTitle className="text-2xl text-center font-bold">
              Administrator Access
            </CardTitle>
            <CardDescription className="text-center">
              Secure authentication required
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Security Notice */}
              <div className="bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-navy-600 dark:text-navy-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-navy-700 dark:text-navy-300">
                  This area is restricted to authorized administrators only. All access attempts are logged.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Administrator Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@capitalpath.com"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  required
                  className="h-12 border-2 focus:border-gold-600"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Secure Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                  className="h-12 border-2 focus:border-gold-600"
                  autoComplete="current-password"
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold shadow-lg" 
                  disabled={loading}
                  variant="gold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      Authenticate & Access
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Secured with enterprise-grade encryption</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center mt-8"
      >
        <p className="text-sm text-white/70">
          &copy; 2025 CapitalPath. All rights reserved.
        </p>
        <p className="text-xs text-white/50 mt-2">
          Unauthorized access is prohibited and will be prosecuted
        </p>
      </motion.div>
    </div>
  )
}
