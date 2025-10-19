import { SignUp } from "@clerk/nextjs"
import { OnboardingStepper } from "@/components/onboarding-stepper"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Onboarding Stepper */}
      <OnboardingStepper currentStep={1} />
      
      <div className="flex items-center justify-center pb-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-navy-700 to-gold-600 bg-clip-text text-transparent mb-2">
              Welcome to CapitalPath
            </h1>
            <p className="text-muted-foreground">
              Create your account to start your financial journey
            </p>
          </div>
          <SignUp 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-xl border-2 border-gold-600/20"
              }
            }}
            afterSignUpUrl="/kyc"
            redirectUrl="/kyc"
          />
        </div>
      </div>
    </div>
  )
}
