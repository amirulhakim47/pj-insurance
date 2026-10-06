export function normalizePlate(plate: string): string {
  return plate.toUpperCase().replace(/\s/g, '');
}

/** Primary user-facing line when Allianz has no record for plate + ID. */
export function vehicleDataNotFoundMessage(plate: string): string {
  return `Vehicle data for ${normalizePlate(plate)} not found.`;
}

export function vehicleDataNotFoundWithGuidance(plate: string, guidance: string): string {
  return `${vehicleDataNotFoundMessage(plate)} ${guidance}`;
}
