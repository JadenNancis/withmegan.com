export type SchoolCategory = "Primary / Middle" | "Secondary / High";

export interface School {
  name: string;
  category: SchoolCategory;
  /** Located in the Mt. St. George/Goodwood electoral district. Sorted first. */
  district?: boolean;
}

export const BTS_SCHOOLS: readonly School[] = [
  { name: "Belle Garden Anglican", category: "Primary / Middle" },
  { name: "Bethesda Government", category: "Primary / Middle" },
  { name: "Black Rock Government", category: "Primary / Middle" },
  { name: "Bon Accord Government", category: "Primary / Middle" },
  { name: "Buccoo Government", category: "Primary / Middle" },
  { name: "Castara Government", category: "Primary / Middle" },
  { name: "Charlotteville Methodist", category: "Primary / Middle" },
  { name: "Charlotteville SDA", category: "Primary / Middle" },
  { name: "Delaford Anglican", category: "Primary / Middle" },
  { name: "Delaford Roman Catholic", category: "Primary / Middle" },
  { name: "Des Vignes Road Government", category: "Primary / Middle" },
  { name: "Diamond Vale Government", category: "Primary / Middle" },
  { name: "Ebenezer Methodist", category: "Primary / Middle" },
  { name: "Goodwood Methodist", category: "Primary / Middle", district: true },
  { name: "Golden Lane Government", category: "Primary / Middle" },
  { name: "Happy Haven / Tobago School for the Deaf", category: "Primary / Middle" },
  { name: "Hope Anglican", category: "Primary / Middle", district: true },
  { name: "Lambeau Anglican", category: "Primary / Middle" },
  { name: "L'Anse Fourmi Government", category: "Primary / Middle" },
  { name: "Mason Hall Government", category: "Primary / Middle" },
  { name: "Montgomery Government", category: "Primary / Middle" },
  { name: "Moriah Government", category: "Primary / Middle" },
  { name: "Mt St George Methodist", category: "Primary / Middle", district: true },
  { name: "North Regional SDA", category: "Primary / Middle" },
  { name: "Parlatuvier Anglican", category: "Primary / Middle" },
  { name: "Patience Hill Government", category: "Primary / Middle" },
  { name: "Pembroke Anglican", category: "Primary / Middle" },
  { name: "Pentecostal Light & Life Foundation", category: "Primary / Middle" },
  { name: "Plymouth Anglican", category: "Primary / Middle" },
  { name: "Roxborough Anglican", category: "Primary / Middle" },
  { name: "Scarborough Methodist", category: "Primary / Middle" },
  { name: "Scarborough Roman Catholic", category: "Primary / Middle" },
  { name: "Scarborough SDA", category: "Primary / Middle" },
  { name: "Signal Hill Government", category: "Primary / Middle" },
  { name: "Speyside Anglican", category: "Primary / Middle" },
  { name: "St. Andrews Anglican", category: "Primary / Middle", district: true },
  { name: "St. Nicholas Primary (Private)", category: "Primary / Middle" },
  { name: "St. Patrick Anglican", category: "Primary / Middle" },
  { name: "Tablepiece Government", category: "Primary / Middle" },
  { name: "Tobago International Academy (Private)", category: "Primary / Middle" },
  { name: "Whim Anglican", category: "Primary / Middle" },
  { name: "Bishop's High School Tobago", category: "Secondary / High" },
  { name: "Goodwood Secondary", category: "Secondary / High", district: true },
  { name: "Harmon School of S.D.A. Scarborough Tobago (Private)", category: "Secondary / High" },
  { name: "Mason Hall Secondary", category: "Secondary / High" },
  { name: "Pentecostal Light and Life Foundation High School", category: "Secondary / High" },
  { name: "Roxborough Secondary", category: "Secondary / High" },
  { name: "Scarborough Secondary", category: "Secondary / High" },
  { name: "Signal Hill Secondary", category: "Secondary / High" },
  { name: "Speyside Secondary", category: "Secondary / High" },
] as const;

export const OTHER_SCHOOL_VALUE = "__other__";

export function schoolsByCategory(): { category: SchoolCategory; schools: School[] }[] {
  const order: SchoolCategory[] = ["Primary / Middle", "Secondary / High"];
  return order.map((category) => ({
    category,
    schools: BTS_SCHOOLS.filter((s) => s.category === category).sort((a, b) => {
      // District schools first, then the rest — each subgroup alphabetical.
      if (!!a.district !== !!b.district) return a.district ? -1 : 1;
      return a.name.localeCompare(b.name);
    }),
  }));
}

export function isKnownSchool(name: string): boolean {
  return BTS_SCHOOLS.some((s) => s.name === name);
}