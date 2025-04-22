import { Card, CardContent } from "@/components/ui/card"
import { Microscope, Users, DollarSign, FileText, Lightbulb } from "lucide-react"

export function OverviewSection() {
  const capabilities = [
    {
      icon: Microscope,
      title: "Research & Development",
      description: "Advanced tools for new drug discovery and development",
    },
    {
      icon: Users,
      title: "Competitive Analysis",
      description: "Comprehensive market access strategy and competitor insights",
    },
    {
      icon: DollarSign,
      title: "AI-Powered Pricing",
      description: "Intelligent pricing and reimbursement insights",
    },
    {
      icon: FileText,
      title: "Formulary Access",
      description: "Detailed formulary coverage and restrictions analysis",
    },
    {
      icon: Lightbulb,
      title: "Innovation Insights",
      description: "Identify emerging trends and opportunities in pharma",
    },
  ]

  const metrics = [
    { label: "Scientific Research", value: "2M+", source: "PubMed articles" },
    { label: "Patents", value: "1M+", source: "pharma-specific patents" },
    { label: "Disease Data", value: "22K+", source: "indications (CDC)" },
    { label: "Drugs Database", value: "170K+", source: "global drugs" },
    { label: "Reimbursement Data", value: "100%", source: "US formulary plan database" },
    { label: "Clinical Trials", value: "500K+", source: "trials" },
    { label: "Demographics", value: "Global", source: "Burden of Disease (GBD)" },
    { label: "Sales Data", value: "Complete", source: "Annual reports of pharma companies" },
  ]

  return (
    <section id="overview" className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">What is PharmaX?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A comprehensive pharmaceutical R&D platform with market access insights.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {capabilities.map((capability, index) => (
            <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <capability.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{capability.title}</h3>
                <p className="text-muted-foreground">{capability.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-muted rounded-xl p-8 shadow-inner">
          <h3 className="text-2xl font-bold text-center mb-10">Our Data & Metrics</h3>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center p-4 bg-background rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-primary mb-1">{metric.value}</div>
                <div className="font-medium mb-1">{metric.label}</div>
                <div className="text-sm text-muted-foreground">{metric.source}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
