# Nutrition · a Life app

Static HTML/CSS/JS dashboard for what goes **into and onto** Julius's body: food, drink, supplements and skincare.

- Open `index.html` directly (file://, which uses the `data.js` fallback) or serve the folder (`python3 -m http.server`, which fetches `data/index.json`).
- Logging happens by chatting with the Nutritionist agent, which writes `data/days/YYYY-MM-DD.json`, then runs `python3 build_data.py` to refresh `data/index.json` and `data.js`.
- Privacy: periods only (morning / midday / evening). No clock times, no location names.

## Data
- `data/days/*.json`: items `{name, period, kind food|drink|supplement|skincare, qty, kcal, protein, fat, carbs{sugars{fruit,added,lactose},fiber,starch}, micros, cost_thb, estimate, evidence, flags}` plus `mood`.
- `data/pantry.json`: label facts, ingredients (INCI) and unit price per product.
- `data/training.json`: Fitbot's weekly endurance plan.
- `data/extras.json`: micro targets, ancestral corner, and swaps with THB/week.

Values marked `~` are estimates until labels arrive. A `null` cost shows as "add price".
