'use client';

import * as React from 'react';
import { Container } from './layout';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-muted/10 mt-auto">
      <Container size="xl">
        <div className="py-14 grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <span className="text-primary-foreground font-bold text-xs">H</span>
              </div>
              <span className="text-base font-bold tracking-tight text-foreground">HALLU</span>
            </Link>
            <p className="text-[13px] text-muted-foreground/80 leading-relaxed max-w-[260px]">
              A registered digital intermediary of Allianz General Insurance Company (Malaysia) Berhad.
            </p>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">Company</h4>
            <ul className="space-y-2.5 text-[13px]">
              <li className="font-medium text-foreground">DC AUTO SERVICES</li>
              <li className="text-muted-foreground/80">SSM: 202503063833</li>
              <li className="text-muted-foreground/80 leading-relaxed">No. 12, Jalan SS 2/10,<br/>47300 Petaling Jaya, Selangor</li>
              <li className="text-muted-foreground/80">+60 12-345 6789</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">Quick Links</h4>
            <ul className="space-y-2.5 text-[13px] text-muted-foreground/80">
              <li><a href="#coverage" className="hover:text-primary transition-colors duration-200">Coverage</a></li>
              <li><a href="#how-it-works" className="hover:text-primary transition-colors duration-200">How It Works</a></li>
              <li><a href="#reviews" className="hover:text-primary transition-colors duration-200">Reviews</a></li>
              <li>
                <a href="https://hallu.com.my" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-200">
                  hallu.com.my
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">Legal</h4>
            <ul className="space-y-2.5 text-[13px] text-muted-foreground/80">
              <li><Link href="/pdpa-policy" className="hover:text-primary transition-colors duration-200">Privacy Policy</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors duration-200">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors duration-200">Contact Us</a></li>
              <li>
                <a href="https://www.allianz.com.my" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-200">
                  Allianz Direct Channel
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/30 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-muted-foreground/60">
            &copy; {currentYear} HALLU by DC AUTO SERVICES. All rights reserved.
          </p>
          <p className="text-[12px] text-muted-foreground/50">
            Regulated by Bank Negara Malaysia
          </p>
        </div>
      </Container>
    </footer>
  );
}
