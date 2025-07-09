
"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, TrendingUp, Award, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HeroSection() {
  const stats = [
    { label: "Students Placed", value: "2500+", icon: Users },
    { label: "Average Package", value: "₹12.5 LPA", icon: TrendingUp },
    { label: "Highest Package", value: "₹45 LPA", icon: Award },
    { label: "Companies Visited", value: "150+", icon: Users },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                🎓 Welcome to MNIT Placement Portal
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Shape Your <span className="text-blue-600">Career</span>
                <br />
                Journey Starts Here
              </h1>
              
              <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                Join thousands of MNIT Jaipur students who have secured their dream jobs 
                through our comprehensive placement program.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold group">
                <Link href="/login" className="flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="border-gray-300 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold">
                <Link href="#about-cell">
                  Learn More
                </Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <stat.icon className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Content - MNIT Logo & Visual */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="text-center space-y-6">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/en/b/b7/Mnit_logo.png"
                  alt="MNIT Jaipur Logo"
                  width={120}
                  height={120}
                  className="mx-auto"
                />
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Malaviya National Institute of Technology
                  </h3>
                  <p className="text-lg text-blue-600 font-semibold">Jaipur, Rajasthan</p>
                  <p className="text-gray-600 mt-2">
                    Premier Technical Institute of National Importance
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 font-medium">
                    🏆 Ranked among top engineering colleges in India
                  </p>
                  <p className="text-sm text-gray-700 font-medium">
                    🌟 Excellence in placement records since decades
                  </p>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-pulse delay-1000" />
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </div>
      </div>
    </section>
  );
}
