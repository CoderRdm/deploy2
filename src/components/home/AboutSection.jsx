
"use client";

import { useState } from "react";
import { GraduationCap, Briefcase, Award, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function AboutSection() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  const features = [
    {
      icon: <GraduationCap className="h-10 w-10" />,
      title: "Training Programs",
      description: "Comprehensive training programs to enhance technical and soft skills of students.",
      moreContent: `MNIT offers intensive training programs including Summer Internship Programs (SIP), Electronics & ICT Academy certifications, and online hybrid courses via platforms like NASSCOM. These focus on AI, cybersecurity, Web3, embedded systems, and more—developing both technical and professional competencies.`,
    },
    {
      icon: <Briefcase className="h-10 w-10" />,
      title: "Internship Opportunities",
      description: "Facilitating internships with leading companies to provide real-world experience.",
      moreContent: `Students secure internships at organizations like DAAD WISE, MITACS, OIST, and ISRO. MNIT also enables semester-long internships with core industries and startups, including those incubated under MIIC. These roles often lead to PPOs and expose students to real-time industrial challenges.`,
    },
    {
      icon: <Award className="h-10 w-10" />,
      title: "Placement Assistance",
      description: "End-to-end placement support from resume building to interview preparation.",
      moreContent: `The TPC provides resume-building workshops, mock interviews, and domain-specific sessions. Top recruiters include Microsoft, Google, Goldman Sachs, and TATA Steel. The cell maintains a record of high placement averages with numerous PPOs and international offers.`,
    },
    {
      icon: <BookOpen className="h-10 w-10" />,
      title: "Industry Connections",
      description: "Strong network with industry partners for better placement opportunities.",
      moreContent: `MNIT’s strong ties with DRDO, BHEL, Infosys, and other firms lead to research collaborations, funded projects, and curriculum updates. Alumni from top firms serve as mentors, and departments regularly host industry experts to bridge the gap between academia and application.`,
    },
  ];

  return (
    <section id="about-cell" className="bg-background py-16"> {/* Changed ID from "team" to "about-cell" */}
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">About Placement & Training Cell</h2>
          <p className="mx-auto max-w-3xl text-muted-foreground">
            The Placement & Training Cell at MNIT Jaipur serves as a bridge between students and industry,
            facilitating career opportunities and professional development for our talented students.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <p className="mb-8 text-muted-foreground">
            The Placement & Training Cell at MNIT Jaipur is dedicated to guiding students in their career paths and
            helping them secure positions in prestigious organizations. Our cell works tirelessly to:
          </p>

          <ul className="mb-8 list-inside list-disc space-y-2 text-muted-foreground">
            <li>Organize campus recruitment drives with leading companies</li>
            <li>Conduct training sessions to enhance technical and soft skills</li>
            <li>Arrange workshops and seminars by industry experts</li>
            <li>Provide career counseling and guidance</li>
            <li>Facilitate internships and industrial training</li>
            <li>Maintain strong industry-academia relationships</li>
          </ul>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-t-4 border-t-primary rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-3 pt-5">
                <div className="mb-3 text-primary flex justify-center items-center h-16 w-16 rounded-full bg-primary/10 mx-auto">
                  {feature.icon}
                </div>
                <CardTitle className="text-center text-lg font-semibold text-card-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-muted-foreground min-h-[60px]">{feature.description}</CardDescription>
                <Button
                  onClick={() => setSelectedFeature(feature)}
                  variant="default"
                  size="sm" 
                  className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  See More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedFeature && (
          <Dialog open={true} onOpenChange={() => setSelectedFeature(null)}>
            <DialogContent className="max-w-lg rounded-lg">
              <DialogHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-primary">{selectedFeature.icon}</span>
                  <DialogTitle className="text-primary text-xl font-bold">{selectedFeature.title}</DialogTitle>
                </div>
                <DialogDescription className="text-sm text-muted-foreground">{selectedFeature.description}</DialogDescription>
              </DialogHeader>
              <div className="text-muted-foreground whitespace-pre-line pt-4 text-sm leading-relaxed">{selectedFeature.moreContent}</div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </section>
  );
}