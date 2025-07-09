"use client";

import React, { useState } from "react";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/hooks/use-toast";

export default function ContactSection() {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    toast({
      title: "Message Sent",
      description: "Thank you for your message. We will get back to you soon.",
    });

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <section id="contact" className="bg-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">
            Contact Us
          </h2>
          <p className="mx-auto max-w-3xl text-muted-foreground">
            Get in touch with the Training & Placement Cell for any queries or information.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          {/* Form Card */}
          <div>
            <Card className="rounded-lg shadow-lg">
              <CardHeader>
                <CardTitle className="text-primary">Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contact-section-name">Name</Label>
                    <Input
                      id="contact-section-name"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contact-section-email">Email</Label>
                    <Input
                      id="contact-section-email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contact-section-subject">Subject</Label>
                    <Input
                      id="contact-section-subject"
                      name="subject"
                      placeholder="Subject of your message"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contact-section-message">Message</Label>
                    <Textarea
                      id="contact-section-message"
                      name="message"
                      placeholder="Your message..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    aria-label="Send Message"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info + Map */}
          <div className="flex flex-col gap-8">
            {/* Contact Info */}
            <Card className="rounded-lg shadow-lg">
              <CardHeader>
                <CardTitle className="text-primary">Contact Information</CardTitle>
                <CardDescription>
                  Reach out to us through any of the following channels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="mr-3 h-5 w-5 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-card-foreground">Address</h4>
                    <p className="text-sm text-muted-foreground">
                      Training & Placement Cell
                      <br />
                      Malaviya National Institute of Technology Jaipur
                      <br />
                      JLN Marg, Jaipur- 302017
                      <br />
                      Rajasthan, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="mr-3 h-5 w-5 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-card-foreground">Phone</h4>
                    <p className="text-sm text-muted-foreground">+91-141-2529065</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="mr-3 h-5 w-5 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-card-foreground">Email</h4>
                    <p className="text-sm text-muted-foreground">
                      placements@mnit.ac.in
                      <br />
                      pi.tnp@mnit.ac.in
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card className="flex-1 rounded-lg shadow-lg">
              <CardHeader>
                <CardTitle className="text-primary">Location</CardTitle>
                <CardDescription>Find us on the map</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video overflow-hidden rounded-md">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.033878963087!2d75.8081894!3d26.8641145!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db679c77cb991%3A0x85ded1900c9828a8!2sPlacement%20and%20Training%20Cell!5e0!3m2!1sen!2sin!4v1716120444846!5m2!1sen!2sin"
                    className="w-full h-full"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}