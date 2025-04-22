import { Link } from "react-router-dom"
import { Building2, Mail, Phone, Linkedin, Twitter, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-6 w-6" />
              <span className="text-xl font-bold">PharmaX</span>
            </div>
            <p className="text-primary-foreground/80 mb-6">
              A comprehensive pharmaceutical R&D platform with market access insights.
            </p>
            <div className="flex gap-4">
              <Button size="icon" variant="ghost" className="rounded-full">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/disease-overview" className="hover:underline">
                  Disease Overview
                </Link>
              </li>
              <li>
                <Link to="/competitive-landscape" className="hover:underline">
                  Competitive Landscape
                </Link>
              </li>
              <li>
                <Link to="/price-prediction" className="hover:underline">
                  Price Prediction
                </Link>
              </li>
              <li>
                <Link to="/formulary" className="hover:underline">
                  Formulary Analysis
                </Link>
              </li>
              <li>
                <Link to="/bio-formulate" className="hover:underline">
                  R&D Formulations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:underline">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:underline">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:underline">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:underline">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Stay Updated</h3>
            <p className="text-primary-foreground/80 mb-4">
              Subscribe to our newsletter for the latest updates and insights.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button variant="secondary">Subscribe</Button>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-foreground/70" />
                <span>contact@pharmax.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-foreground/70" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-foreground/70 text-sm">&copy; {currentYear} PharmaX. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
