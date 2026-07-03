'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageLayout, Container, Grid } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import {
  Shield, Zap, Clock, CheckCircle, ArrowRight, Star,
  Lock, FileText, ExternalLink, Building2,
  Headphones, Sparkles,
  ShieldCheck, Settings, Crown,
} from 'lucide-react';
import { DataProtectionCard } from '@/components/ui/data-protection-card';

const PACKAGES = [
  {
    icon: ShieldCheck,
    title: 'Comprehensive',
    desc: 'Full protection against accidents, theft, fire, and third-party claims — the most popular choice.',
  },
  {
    icon: Zap,
    title: 'Add-On Covers',
    desc: 'Enhance your policy with windscreen protection, flood cover, roadside assistance, and more.',
  },
  {
    icon: Crown,
    title: 'NCD Protection',
    desc: 'Keep your No Claim Discount intact even after a claim — save more on future renewals.',
  },
  {
    icon: Settings,
    title: 'Customise Your Plan',
    desc: 'Pick and choose the features that matter most to you and build a plan that fits your budget.',
  },
];

const REVIEWS = [
  {
    name: 'Sarah A.',
    role: 'Perodua Myvi Owner',
    avatar: 'S',
    quote: 'Super fast and easy! I got my cover note delivered instantly. The price comparison saved me over RM200.',
    stars: 5,
  },
  {
    name: 'Ahmad R.',
    role: 'Honda City Owner',
    avatar: 'A',
    quote: 'Best platform for car insurance. Clean interface and the process is very straightforward. Highly recommend!',
    stars: 5,
  },
  {
    name: 'Jessica L.',
    role: 'Toyota Vios Owner',
    avatar: 'J',
    quote: 'Saved RM300 on my renewal this year. The comparison tool made it so easy to find the best deal.',
    stars: 5,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [plateInput, setPlateInput] = React.useState('');

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = plateInput.trim() ? `?plate=${encodeURIComponent(plateInput.trim())}` : '';
    router.push(`/quote${params}`);
  };

  return (
    <PageLayout>
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/60 via-white to-white">
        <Container size="xl" className="relative pt-12 pb-12 md:pt-20 md:pb-20">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left — Copy */}
            <div className="space-y-6 max-w-xl">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-foreground leading-[1.1]">
                Your Trusted
                <br />
                Insurance
                <br />
                Partner
              </h1>

              <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                Renew your Allianz car insurance online. Get an instant quote, customize your coverage, and secure the best deal in minutes.
              </p>

              {/* Input + CTA */}
              <form onSubmit={handleHeroSubmit} className="flex items-center gap-0 max-w-sm">
                <input
                  type="text"
                  placeholder="Your Plate Number"
                  value={plateInput}
                  onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                  className="flex-1 h-12 rounded-l-full border border-r-0 border-border bg-background px-5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <Button type="submit" className="h-12 rounded-r-full rounded-l-none px-6 text-sm font-semibold">
                  Get A Quote
                </Button>
              </form>

              {/* Trust indicators */}
              <div className="flex items-center gap-5 pt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  Instant cover note
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  BNM regulated
                </span>
              </div>
            </div>

            {/* Right — Hero Visual */}
            <div className="relative order-first md:order-last">
              <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3]">
                <Image
                  src="/images/hero-car.jpg"
                  alt="Car owner unlocking their vehicle — protected by Allianz insurance"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Subtle gradient overlay so badges remain legible */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

                {/* 24/7 badge (bottom-right) */}
                <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-base font-bold leading-none text-foreground">24/7</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Guide Support</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Allianz Partner Strip ── */}
      <section className="border-y border-border/40 bg-muted/20">
        <Container size="xl" className="py-6">
          <div className="flex items-center justify-center gap-4">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Official Partner of</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/Allianz-logo.png" alt="Allianz General Insurance" className="h-8 w-auto object-contain" />
          </div>
        </Container>
      </section>

      {/* ── Coverage Options ── */}
      <section id="coverage" className="py-20">
        <Container size="xl">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Allianz Motor Coverage
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Comprehensive auto insurance tailored to your needs — powered by Allianz General Insurance.
            </p>
          </div>

          <Grid cols={{ default: 2, md: 2, lg: 4 }} gap={6}>
            {PACKAGES.map((pkg) => (
              <Card
                key={pkg.title}
                className="border-border/60 shadow-none hover:shadow-lg hover:border-primary/30 transition-all duration-300 group cursor-pointer"
              >
                <CardHeader className="items-center text-center pb-2">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
                    <pkg.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <CardTitle className="text-base">{pkg.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{pkg.desc}</p>
                  <Link
                    href="/quote"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    Learn More <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Container>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="bg-muted/30 border-y border-border/40 py-20">
        <Container size="xl">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              How It Works
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Renewing your insurance shouldn&apos;t take all day. Here&apos;s the process.
            </p>
          </div>

          <Grid cols={{ default: 1, md: 3 }} gap={8}>
            {[
              {
                step: '01',
                icon: FileText,
                title: 'Enter Your Details',
                desc: 'Vehicle plate number, IC, and basic info — takes about 30 seconds.',
              },
              {
                step: '02',
                icon: Shield,
                title: 'Compare Quotes',
                desc: 'See your Allianz premium, NCD discount, and available add-ons instantly.',
              },
              {
                step: '03',
                icon: CheckCircle,
                title: 'Pay & Get Covered',
                desc: 'Secure checkout via SenangPay. Receive your policy and cover note by email.',
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center space-y-4 group">
                <div className="relative mx-auto">
                  <div className="w-20 h-20 rounded-full bg-white border-2 border-border/60 flex items-center justify-center mx-auto group-hover:border-primary/50 transition-colors shadow-sm">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shadow">
                    {item.step.replace('0', '')}
                  </div>
                </div>
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </Grid>
        </Container>
      </section>

      {/* ── Data Protection ── */}
      <section className="py-20">
        <Container size="xl">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Your Data is Protected</h2>
            <p className="mt-3 text-base text-muted-foreground">We take your privacy and data security seriously.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            <DataProtectionCard />
            <div className="text-center">
              <Link href="/pdpa-policy" className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1">
                Read our full PDPA policy <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Regulatory Disclosures ── */}
      <section className="border-t border-border/40 py-20">
        <Container size="xl">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Important Disclosures</h2>
            <p className="mt-3 text-base text-muted-foreground">Regulatory compliance and transparency information.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            <Card className="border-border/60 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm font-semibold">
                  <Building2 className="w-4 h-4 mr-2 text-primary" />
                  Our Relationship &amp; Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>We are a registered digital intermediary (agent) of Allianz General Insurance Company (Malaysia) Berhad, providing product advisory, policy management, and claims assistance.</p>
                <p>
                  You may purchase directly from Allianz at{' '}
                  <a href="https://www.allianz.com.my" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                    www.allianz.com.my <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  or call 1300 22 5542.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm font-semibold">
                  <Shield className="w-4 h-4 mr-2 text-blue-600" />
                  PIDM Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                <p>
                  Benefits payable under eligible policies are protected by PIDM up to limits. Refer to{' '}
                  <a href="https://www.pidm.gov.my/en/for-public/tips-brochure" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                    PIDM TIPS Brochure <ExternalLink className="w-3 h-3" />
                  </a>{' '}or visit{' '}
                  <a href="https://www.pidm.gov.my" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.pidm.gov.my</a>.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm font-semibold">
                  <FileText className="w-4 h-4 mr-2 text-primary" />
                  Product Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="mb-3">Review these documents before purchasing:</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="/docs/allianz-motor-pds.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium inline-flex items-center gap-1.5 text-sm">
                    <FileText className="w-3.5 h-3.5" /> Product Disclosure Sheet <ExternalLink className="w-3 h-3" />
                  </a>
                  <a href="https://www.allianz.com.my/motor-comprehensive-insurance" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium inline-flex items-center gap-1.5 text-sm">
                    <FileText className="w-3.5 h-3.5" /> Policy Wording <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* ── Client Reviews ── */}
      <section id="reviews" className="bg-muted/30 border-y border-border/40 py-20">
        <Container size="xl">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Our Client Reviews
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Discover Why Our Clients Love Working With Us and Hear Their Honest Feedback.
            </p>
          </div>

          <Grid cols={{ default: 1, md: 3 }} gap={6}>
            {REVIEWS.map((r) => (
              <Card key={r.name} className="border-border/60 shadow-none hover:shadow-md transition-shadow bg-white">
                <CardContent className="pt-6">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(r.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    &ldquo;{r.quote}&rdquo;
                  </p>
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-gray-600">{r.avatar}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Container>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="bg-foreground text-background">
        <Container size="xl" className="py-20">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Ready to Renew?
            </h2>
            <p className="text-background/70 text-lg">
              Renew your Allianz motor insurance online — fast, simple, and secure.
            </p>
            <Button asChild size="lg" className="text-base px-8 h-13 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/quote">Get Your Free Quote</Link>
            </Button>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-background/50 pt-2">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> PDPA compliant</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Takes 2 minutes</span>
            </div>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
