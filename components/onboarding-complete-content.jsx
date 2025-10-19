"use client"

import { motion } from "framer-motion"
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { OnboardingStepper } from "./onboarding-stepper"
import Link from "next/link"
import confetti from "canvas-confetti"
import { useEffect } from "react"

export function OnboardingCompleteContent({ user }) {
  useEffect(() => {
    // Trigger confetti animation
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Show completed stepper */}
      <OnboardingStepper currentStep={4} />

      <div className="max-w-3xl mx-auto mt-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Success Icon with Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 10
            }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <CheckCircle className="w-20 h-20 text-white" />
              </div>
              <motion.div
                className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-navy-700 to-gold-600 bg-clip-text text-transparent">
              Congratulations! 🎉
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your CapitalPath account is fully set up and ready to use!
            </p>
          </motion.div>

          {/* User Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <Card className="border-2 border-gold-600/20">
              <CardContent className="p-8">
                <div className="flex flex-col items-center gap-6">
                  {(user.profileImageUrl || user.profile_image_url || user.imageUrl) && (
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gold-600 shadow-xl">
                      <img 
                        src={user.profileImageUrl || user.profile_image_url || user.imageUrl} 
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-600 to-navy-800 text-white text-3xl font-bold">' + (user.full_name?.[0] || 'U') + '</div>'
                        }}
                      />
                    </div>
                  )}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-1">{user.full_name}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-4">
                    <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold">KYC Verified</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gold-50 dark:bg-gold-950/20 border border-gold-200 dark:border-gold-800">
                      <Sparkles className="h-6 w-6 text-gold-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold">Premium Account</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/dashboard">
              <Button size="lg" variant="gold" className="gap-2">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/investments">
              <Button size="lg" variant="outline" className="gap-2">
                Explore Investments
              </Button>
            </Link>
          </motion.div>

          {/* What's Next Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 grid md:grid-cols-3 gap-6"
          >
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-semibold mb-2">Add Funds</h3>
                <p className="text-sm text-muted-foreground">
                  Deposit money to start investing
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="font-semibold mb-2">Explore Investments</h3>
                <p className="text-sm text-muted-foreground">
                  Browse crypto, stocks, forex & more
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold mb-2">Track Portfolio</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your investments in real-time
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

