// ----Constants---------------------------
export const FIVE_KM = 5;
export const TEN_KM = 10;
export const HALF_MARATHON_KM = 21.0975;
export const MARATHON_KM = 42.195;
export const KM_PER_MILE = 1.609344;

// ----Conversion--------------------------
export function convertKmToMile(kilometers: number): number {
  return kilometers / KM_PER_MILE;
}

export function convertMileToKm(miles: number): number {
  return miles * KM_PER_MILE;
}
