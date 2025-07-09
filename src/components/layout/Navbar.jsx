"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { data: session } = useSession()

  const pathname = usePathname()
  const router = useRouter()
  // This ref is crucial to prevent re-scrolling if the hash doesn't change
  const initialScrollAfterNavRef = useRef(false);

  const homepageNavLinks = [
    { name: "Home", href: "/#home" },
    { name: "Our Team", href: "/#team" },
    { name: "Placement Stats", href: "/#stats" },
    { name: "FAQ's", href: "/#faqs" },
    { name: "Contact Us", href: "/#contact" },
  ]

  // Effect to handle scroll styling for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Reset initialScrollAfterNavRef when pathname changes
  useEffect(() => {
    initialScrollAfterNavRef.current = false;
  }, [pathname]);


  // Effect to handle initial scroll to hash on page load or navigation
  useEffect(() => {
    const currentHash = typeof window !== 'undefined' ? window.location.hash : '';
    // Only attempt to scroll if on the homepage and a hash exists and hasn't been scrolled yet
    if (pathname === "/" && currentHash && !initialScrollAfterNavRef.current) {
      const targetId = currentHash.substring(1); // Remove '#'
      if (targetId) {
        // Use a small timeout to ensure the DOM is ready and calculations are accurate
        const timer = setTimeout(() => {
          const element = document.getElementById(targetId);
          if (targetId === "home") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else if (element) {
            const navbarHeight = scrolled ? 56 : 64; // Adjust based on your Navbar height
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - navbarHeight - 20; // -20 for extra padding
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
          }
          initialScrollAfterNavRef.current = true; // Mark as scrolled
        }, 100); // Small delay to allow page rendering
        return () => clearTimeout(timer); // Cleanup timeout
      }
    }
  }, [pathname, scrolled]); // Depend on pathname and scrolled (navbar height change)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Improved handleHomepageLinkClick
  const handleHomepageLinkClick = (e, fullHref) => {
    e.preventDefault(); // Prevent default link behavior
    setIsMenuOpen(false); // Close mobile menu

    const hashIndex = fullHref.indexOf("#");
    const targetId = hashIndex !== -1 ? fullHref.substring(hashIndex + 1) : "";

    // Function to perform the scroll (called after navigation or directly if on homepage)
    const scrollToTarget = () => {
      if (targetId === "home" || (targetId === "" && fullHref === "/")) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (targetId) {
        const element = document.getElementById(targetId);
        if (element) {
          const navbarHeight = scrolled ? 56 : 64; // Adjust based on your Navbar height
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navbarHeight - 20; // -20 for extra padding
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }
    };

    if (pathname === "/") {
      // If already on the homepage, just scroll
      scrollToTarget();
      // Update URL hash without causing a full page reload or re-scroll due to router.push/replace
      if (fullHref !== (window.location.pathname + window.location.hash)) {
          router.replace(fullHref, { scroll: false });
      }
    } else {
      // If not on the homepage, navigate to it first
      // Pass the hash in the state so we can pick it up in the useEffect on the homepage
      router.push(fullHref);
      // The useEffect for `pathname === "/" && currentHash` will handle the scroll
    }
  };


  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-md transition-all duration-300",
        scrolled ? "py-2" : "py-3",
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-3" onClick={() => setIsMenuOpen(false)}>
          <Image
            src="https://upload.wikimedia.org/wikipedia/en/b/b7/Mnit_logo.png?20141210203351"
            alt="MNIT Logo"
            width={40}
            height={40}
            className="h-10 w-10"
            data-ai-hint="university logo"
          />
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-semibold leading-tight">Placement & Training Cell</span>
            <span className="text-xs leading-tight">Malaviya National Institute of Technology Jaipur</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center space-x-6">
          <ul className="flex space-x-6">
            {homepageNavLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-sm font-semibold transition-colors hover:text-primary-foreground/80"
                  // Pass the full link.href to the handler
                  onClick={(e) => handleHomepageLinkClick(e, link.href)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="secondary">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>

        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="text-primary-foreground hover:bg-primary-foreground/10 focus:bg-primary-foreground/10"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "absolute left-0 right-0 bg-primary shadow-md transition-all duration-300 ease-in-out lg:hidden",
          isMenuOpen ? "max-h-[400px] opacity-100 py-2" : "max-h-0 opacity-0 overflow-hidden py-0",
        )}
      >
        <div className="container mx-auto px-4">
          <ul className="flex flex-col space-y-3 pb-2 pt-2">
            {homepageNavLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="block py-2 text-sm font-semibold transition-colors hover:text-primary-foreground/80"
                  // Pass the full link.href to the handler here too
                  onClick={(e) => handleHomepageLinkClick(e, link.href)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            {session ? (
              <>
                <li>
                  <Link
                    href="/dashboard"
                    className="block py-2 text-sm font-semibold transition-colors hover:text-primary-foreground/80"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setIsMenuOpen(false);
                    }}
                    className="block w-full py-2 text-left text-sm font-semibold text-red-400 transition-colors hover:text-red-300"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  href="/login"
                  className="block py-2 text-sm font-semibold transition-colors hover:text-primary-foreground/80"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}