'use client';

import * as React from 'react';
import { Container } from './layout';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-muted/20 mt-auto">
      <Container>
        <div className="py-12 grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-10">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">H</span>
              </div>
              <span className="text-base font-bold tracking-tight text-foreground">HALLU</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              A registered digital intermediary of Allianz General Insurance Company (Malaysia) Berhad. Renew your motor insurance online.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</h4>
            <ul className="space-y-2 text-sm">
              <li className="font-medium text-foreground">DC AUTO SERVICES</li>
              <li className="text-muted-foreground">SSM: 202503063833</li>
              <li className="text-muted-foreground">+60 12-345 6789</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/pdpa-policy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">Contact</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
          &copy; {currentYear} HALLU by DC AUTO SERVICES. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
