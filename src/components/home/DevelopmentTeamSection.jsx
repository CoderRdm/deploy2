
"use client";

import Image from "next/image";
import { Github, Linkedin, Mail, Code, Palette, Server } from "lucide-react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DevelopmentTeamSection() {
  const developers = [
    {
      name: "Ridam Goyal",
      role: "Lead Developer & Backend Architect",
      image: "https://placehold.co/400x400.png?text=RG",
      dataAiHint: "developer portrait",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "2023UEE1079@MNIT.AC.IN",
      skills: ["Node.js", "React", "MongoDB", "System Design"],
      icon: Server
    },
    {
      name: "Rahul Chauhan",
      role: "Frontend Developer & UI Specialist",
      image: "https://placehold.co/400x400.png?text=FD",
      dataAiHint: "developer portrait",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "2022ucp1573@mnit.ac.in",
      skills: ["React", "Next.js", "Tailwind CSS", "TypeScript"],
      icon: Code
    },
    {
      name: "Aakash Runtani",
      role: "UI/UX Designer & Frontend",
      image: "https://placehold.co/400x400.png?text=UD",
      dataAiHint: "designer portrait",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "2022ucp1573@mnit.ac.in",
      skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
      icon: Palette
    },
  ];

  return (
    <section id="dev-team" className="bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            💻 Meet Our Team
          </div>
          <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">Development Team</h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 leading-relaxed">
            Meet the talented MNIT students who designed, developed, and maintained this placement portal 
            to serve the entire MNIT community.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {developers.map((dev, index) => (
            <Card key={index} className="group relative overflow-hidden bg-white border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative p-8 text-center">
                {/* Role Icon */}
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <dev.icon className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                
                {/* Profile Image */}
                <div className="h-32 w-32 mb-6 mx-auto overflow-hidden rounded-full border-4 border-gray-200 group-hover:border-blue-300 transition-colors">
                  <Image
                    src={dev.image}
                    alt={dev.name}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    data-ai-hint={dev.dataAiHint}
                  />
                </div>
                
                {/* Developer Info */}
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {dev.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 font-medium leading-relaxed">
                    {dev.role}
                  </CardDescription>
                </CardHeader>
                
                {/* Skills */}
                <div className="mb-6">
                  <div className="flex flex-wrap justify-center gap-2">
                    {dev.skills.slice(0, 2).map((skill, skillIndex) => (
                      <span 
                        key={skillIndex} 
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  {dev.skills.length > 2 && (
                    <p className="text-xs text-gray-500 mt-2">
                      +{dev.skills.length - 2} more skills
                    </p>
                  )}
                </div>
                
                {/* Social Links */}
                <CardFooter className="justify-center p-0 gap-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all group" 
                    asChild
                  >
                    <a href={dev.github} target="_blank" rel="noopener noreferrer" aria-label={`${dev.name}'s GitHub`}>
                      <Github className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </a>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all group" 
                    asChild
                  >
                    <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${dev.name}'s LinkedIn`}>
                      <Linkedin className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </a>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all group" 
                    asChild
                  >
                    <a href={`mailto:${dev.email}`} aria-label={`Email ${dev.name}`}>
                      <Mail className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </a>
                  </Button>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Bottom Section */}
        <div className="mt-16 text-center">
          <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Open Source Project</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              This placement portal is developed and maintained by MNIT students for MNIT students. 
              We believe in building solutions that serve our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                <Mail className="w-4 h-4 mr-2" />
                Contact Team
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
