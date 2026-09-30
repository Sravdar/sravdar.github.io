# Foxmap CDN

CDN for foxmap app.

## Carousel JSON

Access via `https://raw.githubusercontent.com/Sravdar/sravdar.github.io/foxmap-data/carousel/carousel.json`

Carousel data is served from the CDN as JSON. Each carousel is identified by `id` (e.g. `homescreen`).

### Structure

- `version` – schema version
- `updatedAt` – last update time (ISO 8601, UTC)
- `carousels[]` – list of carousels
  - `id` – unique carousel name
  - `settings` – carousel defaults
    - `autoplay`, `loop`, `showDots`, `showArrows` – booleans
    - `pauseOnHover` – pause autoplay on hover (default `false`)
    - `defaultDurationMs` – time each slide is shown
    - `defaultTitleColor`, `defaultDescColor` – hex colors
  - `slides[]` – list of slides

### Slide fields

Only `id` is required. All other fields are optional.

| Field | Description |
|---|---|
| `id` | Unique slide ID |
| `isActive` | Set to `false` to disable the slide. Default `true` |
| `priority` | Display order; lower number is shown first |
| `title` / `titleColor` | Title (string or span list) and its default color |
| `desc` / `descColor` | Description (string or span list) and its default color |
| `foregroundImage` | Image shown above the background (string or image object) |
| `backgroundImage` | Background image (string or image object) |
| `backgroundColor` | Background hex color |
| `url` | Opens on click; slide is not clickable if omitted |
| `startAt` / `expireAt` | Active window (ISO 8601, UTC) |
| `durationMs` | Overrides `defaultDurationMs` for this slide |

### Text (`title`, `desc`)

Either a plain string:

    "title": "Normal title"

Or a list of spans, rendered with Flutter `TextSpan`:

    "title": [
      { "text": "Discover our " },
      { "text": "featured", "color": "#FF5722", "bold": true },
      { "text": " products today." }
    ]

Span properties (all optional except `text`), mapped to Flutter `TextStyle`:

| Property | Values |
|---|---|
| `text` | Span text (required) |
| `color` | Hex color. Falls back to `titleColor` / `descColor` |
| `backgroundColor` | Hex color behind the text |
| `fontSize` | Number |
| `bold` | `true` = `FontWeight.bold` (shortcut) |
| `fontWeight` | `w100`–`w900`, `normal`, `bold`. Overrides `bold` |
| `italic` | `true` = `FontStyle.italic` |
| `fontFamily` | Font name registered in the app |
| `letterSpacing`, `wordSpacing` | Number |
| `height` | Line height multiplier |
| `decoration` | `none`, `underline`, `overline`, `lineThrough` (or a list to combine) |
| `decorationColor` | Hex color |
| `decorationStyle` | `solid`, `double`, `dotted`, `dashed`, `wavy` |
| `decorationThickness` | Number |

### Images (`foregroundImage`, `backgroundImage`)

Either a plain URL string (default fit and alignment):

    "backgroundImage": "https://cdn.example.com/beach.webp"

Or an object:

    "foregroundImage": {
      "url": "https://cdn.example.com/shoes.webp",
      "fit": "contain",
      "alignment": "bottomRight"
    }

| Property | Values |
|---|---|
| `url` | Image URL (required) |
| `fit` | Flutter `BoxFit`: `fill`, `contain`, `cover`, `fitWidth`, `fitHeight`, `none`, `scaleDown` |
| `alignment` | Flutter `Alignment`: `topLeft`, `topCenter`, `topRight`, `centerLeft`, `center`, `centerRight`, `bottomLeft`, `bottomCenter`, `bottomRight`, or `{ "x": -1..1, "y": -1..1 }` |

Defaults: background uses `cover`, foreground uses `contain`, both aligned `center`.

### Colors

Hex as `#RRGGBB` or `#AARRGGBB` (alpha first, same order as Flutter's `Color(0xAARRGGBB)`).

### Rules

- A slide is shown only if `isActive` is not `false` and the current time is within its `startAt`/`expireAt` window.
- Slides are sorted by `priority` (ascending). Slides without `priority` go last. Ties keep their order in the JSON.
- Text color priority: span `color` → `titleColor`/`descColor` → carousel default → app default.
- Unknown values (e.g. an unsupported `fit`) are ignored and the default is used.
- Layer order: background color → background image → foreground image → text.