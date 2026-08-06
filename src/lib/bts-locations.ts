/**
 * Communities served by the Back to School with Megan book drive.
 *
 * The platform serves families in and around Mount St. George and
 * Goodwood, eastern Tobago. This is the canonical list used for the
 * guardian location dropdown — the only locations the platform accepts.
 */

export const BTS_LOCATIONS = [
  "Mount St. George",
  "Goodwood",
  "Belle Garden",
  "Bethesda",
  "Bacolet",
  "Buccoo",
  "Cane Garden",
  "Charlotteville",
  "Delaford",
  "Diamond",
  "Golden Lane",
  "Hope",
  "Lambeau",
  "L'Anse Fourmi",
  "Mason Hall",
  "Montgomery",
  "Moriah",
  "Parlatuvier",
  "Patience Hill",
  "Pembroke",
  "Plymouth",
  "Roxborough",
  "Scarborough",
  "Signal Hill",
  "Speyside",
  "Other (specify below)",
] as const;

export type BtsLocation = (typeof BTS_LOCATIONS)[number];

export const OTHER_LOCATION_VALUE = "Other (specify below)";

export function isKnownLocation(value: string): boolean {
  return BTS_LOCATIONS.includes(value as BtsLocation);
}