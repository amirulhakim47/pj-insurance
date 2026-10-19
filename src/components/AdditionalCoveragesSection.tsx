'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  HelpCircle,
  Search,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  ADDON_TOOLTIPS,
  buildCollapsedAddonPreview,
  isPopularAddonCover,
  sortAdditionalCovers,
} from '@/config/addon-tooltips';
import {
  GAS_KIT_MAX_SI,
  WINDSCREEN_MAX_SI,
  WINDSCREEN_MIN_SI,
  formatSumInsuredInputTyping,
  formatSumInsuredThousands,
  parseSumInsuredDigits,
} from '@/lib/addon-quote';
import type { AdditionalCoverItem } from '@/types/allianz';
import { sanitizePersonNameInput } from '@/lib/validations';

const COLLAPSED_PREVIEW_COUNT = 5;
const SCROLL_MAX_HEIGHT = 'max-h-[min(28rem,55vh)]';

type FilterMode = 'all' | 'selected';

const VIEWPORT_GUTTER_PX = 16;
/** Mobile sticky Proceed bar on results page — keep tooltip above it */
const MOBILE_STICKY_FOOTER_PX = 96;
const MOBILE_BREAKPOINT_PX = 640;

const TOOLTIP_PANEL_CLASS =
  'fixed z-[200] bg-popover border border-border rounded-xl shadow-lg p-3 text-xs text-popover-foreground leading-relaxed pointer-events-auto max-h-[min(45vh,20rem)] overflow-y-auto overscroll-contain sm:w-72 sm:max-w-[calc(100vw-2rem)]';

function computeTooltipStyle(
  anchor: HTMLElement,
  popover: HTMLElement | null,
): React.CSSProperties {
  const rect = anchor.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const popH = popover?.offsetHeight ?? 120;
  const gap = 8;
  const isMobile = vw < MOBILE_BREAKPOINT_PX;

  if (isMobile) {
    const bottomLimit = vh - MOBILE_STICKY_FOOTER_PX;
    const spaceAbove = rect.top - VIEWPORT_GUTTER_PX;
    const spaceBelow = bottomLimit - rect.bottom;
    const openBelow = spaceBelow >= popH + gap || spaceBelow >= spaceAbove;
    let top = openBelow ? rect.bottom + gap : rect.top - popH - gap;
    if (openBelow) {
      top = Math.min(top, bottomLimit - popH - VIEWPORT_GUTTER_PX);
    } else {
      top = Math.max(VIEWPORT_GUTTER_PX, top);
    }
    return {
      top,
      left: VIEWPORT_GUTTER_PX,
      right: VIEWPORT_GUTTER_PX,
      width: vw - VIEWPORT_GUTTER_PX * 2,
      transform: 'none',
    };
  }

  const popW = popover?.offsetWidth ?? 288;
  const centerX = rect.left + rect.width / 2;
  const halfW = popW / 2;
  const left = Math.min(
    Math.max(centerX, VIEWPORT_GUTTER_PX + halfW),
    vw - VIEWPORT_GUTTER_PX - halfW,
  );
  const spaceAbove = rect.top;
  const spaceBelow = vh - rect.bottom;
  const openBelow = spaceBelow >= popH + gap || spaceBelow >= spaceAbove;
  let top = openBelow ? rect.bottom + gap : rect.top - popH - gap;
  top = Math.max(VIEWPORT_GUTTER_PX, Math.min(top, vh - VIEWPORT_GUTTER_PX - popH));
  return { top, left, transform: 'translateX(-50%)' };
}

