# Working in this repository

This is a collection of independent experiments inspired by Simon Willison's
tools repository, rather than a single application.

- Put each experiment in its own descriptively named root-level subdirectory.
  Keep the repository root for shared tooling and documentation.
- Keep each experiment self-contained. Put its source, dependencies, configuration,
  tests, and README in its own directory. Avoid coupling unrelated experiments.
- Prefer a small, understandable implementation. Choose tools to suit the
  experiment; a framework or TypeScript is optional.
- Document what each experiment does, how to install and run it, and any required
  environment variables or limitations. Never commit credentials.
- Use the root Nix flake for the shared Node.js and TypeScript toolchain:
  `nix develop` or `nix develop --command <command>`. Keep `flake.lock` committed
  once generated; update it only intentionally.
- Run dependency installation, builds, and relevant checks from the experiment's
  directory. Use its existing package manager and lockfile. Do not introduce a
  root package manifest just to manage one experiment.
- Validate the behavior you changed and report the commands run. There is no
  repository-wide test command yet; do not claim unrun checks passed.
- In Codex cloud, use the existing checkout: each task already runs in an isolated
  environment. Do not create a Git worktree unless explicitly requested.
