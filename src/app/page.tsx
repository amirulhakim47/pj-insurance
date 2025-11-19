'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageLayout, Section, Container, Grid } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Clock, CheckCircle, ArrowRight, Star, Users, Car, Heart } from 'lucide-react';
import { prefixPath, getHref } from '@/lib/utils';

export default function LandingPage() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-background overflow-hidden">
        {/* Abstract Background SVGs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-20 pointer-events-none overflow-hidden">
           <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FF6B35" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.4,70.6,31.4C59,41.4,47.1,48.6,35.9,56.3C24.7,64,14.1,72.1,1.7,69.2C-10.7,66.3,-25,52.3,-38.3,41.7C-51.6,31.1,-64,23.9,-71.2,13.2C-78.4,2.5,-80.4,-11.7,-74.2,-23.2C-68,-34.7,-53.6,-43.5,-40.8,-51.1C-28,-58.7,-16.8,-65.1,-3.7,-58.7C9.4,-52.3,18.8,-33.1,30.5,-25.4" transform="translate(100 100)" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 opacity-10 pointer-events-none">
           <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FF6B35" d="M42.7,-73.4C55.9,-67.2,67.4,-57.6,75.6,-46.1C83.8,-34.6,88.7,-21.2,86.8,-8.4C84.9,4.4,76.2,16.6,67.1,27.6C58,38.6,48.5,48.4,37.9,55.7C27.3,63,15.6,67.8,2.9,62.8C-9.8,57.8,-23.5,43,-36.3,31.3C-49.1,19.6,-61,11,-65.4,-0.8C-69.8,-12.6,-66.7,-27.6,-57.8,-39.9C-48.9,-52.2,-34.2,-61.8,-19.9,-65.4C-5.6,-69,-2.8,-66.6,5.8,-72" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        
        <Container className="relative pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <Badge variant="secondary" className="px-4 py-1 text-sm rounded-full animate-in fade-in slide-in-from-bottom-4 duration-700">
              ✨ The #1 Insurance Platform in Malaysia
            </Badge>
            
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-foreground leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Car Insurance Renewal, <br />
              <span className="text-primary relative inline-block">
                 Made Simple!
                 <svg className="absolute w-full h-3 -bottom-1 left-0 text-orange-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                 </svg>
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Compare quotes from top insurers like Etiqa, Allianz, and Liberty in seconds. 
              Renew your road tax and insurance with just a few clicks.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Button asChild size="lg" className="text-lg px-8 h-14 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1">
                <Link href={getHref('/quote')}>
                  Get Instant Quote <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 h-14 bg-background/50 backdrop-blur-sm hover:bg-background">
                <a href="#how-it-works">How it Works</a>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 pt-8 text-sm text-muted-foreground animate-in fade-in duration-1000 delay-500">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/20">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span>Instant Cover Note</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/20">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span>Best Price Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/20">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </Container>

        {/* Decorative wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
            <svg className="relative block w-[calc(100%+1.3px)] h-[50px] text-card/50" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
            </svg>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-b bg-card/50 backdrop-blur-sm relative z-10">
        <Container className="py-12">
          <Grid cols={{ default: 2, md: 4 }} gap={8} className="text-center">
            <div className="space-y-2 p-4 rounded-xl hover:bg-muted/50 transition-colors">
              <h3 className="text-4xl font-extrabold text-primary">50k+</h3>
              <p className="text-muted-foreground font-medium">Happy Customers</p>
            </div>
            <div className="space-y-2 p-4 rounded-xl hover:bg-muted/50 transition-colors">
              <h3 className="text-4xl font-extrabold text-primary">RM 2M+</h3>
              <p className="text-muted-foreground font-medium">Claims Processed</p>
            </div>
            <div className="space-y-2 p-4 rounded-xl hover:bg-muted/50 transition-colors">
              <h3 className="text-4xl font-extrabold text-primary">15+</h3>
              <p className="text-muted-foreground font-medium">Insurance Partners</p>
            </div>
            <div className="space-y-2 p-4 rounded-xl hover:bg-muted/50 transition-colors">
              <h3 className="text-4xl font-extrabold text-primary">4.9/5</h3>
              <p className="text-muted-foreground font-medium">Customer Rating</p>
            </div>
          </Grid>
        </Container>
      </div>

      {/* Features Section */}
      <Section title="Why Choose Us?" subtitle="We make insurance renewal easier, faster, and cheaper." className="relative">
         {/* Background Blob */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />

        <Grid cols={{ default: 1, md: 3 }} gap={6}>
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card group">
            <CardHeader>
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-4 rotate-3 group-hover:rotate-6 transition-transform duration-300">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-xl">Lightning Fast Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Get comparison quotes from multiple insurers in under 60 seconds. No more waiting for agents.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card group">
            <CardHeader>
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4 -rotate-3 group-hover:-rotate-6 transition-transform duration-300">
                <Shield className="w-7 h-7 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Secure & Reliable</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Your data is encrypted and secure. We are licensed and regulated by Bank Negara Malaysia.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card group">
            <CardHeader>
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-4 rotate-3 group-hover:rotate-6 transition-transform duration-300">
                <Heart className="w-7 h-7 text-red-600" />
              </div>
              <CardTitle className="text-xl">Best Price Guarantee</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                We compare prices across top providers to ensure you get the best coverage at the lowest rate.
              </CardDescription>
            </CardContent>
          </Card>
        </Grid>
      </Section>

      {/* How It Works Section */}
      <div id="how-it-works" className="bg-muted/30 py-24 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
        </div>

        <Container className="relative">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-background">Simple Process</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Renewing your insurance shouldn't be complicated. We've simplified it to 3 easy steps.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent -z-10 border-t-2 border-dashed border-primary/30" />
            
            <Grid cols={{ default: 1, md: 3 }} gap={8}>
              <div className="relative flex flex-col items-center text-center space-y-6 group cursor-default">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all opacity-50" />
                    <div className="w-32 h-32 bg-background rounded-full flex items-center justify-center border-4 border-muted group-hover:border-primary transition-colors shadow-sm relative z-10">
                        <Car className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm shadow-md">1</div>
                    </div>
                </div>
                <div className="space-y-2 max-w-xs">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">Enter Details</h3>
                  <p className="text-muted-foreground">
                    Fill in your vehicle registration number and personal details.
                  </p>
                </div>
              </div>

              <div className="relative flex flex-col items-center text-center space-y-6 group cursor-default">
                 <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all opacity-50" />
                    <div className="w-32 h-32 bg-background rounded-full flex items-center justify-center border-4 border-muted group-hover:border-primary transition-colors shadow-sm relative z-10">
                        <Clock className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm shadow-md">2</div>
                    </div>
                </div>
                <div className="space-y-2 max-w-xs">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">Compare Quotes</h3>
                  <p className="text-muted-foreground">
                    Instantly see quotes from Allianz, Etiqa, Liberty, and more.
                  </p>
                </div>
              </div>

              <div className="relative flex flex-col items-center text-center space-y-6 group cursor-default">
                 <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all opacity-50" />
                    <div className="w-32 h-32 bg-background rounded-full flex items-center justify-center border-4 border-muted group-hover:border-primary transition-colors shadow-sm relative z-10">
                        <CheckCircle className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm shadow-md">3</div>
                    </div>
                </div>
                <div className="space-y-2 max-w-xs">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">Pay & Insure</h3>
                  <p className="text-muted-foreground">
                    Secure checkout and receive your policy instantly via email.
                  </p>
                </div>
              </div>
            </Grid>
          </div>
        </Container>
      </div>

      {/* Testimonials (Optional but adds credibility) */}
      <Section title="What People Say" subtitle="Trusted by thousands of Malaysian drivers." className="relative">
         <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
            <svg width="200" height="200" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
         </div>
        <Grid cols={{ default: 1, md: 2, lg: 3 }} gap={6}>
          {[
              { name: "Sarah A.", role: "Insured since 2023", quote: "Super fast and easy! I got my road tax delivered within 2 days. The price comparison really helped me save money." },
              { name: "Ahmad R.", role: "Insured since 2022", quote: "The best platform for car insurance. User interface is clean and the process is very straightforward." },
              { name: "Jessica L.", role: "Insured since 2024", quote: "Saved RM300 on my renewal this year thanks to the comparison tool. Highly recommended!" }
          ].map((t, i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm border-muted hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex gap-1 text-yellow-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                     <Star key={i} className="fill-current w-4 h-4" />
                  ))}
                </div>
                <p className="mb-6 text-muted-foreground italic">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="font-bold text-gray-600">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
         {/* Background abstract shapes */}
         <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
         <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

        <Container className="relative z-10">
          <div className="flex flex-col items-center text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold">Ready to secure your drive?</h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl">
              Join thousands of satisfied customers and drive with peace of mind today.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 h-14 text-primary hover:text-primary shadow-2xl hover:shadow-white/20 transition-all hover:-translate-y-1">
              <Link href={getHref('/quote')}>
                Get Your Free Quote Now
              </Link>
            </Button>
            <p className="text-sm opacity-80 flex items-center gap-2">
              <Shield className="w-4 h-4" /> No credit card required for quotes. Takes less than 2 minutes.
            </p>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
