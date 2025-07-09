"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ListOrdered } from "lucide-react"; // ListOrdered is not used

const processSteps = [
  "Students register for the placement session",
  "Placement & Training (P&T) cell invites companies for internship and placement",
  "Interested companies contact P&T cell and submit JNF/INF for the profiles offered",
  "Announcement of available job offer(s) as per JNF/INF by P&T cell",
  "Company registration by the interested students",
  "Eligibility check by P&T cell as per JNF requirements",
  "Notification of eligible student list",
  "Slot allotment to the company as per availability",
  "Selection process by the company",
  "Announcement of the selection result",
];

export default function PlacementProcessSection() {
  return (
    <section id="process" className="bg-primary-foreground py-16"> {/* Use bg-muted/30 for slight differentiation */}
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">Placement Process</h2> {/* Use text-primary */}
          <p className="mx-auto max-w-3xl text-muted-foreground"> {/* Use text-muted-foreground */}
            The placement process for the session shall begin in the month of April/May every year.
            The process flow for the typical placement/internship shall be as under:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processSteps.map((step, index) => (
            <Card key={index} className="shadow-lg rounded-xl flex flex-col overflow-hidden h-full border-t-4 border-t-primary hover:shadow-xl transition-shadow duration-300"> {/* Use border-t-primary */}
              <CardHeader className="pb-3 pt-5 bg-card"> {/* Use bg-card for consistency with other cards */}
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center font-semibold"> {/* Use theme colors */}
                    {index + 1}
                  </div>
                  <CardTitle className="text-md font-semibold text-card-foreground">{/* Use text-card-foreground */}Step {index + 1}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 flex-grow">
                <p className="text-muted-foreground leading-relaxed text-sm">{step}</p> {/* Use text-muted-foreground */}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}