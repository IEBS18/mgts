import { HeroSection } from "@/components/home/HeroSection"
import { OverviewSection } from "@/components/home/OverviewSection"
import { PlatformSection } from "@/components/home/PlatformSection"
import { FaqSection } from "@/components/home/FaqSection"
import { TestimonialsSection } from "@/components/home/TestimonialsSection"
import { Footer } from "@/components/home/Footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <OverviewSection />
      <PlatformSection />
      <TestimonialsSection />
      <FaqSection />
      <Footer />
    </div>
  )
}
