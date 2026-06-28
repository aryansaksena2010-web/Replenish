# Replenish

**Rescue surplus food before it is wasted, and route it to the neighborhoods that need it most.**

Replenish is a web app that connects grocery stores with surplus food to the food banks and volunteers who can move it, in real time, before it spoils. Built for FutureHacks 2026 (Advanced division).

**Live demo:** _(add your GitHub Pages link here once deployed)_

---

## The problem

There is a difference between waste and surplus. Waste is food that has actually spoiled. Surplus is food that is still perfectly good to eat but can no longer be sold: bread baked that morning, slightly bruised produce, dented packaging, overstock.

The United States produces roughly 74 million tons of surplus food every year, worth over 300 billion dollars. Only about 2.5 percent of it is ever donated. The rest is thrown away. At the same time, nearly 48 million Americans cannot reliably afford enough food.

The food already exists. The problem has never been supply. It is logistics: getting fresh, perishable surplus to the right place fast enough, and prioritizing the communities that need it most.

## What Replenish does

Replenish is a three sided platform. Anyone can enter as a grocery store, a food bank, or a volunteer driver.

- **Stores** post surplus in seconds, either by typing it in plain language or with a quick form. Stores are not asked to be charitable. Donating is cheaper than paying to dump food, it can be legally required in a growing number of states, and Replenish generates an automatic tax receipt for the write off.
- **Food banks** set their top five needs and claim surplus available within 20 miles. High need areas get first priority on matching items.
- **Drivers** see nearby delivery runs ranked by urgency, accept one, and deliver it. Every delivery is confirmed by the receiving shelter so nothing goes missing.

## Key features

- **National Need Index.** Every county in the United States (3,141 in total) is scored from 0 to 100 for how badly it needs food, built from public USDA and Census data. This drives which deliveries are prioritized. Type in any town and it works.
- **Urgency based ranking.** Deliveries are ranked by a combined score of need and time, so food that spoils soonest and serves the highest need rises to the top. Cards are flagged URGENT or MOST IN NEED.
- **Real time geocoded matching.** Real addresses are looked up and placed on a live map. Stores, food banks, and drivers are matched within a 20 mile radius.
- **Two sided verification.** Every store, food bank, and driver completes a step by step identity verification before joining.
- **Confirmation handshake.** When a driver marks a delivery complete, the receiving food bank confirms it. A dispute quietly flags the delivery for review, with no public rating or shaming of volunteers.
- **Self healing dispatch.** If a driver cancels a run, the food is automatically reopened with an urgency boost so the next nearby driver can grab it.

## Tech

- Single page web app, plain HTML, CSS, and JavaScript, no build step.
- Leaflet with CARTO basemaps for the live map (no API key).
- OSRM public routing for real driving routes (no API key).
- OpenStreetMap Nominatim for address geocoding (no API key).
- Browser storage for persistence across sessions.
- The Need Index is delivered as a JSON dataset produced by a reproducible Python pipeline from public data.

## How to run it

No install needed.

1. Download or clone this repository.
2. Open `index.html` in any modern browser.

Or visit the live link at the top of this README.

For the full national dataset to load, keep `need_index.min.json` in the same folder as `index.html`. If it is missing, the app falls back to built in New Jersey scores so it still runs.

## Project files

- `index.html` - the entire application.
- `need_index.min.json` - the national Need Index used by the app.
- `need_index.json` - the same data, pretty printed for readability.
- `needIndex.js` - a helper library for looking up and sorting by need score.
- `build_need_index.py` - the reproducible pipeline that builds the Need Index from public data.

## Data sources

- ReFED, US Food Waste reports (surplus and donation figures).
- USDA Economic Research Service, Household Food Security and Food Access data.
- Feeding America, Map the Meal Gap methodology.
- US Census Bureau, American Community Survey (poverty and income).

## Team

Built for FutureHacks 2026.

- Application, product design, and front end engineering: Aryan Saksena
- National Need Index model and dataset: Aria Saksena

## Note

This is a functional prototype. Identity verification is simulated and no real documents are stored. Production features such as email notifications, background cron jobs, and automated confirmations are described as next steps and are not part of this demo.
