# Images Compare

A vanilla JavaScript micro-library for comparing two images with a draggable slider.

No dependencies.

![vanilla images compare preview](https://raw.githubusercontent.com/sylvaincombes/vanilla-images-compare/main/preview.gif)

[![CI](https://img.shields.io/github/actions/workflow/status/sylvaincombes/vanilla-images-compare/ci.yml?branch=main&style=flat-square)](https://github.com/sylvaincombes/vanilla-images-compare/actions/workflows/ci.yml) [![npm](https://img.shields.io/npm/v/vanilla-images-compare.svg?style=flat-square)](https://www.npmjs.com/package/vanilla-images-compare) [![npm downloads](https://img.shields.io/npm/dm/vanilla-images-compare.svg?style=flat-square)](https://www.npmjs.com/package/vanilla-images-compare) [![JSR](https://jsr.io/badges/@sylvaincombes/vanilla-images-compare?style=flat-square)](https://jsr.io/@sylvaincombes/vanilla-images-compare) [![license](https://img.shields.io/github/license/sylvaincombes/vanilla-images-compare.svg?style=flat-square)](https://raw.githubusercontent.com/sylvaincombes/vanilla-images-compare/main/LICENSE.md)

## Features

- compatibility: Chrome 80+, Edge 80+, Firefox 74+, Safari 13.1+ (no IE)

- Dependency footprint: none (vanilla JS)

- Appearance fully styled via CSS (easy to skin / customize)

- Touch friendly, mouse drag (Pointer Events), click, and mousemove modes

- Responsive resizing support

- Custom events: `imagesCompare:initialised`, `imagesCompare:changed`, `imagesCompare:resized`

- Value API: `setValue`, `getValue`, `destroy`, `recycle`, `on`, `off`

- Animation on value updates

> NB : This library only does horizontal slide

## Quick start

In your head section, include the css (a minified version is also provided) :

```html
<link rel="stylesheet" href="images-compare.css" />
```

Include the required Javascript, before the closing body tag:

```html
<link rel="stylesheet" href="images-compare.css" />
<script type="module" src="images-compare.js"></script>
```

Alternative (module import):

```html
<script type="module">
    import ImagesCompare from "./images-compare.js";
    const container = document.querySelector("#myImageCompare");
    if (container) new ImagesCompare(container);
</script>
```

No legacy framework required.

Setup your html (minimal example) :

```html
<!-- Main div container -->
<div id="myImageCompare">
    <!-- The first div will be the front element, to prevent FOUC add a style="display: none;" -->
    <div style="display: none;">
        <img src="assets/img/before.jpg" alt="Before" />
    </div>
    <!-- This div will be the back element -->
    <div>
        <img src="assets/img/after.jpg" alt="After" />
    </div>
</div>
```

Initialize the plugin:

```js
import ImagesCompare from "./images-compare.js";
const imageCompare = new ImagesCompare(
    document.querySelector("#myImageCompare"),
);
```

## Documentation

### Install

```sh
bun add vanilla-images-compare
```

Or with npm / pnpm / yarn:

```sh
npm install vanilla-images-compare
```

### Via CDN

No install needed — load directly from [jsDelivr](https://www.jsdelivr.com/) (recommended) or [unpkg](https://unpkg.com/):

```html
<!-- CSS -->
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/vanilla-images-compare/build/images-compare.min.css"
/>

<!-- JS (as ES module) -->
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/vanilla-images-compare/build/images-compare.min.js"
></script>
```

> Pin to a specific version in production, e.g. `.../npm/vanilla-images-compare@1.0.0/build/...`

### Install via JSR

[JSR](https://jsr.io) (JavaScript Registry) is a modern, TypeScript-native package registry.
Unlike npm, it publishes TypeScript source directly — no build step, full types out of the box,
and works natively with Deno, Node, Bun, and any bundler.

```sh
# Bun
bunx jsr add @sylvaincombes/vanilla-images-compare

# Node / npm
npx jsr add @sylvaincombes/vanilla-images-compare

# Deno
deno add jsr:@sylvaincombes/vanilla-images-compare
```

Then import:

```ts
import ImagesCompare from "@sylvaincombes/vanilla-images-compare";
```

Deno can also import directly without installation:

```ts
import ImagesCompare from "jsr:@sylvaincombes/vanilla-images-compare";
```

### Tooling (optional)

This repo includes a `mise.toml` for pinning Bun. If you use `mise`, run:

```sh
mise install
```

You can also install Bun directly if you do not use `mise`.

### Git Hooks (optional)

To enable the pre-commit lint hook:

```sh
git config core.hooksPath .githooks
```

### Plugin settings

You can change settings by passing an options object, e.g. :

```js
const imageCompare = new ImagesCompare(
    document.querySelector("#myImageCompare"),
    {
        initVisibleRatio: 0.2,
        interactionMode: "mousemove",
        addSeparator: false,
        addDragHandle: false,
        animationDuration: 450,
        animationEasing: "linear",
        precision: 2,
    },
);
```

List of available options :

| key               | Description                                                                              | Default value                       |
| ----------------- | ---------------------------------------------------------------------------------------- | ----------------------------------- |
| initVisibleRatio  | Visible ratio of front element on init, float value between 0 and 1                      | 0.5 (front element is half visible) |
| interactionMode   | The interaction mode to use, valid values are "drag" (recommended), "mousemove", "click" | "drag"                              |
| addSeparator      | Add a html separator element ? (thin vertical blank line) - _boolean_                    | true                                |
| addDragHandle     | Add a html "drag handle" element ? - _boolean_                                           | true                                |
| animationDuration | default animation duration in ms                                                         | 400                                 |
| animationEasing   | default animation easing to use ("linear", "swing")                                      | "swing"                             |
| precision         | Ratio precision, numbers after the decimal point                                         | 4                                   |

### Changing appearance

The styling is done via css, to let you change it by css overrides.

#### Css classes

Basic list of main css classes, for full details please have a look at the css file.

| Selector                                                 | Description                          |
| -------------------------------------------------------- | ------------------------------------ |
| \.images-compare-container                               | Container of the elements            |
| \.images-compare-before                                  | Front element                        |
| \.images-compare-after                                   | Back element                         |
| \.images-compare-separator                               | Separator (thin vertical blank line) |
| \.images-compare-handle                                  | Drag handle (circle)                 |
| \.images-compare-left-arrow, .images-compare-right-arrow | Drag handle arrows                   |
| \.images-compare-label                                   | Label class element                  |

#### Markup example with labels

You can add labels, add the class _images-compare-label_ to your elements.

A default styling will be applied, you can override css rules to customize to your needs.

```html
<!-- Main div container -->
<div id="myImageCompare">
    <!-- The first div will be the front element, to prevent FOUC add a style="display: none;" -->
    <div style="display: none;">
        <span class="images-compare-label">Before</span>
        <img src="assets/img/before.jpg" alt="Before" />
    </div>
    <!-- This div will be the back element -->
    <div>
        <span class="images-compare-label">After</span>
        <img src="assets/img/after.jpg" alt="After" />
    </div>
</div>
```

### Events

List of events the plugin triggers :

| Event name                | Description                                                                  |
| ------------------------- | ---------------------------------------------------------------------------- |
| imagesCompare:initialised | This event is fired when init is done                                        |
| imagesCompare:changed     | This event is fired when the value of visible front element is changed       |
| imagesCompare:resized     | This event is fired when a resize window event has been received and treated |

#### Example listening to change event

```js
const imageCompare = new ImagesCompare(
    document.querySelector("#myImageCompare"),
);

imageCompare.on("imagesCompare:changed", function (event) {
    console.log("change");
    console.log(event);
    if (event.ratio < 0.4) {
        console.log("We see more than half of the back image");
    }
    if (event.ratio > 0.6) {
        console.log("We see more than half of the front image");
    }

    if (event.ratio <= 0) {
        console.log("We see completely back image");
    }

    if (event.ratio >= 1) {
        console.log("We see completely front image");
    }
});
```

### Changing value

You can change value of visible front part via code :

```js
const imageCompare = new ImagesCompare(
    document.querySelector("#myImageCompare"),
);
imageCompare.setValue(0);
```

### Changing value with animation

You can change value of visible front part via code and request an animation :

```js
const imageCompare = new ImagesCompare(
    document.querySelector("#myImageCompare"),
);

// pass true as second argument to request animation
imageCompare.setValue(0, true);

// override duration and easing for one call:
// imageCompare.setValue(ratio, animate, duration, easing);
```

### Contribute

Clone the repository, then launch an :

```sh
bun install
```

To lint js and css use :

```sh
bun run lint
```

To build use :

```sh
bun run build
```

To test use :

```sh
bun run test
bun run test:serve
```

(Then open `http://localhost:41721/src/tests/test.html` in a browser.)

On macOS you can also run:

```sh
bun run test:open
```

To open the example page:

```sh
bun run example:serve
```

```sh
bun run example:open
```

_Too look available scripts look at the scripts part in the package.json file_

## Contributors

- [@sylvaincombes](https://github.com/sylvaincombes) (Maintainer)
- [Céline Skowron](https://celine-skowron.fr)

## Credits

### External libs and code

#### Code snippets

- Drag handle appearance influenced by [zurb twentytwenty](https://github.com/zurb/twentytwenty)

## Browser Support

This plugin uses Pointer Events for drag interactions and targets modern evergreen browsers:

- Chrome 55+
- Edge 12+
- Firefox 59+
- Safari 13+

Older browsers (including Internet Explorer) are not supported.

### Images in examples

Images used in example are kindly provided by [Céline Skowron](https://celine-skowron.fr), all rights belong to her so you can't use them anywhere without contacting her.

## License

Released under the MIT license.

## Other libraries on the same subject

- [zurb twentytwenty](https://github.com/zurb/twentytwenty)
- [jquery-beforeafter-plugin](http://www.catchmyfame.com/catchmyfame-jquery-plugins/jquery-beforeafter-plugin/)
- [juxtapose](https://juxtapose.knightlab.com/)
