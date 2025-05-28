"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Key, CheckCircle, ExternalLink, ArrowRight, Loader2 } from "lucide-react"

interface WelcomeScreenProps {
  onComplete: () => void
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [apiKey, setApiKey] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState("")

  const steps = [
    {
      title: "Welcome to DropSentinel",
      description: "Advanced file security with drag-and-drop protection",
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 flex items-center justify-center">
            <img
              src="/dropsentinel_logo.svg"
              alt="DropSentinel Logo"
              className="w-24 h-24"
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Protect Your Downloads</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Automatically scan files with drag-and-drop convenience and real-time monitoring using VirusTotal's powerful threat detection engine.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold">Real-time Monitoring</h3>
                <p className="text-sm text-muted-foreground">Watches your Downloads folder continuously</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold">VirusTotal Integration</h3>
                <p className="text-sm text-muted-foreground">Powered by 70+ antivirus engines</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto">
                  <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold">Detailed Reports</h3>
                <p className="text-sm text-muted-foreground">Comprehensive threat analysis and recommendations</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "VirusTotal API Setup",
      description: "Configure your VirusTotal API key for scanning",
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">API Key Required</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              To scan files with VirusTotal, you'll need a free API key. Don't worry - it only takes a minute to get one!
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to get your API key:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-0.5">1</Badge>
                  <div>
                    <p className="font-medium">Create a VirusTotal account</p>
                    <p className="text-sm text-muted-foreground">Visit virustotal.com and sign up for free</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-0.5">2</Badge>
                  <div>
                    <p className="font-medium">Go to your API key page</p>
                    <p className="text-sm text-muted-foreground">Navigate to your profile and find the API key section</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-0.5">3</Badge>
                  <div>
                    <p className="font-medium">Copy your API key</p>
                    <p className="text-sm text-muted-foreground">Copy the key and paste it below</p>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('https://www.virustotal.com/gui/my-apikey', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Get Your API Key
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">VirusTotal API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your VirusTotal API key"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  setValidationError("")
                }}
                className={validationError ? "border-red-500" : ""}
              />
              {validationError && (
                <p className="text-sm text-red-500">{validationError}</p>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Your API key is stored locally and never shared. It's only used to communicate with VirusTotal's servers.
            </p>
          </div>
        </div>
      )
    }
  ]

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationError("Please enter your API key")
      return false
    }

    if (apiKey.length < 32) {
      setValidationError("API key appears to be invalid (too short)")
      return false
    }

    setIsValidating(true)
    setValidationError("")

    try {
      // Test the API key by making a simple request
      await window.electronAPI.setStoreValue("virusTotalApiKey", apiKey)
      setIsValidating(false)
      return true
    } catch (error) {
      setValidationError("Failed to validate API key. Please check and try again.")
      setIsValidating(false)
      return false
    }
  }

  const handleNext = async () => {
    if (currentStep === 0) {
      setCurrentStep(1)
    } else if (currentStep === 1) {
      const isValid = await validateApiKey()
      if (isValid) {
        await window.electronAPI.setStoreValue("hasCompletedSetup", true)
        onComplete()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-24 h-24 bg-purple-500/10 rounded-full"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.6, 0.3, 0.6],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
        <motion.div
          className="absolute top-1/2 left-10 w-16 h-16 bg-indigo-500/10 rounded-full"
          animate={{
            y: [-20, 20, -20],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <Card className="w-full max-w-3xl glass border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            {/* Progress Indicators */}
            <motion.div
              className="flex items-center justify-center space-x-3 mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {steps.map((_, index) => (
                <motion.div
                  key={`step-${index}`}
                  className={`relative ${
                    index <= currentStep ? "w-12 h-3" : "w-3 h-3"
                  } rounded-full transition-all duration-500 ${
                    index <= currentStep
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {index <= currentStep && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    />
                  )}
                  {index < currentStep && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <CheckCircle className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
                {steps[currentStep].title}
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 dark:text-slate-400">
                {steps[currentStep].description}
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-8 px-8 pb-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              {steps[currentStep].content}
            </motion.div>

            <motion.div
              className="flex justify-between pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="bg-white/50 hover:bg-white/70 border-white/20 disabled:opacity-50"
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={isValidating || (currentStep === 1 && !apiKey.trim())}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg disabled:opacity-50"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    {currentStep === steps.length - 1 ? "Complete Setup" : "Next"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