function TooltipButton({ coverCode }: { coverCode: string }) {
  const [open, setOpen] = React.useState(false);
  const [tooltipStyle, setTooltipStyle] = React.useState<React.CSSProperties | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const tooltip = ADDON_TOOLTIPS[coverCode];

  const reposition = React.useCallback(() => {
    const anchor = buttonRef.current;
    if (!anchor) return;
    setTooltipStyle(computeTooltipStyle(anchor, popoverRef.current));
  }, []);

  React.useLayoutEffect(() => {
    if (!open) {
      setTooltipStyle(null);
      return;
    }
    reposition();
    const id = requestAnimationFrame(() => {
      reposition();
      requestAnimationFrame(reposition);
    });
    return () => cancelAnimationFrame(id);
  }, [open, reposition, tooltip?.text]);

  React.useEffect(() => {
    if (!open || !tooltip) return;
    reposition();
    const onScroll = () => reposition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, tooltip, reposition]);

  React.useEffect(() => {
    if (!open || !tooltip) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open, tooltip]);

  if (!tooltip) return null;

  const panel = open && tooltipStyle && (
    <div
      ref={popoverRef}
      role="tooltip"
      className={TOOLTIP_PANEL_CLASS}
      style={tooltipStyle}
    >
      {tooltip.text}
      {tooltip.link && (
        <a
          href={tooltip.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-1.5 text-primary hover:underline font-medium"
        >
          Learn more <ExternalLink className="w-2.5 h-2.5 inline" />
        </a>
      )}
    </div>
  );

  return (
    <>
      <span className="inline-block">
        <button
          ref={buttonRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className="text-muted-foreground hover:text-primary transition-colors p-0.5 rounded-sm"
          aria-label="More info about this coverage"
          aria-expanded={open}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </span>
      {typeof document !== 'undefined' && panel ? createPortal(panel, document.body) : null}
    </>
  );
}

function SumInsuredTextInput({
  label,
  hint,
  committedAmount,
  onCommit,
}: {
  label: string;
  hint: string;
  committedAmount: number;
  onCommit: (digitsOnly: string) => void;
}) {
  const [draft, setDraft] = React.useState<string | null>(null);
  const display =
    draft ?? formatSumInsuredThousands(committedAmount);

  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={display}
        onChange={(e) => setDraft(formatSumInsuredInputTyping(e.target.value))}
        onBlur={() => {
          const source = draft ?? formatSumInsuredThousands(committedAmount);
          setDraft(null);
          onCommit(String(parseSumInsuredDigits(source)));
        }}
        className="mt-1 w-full max-w-[9rem] rounded-lg border border-input px-2 py-1.5 text-xs tabular-nums"
        aria-label={label}
      />
      <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>
    </div>
  );
}

function formatAddonPrice(cover: AdditionalCoverItem, isSelected: boolean, isUpdating: boolean): string {
  if (isUpdating && isSelected) return 'Calculating…';
  if (!isSelected) {
    return cover.displayPremium > 0 ? `+ RM ${cover.displayPremium.toFixed(2)}` : '—';
  }
  if (cover.displayPremium > 0) return `+ RM ${cover.displayPremium.toFixed(2)}`;
  if (cover.displayPremium === 0 && cover.selectedIndicator) return 'FREE';
  return '—';
}

function AddonCoverRow({
  cover,
  isSelected,
  isUpdating,
  descriptionExpanded,
  onToggleDescription,
  onToggle,
  addonInputs,
  onInputChange,
  onSumInsuredCommit,
  ehailingDriver,
  onEhailingChange,
  ehailingErrors,
}: {
  cover: AdditionalCoverItem;
  isSelected: boolean;
  isUpdating: boolean;
  descriptionExpanded: boolean;
  onToggleDescription: () => void;
  onToggle: () => void;
  addonInputs: Record<string, { sumInsured?: number; cartDay?: string; cartAmount?: string; planCode?: string }>;
  onInputChange: (code: string, field: string, value: string) => void;
  onSumInsuredCommit: (code: string, rawValue: string) => void;
  ehailingDriver: { fullName: string; idNumber: string };
  onEhailingChange: (d: { fullName: string; idNumber: string }) => void;
  ehailingErrors?: { fullName?: string; idNumber?: string };
}) {
  const inputs = addonInputs[cover.coverCode];
  const isPopular = isPopularAddonCover(cover);
  const hasDescription = Boolean(cover.coverDescription?.trim());

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        isSelected
          ? 'border-primary/60 bg-primary/[0.04] shadow-sm'
          : 'border-border/50 bg-card hover:border-primary/25'
      } ${isUpdating ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start gap-2 p-3 sm:p-3.5">
        <button
          type="button"
          onClick={onToggle}
          disabled={isUpdating}
          aria-pressed={isSelected}
          aria-label={`${isSelected ? 'Remove' : 'Add'} ${cover.coverName}`}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/35 hover:border-primary/50'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
        </button>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-medium text-sm leading-snug">{cover.coverName}</span>
                <TooltipButton coverCode={cover.coverCode} />
                {isPopular && (
                  <span className="text-[10px] uppercase tracking-wide font-semibold text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                    Popular
                  </span>
                )}
              </div>
              {hasDescription && (
                <button
                  type="button"
                  onClick={onToggleDescription}
                  className="text-[11px] text-primary font-medium hover:underline mt-0.5"
                >
                  {descriptionExpanded ? 'Hide details' : 'View details'}
                </button>
              )}
            </div>
            <span
              className={`text-sm font-semibold flex-shrink-0 tabular-nums ${
                cover.displayPremium === 0 && isSelected && !isUpdating ? 'text-green-600' : 'text-foreground'
              }`}
            >
              {formatAddonPrice(cover, isSelected, isUpdating)}
            </span>
          </div>

          {descriptionExpanded && hasDescription && (
            <p className="text-xs text-muted-foreground leading-relaxed pr-2">{cover.coverDescription}</p>
          )}

          {isSelected && (
            <div className="pt-2 space-y-2 border-t border-border/40 mt-2" onClick={(e) => e.stopPropagation()}>
              {cover.coverCode === 'PAB-ERW' && (
                <div>
                  <label className="text-xs text-muted-foreground">Car replacement days</label>
                  <select
                    value={inputs?.planCode || 'PABERWA'}
                    onChange={(e) => onInputChange(cover.coverCode, 'planCode', e.target.value)}
                    className="mt-1 w-full max-w-xs rounded-lg border border-input px-2 py-1.5 text-xs bg-background"
                  >
                    <option value="PABERWA">Plan A — 5 days</option>
                    <option value="PABERWB">Plan B — 6 days</option>
                    <option value="PABERWC">Plan C — 7 days</option>
                  </select>
                </div>
              )}

              {cover.coverCode === '89' && (
                <SumInsuredTextInput
                  label="Windscreen sum insured (RM)"
                  hint={`RM ${formatSumInsuredThousands(WINDSCREEN_MIN_SI)}–${formatSumInsuredThousands(WINDSCREEN_MAX_SI)}`}
                  committedAmount={
                    inputs?.sumInsured ?? cover.coverSumInsured ?? WINDSCREEN_MIN_SI
                  }
                  onCommit={(digits) => onSumInsuredCommit(cover.coverCode, digits)}
                />
              )}

              {cover.coverCode === '97A' && (
                <SumInsuredTextInput
                  label="Gas kit sum insured (RM)"
                  hint={`RM ${formatSumInsuredThousands(100)}–${formatSumInsuredThousands(GAS_KIT_MAX_SI)}`}
                  committedAmount={inputs?.sumInsured ?? cover.coverSumInsured ?? 1000}
                  onCommit={(digits) => onSumInsuredCommit(cover.coverCode, digits)}
                />
              )}

              {cover.coverCode === '112' && (
                <div className="flex flex-wrap gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Days</label>
                    <select
                      value={inputs?.cartDay || '7'}
                      onChange={(e) => onInputChange(cover.coverCode, 'cartDay', e.target.value)}
                      className="mt-1 rounded-lg border border-input px-2 py-1.5 text-xs"
                    >
                      <option value="7">7</option>
                      <option value="14">14</option>
                      <option value="21">21</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Per day</label>
                    <select
                      value={inputs?.cartAmount || '100'}
                      onChange={(e) => onInputChange(cover.coverCode, 'cartAmount', e.target.value)}
                      className="mt-1 rounded-lg border border-input px-2 py-1.5 text-xs"
                    >
                      <option value="50">RM 50</option>
                      <option value="100">RM 100</option>
                      <option value="200">RM 200</option>
                    </select>
                  </div>
                </div>
              )}

              {cover.coverCode === 'PAB3' && (
                <div>
                  <label className="text-xs text-muted-foreground">Death / permanent disablement (per person)</label>
                  <select
                    value={inputs?.planCode || 'PAB3A'}
                    onChange={(e) => onInputChange(cover.coverCode, 'planCode', e.target.value)}
                    className="mt-1 w-full max-w-sm rounded-lg border border-input px-2 py-1.5 text-xs"
                  >
                    <option value="PAB3A">Plan A — RM 25,000</option>
                    <option value="PAB3B">Plan B — RM 50,000</option>
                  </select>
                </div>
              )}

              {cover.coverCode === 'A202' && (
                <div id="ehailing-driver-section" className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    e-Hailing driver (Malaysian NRIC holder; optional to edit)
                  </p>
                  <div>
                    <label className="text-xs text-muted-foreground">Driver name</label>
                    <input
                      value={ehailingDriver.fullName}
                      onChange={(e) =>
                        onEhailingChange({
                          ...ehailingDriver,
                          fullName: sanitizePersonNameInput(e.target.value),
                        })
                      }
                      aria-invalid={Boolean(ehailingErrors?.fullName)}
                      className={`mt-1 w-full rounded-lg border px-2 py-1.5 text-xs uppercase ${
                        ehailingErrors?.fullName ? 'border-destructive ring-1 ring-destructive/30' : 'border-input'
                      }`}
                      placeholder="DRIVER NAME"
                    />
                    {ehailingErrors?.fullName && (
                      <p className="text-[11px] text-destructive mt-1">{ehailingErrors.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">NRIC no.</label>
                    <input
                      value={ehailingDriver.idNumber}
                      onChange={(e) => onEhailingChange({ ...ehailingDriver, idNumber: e.target.value })}
                      aria-invalid={Boolean(ehailingErrors?.idNumber)}
                      className={`mt-1 w-full rounded-lg border px-2 py-1.5 text-xs ${
                        ehailingErrors?.idNumber ? 'border-destructive ring-1 ring-destructive/30' : 'border-input'
                      }`}
                      placeholder="ID number"
                    />
                    {ehailingErrors?.idNumber && (
                      <p className="text-[11px] text-destructive mt-1">{ehailingErrors.idNumber}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdditionalCoveragesSection({
  covers,
  selectedAddons,
  isUpdating,
  pendingAddonSync,
  onToggleAddon,
  addonInputs,
  onInputChange,
  onSumInsuredCommit,
  ehailingDriver,
  onEhailingChange,
  ehailingErrors,
}: {
  covers: AdditionalCoverItem[];
  selectedAddons: Set<string>;
  isUpdating: boolean;
  pendingAddonSync: boolean;
  onToggleAddon: (cover: AdditionalCoverItem) => void;
  addonInputs: Record<string, { sumInsured?: number; cartDay?: string; cartAmount?: string; planCode?: string }>;
  onInputChange: (code: string, field: string, value: string) => void;
  onSumInsuredCommit: (code: string, rawValue: string) => void;
  ehailingDriver: { fullName: string; idNumber: string };
  onEhailingChange: (d: { fullName: string; idNumber: string }) => void;
  ehailingErrors?: { fullName?: string; idNumber?: string };
}) {
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<FilterMode>('all');
  const [showAll, setShowAll] = React.useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = React.useState<Set<string>>(new Set());

  const sorted = React.useMemo(() => sortAdditionalCovers(covers), [covers]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return sorted.filter((cover) => {
      if (filter === 'selected' && !selectedAddons.has(cover.coverCode)) return false;
      if (!q) return true;
      const haystack = `${cover.coverName} ${cover.coverDescription ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [sorted, search, filter, selectedAddons]);

  const collapsedPreview = React.useMemo(
    () => buildCollapsedAddonPreview(filtered, COLLAPSED_PREVIEW_COUNT),
    [filtered],
  );

  const visibleList = React.useMemo(() => {
    if (showAll || search.trim() || filter === 'selected') return filtered;
    return collapsedPreview;
  }, [filtered, collapsedPreview, showAll, search, filter]);

  const hiddenCount = filtered.length - visibleList.length;
  const listExpandable = filtered.length > collapsedPreview.length;
  const busy = isUpdating || pendingAddonSync;

  const selectedList = React.useMemo(
    () => sorted.filter((c) => selectedAddons.has(c.coverCode)),
    [sorted, selectedAddons],
  );

  const toggleDescription = (code: string) => {
    setExpandedDescriptions((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  if (covers.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm">Enhance your coverage</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {covers.length} optional add-on{covers.length === 1 ? '' : 's'} from Allianz — search or filter to find what you need.
          </p>
        </div>
        {selectedList.length > 0 && (
          <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full self-start sm:self-auto">
            {selectedList.length} selected
          </span>
        )}
      </div>

      {selectedList.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedList.map((cover) => (
            <button
              key={cover.coverCode}
              type="button"
              onClick={() => onToggleAddon(cover)}
              className="inline-flex items-center gap-1 max-w-full text-xs pl-2.5 pr-1.5 py-1 rounded-full border border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10 transition-colors"
              title="Remove add-on"
            >
              <span className="truncate">{cover.coverName}</span>
              <X className="w-3 h-3 flex-shrink-0 opacity-60" />
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search coverages (e.g. windscreen, flood, towing…)"
          className="pl-9 h-10"
          aria-label="Search optional coverages"
        />
      </div>

      <div className="flex gap-2">
        {(['all', 'selected'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setFilter(mode)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              filter === mode
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border/60 text-muted-foreground hover:border-primary/40'
            }`}
          >
            {mode === 'all' ? `All (${covers.length})` : `Selected (${selectedList.length})`}
          </button>
        ))}
      </div>

      <div
        className={`space-y-2 overflow-y-auto overscroll-contain pr-0.5 ${SCROLL_MAX_HEIGHT} scroll-smooth`}
        role="list"
        aria-label="Optional coverage add-ons"
      >
        {visibleList.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 px-4 border border-dashed border-border/60 rounded-xl">
            No coverages match your search. Try another keyword or show all options.
          </p>
        ) : (
          visibleList.map((cover) => (
            <AddonCoverRow
              key={cover.coverCode}
              cover={cover}
              isSelected={selectedAddons.has(cover.coverCode)}
              isUpdating={busy}
              descriptionExpanded={expandedDescriptions.has(cover.coverCode)}
              onToggleDescription={() => toggleDescription(cover.coverCode)}
              onToggle={() => onToggleAddon(cover)}
              addonInputs={addonInputs}
              onInputChange={onInputChange}
              onSumInsuredCommit={onSumInsuredCommit}
              ehailingDriver={ehailingDriver}
              onEhailingChange={onEhailingChange}
              ehailingErrors={cover.coverCode === 'A202' ? ehailingErrors : undefined}
            />
          ))
        )}
      </div>

      {!search.trim() && filter === 'all' && (showAll || listExpandable) && (
        <Button
          type="button"
          variant="outline"
          className="w-full h-10 text-sm font-medium"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Show fewer coverages
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Show all {filtered.length} coverages
              {hiddenCount > 0 ? ` (${hiddenCount} more)` : ''}
            </>
          )}
        </Button>
      )}

      {search.trim() && filtered.length > 0 && (
        <p className="text-[11px] text-center text-muted-foreground">
          Showing {filtered.length} result{filtered.length === 1 ? '' : 's'} for &ldquo;{search.trim()}&rdquo;
        </p>
      )}
    </div>
  );
}

export function RoadRangersTooltipButton() {
  return <TooltipButton coverCode="ROAD_RANGERS" />;
}
