import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FaqSection() {
  const faqs = [
    {
      question: "What is PharmaX?",
      answer:
        "PharmaX is a comprehensive pharmaceutical R&D platform that provides market access insights, competitive analysis, and AI-powered pricing and reimbursement intelligence. It helps pharmaceutical companies make data-driven decisions throughout the drug development lifecycle.",
    },
    {
      question: "How does PharmaX help with drug development?",
      answer:
        "PharmaX provides comprehensive disease data, competitive landscape analysis, and R&D formulation tools that help researchers identify opportunities, understand disease biology, and accelerate the drug development process. Our platform integrates data from multiple sources to provide actionable insights.",
    },
    {
      question: "What data sources does PharmaX use?",
      answer:
        "PharmaX integrates data from multiple sources including PubMed (2M+ articles), pharmaceutical patents (1M+), CDC disease indications (22K+), global drugs database (170K+), US formulary plans, clinical trials (500K+), and annual reports from pharmaceutical companies.",
    },
    {
      question: "How accurate are the price predictions?",
      answer:
        "Our price prediction models are trained on comprehensive historical data and use advanced AI algorithms to provide highly accurate forecasts. The models are continuously updated and refined as new data becomes available, ensuring the highest possible accuracy.",
    },
    {
      question: "Can PharmaX be customized for specific research needs?",
      answer:
        "Yes, PharmaX offers customization options to meet specific research requirements. Our team can work with you to tailor the platform to your specific needs, including custom data integrations, specialized analytics, and bespoke reporting.",
    },
    {
      question: "Is my data secure on the PharmaX platform?",
      answer:
        "Absolutely. PharmaX employs enterprise-grade security measures including end-to-end encryption, secure authentication, and regular security audits. We comply with industry standards and regulations to ensure your data remains protected at all times.",
    },
    {
      question: "How often is the data updated?",
      answer:
        "PharmaX data is updated on a regular schedule, with most databases refreshed daily or weekly. Critical market data and regulatory information are updated in real-time to ensure you always have access to the most current information for decision-making.",
    },
  ]

  return (
    <section id="faq" className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions about PharmaX
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
