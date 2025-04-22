import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import WorkFlow from "./WorkFlow"

export function PlatformSection() {
  const platformFeatures = [
    {
      title: "Disease Overview",
      description: "Understand disease biology, risks, and treatment protocols.",
      href: "/disease-overview",
    },
    {
      title: "Competitive Landscape",
      description: "Explore key players, product portfolios, and opportunities.",
      href: "/competitive-landscape",
    },
    {
      title: "Price Prediction",
      description: "Analyze clinical programs and discover key innovators.",
      href: "/price-prediction",
    },
    {
      title: "Formulary Analysis",
      description: "Review insurance coverage and preferred medications.",
      href: "/formulary",
    },
    {
      title: "R&D Formulations",
      description: "Analyze ingredients and uncover new therapeutic applications.",
      href: "/bio-formulate",
    },
  ]

  return (
    <section id="platform" className="py-20 bg-gradient-to-br from-primary/90 to-primary/70 text-black">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Our Platform</h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            A comprehensive suite of tools to accelerate pharmaceutical research, development, and market access
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 items-center mb-16">
          <div>
            <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-xl">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-WVSvp81e1ol2oCnenXK1fpQdoI70Yj.png"
                alt="PharmaX Platform"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">PharmaX Computational Platform</h3>
            <p className="text-lg opacity-90">
              A cloud-based platform for pharmaceutical research and development, powered by AI, data science, and
              high-performance computing.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" size="lg">
                Free Trial
              </Button>
              <Button variant="outline" className="bg-transparent text-black border-white hover:bg-white/10" size="lg">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="relative mt-20 mb-10">
          <div className="min-h-screen bg-slate-50 relative mx-auto max-w-4xl">
           <WorkFlow />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {platformFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="opacity-90 mb-4">{feature.description}</p>
              <Button variant="link" className="text-black p-0" asChild>
                <a href={feature.href}>
                  Explore <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
