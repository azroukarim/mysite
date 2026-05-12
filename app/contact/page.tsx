"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  Clock,
  Headphones,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Shield,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Contact() {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const whatsappNumber = "212670965351";
    const text = `*New Message from Website*%0A%0A*Name:* ${formData.name}%0A*Email:* ${formData.email}%0A*Subject:* ${formData.subject}%0A*Message:* ${formData.message}`;
    
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  const contactInfo = [
    {
      icon: Mail,
      title: t('contact_email_us'),
      details: ["support@streamtv.com"],
      description: t('hero_desc').includes('email') ? t('hero_desc') : "Send us an email anytime",
    },
    {
      icon: Phone,
      title: t('contact_call_us'),
      details: ["+212 670965351"],
      description: language === 'fr' ? "Disponible tous les jours (Ven: 14h-00h, Autres jours: 8h-00h)" : "Available daily (Fri: 2pm-12pm, Other days: 8am-12pm)",
    },
    {
      icon: MapPin,
      title: t('contact_visit_us'),
      details: ["ifrane . maroc"],
      description: language === 'fr' ? "Venez nous dire bonjour à notre bureau" : "Come say hello at our office",
    },
    {
      icon: Clock,
      title: t('contact_working_hours'),
      details: language === 'fr' ? [
        "Lun-Jeu & Sam-Dim: 8h - 00h",
        "Vendredi: 14h - 00h"
      ] : [
        "Mon-Thu & Sat-Sun: 8am - 12pm",
        "Friday: 2pm - 12pm"
      ],
      description: t('contact_open_all_week'),
    },
  ];

  const features = [
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Get help whenever you need it",
    },
    {
      icon: MessageSquare,
      title: "Quick Response",
      description: "We reply within 2 hours",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your information is safe with us",
    },
  ];

  return (
    <div className="bg-background">
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-primary text-primary-foreground">
              {t('contact_get_in_touch')}
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              {t('contact_hear_from_you_title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('contact_desc')}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {t('contact_send_message')}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {t('contact_form_desc')}
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="name"
                          className="text-sm font-medium text-foreground"
                        >
                          {t('contact_name_label')}
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="bg-background border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="text-sm font-medium text-foreground"
                        >
                          {t('contact_email_label')}
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="bg-background border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="subject"
                        className="text-sm font-medium text-foreground"
                      >
                        {t('contact_subject_label')}
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder="How can we help you?"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="bg-background border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="message"
                        className="text-sm font-medium text-foreground"
                      >
                        {t('contact_message_label')}
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us more about your question or concern..."
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        className="bg-background border-border resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting || isSubmitted}
                      className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          {t('contact_sending_btn')}
                        </div>
                      ) : isSubmitted ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          {t('contact_sent_btn')}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          {t('contact_send_btn')}
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    {t('contact_info_title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <info.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">
                          {info.title}
                        </h3>
                        {info.details.map((detail, idx) => (
                          <p
                            key={idx}
                            className="text-sm text-muted-foreground"
                          >
                            {detail}
                          </p>
                        ))}
                        <p className="text-xs text-muted-foreground mt-1">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    {t('contact_why_contact_us')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {features.map((feature, index) => (
                    <div key={index}>
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-accent/10 rounded">
                          <feature.icon className="h-4 w-4 text-accent-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground text-sm">
                            {feature.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                      {index < features.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-6">
              FAQ
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('contact_faq_title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('contact_faq_desc')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: t('faq_q1'),
                answer: t('faq_a1'),
              },
              {
                question: t('faq_q2'),
                answer: t('faq_a2'),
              },
              {
                question: t('faq_q3'),
                answer: t('faq_a3'),
              },
              {
                question: t('faq_q4'),
                answer: t('faq_a4'),
              },
            ].map((faq, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}
