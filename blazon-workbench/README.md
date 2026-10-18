# Blazon workbench

A small, dependency-free web tool that compiles a bounded subset of English
heraldic blazon into a composable SVG coat of arms. It runs entirely in the
browser; no API keys, server, model calls, or image assets are required.

## Run

From this directory, use the repository's shared Nix shell if available:

```sh
nix develop --command npm start
```

Or use the installed Python and Node.js directly:

```sh
npm start
# Open http://localhost:4173
npm test
```

`npm start` serves `dist/` with Python 3. The tests use Node.js 24's built-in test
runner. There are no dependencies to install and no build step. All source files
are in `dist/`; the directory name also makes the static hosting manifest simple.
The task environment did not have Nix, so validation used the installed Node.js 24.

## Use

Enter a blazon, or choose a Wikipedia example. Validation is automatic; Render
arms (or Ctrl/Cmd+Enter) also compiles immediately. Diagnostics show the line,
column, error code, and a button selecting the offending token. Invalid input
cannot be exported; the last rendering is visibly dimmed. The tabs show the
parsed layers, syntax tree, and SVG source. Choose a shield outline and download
a standalone SVG, or copy a link containing the blazon and outline in its URL
fragment. The latest input and shield shape are kept in browser local storage.

The language guide documents the supported vocabulary and boundaries. It also
reports the expected outcomes of the Wikipedia fixtures, computed in the browser.

## Architecture

- `dist/language.js`: position-aware lexer, recursive-descent parser, tincture
  reference resolution, validation, and advisory tincture checks.
- `dist/render.js`: pure AST-to-SVG renderer. Fields, ordinaries, simple charge
  symbols, layouts, quarterings, and shield outlines are independent building
  blocks. Counterchanging masks a reversed copy of the field in shield
  coordinates; it is not a special illustration for a particular coat of arms.
- `dist/examples.js`: factual blazon descriptions from the Wikipedia
  [Blazon](https://en.wikipedia.org/wiki/Blazon) article, with expected acceptance
  or rejection by this grammar.
- `dist/app.js`, `index.html`, `style.css`: browser UI, export, sharing, and guide.
- `tests/language.test.js`: Wikipedia fixtures, unseen combinations, diagnostics,
  references, composition, malformed input, and SVG integrity checks.

Neither the parser nor the renderer imports the examples. There are no
name-to-image substitutions or example-specific parser rules.

The public module functions are `tokenize(source)`, `parseBlazon(source)`,
`validateBlazon(source)`, and `renderSVG(ast, options)`. `validateBlazon` returns
`{ ok, ast, tokens, warnings }` or `{ ok: false, error, warnings }`. `BlazonError`
contains `code`, `start`, `end`, `line`, `column`, and `found`. Rendering options
include `shape` (`heater`, `french`, `round`), `title`, and an SVG identifier
`prefix` when embedding several outputs in one document.

## Grammar sketch

This is an implementation outline; the in-app reference is the vocabulary guide.
Commas, periods, colons, whitespace, and capitalization are flexible. Semicolons
separate numbered quartering groups.

```ebnf
arms          = field, { charge, { "and", charge } }
              | ("quarterly" | "quartered"), quarterGroup,
                { ";", quarterGroup } ;
quarterGroup  = ["in"], ["the"], ordinal, ["and", ordinal], arms ;
field         = tincture, ["plain"]
              | ["party"], "per", division, tincture, "and", tincture
              | ("quarterly" | "quartered"), tincture, "and", tincture
              | pattern, ["of", count | "(", count, ")"],
                tincture, "and", tincture ;
charge        = ["on"], [placement], count, shape, [modifier],
                [edge], chargeTincture, [placement], ["ill-ordered"],
                { detailColours }, ["between", simpleCharge],
                [simpleCharge | "charged with", simpleCharge] ;
chargeTincture = tincture | "counterchanged"
               | "of", ["the"], ("same" | "field" | ordinal) ;
```

A final tincture may be shared by preceding charge groups. Counts range from 1 to
12; pattern counts range from 2 to 12. All four quarters must be described exactly
once, with up to four nesting levels. `on` requires a following simple charge
and a single chief, canton, bend, fess, bar, or pale. Nested charges on charges and
explicit placements within an ordinary are rejected. Fixed ordinaries have fixed
positions. Crosses can also be repeated as simple charges.

## Scope and drawing conventions

Supported fields include the seven common tinctures, ermine/ermines, six divisions
plus quarterly, and barry/burely, paly, bendy, chequy, and lozengy patterns. Charges
include the common ordinaries and roundels, annulets, lozenges, mullets/stars,
crescents, fleurs-de-lis, roses, trefoils, escallops, trees, lions, eagles, hearts,
crowns, towers, and billets. Supported modifiers and detail colours are listed in
the language guide.

This is **not a grammar for all historical heraldry**. The 24 Wikipedia fixtures
comprise 16 renderable descriptions and eight expected rejections covering, among
others, named quarterings, perrons, griffins, hunting horns, and Churchill's
nested arms. Other large descriptions on the page, such as Hungary and Mayenne,
are outside the implemented subset and are not claimed as rendered or tested.
Unsupported clauses are rejected rather than discarded.

SVG components are schematic. Animal attitudes, edge treatments, and detail
colours are simplified; wavy and engrailed lines use the same approximation.
Charge layout is deterministic, not an attempt at official or pixel-exact
emblazonment. Rule-of-tincture notices are advisory and do not prevent export.
External ornaments, named arms, arbitrary wing charges, semé, and inescutcheons
are not supported.

## Verification

`npm test` runs 60 tests, including all 24 Wikipedia fixtures and a cross-product
of more than 200 unseen field/charge combinations. Additional browser checks
performed during development covered live validation, error-token selection,
AST and SVG tabs, standalone SVG download, shield changes, the guide, and desktop
and 390px mobile layouts. Counterchanged charges and ordinary edges were visually
inspected. The application has no external runtime requests.
