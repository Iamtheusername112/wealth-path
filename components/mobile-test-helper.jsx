"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Tablet, Monitor, Eye, EyeOff } from "lucide-react"

export function MobileTestHelper() {
  const [isVisible, setIsVisible] = useState(false)
  const [screenSize, setScreenSize] = useState('')
  const [viewport, setViewport] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      })
      
      if (window.innerWidth < 640) {
        setScreenSize('Mobile')
      } else if (window.innerWidth < 1024) {
        setScreenSize('Tablet')
      } else {
        setScreenSize('Desktop')
      }
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 right-4 z-50 md:hidden"
        size="sm"
        variant="outline"
      >
        <Eye className="h-4 w-4 mr-2" />
        Test Mobile
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-20 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] md:hidden mobile-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Mobile Test Helper</CardTitle>
          <Button
            onClick={() => setIsVisible(false)}
            size="sm"
            variant="ghost"
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          {screenSize === 'Mobile' && <Smartphone className="h-4 w-4 text-blue-600" />}
          {screenSize === 'Tablet' && <Tablet className="h-4 w-4 text-green-600" />}
          {screenSize === 'Desktop' && <Monitor className="h-4 w-4 text-purple-600" />}
          <span className="text-sm font-medium">{screenSize} View</span>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>Viewport: {viewport.width} × {viewport.height}</p>
          <p>Device: {screenSize}</p>
        </div>

        <div className="space-y-2">
          <div className="text-xs">
            <p className="font-medium mb-1">Breakpoints:</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${viewport.width < 640 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                <span className="text-xs">Mobile (&lt; 640px)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${viewport.width >= 640 && viewport.width < 1024 ? 'bg-green-600' : 'bg-gray-300'}`} />
                <span className="text-xs">Tablet (640px - 1024px)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${viewport.width >= 1024 ? 'bg-purple-600' : 'bg-gray-300'}`} />
                <span className="text-xs">Desktop (&gt; 1024px)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="text-xs">
            <p className="font-medium mb-1">Mobile Features:</p>
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">Bottom Navigation</Badge>
              <Badge variant="outline" className="text-xs">Touch Targets</Badge>
              <Badge variant="outline" className="text-xs">Safe Areas</Badge>
              <Badge variant="outline" className="text-xs">Mobile Animations</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
