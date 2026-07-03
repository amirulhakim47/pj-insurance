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
  Headphones,
  ShieldCheck, Settings, Crown,
} from 'lucide-react';
import { DataProtectionCard } from '@/components/ui/data-protection-card';

const PACKAGES = [
  {
    icon: ShieldCheck,
    title: 'Comprehensive',
    desc: 'Full protection against accidents, theft, fire, and third-party claims — the most popular choice.',
    accent: 'from-orange-500/10 to-orange-600/5',
    iconColor: 'text-primary',
  },
  {
    icon: Zap,
    title: 'Add-On Covers',
    desc: 'Enhance your policy with windscreen protection, flood cover, roadside assistance, and more.',
    accent: 'from-amber-500/10 to-amber-600/5',
    iconColor: 'text-amber-600',
  },
  {
    icon: Crown,
    title: 'NCD Protection',
    desc: 'Keep your No Claim Discount intact even after a claim — save more on future renewals.',
    accent: 'from-orange-500/10 to-orange-600/5',
    iconColor: 'text-primary',
  },
  {
    icon: Settings,
    title: 'Customise Your Plan',
    desc: 'Pick and choose the features that matter most to you and build a plan that fits your budget.',
    accent: 'from-amber-500/10 to-amber-600/5',
    iconColor: 'text-amber-600',
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
      <section className="relative overflow-hidden">
        {/* Subtle textured background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,107,53,0.08),transparent)]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.015\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <Container size="xl" className="relative pt-16 pb-16 md:pt-24 md:pb-28">
          <div className="grid md:grid-cols-[1fr_1.1fr] gap-12 md:gap-20 items-center">
            {/* Right — Hero Visual (order-first on mobile) */}
            <div className="relative order-first md:order-last">
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-black/15 aspect-[4/3] ring-1 ring-black/5">
                <Image
                  src="/images/hero-car.jpg"
                  alt="Car owner unlocking their vehicle — protected by Allianz insurance"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 55vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5" />

                {/* 24/7 badge */}
                <div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 bg-white/95 backdrop-blur-md rounded-2xl px-5 py-3 shadow-xl shadow-black/10 ring-1 ring-black/5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-bold leading-none text-foreground tracking-tight">24/7</p>
                      <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">Support</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Left — Copy */}
            <div className="space-y-8 max-w-xl md:pl-2">
              <div className="space-y-5">
                <h1 className="font-serif text-[2.75rem] sm:text-[3.25rem] lg:text-[3.75rem] font-bold tracking-tight text-foreground leading-[1.08]">
                  Your Trusted
                  <br />
                  <span className="text-primary">Insurance</span>
                  <br />
                  Partner
                </h1>

                <p className="text-[17px] text-muted-foreground leading-relaxed max-w-md">
                  Renewing your premium insurance should be a moment of confidence, not paperwork. Let&apos;s make it effortless.
                </p>
              </div>

              {/* Premium Form */}
              <form onSubmit={handleHeroSubmit} className="max-w-[420px]">
                <div className="flex items-center bg-white rounded-full shadow-lg shadow-black/[0.06] ring-1 ring-border/80 focus-within:ring-2 focus-within:ring-primary/40 focus-within:shadow-xl transition-all duration-300">
                  <input
                    type="text"
                    placeholder="Enter your plate number"
                    value={plateInput}
                    onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                    className="flex-1 h-[52px] bg-transparent pl-6 pr-2 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none tracking-wide"
                  />
                  <Button type="submit" className="h-11 rounded-full px-7 text-sm font-semibold mr-1 shadow-none">
                    Get A Quote
                  </Button>
                </div>
              </form>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 text-[13px] text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600/80" />
                  Instant cover note
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600/80" />
                  BNM regulated
                </span>
                <span className="hidden sm:flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600/80" />
                  2-minute process
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Powered by Allianz ── */}
      <section className="border-y border-border/30 bg-gradient-to-r from-transparent via-muted/30 to-transparent">
        <Container size="xl" className="py-8">
          <div className="flex flex-col items-center justify-center gap-2.5">
            <span className="text-[11px] text-muted-foreground/70 font-medium uppercase tracking-[0.2em]">Powered by</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/Allianz-logo.png" alt="Allianz General Insurance" className="h-14 sm:h-16 w-auto object-contain" />
          </div>
        </Container>
      </section>

      {/* ── Coverage Options ── */}
      <section id="coverage" className="py-24">
        <Container size="xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">Coverage</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Allianz Motor Coverage
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Comprehensive auto insurance tailored to your needs — powered by Allianz General Insurance.
            </p>
          </div>

          <Grid cols={{ default: 2, md: 2, lg: 4 }} gap={6}>
            {PACKAGES.map((pkg) => (
              <Card
                key={pkg.title}
                className="relative overflow-hidden border-border/40 shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-500 group cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${pkg.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <CardHeader className="relative items-center text-center pb-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500">
                    <pkg.icon className={`w-6 h-6 ${pkg.iconColor}`} />
                  </div>
                  <CardTitle className="text-base font-semibold">{pkg.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative text-center">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{pkg.desc}</p>
                  <Link
                    href="/quote"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all duration-300"
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
      <section id="how-it-works" className="bg-muted/20 border-y border-border/30 py-24">
        <Container size="xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">Process</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              How It Works
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Renewing your insurance shouldn&apos;t take all day. Three steps to peace of mind.
            </p>
          </div>

          <Grid cols={{ default: 1, md: 3 }} gap={10}>
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
                title: 'Review Your Quote',
                desc: 'See your Allianz premium, NCD discount, and available add-ons instantly.',
              },
              {
                step: '03',
                icon: CheckCircle,
                title: 'Pay & Get Covered',
                desc: 'Secure checkout via SenangPay. Receive your policy and cover note by email.',
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center space-y-5 group">
                <div className="relative mx-auto">
                  <div className="w-20 h-20 rounded-full bg-white border border-border/40 flex items-center justify-center mx-auto group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/5 transition-all duration-500 shadow-sm">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shadow-md">
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
      <section className="py-24">
        <Container size="xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">Security</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Your Data is Protected</h2>
            <p className="mt-4 text-base text-muted-foreground">We take your privacy and data security seriously.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            <DataProtectionCard />
            <div className="text-center">
              <Link href="/pdpa-policy" className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1.5 hover:gap-2.5 transition-all duration-300">
                Read our full PDPA policy <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Regulatory Disclosures ── */}
      <section className="border-t border-border/30 py-24">
        <Container size="xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">Compliance</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Important Disclosures</h2>
            <p className="mt-4 text-base text-muted-foreground">Regulatory compliance and transparency information.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm font-semibold">
                  <Building2 className="w-4 h-4 mr-2 text-primary" />
                  Our Relationship &amp; Level of Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>DC AUTO SERVICES (HALLU) is a registered agent of Allianz General Insurance Company (Malaysia) Berhad.</p>
                <p>As a registered agent, we provide the following services to our customers:</p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Product advisory — helping you understand and choose the right motor insurance coverage</li>
                  <li>Assistance in changing or updating policy details</li>
                  <li>Claims assistance — guiding you through the claims process</li>
                </ol>
                <p>
                  Alternatively, you may also contact Allianz General Insurance directly for after-sales services at 1300 22 5542 or{' '}
                  <a href="mailto:customer.service@allianz.com.my" className="text-primary hover:underline">customer.service@allianz.com.my</a>.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm font-semibold">
                  <Headphones className="w-4 h-4 mr-2 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <div>
                  <p className="font-semibold text-foreground">Is there any after sales &amp; claims services offered to customer after insurance purchase?</p>
                  <p className="mt-1">Yes, DC AUTO SERVICES as a registered agent provides 1) product advisory, 2) assistance in changing/updating policy details, 3) claims assistance. Alternatively, you may also contact Allianz General Insurance directly for after-sales services.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Can I purchase this product direct from the insurance company?</p>
                  <p className="mt-1">
                    Yes, to purchase direct from Allianz, you may visit{' '}
                    <a href="https://www.allianz.com.my" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                      www.allianz.com.my <ExternalLink className="w-3 h-3" />
                    </a>, call 1300 22 5542, or walk in to the nearest Allianz branch.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-sm">
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

            <Card className="border-border/40 shadow-sm">
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
      <section id="reviews" className="bg-muted/15 border-y border-border/30 py-24">
        <Container size="xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">Testimonials</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Our Client Reviews
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Discover why our clients trust us with their motor insurance.
            </p>
          </div>

          <Grid cols={{ default: 1, md: 3 }} gap={6}>
            {REVIEWS.map((r) => (
              <Card key={r.name} className="border-border/40 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-500 bg-white">
                <CardContent className="pt-7 pb-6">
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(r.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary/80 text-primary/80" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-7 italic">
                    &ldquo;{r.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center flex-shrink-0 ring-1 ring-primary/10">
                      <span className="text-sm font-bold text-primary/80">{r.avatar}</span>
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
      <section className="relative bg-foreground text-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_120%,rgba(255,107,53,0.15),transparent)]" />
        <Container size="xl" className="relative py-24">
          <div className="max-w-2xl mx-auto text-center space-y-7">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Ready to Renew?
            </h2>
            <p className="text-background/60 text-lg leading-relaxed max-w-md mx-auto">
              Renew your Allianz motor insurance online — fast, simple, and secure.
            </p>
            <Button asChild size="lg" className="text-base px-9 h-13 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
              <Link href="/quote">Get Your Free Quote</Link>
            </Button>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 text-sm text-background/40 pt-3">
              <span className="flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> No credit card required</span>
              <span className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> PDPA compliant</span>
              <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Takes 2 minutes</span>
            </div>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
