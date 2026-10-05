import { cn } from '@/lib/utils';

const SIZE_CLASS = {
  /** Quote / loading / results / customer / payment / thank-you headers */
  flow: 'h-16 sm:h-20',
  /** Home “Powered by” strip */
  strip: 'h-20 sm:h-24',
} as const;

export type AllianzLogoSize = keyof typeof SIZE_CLASS;

interface AllianzLogoProps {
  size?: AllianzLogoSize;
  className?: string;
  centered?: boolean;
}

export function AllianzLogo({ size = 'flow', className, centered = true }: AllianzLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logos/Allianz-logo.png"
      alt="Allianz General Insurance"
      className={cn(
        SIZE_CLASS[size],
        'w-auto max-w-[min(100%,320px)] object-contain',
        centered && 'mx-auto',
        className,
      )}
    />
  );
}
