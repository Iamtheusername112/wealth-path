"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Circle, User, FileCheck, Wallet, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  { 
    id: 1, 
    name: "Create Account", 
    icon: User,
    description: "Sign up with your email"
  },
  { 
    id: 2, 
    name: "Verify Identity", 
    icon: FileCheck,
    description: "Complete KYC verification"
  },
  { 
    id: 3, 
    name: "Fund Account", 
    icon: Wallet,
    description: "Add funds to start"
  },
  { 
    id: 4, 
    name: "Start Investing", 
    icon: TrendingUp,
    description: "Grow your wealth"
  },
]

export function OnboardingStepper({ currentStep = 1 }) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Desktop Stepper */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 w-full h-1 bg-muted">
            <motion.div
              className="h-full bg-gradient-to-r from-navy-600 to-gold-600"
              initial={{ width: "0%" }}
              animate={{ 
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` 
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.id
              const isCurrent = currentStep === step.id
              const Icon = step.icon

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  {/* Circle with Icon */}
                  <motion.div
                    className={cn(
                      "relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                      isCompleted && "bg-gradient-to-r from-navy-600 to-gold-600 border-gold-600",
                      isCurrent && "bg-white dark:bg-background border-gold-600 shadow-lg shadow-gold-600/50",
                      !isCompleted && !isCurrent && "bg-muted border-muted-foreground/20"
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : (
                      <Icon className={cn(
                        "w-6 h-6",
                        isCurrent && "text-gold-600",
                        !isCurrent && "text-muted-foreground"
                      )} />
                    )}
                    
                    {/* Pulse animation for current step */}
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-gold-600"
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
                    )}
                  </motion.div>

                  {/* Label */}
                  <div className="mt-4 text-center max-w-[150px]">
                    <p className={cn(
                      "font-semibold text-sm mb-1",
                      isCurrent && "text-gold-600",
                      isCompleted && "text-foreground",
                      !isCompleted && !isCurrent && "text-muted-foreground"
                    )}>
                      {step.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden space-y-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id
          const Icon = step.icon

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                isCurrent && "border-gold-600 bg-gold-50 dark:bg-gold-950/20",
                isCompleted && "border-green-600/50 bg-green-50 dark:bg-green-950/20",
                !isCompleted && !isCurrent && "border-muted"
              )}
            >
              {/* Icon */}
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2",
                isCompleted && "bg-green-600 border-green-600",
                isCurrent && "bg-gold-600 border-gold-600",
                !isCompleted && !isCurrent && "bg-muted border-muted-foreground/20"
              )}>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <Icon className={cn(
                    "w-5 h-5",
                    isCurrent && "text-white",
                    !isCurrent && "text-muted-foreground"
                  )} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className={cn(
                  "font-semibold",
                  isCurrent && "text-gold-700 dark:text-gold-400"
                )}>
                  Step {step.id}: {step.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>

              {/* Status Badge */}
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs bg-green-600 text-white px-2 py-1 rounded-full font-semibold"
                >
                  Done
                </motion.div>
              )}
              {isCurrent && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-xs bg-gold-600 text-white px-2 py-1 rounded-full font-semibold"
                >
                  Current
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Progress Percentage */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-muted-foreground mb-2">
          Overall Progress
        </p>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-navy-600 to-gold-600"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {Math.round((currentStep / steps.length) * 100)}% Complete
        </p>
      </motion.div>
    </div>
  )
}

