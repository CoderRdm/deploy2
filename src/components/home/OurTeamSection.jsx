
"use client";

import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // CardContent is not used in the provided code
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OurTeamSection() {
  const leadership = [
    {
      name: "Prof. N. P. Padhy",
      position: "Director, MNIT Jaipur",
      image: "https://placehold.co/400x400.png",
      dataAiHint: "director portrait",
      email: "director@mnit.ac.in",
    },
    {
      name: "Prof. Rakesh Jain",
      position: "Professor In-charge, Training & Placement Cell",
      image: "https://placehold.co/400x400.png",
      dataAiHint: "professor portrait",
      email: "pi.tnp@mnit.ac.in",
    },
  ];

  const facultyConveners = [
    {
      name: "Dr. Ila Sharma",
      position: "Associate Professor, Computer Science & Engg.",
      email: "isharma.cse@mnit.ac.in",
      image: "https://placehold.co/300x300.png",
      dataAiHint: "faculty portrait",
    },
    {
      name: "Dr. Sunanda Sinha",
      position: "Associate Professor, Electronics & Comm. Engg.",
      email: "ssinha.ece@mnit.ac.in",
      image: "https://placehold.co/300x300.png",
      dataAiHint: "faculty portrait",
    },
    {
      name: "Dr. Tapas Bajpai",
      position: "Assistant Professor, Electrical Engg.",
      email: "tbajpai.ee@mnit.ac.in",
      image: "https://placehold.co/300x300.png",
      dataAiHint: "faculty portrait",
    },
    {
      name: "Dr. Rohidas Gangaram Bhoi",
      position: "Assistant Professor, Mechanical Engg.",
      email: "rgbhoi.mech@mnit.ac.in",
      image: "https://placehold.co/300x300.png",
      dataAiHint: "faculty portrait",
    },
    {
      name: "Dr. Randhir Kumar Singh",
      position: "Assistant Professor, Civil Engg.",
      email: "rksingh.civil@mnit.ac.in",
      image: "https://placehold.co/300x300.png",
      dataAiHint: "faculty portrait",
    },
    {
      name: "Dr. Shridev Devji",
      position: "Assistant Professor, Chemical Engg.",
      email: "sdevji.chem@mnit.ac.in",
      image: "https://placehold.co/300x300.png",
      dataAiHint: "faculty portrait",
    },
    {
      name: "Dr. Surender Hans",
      position: "Assistant Professor, Metallurgical & Materials Engg.",
      email: "shans.meta@mnit.ac.in",
      image: "https://placehold.co/300x300.png",
      dataAiHint: "faculty portrait",
    },
    {
      name: "Dr. Vikash Kumar",
      position: "Assistant Professor, Physics",
      email: "vkumar.phy@mnit.ac.in",
      image: "https://placehold.co/300x300.png",
      dataAiHint: "faculty portrait",
    },
    {
      name: "Dr. Dhiraj Raj",
      position: "Assistant Professor, Mathematics",
      email: "draj.math@mnit.ac.in",
      image: "https://placehold.co/300x300.png",
      dataAiHint: "faculty portrait",
    },
  ];

  const studentCoordinators = [
    { 
      name: "AKASH SINDHI", 
      position: "Student Placement Coordinator", 
      image: "https://placehold.co/300x300.png",
      dataAiHint: "student portrait"
    },
    {
      name: "TALLAPUDI VENKATA SAI POOJITHA",
      position: "Student Placement Coordinator",
      image: "https://placehold.co/300x300.png",
      dataAiHint: "student portrait"
    },
    { 
      name: "KIRTI SHARMA", 
      position: "Student Placement Coordinator", 
      image: "https://placehold.co/300x300.png",
      dataAiHint: "student portrait"
    },
    {
      name: "AARYA SRIVASTAVA",
      position: "Student Placement Coordinator",
      image: "https://placehold.co/300x300.png",
      dataAiHint: "student portrait"
    },
    // Add more student coordinators as needed, ensuring dataAiHint for images
  ];

  return (
    <section id="team" className="bg-primary-foreground py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">Our Team</h2>
          <p className="mx-auto max-w-3xl text-muted-foreground">
            Meet the dedicated professionals and student volunteers who work tirelessly to create opportunities for MNIT
            Jaipur students.
          </p>
        </div>

        <div className="mb-16">
          <h3 className="mb-8 text-center text-2xl font-bold text-primary">Leadership</h3>
          <div className="grid gap-8 md:grid-cols-2">
            {leadership.map((leader, index) => (
              <Card key={index} className="overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col items-center p-6 md:flex-row md:items-start md:space-x-6">
                  <div className="mb-4 h-40 w-40 flex-shrink-0 overflow-hidden rounded-full border-4 border-primary/30 md:mb-0">
                    <Image
                      src={leader.image}
                      alt={leader.name}
                      width={160}
                      height={160}
                      className="h-full w-full object-cover"
                      data-ai-hint={leader.dataAiHint}
                    />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h4 className="text-xl font-bold text-card-foreground">{leader.name}</h4>
                    <p className="mb-2 text-primary font-medium">{leader.position}</p>
                    {leader.email && <p className="text-sm text-muted-foreground">Email: {leader.email}</p>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Tabs defaultValue="faculty" className="mx-auto max-w-6xl">
          <div className="mb-8 flex justify-center">
            <TabsList className="bg-muted">
              <TabsTrigger value="faculty" className="text-primary data-[state=active]:text-primary-foreground data-[state=active]:bg-primary font-semibold capitalize">Faculty Conveners</TabsTrigger>
              <TabsTrigger value="students" className="text-primary data-[state=active]:text-primary-foreground data-[state=active]:bg-primary font-semibold capitalize">Student Coordinators</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="faculty">
            <h3 className="mb-8 text-center text-xl font-bold text-primary">
              Department Placement Committee Conveners
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {facultyConveners.map((faculty, index) => (
                <Card key={index} className="flex flex-col items-center p-4 gap-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary/20">
                    <Image
                      src={faculty.image}
                      alt={faculty.name}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                       data-ai-hint={faculty.dataAiHint}
                    />
                  </div>
                  <div className="text-center">
                    <CardTitle className="text-md font-semibold text-card-foreground">{faculty.name}</CardTitle>
                    <CardDescription className="text-xs text-primary">{faculty.position}</CardDescription>
                    {faculty.email && (
                      <p className="text-xs text-muted-foreground mt-1">Email: {faculty.email}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="students">
            <h3 className="mb-8 text-center text-xl font-bold text-primary">
              Student Placement Coordinators
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {studentCoordinators.map((student, index) => (
                <Card key={index} className="flex flex-col items-center p-4 gap-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary/20">
                    <Image
                      src={student.image}
                      alt={student.name}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      data-ai-hint={student.dataAiHint}
                    />
                  </div>
                  <div className="text-center">
                    <CardTitle className="text-md font-semibold text-card-foreground">{student.name}</CardTitle>
                    <CardDescription className="text-xs text-primary">{student.position}</CardDescription>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}