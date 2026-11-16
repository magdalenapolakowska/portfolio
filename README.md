# Portfolio

A single-page portfolio site with no build step and no frameworks.

## Structure

```
index.html          the content
images/             screenshots used in the case study
css/
  tokens.css        colours for light and dark, and the typefaces
  base.css          reset and page defaults
  components.css    navigation, theme switch, buttons, pills, tool tags
  sections.css      hero, tools, projects, about, work, contact, and responsive rules
js/
  main.js           entry point; redraws canvases on theme or size change
  util.js           shared helpers
  theme.js          light and dark switch
  case-study.js     the case study dialog
  cat.js            Lulu the cat (currently switched off in main.js)
  hero.js           the interactive drawings in the hero
  projects.js       the animated project illustrations
```

## Editing

Change the text in `index.html`. To restyle the whole site, start with the colour and font variables in `css/tokens.css`.

The scripts are ES modules, so open the site through a local server (for example `python3 -m http.server`) instead of double-clicking `index.html`.

## Design rules

These apply to everything on the site.

- **Nested rounded corners:** inner radius = outer radius minus the padding between them.
- **Borders:** alpha colours, not solid hex, so they blend into any background.
- **Palettes:** built in OKLCH, so equal lightness looks equal.
- **Gradients:** interpolate `in oklch`, so they don't go grey in the middle.
- **Icons:** stroke width matches the weight of the text beside the icon.
- **Carousels:** fade the edges with `mask: linear-gradient(90deg, transparent, black 15% 85%, transparent)`.
- **Icon swaps:** the outgoing icon blurs (`filter: blur(4px)`) as it fades out.
- **Dark mode:** depth comes from lighter surfaces, since shadows barely show.
- **Full-height sections:** `100dvh`, not `100vh`, which breaks in Safari.
- **Images on a white background:** `mix-blend-mode: multiply`, so the white disappears.

## Publishing

Pushing to `main` deploys the site to GitHub Pages at https://magdalenapolakowska.github.io/portfolio/ (repository Settings > Pages > Source must be set to "GitHub Actions").
