// Curated coordinates for major Indian cities, so `scoreLocation` (and the
// candidate-facing "nearest first" job sort in the job-portal app) can rank
// by real distance instead of exact city-name string matching. Same
// reasoning as the institution seed list in the job-portal app: a static,
// curated table is simpler and more reliable than wiring up a geocoding API
// for what's still a fixed, mostly-stable list of city names — and falls
// back gracefully (see resolveNearestDistanceKm) rather than breaking when a
// location isn't in the table yet.
export interface Coordinates {
  lat: number;
  lng: number;
}

const CITY_COORDINATES: Record<string, Coordinates> = {
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.7041, lng: 77.1025 },
  "new delhi": { lat: 28.6139, lng: 77.209 },
  pune: { lat: 18.5204, lng: 73.8567 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  surat: { lat: 21.1702, lng: 72.8311 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  kanpur: { lat: 26.4499, lng: 80.3319 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  indore: { lat: 22.7196, lng: 75.8577 },
  thane: { lat: 19.2183, lng: 72.9781 },
  bhopal: { lat: 23.2599, lng: 77.4126 },
  visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  patna: { lat: 25.5941, lng: 85.1376 },
  vadodara: { lat: 22.3072, lng: 73.1812 },
  ghaziabad: { lat: 28.6692, lng: 77.4538 },
  ludhiana: { lat: 30.901, lng: 75.8573 },
  agra: { lat: 27.1767, lng: 78.0081 },
  nashik: { lat: 19.9975, lng: 73.7898 },
  faridabad: { lat: 28.4089, lng: 77.3178 },
  meerut: { lat: 28.9845, lng: 77.7064 },
  rajkot: { lat: 22.3039, lng: 70.8022 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  srinagar: { lat: 34.0837, lng: 74.7973 },
  amritsar: { lat: 31.634, lng: 74.8723 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  cochin: { lat: 9.9312, lng: 76.2673 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  gurgaon: { lat: 28.4595, lng: 77.0266 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
  noida: { lat: 28.5355, lng: 77.391 },
  mysore: { lat: 12.2958, lng: 76.6394 },
  mysuru: { lat: 12.2958, lng: 76.6394 },
  bhubaneswar: { lat: 20.2961, lng: 85.8245 },
  guwahati: { lat: 26.1445, lng: 91.7362 },
  dehradun: { lat: 30.3165, lng: 78.0322 },
  thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
  trivandrum: { lat: 8.5241, lng: 76.9366 },
  vijayawada: { lat: 16.5062, lng: 80.648 },
  madurai: { lat: 9.9252, lng: 78.1198 },
  raipur: { lat: 21.2514, lng: 81.6296 },
  ranchi: { lat: 23.3441, lng: 85.3096 },
  jodhpur: { lat: 26.2389, lng: 73.0243 },
  jabalpur: { lat: 23.1815, lng: 79.9864 },
  gwalior: { lat: 26.2183, lng: 78.1828 },
  aurangabad: { lat: 19.8762, lng: 75.3433 },
  salem: { lat: 11.6643, lng: 78.146 },
  warangal: { lat: 17.9689, lng: 79.5941 },
  jalandhar: { lat: 31.326, lng: 75.5762 },
  bhilai: { lat: 21.2094, lng: 81.4285 },
  cuttack: { lat: 20.4625, lng: 85.8828 },
  kota: { lat: 25.2138, lng: 75.8648 },
  dhanbad: { lat: 23.7957, lng: 86.4304 },
  kolhapur: { lat: 16.705, lng: 74.2433 },
  ajmer: { lat: 26.4499, lng: 74.6399 },
  siliguri: { lat: 26.7271, lng: 88.3953 },
  jamshedpur: { lat: 22.8046, lng: 86.2029 },
  guntur: { lat: 16.3067, lng: 80.4365 },
  nellore: { lat: 14.4426, lng: 79.9865 },
  gorakhpur: { lat: 26.7606, lng: 83.3732 },
  bikaner: { lat: 28.0229, lng: 73.3119 },
  amravati: { lat: 20.9374, lng: 77.7796 },
  jamnagar: { lat: 22.4707, lng: 70.0577 },
  bhavnagar: { lat: 21.7645, lng: 72.1519 },
  udaipur: { lat: 24.5854, lng: 73.7125 },
  bareilly: { lat: 28.367, lng: 79.4304 },
  moradabad: { lat: 28.8386, lng: 78.7733 },
  mangalore: { lat: 12.9141, lng: 74.856 },
  mangaluru: { lat: 12.9141, lng: 74.856 },
  hubli: { lat: 15.3647, lng: 75.124 },
  belgaum: { lat: 15.8497, lng: 74.4977 },
  tiruchirappalli: { lat: 10.7905, lng: 78.7047 },
  trichy: { lat: 10.7905, lng: 78.7047 },
  tirupati: { lat: 13.6288, lng: 79.4192 },
  shimla: { lat: 31.1048, lng: 77.1734 },
  panaji: { lat: 15.4909, lng: 73.8278 },
  goa: { lat: 15.2993, lng: 74.124 },
  puducherry: { lat: 11.9416, lng: 79.8083 },
  pondicherry: { lat: 11.9416, lng: 79.8083 },
  imphal: { lat: 24.817, lng: 93.9368 },
  shillong: { lat: 25.5788, lng: 91.8933 },
  agartala: { lat: 23.8315, lng: 91.2868 },
  aizawl: { lat: 23.7271, lng: 92.7176 },
  itanagar: { lat: 27.0844, lng: 93.6053 },
  kohima: { lat: 25.6751, lng: 94.1086 },
  gangtok: { lat: 27.3389, lng: 88.6065 },
  navi: { lat: 19.033, lng: 73.0297 },
  "navi mumbai": { lat: 19.033, lng: 73.0297 },
  pimpri: { lat: 18.6298, lng: 73.7997 },
  "pimpri-chinchwad": { lat: 18.6298, lng: 73.7997 },
  hinjewadi: { lat: 18.5908, lng: 73.7397 },
  whitefield: { lat: 12.9698, lng: 77.75 },
  "electronic city": { lat: 12.8452, lng: 77.6602 },
  powai: { lat: 19.1176, lng: 72.906 },
  andheri: { lat: 19.1136, lng: 72.8697 },
};

function normalizeCityKey(name: string): string {
  return name.trim().toLowerCase();
}

export function resolveCityCoordinates(name: string): Coordinates | null {
  return CITY_COORDINATES[normalizeCityKey(name)] ?? null;
}

const EARTH_RADIUS_KM = 6371;

export function haversineDistanceKm(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Shortest distance in km from the job's location to any of the candidate's
// preferred locations — null if either side can't be resolved to a known
// city (callers fall back to exact-string-match behavior in that case, see
// scoreLocation).
export function resolveNearestDistanceKm(candidateLocations: string[], jobLocation: string | null): number | null {
  if (!jobLocation) return null;
  const jobCoords = resolveCityCoordinates(jobLocation);
  if (!jobCoords) return null;

  let nearest: number | null = null;
  for (const loc of candidateLocations) {
    const coords = resolveCityCoordinates(loc);
    if (!coords) continue;
    const distance = haversineDistanceKm(jobCoords, coords);
    if (nearest === null || distance < nearest) nearest = distance;
  }
  return nearest;
}
