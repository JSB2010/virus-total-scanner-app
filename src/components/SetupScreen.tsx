"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, Key, CheckCircle } from "lucide-react"

interface SetupScreenProps {
  onComplete: () => void
}

export function SetupScreen({ onComplete }: SetupScreenProps) {
  const [apiKey, setApiKey] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!apiKey.trim()) {
      setError("Please enter your VirusTotal API key")
      return
    }

    setIsValidating(true)
    setError("")

    try {
      // In a real app, you would validate the API key here
      await new Promise((resolve) => setTimeout(resolve, 1000))

      await window.electronAPI.setStoreValue("virusTotalApiKey", apiKey)
      onComplete()
    } catch (err) {
      setError("Invalid API key. Please check and try again.")
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-100">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Key className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Setup VirusTotal API</CardTitle>
          <CardDescription>Configure your VirusTotal API key to start scanning files</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              VirusTotal provides free API access with 4 requests per minute. This is perfect for personal use and
              monitoring your downloads.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">How to get your API key:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Visit VirusTotal and create a free account</li>
                <li>Go to your profile settings</li>
                <li>Navigate to the "API Key" section</li>
                <li>Copy your personal API key</li>
                <li>Paste it below</li>
              </ol>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open("https://www.virustotal.com/gui/join-us", "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Get Your Free API Key
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">VirusTotal API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your VirusTotal API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isValidating}>
              {isValidating ? "Validating..." : "Save & Continue"}
            </Button>
          </form>

          <div className="text-xs text-muted-foreground text-center">
            Your API key is stored securely on your device and never shared.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
