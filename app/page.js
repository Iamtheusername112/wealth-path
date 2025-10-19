import Link from "next/link"
import { 
  ArrowRight, 
  Shield, 
  TrendingUp, 
  Wallet, 
  Globe, 
  Lock,
  BarChart3,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { currentUser } from "@clerk/nextjs/server"
import { serializeUser } from "@/lib/serialize-user"

export default async function Home() {
  const clerkUser = await currentUser()
  const user = serializeUser(clerkUser)

  const features = [
    {
      icon: Wallet,
      title: "Smart Banking",
      description: "Manage your finances with intelligent tools and real-time insights"
    },
    {
      icon: TrendingUp,
      title: "Investment Platform",
      description: "Access crypto, stocks, forex, commodities, and real estate opportunities"
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your assets are protected with military-grade encryption and KYC verification"
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Trade and manage your portfolio from anywhere in the world"
    },
    {
      icon: Lock,
      title: "Secure Transactions",
      description: "Every transaction is encrypted and verified for maximum security"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Make informed decisions with comprehensive charts and market data"
    }
  ]

  const benefits = [
    "Instant deposits and withdrawals",
    "No hidden fees or charges",
    "24/7 customer support",
    "Multi-currency support",
    "Real-time market data",
    "Portfolio diversification tools"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navbar user={user} />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-navy-700 via-navy-600 to-gold-600 bg-clip-text text-transparent">
            Your Premium Path to Financial Freedom
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the future of banking and investing. Manage your wealth, invest globally, 
            and grow your portfolio—all in one secure platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <a href="/sign-up">
                  <Button size="lg" variant="gold" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
                <a href="/sign-in">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </a>
              </>
            ) : (
              <Link href="/dashboard">
                <Button size="lg" variant="gold" className="gap-2">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A complete financial ecosystem designed for modern investors
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-gold-600 transition-all">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-gold-600 mb-4" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why Choose CapitalPath?
            </h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of smart investors who trust CapitalPath for their financial journey.
            </p>
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-gold-600 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Card className="p-8 bg-gradient-to-br from-navy-700 to-navy-900 text-white border-0">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Ready to Get Started?</CardTitle>
              <CardDescription className="text-gray-300">
                Complete KYC verification and start investing in minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-gold-600 text-white w-8 h-8 flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-white">Create Account</h4>
                  <p className="text-sm text-gray-300">Sign up with your email</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-gold-600 text-white w-8 h-8 flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-white">Complete KYC</h4>
                  <p className="text-sm text-gray-300">Verify your identity securely</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-gold-600 text-white w-8 h-8 flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-white">Start Investing</h4>
                  <p className="text-sm text-gray-300">Access global markets instantly</p>
                </div>
              </div>
              {!user && (
                <a href="/sign-up" className="block mt-6">
                  <Button variant="gold" className="w-full" size="lg">
                    Open Your Account
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 CapitalPath. All rights reserved.</p>
            <p className="text-sm mt-2">
              Secure Banking & Investment Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
