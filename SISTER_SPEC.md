# Replenish — Need Index Model (Your Half)

## What you're building
A model/dataset that, for **any place in the U.S.**, gives a **need score from 0–100**
(higher = more in need of food). This score is what tells the app which pickups to
prioritize for drivers, and which areas matter most.

It must be **broad** — not just New Jersey. Any town/county the app looks up should
already have a score in your file. Think of it as a nationwide lookup table.

## Your deliverable: ONE file — `need_index.json`
A single JSON file covering many areas (ideally all U.S. counties — there are ~3,100,
which is totally fine as one file). The app reads it and looks up whatever place is on screen.

### Recommended: key by COUNTY + STATE (most standard, best public data)
```json
{
  "region": "United States",
  "model_version": "v1",
  "keyed_by": "county_state",
  "areas": [
    {
      "area": "Essex County",
      "state": "NJ",
      "fips": "34013",
      "lat": 40.79,
      "lng": -74.24,
      "need_score": 91,
      "factors": {
        "food_insecurity_rate": 0.18,
        "poverty_rate": 0.15,
        "grocery_access_score": 0.40,
        "median_income": 67000
      }
    },
    {
      "area": "Somerset County",
      "state": "NJ",
      "fips": "34035",
      "lat": 40.56,
      "lng": -74.61,
      "need_score": 14,
      "factors": { "food_insecurity_rate": 0.06, "poverty_rate": 0.04, "grocery_access_score": 0.88 }
    }
  ]
}
```

## Rules
- **`need_score` (0–100) is the ONLY field the app requires.** Higher = more need.
- `area`, `state`, `lat`, `lng` let the app place/look it up. `fips` is a bonus (precise key).
- `factors` is optional but recommended — the app shows it so judges see *why* an area scores high.
- Cover as many areas as you reasonably can. More coverage = "any place works."
- It's fine to deliver county-level. (ZIP-level or census-tract is even better but harder.)

## Where to get the data (all free, reputable)
- **Feeding America — Map the Meal Gap**: food-insecurity rate per county. (Best single source.)
- **USDA Food Access Research Atlas**: low-income + low-grocery-access (food deserts) by tract.
- **U.S. Census / ACS**: poverty rate, median income by county.

## How to combine into a 0–100 score (simple, defensible recipe)
1. Pull each factor per county (food-insecurity rate, poverty rate, low-access %, income).
2. Normalize each factor to 0–1 across all counties.
3. Weighted average, e.g.:
   `need = 0.40*food_insecurity + 0.30*low_access + 0.20*poverty + 0.10*(1 - income_norm)`
4. Multiply by 100, round. That's `need_score`.
(You can tune the weights — just be able to explain them in the video.)

## How to deliver
Build it however you like (Python notebook, pandas, whatever). The ONLY thing that
matters to the app is the final `need_index.json` committed to the repo. You can't break
the website, and the website can't break your model. Hand me the file and it plugs in.
