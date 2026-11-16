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
  cat.js            Lulu the cat (currently switched off in main.js)
  hero.js           the interactive drawings in the hero
  projects.js       the animated project illustrations
```

## Editing

Change the text in `index.html`. To restyle the whole site, start with the colour and font variables in `css/tokens.css`.

The scripts are ES modules, so open the site through a local server (for example `python3 -m http.server`) instead of double-clicking `index.html`.

## Publishing

Pushing to `main` deploys the site to GitHub Pages at https://magdalenapolakowska.github.io/portfolio/ (repository Settings > Pages > Source must be set to "GitHub Actions").
