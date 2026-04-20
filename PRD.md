# French Press App — Product Requirements Document

## Problem
Coffee drinkers who own a French press often get inconsistent results
because the variables (coffee-to-water ratio, water temperature, grind
size, steep time) interact in ways that are hard to calculate mentally.
They currently follow generic recipes from a bag of beans, wing it from
memory, or give up and settle for mediocre coffee. Every time they
switch beans or press sizes, they're back to guessing.

## User
A home coffee drinker who owns a French press and makes coffee 3–5
times a week, already understands the basics of the process, and wants
precise results without having to memorize different recipes for
different roasts or own specialized equipment like a scale or
thermometer.

## The One Thing It Does
This app lets the user enter four variables (press size, roast level,
grind size, desired strength) so that they can brew a precisely-measured
French press following a guided, timed walkthrough.

## Core Features
1. Live-updating recipe calculator — four inputs drive four outputs
   (coffee dose, water volume, water temperature, steep time)
2. Guided six-step brew flow with auto-advancing countdown timers and a
   pause option
3. Metric/imperial unit toggle that cascades across the entire app
4. Save and load named recipes via localStorage

## What It Does NOT Do
- No accounts, login, or authentication
- No cloud sync — recipes are local to the browser
- No social features, sharing, or community
- No Bluetooth scale integration
- No post-brew feedback or rating system
- No educational / French Press 101 content (v2 scope)
- No prep-phase guidance — assumes the user knows to grind beans and
  heat water
- No bean library or roast tracking across brews

## Success Condition
A user can open the app in a browser, configure a recipe, run through
the full brew flow to completion, save the recipe with a name, close
the browser, return a day later, load the saved recipe, and brew
successfully.

## Data Stored
All in localStorage, no backend:
- Saved recipes (name + four config values per recipe)
- User's unit preference (metric or imperial)

## Calculation Logic

Coffee dose (g) = water_ml × strength_ratio / 100
  Strength ratios: weak 5.5, mild 6, balanced 6.5, strong 7.5, bold 8.5

Water temp by roast:
  light 96°C (205°F), medium 93°C (200°F), dark 90°C (195°F)

Base steep time (seconds):
  light 270, medium 240, dark 210

Grind adjustment to steep time (seconds):
  extra-fine -90, fine -60, medium -30, coarse 0, extra-coarse +30
  (floor at 90 seconds minimum)

Bloom water = 2 × coffee dose

Press sizes: Small (350 ml / 2 cups), Standard (500 ml / 3 cups),
Large (1000 ml / 6 cups), or user-entered custom (200–2000 ml).

Imperial conversions: coffee in tablespoons (dose_g / 5.5) with grams
as secondary, water in fl oz, temp in Fahrenheit.

## Tech Stack
- React + Vite + TypeScript
- Tailwind CSS for styling
- localStorage for persistence (wrapped in try/catch — Safari private
  mode disables it, app must degrade gracefully)
- No routing library — screens are conditional state
- No state management library — useState and useReducer only
- Deployed to Vercel via GitHub auto-deploy
