/**
 * Replenish — Need Index Lookup Helper
 * ====================================
 * Drop-in helper for the frontend. Load this once at app start (~750KB compact JSON),
 * then call getNeedScore() to look up any shelter's need score.
 *
 * Usage:
 *   import needIndex from './need_index.min.json';
 *   import { getNeedScore, sortByNeed } from './needIndex';
 *
 *   // Look up a shelter's need score
 *   const score = getNeedScore(needIndex, "Essex County", "NJ");
 *   // -> 23
 *
 *   // Or by FIPS code if you have it
 *   const score2 = getNeedScoreByFips(needIndex, "34013");
 *
 *   // Sort an array of shelters/connections by need (highest first)
 *   const sorted = sortByNeed(needIndex, connections);
 */

// Build an index for O(1) lookup
let _byName = null;
let _byFips = null;

function _buildIndexes(needIndex) {
  if (_byName && _byFips) return;
  _byName = new Map();
  _byFips = new Map();
  for (const a of needIndex.areas) {
    // Normalize: "essex county" + "nj" -> key
    const key = `${a.area.toLowerCase().trim()}|${a.state.toLowerCase().trim()}`;
    _byName.set(key, a);
    if (a.fips) _byFips.set(a.fips, a);
  }
}

/**
 * Get the full area record by county name + state.
 * State can be either abbreviation ("NJ") or full name ("New Jersey").
 * County name is matched leniently — "Essex", "Essex County", "essex county" all work.
 */
export function getArea(needIndex, county, state) {
  _buildIndexes(needIndex);

  // Normalize county input
  let c = (county || "").toLowerCase().trim();
  // If user passed just "Essex", try adding " county" suffix
  const variants = [c];
  if (!c.endsWith(" county") && !c.endsWith(" parish") && !c.endsWith(" borough")) {
    variants.push(c + " county");
  }
  if (c.endsWith(" county")) {
    variants.push(c.replace(/ county$/, ""));
  }

  // State can be abbr or full name
  const s = (state || "").toLowerCase().trim();
  const stateVariants = [s];
  // Common state abbreviations map - extend as needed
  const stateMap = {
    "alabama": "al", "alaska": "ak", "arizona": "az", "arkansas": "ar",
    "california": "ca", "colorado": "co", "connecticut": "ct", "delaware": "de",
    "florida": "fl", "georgia": "ga", "hawaii": "hi", "idaho": "id",
    "illinois": "il", "indiana": "in", "iowa": "ia", "kansas": "ks",
    "kentucky": "ky", "louisiana": "la", "maine": "me", "maryland": "md",
    "massachusetts": "ma", "michigan": "mi", "minnesota": "mn", "mississippi": "ms",
    "missouri": "mo", "montana": "mt", "nebraska": "ne", "nevada": "nv",
    "new hampshire": "nh", "new jersey": "nj", "new mexico": "nm", "new york": "ny",
    "north carolina": "nc", "north dakota": "nd", "ohio": "oh", "oklahoma": "ok",
    "oregon": "or", "pennsylvania": "pa", "rhode island": "ri", "south carolina": "sc",
    "south dakota": "sd", "tennessee": "tn", "texas": "tx", "utah": "ut",
    "vermont": "vt", "virginia": "va", "washington": "wa", "west virginia": "wv",
    "wisconsin": "wi", "wyoming": "wy", "district of columbia": "dc"
  };
  if (stateMap[s]) stateVariants.push(stateMap[s]);
  // Also try reverse direction
  for (const [name, abbr] of Object.entries(stateMap)) {
    if (abbr === s) stateVariants.push(name);
  }

  for (const cv of variants) {
    for (const sv of stateVariants) {
      const key = `${cv}|${sv}`;
      if (_byName.has(key)) return _byName.get(key);
    }
  }
  return null;
}

/** Get just the need score (0-100). Returns null if not found. */
export function getNeedScore(needIndex, county, state) {
  const a = getArea(needIndex, county, state);
  return a ? a.need_score : null;
}

/** Look up by exact 5-digit FIPS code. Most reliable if you have it. */
export function getNeedScoreByFips(needIndex, fips) {
  _buildIndexes(needIndex);
  const a = _byFips.get(String(fips).padStart(5, "0"));
  return a ? a.need_score : null;
}

/** Get the full factors object (poverty_rate, food_insecurity_rate, etc.) for display. */
export function getFactors(needIndex, county, state) {
  const a = getArea(needIndex, county, state);
  return a ? a.factors : null;
}

/**
 * Sort an array of connection objects by the need_score of their destination shelter.
 *
 * Each connection must have either:
 *   - a `shelter` object with `county` and `state` fields, OR
 *   - direct `county` and `state` fields, OR
 *   - a `fips` field
 *
 * Returns a NEW sorted array, highest-need first.
 * Unmatched entries go to the bottom (score = -1).
 */
export function sortByNeed(needIndex, connections) {
  return [...connections]
    .map(c => {
      let score = null;
      if (c.fips) {
        score = getNeedScoreByFips(needIndex, c.fips);
      }
      if (score === null) {
        const county = c.shelter?.county || c.county;
        const state = c.shelter?.state || c.state;
        if (county && state) score = getNeedScore(needIndex, county, state);
      }
      return { ...c, _needScore: score ?? -1 };
    })
    .sort((a, b) => b._needScore - a._needScore);
}

/**
 * Filter then sort: only include connections within `maxMiles` of the volunteer,
 * then sort by need_score descending. This is the core volunteer-feed function.
 *
 * Expects each connection to have shelter.lat / shelter.lng (or top-level lat/lng).
 */
export function buildVolunteerFeed(needIndex, connections, volunteerLat, volunteerLng, maxMiles = 50) {
  const haversineMiles = (lat1, lng1, lat2, lng2) => {
    const toRad = d => d * Math.PI / 180;
    const R = 3958.8; // miles
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat/2)**2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  return connections
    .map(c => {
      const lat = c.shelter?.lat ?? c.lat;
      const lng = c.shelter?.lng ?? c.lng;
      const distance = (lat != null && lng != null)
        ? haversineMiles(volunteerLat, volunteerLng, lat, lng)
        : Infinity;
      return { ...c, _distanceMiles: distance };
    })
    .filter(c => c._distanceMiles <= maxMiles)
    .map(c => {
      let score = null;
      if (c.fips) score = getNeedScoreByFips(needIndex, c.fips);
      if (score === null) {
        const county = c.shelter?.county || c.county;
        const state = c.shelter?.state || c.state;
        if (county && state) score = getNeedScore(needIndex, county, state);
      }
      return { ...c, _needScore: score ?? -1 };
    })
    .sort((a, b) => b._needScore - a._needScore);  // highest need first
}
