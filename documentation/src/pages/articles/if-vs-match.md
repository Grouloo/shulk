# If vs match

Let's make a function that takes an UV index (0..+11) and returns a string representing a risk.

## Without Shulk

Not a bad solution per se, but kinda hard to read...

```ts
function imperativeUvToRisk(uv: number) {
  if (0 <= uv && uv <= 2) {
    return "Low";
  } else if (3 <= uv && uv <= 5) {
    return "Moderate";
  } else if (6 <= uv && uv <= 7) {
    return "High";
  } else if (8 <= uv && uv <= 10) {
    return "Very high";
  } else {
    return "Extreme";
  }
}
```

## With Shulk

Much more compact and clear about the business rules!

```ts
import { match } from "shulk";

function declarativeUvToRisk(uv: number) {
  const risk = match(uv).with({
    "0..2": "Low",
    "3..5": "Moderate",
    "6..7": "High",
    "8..10": "Very high",
    _otherwise: "Extreme",
  });

  return risk;
}
```
