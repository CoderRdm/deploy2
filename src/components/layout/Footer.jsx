
import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";



export default function Footer() { 
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("bg-footer-background text-footer-foreground")}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Placement & Training Cell</h3>
            <p className="mb-4 text-sm text-footer-muted-foreground">
              Malaviya National Institute of Technology Jaipur
              <br />
              J.L.N. Marg, Jaipur - 302017
              <br />
              Rajasthan, India
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-footer-muted-foreground transition-colors hover:text-footer-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-footer-muted-foreground transition-colors hover:text-footer-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-footer-muted-foreground transition-colors hover:text-footer-foreground">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="#" className="text-footer-muted-foreground transition-colors hover:text-footer-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#home" className="text-footer-muted-foreground transition-colors hover:text-footer-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#team" className="text-footer-muted-foreground transition-colors hover:text-footer-foreground">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/#stats" className="text-footer-muted-foreground transition-colors hover:text-footer-foreground">
                  Placement Stats
                </Link>
              </li>
              <li>
                <Link href="/#process" className="text-footer-muted-foreground transition-colors hover:text-footer-foreground">
                  Placement Process
                </Link>
              </li>
              <li>
                <Link href="/#faqs" className="text-footer-muted-foreground transition-colors hover:text-footer-foreground">
                  FAQ's
                </Link>
              </li>
               <li>
                <Link href="/#dev-team" className="text-footer-muted-foreground transition-colors hover:text-footer-foreground">
                  Development Team
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-footer-muted-foreground transition-colors hover:text-footer-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="https://mnit.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-footer-muted-foreground transition-colors hover:text-footer-foreground"
                >
                  MNIT Jaipur Website
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-footer-muted-foreground">
                <strong>Phone:</strong> +91-141-2529065
              </li>
              <li className="text-footer-muted-foreground">
                <strong>Email:</strong> placements@mnit.ac.in
              </li>
              <li className="text-footer-muted-foreground">
                <strong>Prof. Rakesh Jain:</strong> +91-141-2715018, pi.tnp@mnit.ac.in
              </li>
              <li className="text-footer-muted-foreground">
                <strong>Office Hours:</strong> Monday to Friday, 9:00 AM - 5:00 PM
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-footer-muted-foreground/50 pt-6 text-center text-sm text-footer-muted-foreground">
          <p>© {currentYear} Placement & Training Cell, MNIT Jaipur. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}