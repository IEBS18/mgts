import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 py-20 md:py-32">
      <div className="container relative z-10">
        <div className="grid gap-12 md:grid-cols-2 md:gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="text-[#29c4f8]">Revolutionize</span> Pharmaceutical Research & Development
            </h1>
            <p className="text-xl text-muted-foreground">
              A comprehensive pharmaceutical R&D platform with market access insights, powered by AI and data science.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Request Demo
              </Button>
            </div>
          </div>
          <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-xl">
            {/* <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jrBz6MoAEXBxaSy9Iryr7wfJjWtNlP.png"
              alt="Molecular structure visualization"
              fill
              className="object-cover"
              priority
            /> */}
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
    </section>
  )
}
