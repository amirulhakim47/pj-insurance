'use client';

import * as React from 'react';
import { Container } from './layout';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30 py-12 mt-auto">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                MYDOT
              </h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Your trusted partner for seamless insurance renewals. We simplify the process so you can drive with peace of mind.
            </p>
          </div>

          {/* Company Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Company Details</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="font-medium text-foreground">MYDOT CONSULTING</li>
              <li>SSM: 202503063833</li>
              <li>Email : support@mydotconsulting.com</li>
            </ul>
          </div>

          {/* Quick Links (Optional but good for a modern footer) */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} MYDOT CONSULTING. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}

