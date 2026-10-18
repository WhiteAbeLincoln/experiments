# Experiments

A collection of small tools, prototypes, and ideas, inspired by the spirit of
[Simon Willison's tools repository](https://github.com/simonw/tools): build useful
things, keep them easy to explore, and let the collection grow over time.

## Organization

Each experiment lives in its own descriptively named subdirectory at the repository
root, for example `json-explorer/` or `text-diff/`. Keep the root for shared
development tooling and repository documentation.

Experiments should be independently understandable and runnable. Include a short
README explaining what the experiment does, how to run it, and any limitations.
Keep dependencies, configuration, tests, and generated outputs scoped to the
experiment. Plain HTML and JavaScript are welcome; use TypeScript or a framework
when they help. There is no required shared application or build system.

## Development

Install [Nix](https://nixos.org/download/) with the `nix-command` and `flakes`
experimental features enabled, then enter the shared development shell:

```sh
nix develop
node --version
npm --version
tsc --version
```

The flake provides Node.js 24 (including npm) and the TypeScript compiler on Linux
and macOS, for both x86-64 and ARM64. You can also run individual commands:

```sh
nix develop --command node --version
nix develop --command tsc --version
```

Generate `flake.lock` with `nix flake lock` and commit it to pin the shared
toolchain. Update it intentionally with `nix flake update`. If the flake files are
new and untracked, stage them before running Nix commands so Nix's Git source
filter includes them.

For experiments with npm dependencies, keep a separate `package.json` and lockfile
inside that experiment and use `npm ci` once its lockfile exists. Document its
actual start, build, and test commands in its README. The repository has no
root-level application or test suite yet.
