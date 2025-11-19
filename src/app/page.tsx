'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageLayout, Section, Container, Grid } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Clock, CheckCircle, ArrowRight, Star, Users, Car, Heart } from 'lucide-react';

export default function LandingPage() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-background overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        <Container className="relative pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <Badge variant="secondary" className="px-4 py-1 text-sm rounded-full">
              ✨ The #1 Insurance Platform in Malaysia
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Car Insurance Renewal, <br />
              <span className="text-primary">Made Simple & Fast</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Compare quotes from top insurers like Etiqa, Allianz, and Liberty in seconds. 
              Renew your road tax and insurance with just a few clicks.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Button asChild size="lg" className="text-lg px-8 h-14 shadow-lg shadow-primary/20">
                <Link href="/quote">
                  Get Instant Quote <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 h-14">
                <a href="#how-it-works">How it Works</a>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Instant Cover Note</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Best Price Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Stats Section */}
      <div className="border-y bg-card/50 backdrop-blur-sm">
        <Container className="py-12">
          <Grid cols={{ default: 2, md: 4 }} gap={8} className="text-center">
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-primary">50k+</h3>
              <p className="text-muted-foreground">Happy Customers</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-primary">RM 2M+</h3>
              <p className="text-muted-foreground">Claims Processed</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-primary">15+</h3>
              <p className="text-muted-foreground">Insurance Partners</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-primary">4.9/5</h3>
              <p className="text-muted-foreground">Customer Rating</p>
            </div>
          </Grid>
        </Container>
      </div>

      {/* Features Section */}
      <Section title="Why Choose Us?" subtitle="We make insurance renewal easier, faster, and cheaper.">
        <Grid cols={{ default: 1, md: 3 }} gap={6}>
          <Card className="border-none shadow-md bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Lightning Fast Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Get comparison quotes from multiple insurers in under 60 seconds. No more waiting for agents.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Secure & Reliable</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Your data is encrypted and secure. We are licensed and regulated by Bank Negara Malaysia.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Best Price Guarantee</CardTitle>
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
      <div id="how-it-works" className="bg-muted/30 py-24">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Renewing your insurance shouldn't be complicated. We've simplified it to 3 easy steps.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-primary/20 -z-10" />
            
            <Grid cols={{ default: 1, md: 3 }} gap={8}>
              <div className="relative flex flex-col items-center text-center space-y-4 bg-background p-6 rounded-xl shadow-sm border">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-2 border-4 border-background">
                  <Car className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <Badge variant="outline" className="mb-2">Step 1</Badge>
                  <h3 className="text-xl font-bold">Enter Details</h3>
                  <p className="text-muted-foreground">
                    Fill in your vehicle registration number and personal details.
                  </p>
                </div>
              </div>

              <div className="relative flex flex-col items-center text-center space-y-4 bg-background p-6 rounded-xl shadow-sm border">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-2 border-4 border-background">
                  <Clock className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <Badge variant="outline" className="mb-2">Step 2</Badge>
                  <h3 className="text-xl font-bold">Compare Quotes</h3>
                  <p className="text-muted-foreground">
                    Instantly see quotes from Allianz, Etiqa, Liberty, and more.
                  </p>
                </div>
              </div>

              <div className="relative flex flex-col items-center text-center space-y-4 bg-background p-6 rounded-xl shadow-sm border">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-2 border-4 border-background">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <Badge variant="outline" className="mb-2">Step 3</Badge>
                  <h3 className="text-xl font-bold">Pay & Insure</h3>
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
      <Section title="What People Say" subtitle="Trusted by thousands of Malaysian drivers.">
        <Grid cols={{ default: 1, md: 2, lg: 3 }} gap={6}>
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex gap-1 text-yellow-500 mb-4">
                  <Star className="fill-current w-4 h-4" />
                  <Star className="fill-current w-4 h-4" />
                  <Star className="fill-current w-4 h-4" />
                  <Star className="fill-current w-4 h-4" />
                  <Star className="fill-current w-4 h-4" />
                </div>
                <p className="mb-6 text-muted-foreground">
                  "Super fast and easy! I got my road tax delivered within 2 days. The price comparison really helped me save money."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Sarah A.</p>
                    <p className="text-xs text-muted-foreground">Insured since 2023</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <Container>
          <div className="flex flex-col items-center text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold">Ready to secure your drive?</h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl">
              Join thousands of satisfied customers and drive with peace of mind today.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 h-14 text-primary hover:text-primary">
              <Link href="/quote">
                Get Your Free Quote Now
              </Link>
            </Button>
            <p className="text-sm opacity-80">
              No credit card required for quotes. Takes less than 2 minutes.
            </p>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
