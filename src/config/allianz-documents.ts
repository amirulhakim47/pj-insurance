/** Allianz partner document URLs (UAT-approved). */
export const ALLIANZ_DOCUMENTS = {
  pds: 'https://az.my/partner-CMCC-privatecar-PDS_ENG',
  privacyNotice: 'https://az.my/PrivacyNotice-AGIC',
  policyWording: 'https://az.my/partner-privatecar-PW_ENG',
  pidmTipsBrochure:
    'https://www.pidm.gov.my/pidm2022/files/92/92bdfcde-3534-4a29-9031-5186387623ee.pdf',
} as const;

export const AGENT_DISPLAY_NAME =
  process.env.NEXT_PUBLIC_AGENT_LEGAL_NAME ?? 'DC AUTO SERVICES (HALLU)';

/** Rahmah package — override via env if Allianz assigns a different code. */
export const RAHMAH_PACKAGE_CODE =
  process.env.NEXT_PUBLIC_RAHMAH_PACKAGE_CODE ?? 'RAHMAH';

export const RAHMAH_MAX_SUM_INSURED = 30_000;
export const RAHMAH_MAX_ENGINE_CC = 1_500;
