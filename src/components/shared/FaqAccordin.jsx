
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_DATA } from "@/lib/constants";
import { HelpCircle } from "lucide-react";

export default function FaqAccordion() {
  return (
    <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
      {FAQ_DATA.map((faq, index) => (
        <Accordion type="single" collapsible className="w-full" key={faq.question}> 
          <AccordionItem 
            value={`item-${index}`} 
            className="border rounded-lg shadow-sm bg-card overflow-hidden hover:shadow-md transition-shadow duration-200 h-full flex flex-col" 
          >
            <AccordionTrigger className="px-6 py-4 text-left font-medium text-base hover:no-underline hover:bg-muted/30 transition-colors">
              <div className="flex items-start w-full"> 
                <HelpCircle className="h-5 w-5 mr-3 text-primary shrink-0 mt-1" /> 
                <span className="flex-1 text-card-foreground">{faq.question}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 pt-0 text-muted-foreground leading-relaxed flex-grow"> 
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
}