export const ADDON_TOOLTIPS: Record<string, { text: string; link?: string }> = {
  ROAD_RANGERS: {
    text: 'Allianz Road Rangers is a nationwide motor accident assistance provided free-of-charge to all our Motor Comprehensive (Private Car) policyholders.',
    link: 'https://www.allianz.com.my/road-rangers',
  },
  'PAB-ERW': {
    text: 'Enhanced Road Warrior (ERW) is a 24-Hour Car Assistance Program with the following benefits: 24-Hour Unlimited Emergency Tow Truck Service, Car Replacement, Minor Roadside Repair, Flood Coverage, Medical Expenses Benefit.',
    link: 'https://www.allianz.com.my/enhanced-road-warrior',
  },
  '89': {
    text: 'Cover for Windscreens, Windows and Sunroof covers the cost to repair or replace any glass in the windscreen, window or sunroof (including the cost of lamination/tinting film, if any) of your car that is accidentally damaged. A claim under this benefit does not affect your No Claim Discount (NCD) entitlement, provided no other claim for other damage is submitted for the same incident.',
  },
  A202: {
    text: 'Private Hire Car (e-Hailing) add on covers you for: 1. Loss or damage of your own car, 2. Liability to third parties, 3. Legal liability to fare paying passengers, 4. Personal accident benefit due to accidental injury or death of the authorized e-Hailing driver, 5. Legal liability of fare paying passengers for negligent acts.',
  },
  '72': {
    text: 'Legal Liability of Passengers for Negligent Acts protects you against legal liability sought by third party against you for the action of your passenger(s) in your car provided that the passenger is not driving your car and other conditions set are satisfied.',
  },
  A209: {
    text: 'Car Break-in/Robbery reimburses you the actual expenses incurred up to RM500, to repair or replace your personal effects that were in your car if they are lost or damaged due to a break-in or robbery.',
  },
  '57': {
    text: 'Inclusion of Special Perils covers loss or damage to your car caused by flood, typhoon, hurricane, storm, tempest, volcanic eruption, earthquake, landslide, landslip, subsidence or sinking of the soil/earth or other convulsions of nature.',
  },
  PAB3: {
    text: "Driver and Passengers' Personal Accident covers you and your passengers while travelling in your car. Benefits include Death/Permanent Disablement Benefit.",
  },
  A206: {
    text: 'Key Care reimburses you the actual expenses up to RM1,000, to replace one set of car key if your car key is lost, stolen or damaged due to theft or attempted theft or house break-in.',
  },
  '100A': {
    text: 'Legal Liability to Passengers covers you against legal liability sought by your passenger(s) (except your own family members) against you in the event of an accident due to your negligence.',
  },
  '112': {
    text: 'Compensation for Assessed Repair Time (CART) compensates you, up to 21 days, for the number of days required (assessed by us) to repair your damaged car.',
  },
  '25': {
    text: 'Strike, Riot and Civil Commotion covers for loss or damage to your car caused by various kinds of strikes, riots and civil commotions.',
  },
  '111': {
    text: 'Current Year "NCD" Relief compensates you an amount equal to the current year NCD amount in the event of a claim being made under the policy that may forfeit your NCD. This is a one-off compensation.',
  },
  '97A': {
    text: 'Gas Conversion Kit and Tank covers for loss or damage to the Gas Conversion Kit and Tank of your car as a separate item provided it is installed by a qualified installer.',
  },
};

/** Shown first in the list when Allianz returns many options. */
export const POPULAR_ADDON_CODES = new Set(['PAB-ERW', '89', 'A202', '72', '57', '112']);

export function isCoverHidden(c: { azolHiddenInd?: number }): boolean {
  return c.azolHiddenInd === 1;
}

export function sortAdditionalCovers<T extends { coverCode: string; sequence: number }>(covers: T[]): T[] {
  return [...covers].sort((a, b) => {
    const aPop = POPULAR_ADDON_CODES.has(a.coverCode) ? 0 : 1;
    const bPop = POPULAR_ADDON_CODES.has(b.coverCode) ? 0 : 1;
    if (aPop !== bPop) return aPop - bPop;
    return a.sequence - b.sequence;
  });
}
