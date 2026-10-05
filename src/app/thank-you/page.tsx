'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AllianzLogo } from '@/components/ui/allianz-logo';
import { PageLayout, CenteredLayout } from '@/components/ui/layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Home, Info, ExternalLink, Shield, Loader2, FileText, AlertTriangle } from 'lucide-react';
import type { QuotationResponse, VehicleDetailsResponse } from '@/types/allianz';
import type { InsuranceFormData } from '@/types';
import { ALLIANZ_DOCUMENTS } from '@/config/allianz-documents';

type PolicyStatus =
  | { ready: false }
  | {
      ready: true;
      contractNumber: string;
      policyNumber: string | null;
      status: 'SUCCESS' | 'FAILED';
      pdfAvailable: boolean;
      receivedAt: string;
    };

const POLL_INTERVAL_MS = 30_000;
const MAX_POLL_DURATION_MS = 10 * 60_000;

export default function ThankYouPage() {
  const router = useRouter();
  const [quotation, setQuotation] = React.useState<QuotationResponse | null>(null);
  const [vehicleDetails, setVehicleDetails] = React.useState<VehicleDetailsResponse | null>(null);
  const [formData, setFormData] = React.useState<InsuranceFormData | null>(null);
  const [policyStatus, setPolicyStatus] = React.useState<PolicyStatus>({ ready: false });
  const [polling, setPolling] = React.useState(true);

  // ── Load session data ──────────────────────────────────────────
  React.useEffect(() => {
    const storedQuotation = sessionStorage.getItem('allianz_quotation');
    const storedVehicle = sessionStorage.getItem('allianz_vehicleDetails');
    const storedForm = sessionStorage.getItem('insuranceFormData');
    if (storedQuotation) setQuotation(JSON.parse(storedQuotation));
    if (storedVehicle) setVehicleDetails(JSON.parse(storedVehicle));
    if (storedForm) setFormData(JSON.parse(storedForm));
  }, []);

  // ── Poll for policy readiness ──────────────────────────────────
  React.useEffect(() => {
    const contractNumber = quotation?.contract?.contractNumber;
    const accessToken = sessionStorage.getItem('policyAccessToken');
    if (!contractNumber || !accessToken) {
      setPolling(false);
      return;
    }

    let cancelled = false;
    const startTime = Date.now();
    const policyToken = accessToken;

    async function checkStatus() {
      try {
        const res = await fetch(
          `/api/policy/${contractNumber}?token=${encodeURIComponent(policyToken)}`,
        );
        if (!res.ok) return;
        const data: PolicyStatus = await res.json();
        if (cancelled) return;

        if (data.ready) {
          setPolicyStatus(data);
          setPolling(false);
          return;
        }

        if (Date.now() - startTime > MAX_POLL_DURATION_MS) {
          setPolling(false);
          return;
        }
      } catch {
        // Silently retry on network errors
      }
    }

    checkStatus();
    const interval = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [quotation?.contract?.contractNumber]);

  const grandTotal = React.useMemo(() => {
    if (!quotation) return 0;
    return quotation.premium.premiumDueRounded;
  }, [quotation]);

  const policyReady = policyStatus.ready && policyStatus.status === 'SUCCESS';
  const policyFailed = policyStatus.ready && policyStatus.status === 'FAILED';
  const pdfAvailable = policyReady && policyStatus.pdfAvailable;
  const pdfDownloadUrl = pdfAvailable
    ? (() => {
        const token = sessionStorage.getItem('policyAccessToken');
        const cn = quotation?.contract?.contractNumber;
        if (!token || !cn) return null;
        return `/api/policy/${cn}/pdf?token=${encodeURIComponent(token)}`;
      })()
    : null;

  return (
    <PageLayout>
      <CenteredLayout maxWidth="max-w-lg">
        {/* ── Header ── */}
        <div className="text-center mb-10">
          <AllianzLogo className="mb-6" />
          <div
            className="w-18 h-18 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100/50"
            style={{ width: '4.5rem', height: '4.5rem' }}
          >
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
            Payment successful
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed max-w-md mx-auto">
            Your motor insurance is being processed. Allianz will email your e-Policy and payment acknowledgement to{' '}
            <span className="font-medium text-foreground">{formData?.email || 'your registered email'}</span>{' '}
            within 24 hours.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-3">
            Your e-Policy PDF is encrypted with the last 6 digits of your NRIC/Old IC/Passport No. as the password.
          </p>
        </div>

        <Card className="border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-base">Policy summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ── Policy details ── */}
            {quotation && (
              <div className="p-5 bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl space-y-2.5 text-sm border border-border/30">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insurer</span>
                  <span className="font-medium">Allianz General Insurance</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contract No.</span>
                  <span className="font-medium font-mono text-xs">{quotation.contract.contractNumber}</span>
                </div>
                {policyReady && policyStatus.policyNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Policy No.</span>
                    <span className="font-medium font-mono text-xs">{policyStatus.policyNumber}</span>
                  </div>
                )}
                {vehicleDetails && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vehicle</span>
                      <span className="font-medium">{vehicleDetails.vehicleLicenseId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coverage Period</span>
                      <span className="font-medium text-xs">
                        {vehicleDetails.polEffectiveDate} to {vehicleDetails.polExpiryDate}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-3 border-t border-border/40">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="font-serif font-bold text-lg text-primary">RM {grandTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* ── Policy Document Status ── */}
            {policyFailed ? (
              <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-900">Policy issuance issue</h4>
                    <p className="text-xs text-red-800 mt-0.5 leading-relaxed">
                      There was a problem issuing your policy. Please contact Allianz at{' '}
                      <span className="font-semibold">1-300-22-5542</span> or email{' '}
                      <a href="mailto:customer.service@allianz.com.my" className="underline">
                        customer.service@allianz.com.my
                      </a>{' '}
                      with your contract number.
                    </p>
                  </div>
                </div>
              </div>
            ) : pdfAvailable ? (
              <div className="rounded-xl border border-green-200 bg-green-50/50 p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-green-900">Your e-Policy is ready</h4>
                    <p className="text-xs text-green-800 mt-0.5 leading-relaxed">
                      Your policy document has been generated. You can download it below.
                      Allianz has also emailed a copy to your registered email.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <div className="flex items-start gap-3">
                  {polling ? (
                    <Loader2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5 animate-spin" />
                  ) : (
                    <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900">Policy is being processed</h4>
                    <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                      Your e-Policy will be ready within 24 hours. Allianz will email it to you directly.
                      {polling
                        ? ' We\u2019re checking for updates automatically.'
                        : ' You can close this page — we\u2019ll email you when it\u2019s ready.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Free Look Period ── */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Free look period</h4>
                  <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
                    You may cancel within 15 days for a full premium refund, provided no claim has been made.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Refund Policy ── */}
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-900">Refund policy</h4>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    Refunds upon cancellation are pro-rata if insured continuously for more than 12 months, or at short
                    period rates otherwise. See the{' '}
                    <a
                      href={ALLIANZ_DOCUMENTS.policyWording}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 underline hover:text-amber-900 inline-flex items-center gap-0.5"
                    >
                      Policy Wording <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* ── Download Buttons ── */}
            {pdfDownloadUrl && (
              <div className="pt-2">
                <a href={pdfDownloadUrl} download className="inline-flex w-full">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-11 text-sm border-border/40 hover:border-primary/30 transition-all duration-300"
                  >
                    <Download className="w-4 h-4 mr-3 text-primary" />
                    Download e-Policy (PDF)
                  </Button>
                </a>
              </div>
            )}

            {/* ── Contact Info ── */}
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              {pdfDownloadUrl
                ? 'Allianz has also emailed a copy of your e-Policy to your registered email.'
                : 'Your e-Policy (PDF) will be emailed to you by Allianz within 24 hours.'}{' '}
              For any inquiries, call{' '}
              <span className="font-medium">1-300-22-5542</span> or email{' '}
              <a href="mailto:customer.service@allianz.com.my" className="text-primary hover:underline">
                customer.service@allianz.com.my
              </a>
              .
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300"
              onClick={() => {
                sessionStorage.clear();
                router.push('/');
              }}
            >
              <Home className="w-4 h-4 mr-2" />
              Return to home
            </Button>
          </CardFooter>
        </Card>
      </CenteredLayout>
    </PageLayout>
  );
}
