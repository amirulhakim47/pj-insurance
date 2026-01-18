'use client';

import * as React from 'react';
import { PageLayout, Container } from '@/components/ui/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, FileText, Clock, Database, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PDPAPolicyPage() {
  const sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: FileText,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            At MYDOT, we are committed to protecting your personal data and
            respecting your privacy. This Personal Data Protection Act 2010
            (PDPA) Policy explains how we collect, use, disclose, and safeguard
            your personal information when you use our insurance quotation and
            renewal services.
          </p>
          <p className="text-muted-foreground">
            This policy is designed to comply with Malaysia's Personal Data
            Protection Act 2010 (Act 709) and its regulations. By using our
            services, you acknowledge that you have read and understood this
            policy.
          </p>
        </div>
      ),
    },
    {
      id: 'data-collected',
      title: 'Personal Data We Collect',
      icon: Database,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            We collect the following types of personal data to provide you with
            insurance quotation and related services:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>
              <strong>Identity Information:</strong> Full name, NRIC number,
              passport number (if applicable)
            </li>
            <li>
              <strong>Contact Information:</strong> Email address, phone number,
              postal address, postcode
            </li>
            <li>
              <strong>Vehicle Information:</strong> Vehicle registration number,
              vehicle type, vehicle usage (e.g., e-hailing, electric vehicle)
            </li>
            <li>
              <strong>Customer Type:</strong> Individual or company information
            </li>
            <li>
              <strong>Communication Preferences:</strong> Your preferences for
              receiving communications via WhatsApp, SMS, Email, or Phone
            </li>
            <li>
              <strong>Technical Data:</strong> IP address, browser type, device
              information, and usage data when you visit our website
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'data-usage',
      title: 'How We Use Your Personal Data',
      icon: Eye,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            We use your personal data for the following purposes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>
              <strong>Insurance Quotation Services:</strong> To provide you with
              insurance quotes from our insurance partners
            </li>
            <li>
              <strong>Policy Processing:</strong> To process your insurance
              applications, renewals, and policy updates
            </li>
            <li>
              <strong>Communication:</strong> To contact you via WhatsApp,
              SMS, Email, or Phone regarding your quotations, policy renewals,
              updates, and related services
            </li>
            <li>
              <strong>Customer Service:</strong> To respond to your inquiries,
              provide customer support, and handle complaints
            </li>
            <li>
              <strong>Legal Compliance:</strong> To comply with applicable
              laws, regulations, and regulatory requirements
            </li>
            <li>
              <strong>Service Improvement:</strong> To analyze usage patterns
              and improve our services (using anonymized data where possible)
            </li>
            <li>
              <strong>Fraud Prevention:</strong> To detect and prevent fraud,
              unauthorized access, and other security threats
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'data-disclosure',
      title: 'Disclosure of Personal Data',
      icon: Users,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            We may disclose your personal data to the following parties only for
            the purposes stated in this policy:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>
              <strong>Insurance Partners:</strong> We share your information
              with our insurance partners to obtain quotations and process
              applications
            </li>
            <li>
              <strong>Service Providers:</strong> We may share data with
              third-party service providers who assist us in operating our
              platform, processing payments, and providing customer support
            </li>
            <li>
              <strong>Legal Authorities:</strong> We may disclose data when
              required by law, court orders, or regulatory authorities
            </li>
            <li>
              <strong>Business Transfers:</strong> In the event of a merger,
              acquisition, or sale of assets, your data may be transferred to
              the new entity
            </li>
          </ul>
          <p className="text-muted-foreground">
            We do not sell your personal data to third parties for marketing
            purposes. All disclosures are made in accordance with PDPA
            requirements and with appropriate safeguards in place.
          </p>
        </div>
      ),
    },
    {
      id: 'your-rights',
      title: 'Your Rights Under PDPA',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Under the Personal Data Protection Act 2010, you have the following
            rights regarding your personal data:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>
              <strong>Right to Access:</strong> You can request access to your
              personal data that we hold
            </li>
            <li>
              <strong>Right to Correction:</strong> You can request correction
              of inaccurate or incomplete personal data
            </li>
            <li>
              <strong>Right to Withdraw Consent:</strong> You can withdraw your
              consent for data processing at any time (subject to legal and
              contractual restrictions)
            </li>
            <li>
              <strong>Right to Object:</strong> You can object to the processing
              of your personal data for certain purposes
            </li>
            <li>
              <strong>Right to Data Portability:</strong> You can request a copy
              of your data in a structured, machine-readable format
            </li>
            <li>
              <strong>Right to Complain:</strong> You have the right to lodge a
              complaint with the Personal Data Protection Commissioner if you
              believe your rights have been violated
            </li>
          </ul>
          <p className="text-muted-foreground">
            To exercise any of these rights, please contact us at{' '}
            <a
              href="mailto:privacy@mydot.my"
              className="text-primary hover:underline"
            >
              privacy@mydot.my
            </a>
            . We will respond to your request within 21 days as required by PDPA.
          </p>
        </div>
      ),
    },
    {
      id: 'data-retention',
      title: 'Data Retention Period',
      icon: Clock,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            We retain your personal data only for as long as necessary to
            fulfill the purposes outlined in this policy, unless a longer
            retention period is required or permitted by law.
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>
              <strong>Active Customers:</strong> We retain your data while you
              have an active relationship with us or while you continue to use
              our services
            </li>
            <li>
              <strong>Quotation Data:</strong> Quotation data is retained for up
              to 2 years from the date of last activity
            </li>
            <li>
              <strong>Policy Data:</strong> Policy-related data is retained for
              the duration of the policy and up to 7 years after policy
              expiration (as required by insurance regulations)
            </li>
            <li>
              <strong>Legal Requirements:</strong> Some data may be retained
              longer if required by law, regulatory requirements, or for legal
              proceedings
            </li>
            <li>
              <strong>Anonymized Data:</strong> After the retention period, data
              may be anonymized and used for statistical or analytical purposes
            </li>
          </ul>
          <p className="text-muted-foreground">
            Once the retention period expires, we will securely delete or
            anonymize your personal data in accordance with our data retention
            policies.
          </p>
        </div>
      ),
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: Lock,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            We implement comprehensive security measures to protect your personal
            data from unauthorized access, disclosure, alteration, or destruction:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>
              <strong>256-bit SSL Encryption:</strong> All data transmitted
              between your device and our servers is encrypted using 256-bit SSL
              encryption, the same level of security used by banks and financial
              institutions
            </li>
            <li>
              <strong>Secure Data Storage:</strong> Your data is stored in
              encrypted databases with multiple layers of protection, including
              firewalls, intrusion detection systems, and access controls
            </li>
            <li>
              <strong>Access Controls:</strong> We limit access to personal data
              to authorized personnel only, who are bound by strict
              confidentiality obligations
            </li>
            <li>
              <strong>Regular Security Audits:</strong> We conduct regular
              security assessments and vulnerability testing to identify and
              address potential security risks
            </li>
            <li>
              <strong>Incident Response:</strong> We have procedures in place to
              detect, respond to, and recover from security incidents
            </li>
            <li>
              <strong>Employee Training:</strong> Our staff are trained on data
              protection best practices and PDPA compliance requirements
            </li>
          </ul>
          <p className="text-muted-foreground">
            While we strive to protect your personal data, no method of
            transmission over the internet or electronic storage is 100% secure.
            We cannot guarantee absolute security, but we are committed to
            maintaining the highest standards of data protection.
          </p>
        </div>
      ),
    },
  ];

  return (
    <PageLayout>
      <Container className="py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <Button
              variant="ghost"
              asChild
              className="mb-4"
            >
              <Link href="/quote">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quote Form
              </Link>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Personal Data Protection Act (PDPA) Policy
                </h1>
                <p className="text-muted-foreground mt-2">
                  Last updated: December 2024
                </p>
              </div>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="space-y-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.id} className="shadow-sm">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {section.content}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Contact Information */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
              <p className="text-muted-foreground mb-4">
                If you have any questions, concerns, or wish to exercise your
                rights under PDPA, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Email:</strong>{' '}
                  <a
                    href="mailto:privacy@kawkaw.my"
                    className="text-primary hover:underline"
                  >
                    privacy@kawkaw.my
                  </a>
                </p>
                <p>
                  <strong>Phone:</strong>{' '}
                  <a
                    href="tel:+60123456789"
                    className="text-primary hover:underline"
                  >
                    +60 12-345 6789
                  </a>
                </p>
                <p className="text-muted-foreground mt-4">
                  We are committed to protecting your privacy and will respond to
                  your inquiries promptly.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button asChild variant="outline">
              <Link href="/quote">Return to Quote Form</Link>
            </Button>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </Container>
    </PageLayout>
  );
}

