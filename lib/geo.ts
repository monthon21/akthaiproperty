// ============================================================
// Geo helpers — read coordinates from the formats this app stores
// and compute straight-line distance.
// ============================================================

export interface LatLng {
  lat: number;
  lng: number;
}

function valid(lat: number, lng: number): LatLng | null {
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

/**
 * Extract lat/lng from:
 *  - "13.5937, 100.3721"
 *  - Google Maps embed / share URLs: ?q=lat,lng  ?ll=lat,lng  /@lat,lng,zoom  !3dlat!4dlng
 *  - an <iframe src="..."> snippet containing one of the above
 * Returns null for anything else (e.g. unresolved short links).
 */
export function parseLatLng(value: string | null | undefined): LatLng | null {
  if (!value) return null;
  let s = value.trim();
  const iframe = s.match(/src=["']([^"']+)["']/);
  if (iframe) s = iframe[1];
  try {
    s = decodeURIComponent(s);
  } catch {
    /* keep as-is */
  }

  const num = "(-?\\d{1,3}(?:\\.\\d+)?)";
  const patterns = [
    new RegExp(`^${num}\\s*,\\s*${num}$`),
    new RegExp(`[?&](?:q|ll|query|destination)=${num}\\s*,\\s*${num}`),
    new RegExp(`!3d${num}!4d${num}`), // exact pin — preferred over the map viewport below
    new RegExp(`@${num},${num}`),
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) {
      const p = valid(parseFloat(m[1]), parseFloat(m[2]));
      if (p) return p;
    }
  }
  return null;
}

/** Great-circle distance in km (haversine) */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Short Google Maps share links that need a redirect lookup to reveal coordinates */
export function isShortMapsLink(value: string): boolean {
  return /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)\//i.test(value.trim());
}
