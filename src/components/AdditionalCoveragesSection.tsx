'use client';

import * as React from 'react';
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
import { ADDON_TOOLTIPS, POPULAR_ADDON_CODES, sortAdditionalCovers } from '@/config/addon-tooltips';
import {
  GAS_KIT_MAX_SI,
  WINDSCREEN_MAX_SI,
  WINDSCREEN_MIN_SI,
} from '@/lib/addon-quote';
import type { AdditionalCoverItem } from '@/types/allianz';

const COLLAPSED_PREVIEW_COUNT = 5;
const SCROLL_MAX_HEIGHT = 'max-h-[min(28rem,55vh)]';

type FilterMode = 'all' | 'selected';

function TooltipButton({ coverCode }: { coverCode: string }) {
  const [open, setOpen] = React.useState(false);
  const tooltip = ADDON_TOOLTIPS[coverCode];
  if (!tooltip) return null;

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="text-muted-foreground hover:text-primary transition-colors p-0.5 rounded-sm"
        aria-label="More info about this coverage"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 max-w-[calc(100vw-2rem)] bg-popover border border-border rounded-xl shadow-lg p-3 text-xs text-popover-foreground leading-relaxed">
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
        </>
      )}
    </span>
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
  ehailingDriver: { fullName: string; idNumber: string };
  onEhailingChange: (d: { fullName: string; idNumber: string }) => void;
  ehailingErrors?: { fullName?: string; idNumber?: string };
}) {
  const inputs = addonInputs[cover.coverCode];
  const isPopular = POPULAR_ADDON_CODES.has(cover.coverCode);
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
                <div>
                  <label className="text-xs text-muted-foreground">Windscreen sum insured (RM)</label>
                  <input
                    type="number"
                    min={WINDSCREEN_MIN_SI}
                    max={WINDSCREEN_MAX_SI}
                    step={100}
                    value={inputs?.sumInsured ?? cover.coverSumInsured ?? WINDSCREEN_MIN_SI}
                    onChange={(e) => onInputChange(cover.coverCode, 'sumInsured', e.target.value)}
                    className="mt-1 w-full max-w-[8rem] rounded-lg border border-input px-2 py-1.5 text-xs"
                  />
                </div>
              )}

              {cover.coverCode === '97A' && (
                <div>
                  <label className="text-xs text-muted-foreground">Gas kit sum insured (RM)</label>
                  <input
                    type="number"
                    min={100}
                    max={GAS_KIT_MAX_SI}
                    step={100}
                    value={inputs?.sumInsured ?? cover.coverSumInsured ?? 1000}
                    onChange={(e) => onInputChange(cover.coverCode, 'sumInsured', e.target.value)}
                    className="mt-1 w-full max-w-[8rem] rounded-lg border border-input px-2 py-1.5 text-xs"
                  />
                </div>
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
                  <p className="text-xs font-medium text-muted-foreground">e-Hailing driver details</p>
                  <div>
                    <label className="text-xs text-muted-foreground">
                      Driver name <span className="text-destructive">*</span>
                    </label>
                    <input
                      value={ehailingDriver.fullName}
                      onChange={(e) => onEhailingChange({ ...ehailingDriver, fullName: e.target.value.toUpperCase() })}
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
                    <label className="text-xs text-muted-foreground">
                      ID no. <span className="text-destructive">*</span>
                    </label>
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

  const visibleList = React.useMemo(() => {
    if (showAll || search.trim() || filter === 'selected') return filtered;
    return filtered.slice(0, COLLAPSED_PREVIEW_COUNT);
  }, [filtered, showAll, search, filter]);

  const hiddenCount = filtered.length - visibleList.length;
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
              ehailingDriver={ehailingDriver}
              onEhailingChange={onEhailingChange}
              ehailingErrors={cover.coverCode === 'A202' ? ehailingErrors : undefined}
            />
          ))
        )}
      </div>

      {!search.trim() && filter === 'all' && filtered.length > COLLAPSED_PREVIEW_COUNT && (
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
