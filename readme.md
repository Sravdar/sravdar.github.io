# Foxmap CDN

CDN for foxmap app.

## Carousel JSON

Access via `https://raw.githubusercontent.com/Sravdar/sravdar.github.io/foxmap-data/carousel/carousel.json`

Carousel data is served from the CDN as JSON. Each carousel is identified by `id`. The home screen shows the carousel whose `id` is `homescreen`.

### Editing

You dont have to write JSON by hand. In the app, press **Ctrl+Alt+Shift+K** on any screen to open the developer tools, then open **Carousel editor**.

### Structure

- `version` – schema version
- `updatedAt` – last update time (ISO 8601, UTC)
- `carousels[]` – list of carousels
  - `id` – unique carousel name (required)
  - `settings` – carousel defaults, all optional
    - `autoplay`, `loop`, `showDots`, `showArrows` – booleans (default `true`)
    - `pauseOnHover` – pause autoplay on hover (default `false`)
    - `defaultDurationMs` – time each slide is shown (default `6000`)
    - `defaultTitleColor`, `defaultDescColor` – hex colors (default white, and white at 70%)
    - `defaultTextAlignment` – where the title and description sit (see [Alignment](#alignment), default `bottomLeft`)
  - `slides[]` – list of slides

### Slide fields

Only `id` is required. All other fields are optional, and a part a slide leaves out is simply not drawn.

| Field | Description |
|---|---|
| `id` | Unique slide ID |
| `isActive` | Set to `false` to disable the slide. Default `true` |
| `priority` | Display order; lower number is shown first |
| `title` / `titleColor` | Title (string or span list) and its default color |
| `desc` / `descColor` | Description (string or span list) and its default color |
| `foregroundImage` | Image shown above the background (string or image object) |
| `backgroundImage` | Background image (string or image object) |
| `backgroundColor` | Background hex color. Default is the app theme's surface color |
| `url` | Opens on click, in a new tab on web; slide is not clickable if omitted |
| `startAt` / `expireAt` | Active window (ISO 8601, UTC) |
| `durationMs` | Overrides `defaultDurationMs` for this slide |
| `textAlignment` | Where the title and description sit on the slide (see [Alignment](#alignment)). Overrides `defaultTextAlignment` |

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

A title shows at most 2 lines and a description at most 3; longer text ends in "…". Text has a soft shadow so it reads over any picture.

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
| `url` | Image URL (required). A path without `https://`, such as `assets/Fox Avatars/fa_icon.webp`, is an image bundled in the app |
| `fit` | Flutter `BoxFit`: `fill`, `contain`, `cover`, `fitWidth`, `fitHeight`, `none`, `scaleDown` |
| `alignment` | See [Alignment](#alignment) |

Defaults: background uses `cover`, foreground uses `contain`, both aligned `center`.

Size and format:

- The carousel is 2.2 times as wide as it is tall, but never taller than 360 px. On a phone it is about 330 × 150 px. On desktop it is up to 1100 × 360 px, which is wider than 2.2 : 1, so a `cover` background loses some of its top and bottom there. Design a background at about 2200 × 1000 px, sharp on high-density screens, and keep what matters inside its middle 2200 × 720 px band.
- Prefer WebP: it is far smaller than PNG for painted art, and the app caches every image it shows.
- On web, an image host must send CORS headers (`Access-Control-Allow-Origin`). This CDN does. From a host that doesn't, the image still shows but can't be cached, so it is downloaded again on every launch.

### Alignment

Used by an image's `alignment`, a slide's `textAlignment` and a carousel's `defaultTextAlignment`. Maps to Flutter `Alignment`.

Either a name: `topLeft`, `topCenter`, `topRight`, `centerLeft`, `center`, `centerRight`, `bottomLeft`, `bottomCenter`, `bottomRight`.

Or an object, where `-1` is the left or top edge and `1` the right or bottom edge:

    "textAlignment": { "x": 0, "y": -0.5 }

For text, the title and description move together as one block, and their lines follow its horizontal side: left when `x` is below 0, centred at 0, right above 0.

### Colors

Hex as `#RRGGBB` or `#AARRGGBB` (alpha first, same order as Flutter's `Color(0xAARRGGBB)`). The `#` is optional.

### Rules

- A slide is shown only if `isActive` is not `false` and the current time is within its `startAt`/`expireAt` window. The window is checked when the carousel is drawn, so a slide that expires while on screen goes at the next refresh.
- Slides are sorted by `priority` (ascending). Slides without `priority` go last. Ties keep their order in the JSON.
- Text color priority: span `color` → `titleColor`/`descColor` → carousel default → app default.
- Text alignment priority: slide `textAlignment` → carousel `defaultTextAlignment` → `bottomLeft`.
- Unknown values (e.g. an unsupported `fit`) are ignored and the default is used. So are values of the wrong type, and durations, sizes and line heights of zero or below.
- A carousel or slide without an `id` is dropped.
- Layer order: background color → background image → foreground image → text.
- With `loop: false` the arrows stop at the ends, and autoplay stops on the last slide. A carousel with one slide shows no arrows or dots.