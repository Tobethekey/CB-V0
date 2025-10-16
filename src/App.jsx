import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card } from '@/components/ui/card.jsx'
import { Loader2, Sparkles, Download } from 'lucide-react'
import './App.css'

function App() {
  const [description, setDescription] = useState('')
  const [aspectRatio, setAspectRatio] = useState('square')
  const [style, setStyle] = useState('classic')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)

  const aspectRatios = [
    { id: 'square', label: 'Square (1:1)', ratio: '1:1' },
    { id: 'portrait', label: 'Portrait (2:3)', ratio: '2:3' },
    { id: 'landscape', label: 'Landscape (3:2)', ratio: '3:2' }
  ]

  const styles = [
    { id: 'classic', label: 'Classic', description: 'Traditional coloring book style' },
    { id: 'minimalist', label: 'Minimalist', description: 'Simple and clean lines' },
    { id: 'detailed', label: 'Detailed', description: 'Intricate and complex patterns' }
  ]

  const examplePrompts = [
    "A beautiful garden with a fountain, a cute puppy playing in the park",
    "A majestic unicorn in an enchanted forest with butterflies",
    "A peaceful beach scene with palm trees and seashells",
    "A magical castle on a hill with dragons flying around"
  ]

  const handleTryExample = () => {
    const randomPrompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)]
    setDescription(randomPrompt)
  }

  const handleGenerate = async () => {
    if (!description.trim()) {
      alert('Please enter a description for your coloring book page')
      return
    }

    setIsGenerating(true)
    setGeneratedImage(null)

    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          aspectRatio,
          style
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate image')
      }

      const data = await response.json()
      setGeneratedImage(data.image)
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Failed to generate image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = 'coloring-book-page.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ColoringBook
            </h1>
          </div>
          <p className="text-sm text-muted-foreground hidden md:block">
            Bring your imagination to life
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Bring your imagination to life with ColoringBook
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ColoringBook is an app that turns text descriptions into a coloring book style,
              allowing users to bring their imagination to life.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Customize */}
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-6">Customize</h3>

              {/* Description Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Describe your coloring book style
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A beautiful garden with a fountain, a cute puppy playing in the park..."
                  className="min-h-[120px] resize-none"
                />
                <Button
                  variant="outline"
                  onClick={handleTryExample}
                  className="mt-2 w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Try an example
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Your description can be in any language, but English is likely to give the best results.
                </p>
              </div>

              {/* Aspect Ratio */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Aspect ratio</label>
                <div className="grid grid-cols-3 gap-2">
                  {aspectRatios.map((ratio) => (
                    <Button
                      key={ratio.id}
                      variant={aspectRatio === ratio.id ? 'default' : 'outline'}
                      onClick={() => setAspectRatio(ratio.id)}
                      className="h-auto py-3 flex flex-col items-center gap-2"
                    >
                      <div className={`border-2 ${
                        ratio.id === 'square' ? 'w-8 h-8' :
                        ratio.id === 'portrait' ? 'w-6 h-9' :
                        'w-9 h-6'
                      } rounded`}></div>
                      <span className="text-xs">{ratio.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {styles.map((s) => (
                    <Button
                      key={s.id}
                      variant={style === s.id ? 'default' : 'outline'}
                      onClick={() => setStyle(s.id)}
                      className="h-auto py-3"
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !description.trim()}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </Card>

            {/* Right Column - Result */}
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-6">Result</h3>

              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                {isGenerating ? (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-600" />
                    <p className="text-muted-foreground">Creating your coloring book page...</p>
                  </div>
                ) : generatedImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={generatedImage}
                      alt="Generated coloring book page"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-muted-foreground mb-2">Generated content will appear here</p>
                    <p className="text-sm text-muted-foreground">
                      Customize your inputs and click Generate
                    </p>
                  </div>
                )}
              </div>

              {generatedImage && !isGenerating && (
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full mt-4"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 ColoringBook. Create beautiful coloring pages with AI.</p>
        </div>
      </footer>
    </div>
  )
}

export default App

