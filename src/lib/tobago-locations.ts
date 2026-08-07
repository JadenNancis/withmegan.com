/**
 * Communities served by the With Megan platform initiatives in Tobago.
 *
 * Villages in the electoral district of Mt. St. George/Goodwood
 * (Secretary Megan Morrison) appear first, followed by the rest of
 * Tobago's communities. Both BTS and MD domains use this list for
 * their community/address dropdowns.
 */

/** Communities in the Mt. St. George/Goodwood electoral district (Megan Morrison). */
export const PRIORITY_DISTRICT_VILLAGES = [
  "Mt. St. George",
  "Goodwood",
  "Hope",
  "John Dial",
] as const;

/** All other Tobago communities, alphabetically sorted. */
export const OTHER_TOBAGO_VILLAGES = [
  "Bacolet",
  "Bagatelle",
  "Belle Garden",
  "Bethesda",
  "Bethel",
  "Black Rock",
  "Buccoo",
  "Cane Garden",
  "Castara",
  "Charlotteville",
  "Crown Point",
  "Darrel Spring",
  "Delaford",
  "Diamond",
  "Glamorgan",
  "Golden Lane",
  "Lambeau",
  "L'Anse Fourmi",
  "Les Coteaux",
  "Lowlands",
  "Mason Hall",
  "Montgomery",
  "Moriah",
  "Mount Grace",
  "Mt. Pleasant",
  "New Grange",
  "Parlatuvier",
  "Patience Hill",
  "Pembroke",
  "Plymouth",
  "Roxborough",
  "Scarborough",
  "Signal Hill",
  "Speyside",
  "Whim",
] as const;

export const OTHER_LOCATION_VALUE = "Other (specify below)";

/** Full ordered list: Megan Morrison's district first, then the rest. */
export const TOBAGO_LOCATIONS = [
  ...PRIORITY_DISTRICT_VILLAGES,
  ...OTHER_TOBAGO_VILLAGES,
  OTHER_LOCATION_VALUE,
] as const;

export type TobagoLocation = (typeof TOBAGO_LOCATIONS)[number];

export function isKnownLocation(value: string): boolean {
  return TOBAGO_LOCATIONS.includes(value as TobagoLocation);
}