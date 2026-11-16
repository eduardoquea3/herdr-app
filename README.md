# Herdr app configuration

This directory is the file-based configuration and interface for the local Herdr app. Herdr reads layouts, key bindings, settings, themes, and mods from here; many interface changes are picked up live.

## What lives here

- `layouts/`, `mods/`, `keys.json`, `themes/`, and `settings.json` configure the app's interface and behavior.
- `frame/`, `icons/`, generated type declarations, and `AGENTS.md` are app-managed or generated interface assets. The app may rewrite them; do not treat them as independent project source without checking their ownership.
- `data/`, `shared.json`, `view.json`, `window.json`, `settings.json`, `installed.json`, `seen.json`, and update/telemetry files may contain local preferences, runtime state, or app-maintained data.
- `.kanso-source/` is a separate Git repository for the kansō Herdr layout. Work on kansō from that repository and use its own contribution instructions and checks; do not add the directory as ordinary files to this configuration directory's Git repository.

## Git and changes

This directory and `.kanso-source/` have separate Git histories. Check the intended repository root before staging or committing. In this directory, review each file's ownership and purpose first; runtime state, generated assets, and app-managed files should not be committed merely because they appear in `git status`.

For kansō development, see [`.kanso-source/README.md`](.kanso-source/README.md). Its documented checks include `npm test` and `npm run check:version`, run from `.kanso-source/`.
