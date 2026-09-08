import type { Zone } from '../../types';

/**
 * RESPIRE - Complete Greater Chennai Corporation (GCC) Municipal Dataset
 * 
 * Encompasses all 15 Administrative Zones and exactly 200 Municipal Wards:
 * - Zone I: Thiruvotriyur (Wards 1 to 14)
 * - Zone II: Manali (Wards 15 to 21)
 * - Zone III: Madhavaram (Wards 22 to 33)
 * - Zone IV: Tondiarpet (Wards 34 to 48)
 * - Zone V: Royapuram (Wards 49 to 63)
 * - Zone VI: Thiru-Vi-Ka Nagar (Wards 64 to 78)
 * - Zone VII: Ambattur (Wards 79 to 93)
 * - Zone VIII: Anna Nagar (Wards 94 to 108)
 * - Zone IX: Teynampet (Wards 109 to 126)
 * - Zone X: Kodambakkam (Wards 127 to 142)
 * - Zone XI: Valasaravakkam (Wards 143 to 155)
 * - Zone XII: Alandur (Wards 156 to 167)
 * - Zone XIII: Adyar (Wards 170 to 182)
 * - Zone XIV: Perungudi (Wards 168, 169, 183 to 191)
 * - Zone XV: Sholinganallur (Wards 192 to 200)
 */

export interface ZoneAdministrativeMeta {
  zoneNumber: number;
  romanNumber: string;
  name: string;
  wardRangeDescription: string;
  wardCount: number;
}

export const GCC_ZONES_METADATA: ZoneAdministrativeMeta[] = [
  {
    zoneNumber: 1,
    romanNumber: "I",
    name: "Thiruvotriyur",
    wardRangeDescription: "Wards 1 to 14",
    wardCount: 14,
  },
  {
    zoneNumber: 2,
    romanNumber: "II",
    name: "Manali",
    wardRangeDescription: "Wards 15 to 21",
    wardCount: 7,
  },
  {
    zoneNumber: 3,
    romanNumber: "III",
    name: "Madhavaram",
    wardRangeDescription: "Wards 22 to 33",
    wardCount: 12,
  },
  {
    zoneNumber: 4,
    romanNumber: "IV",
    name: "Tondiarpet",
    wardRangeDescription: "Wards 34 to 48",
    wardCount: 15,
  },
  {
    zoneNumber: 5,
    romanNumber: "V",
    name: "Royapuram",
    wardRangeDescription: "Wards 49 to 63",
    wardCount: 15,
  },
  {
    zoneNumber: 6,
    romanNumber: "VI",
    name: "Thiru-Vi-Ka Nagar",
    wardRangeDescription: "Wards 64 to 78",
    wardCount: 15,
  },
  {
    zoneNumber: 7,
    romanNumber: "VII",
    name: "Ambattur",
    wardRangeDescription: "Wards 79 to 93",
    wardCount: 15,
  },
  {
    zoneNumber: 8,
    romanNumber: "VIII",
    name: "Anna Nagar",
    wardRangeDescription: "Wards 94 to 108",
    wardCount: 15,
  },
  {
    zoneNumber: 9,
    romanNumber: "IX",
    name: "Teynampet",
    wardRangeDescription: "Wards 109 to 126",
    wardCount: 18,
  },
  {
    zoneNumber: 10,
    romanNumber: "X",
    name: "Kodambakkam",
    wardRangeDescription: "Wards 127 to 142",
    wardCount: 16,
  },
  {
    zoneNumber: 11,
    romanNumber: "XI",
    name: "Valasaravakkam",
    wardRangeDescription: "Wards 143 to 155",
    wardCount: 13,
  },
  {
    zoneNumber: 12,
    romanNumber: "XII",
    name: "Alandur",
    wardRangeDescription: "Wards 156 to 167",
    wardCount: 12,
  },
  {
    zoneNumber: 13,
    romanNumber: "XIII",
    name: "Adyar",
    wardRangeDescription: "Wards 170 to 182",
    wardCount: 13,
  },
  {
    zoneNumber: 14,
    romanNumber: "XIV",
    name: "Perungudi",
    wardRangeDescription: "Wards 168, 169, and 183 to 191",
    wardCount: 11,
  },
  {
    zoneNumber: 15,
    romanNumber: "XV",
    name: "Sholinganallur",
    wardRangeDescription: "Wards 192 to 200",
    wardCount: 9,
  },
];


import rawWards from './chennaiAllWards.json';

export const CHENNAI_ALL_200_WARDS: Zone[] = rawWards as unknown as Zone[];
