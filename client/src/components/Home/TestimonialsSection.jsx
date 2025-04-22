import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { QuoteIcon } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "PharmaX has transformed our R&D process. The disease overview and competitive landscape tools have helped us identify opportunities we would have otherwise missed.",
      author: "Dr. Sarah Johnson",
      role: "Director of R&D, PharmaTech Inc.",
      avatar: "/placeholder.svg",
      initials: "SJ",
    },
    {
      quote:
        "The price prediction tool is remarkably accurate. It's helped us develop more effective pricing strategies and improved our market access planning.",
      author: "Michael Chen",
      role: "VP of Market Access, BioInnovate",
      avatar: "/placeholder.svg",
      initials: "MC",
    },
    {
      quote:
        "PharmaX's formulary analysis capabilities have given us unprecedented insights into coverage trends. This has been invaluable for our commercial planning.",
      author: "Dr. Emily Rodriguez",
      role: "Commercial Strategy Lead, GlobalPharm",
      avatar: "/placeholder.svg",
      initials: "ER",
    },
    {
      quote:
        "The comprehensive data integration in PharmaX has accelerated our research timelines by at least 30%. It's become an essential tool for our team.",
      author: "Dr. James Wilson",
      role: "Chief Scientific Officer, NovaMed",
      avatar: "/placeholder.svg",
      initials: "JW",
    },
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">What Our Clients Say</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Trusted by leading pharmaceutical companies and research institutions
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-none shadow-md">
              <CardContent className="p-6">
                <QuoteIcon className="h-8 w-8 text-primary/20 mb-4" />
                <p className="text-lg mb-6 italic">{testimonial.quote}</p>
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                    <AvatarFallback>{testimonial.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
