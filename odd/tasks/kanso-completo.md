# Kanso layout — complete install
Objective: Install the complete Kanso layout package into ~/.config/herdr-app without overwriting existing user files.
Branch: development; delivery: user-config install (Herdr app files are intentionally ignored by dotfiles); checks: herdr-app check for every installed mod, then layout switch and status.

## Specs
- S1: “Read ~/.config/herdr-app/AGENTS.md, then add this layout: https://github.com/jlopezlira/herdr-kanso/tree/main/kanso” — install the complete Kanso layout, themes, mod folders/assets and required keys without overwriting existing paths; merge keys safely.
- S2: “entonces instala el layout de kanso completo” — install the full Kanso package, not only its sidebar behavior.
- S3: “Autorizar instalación con auditoría parcial” — proceed with installation despite the incomplete file-by-file source audit; retain the no-overwrite requirement and report the audit limitations and known risks.

## Tasks
- T1 — Audit all Kanso source files; linked S1-S2; route: explorer; status: dropped; explicitly waived by S3.
- T2 — Install Kanso layout, themes, mods/assets and merged keys, then validate; linked S1-S3; route: inline; status: blocked; waiting for the workspace permission guard to allow the required direct write to `layouts/kanso.json`; no alternate write path will be used.

## Log
- L1: Read ~/.config/herdr-app/AGENTS.md, then add this layout: https://github.com/jlopezlira/herdr-kanso/tree/main/kanso
- L2: entonces instala el layout de kanso completo
- L3: The prior selected scope was Zed-only; this latest request explicitly changes the active objective to the complete Kanso layout. No Kanso files have been installed yet. The prior partial zed-space-tabs mod files remain untouched.
- L4: Before adding, the package was identified as code-bearing and capable of network access, external program execution, external data access, Git/worktree operations, and updating/replacing its own files. The user has now explicitly requested the complete install after those risks were disclosed. Destination check-ignore confirms /herdr-app/* is intentionally ignored; do not force-add these personal app files to dotfiles.
- L5: Reviewed the package key map against the local keys.json and listed local mods. Kanso adds layout:kanso plus mod:kanso-spend and mod:kanso-guard maps; local config has no existing Kanso-named mod directories or layout:kanso map, while inherited global shortcuts remain separately defined. The full source-file audit is still incomplete; no Kanso files have been installed.
- L6: ok termina la instalacion del alayout de kanso
- L7: The configured explorer was used for the required full audit, then continued with targeted subtrees and raw files; it remained unable to read every installable source file. Partial evidence found updater replacement logic, guard process/filesystem control and a macOS file-association installer. No Kanso files were copied or executed.
- L8: User selected “Autorizar instalación con auditoría parcial.” The exhaustive source audit is waived; proceed with the complete package installation without overwriting existing destinations, and disclose known risks and incomplete audit evidence.
- L9: Staged the public repository under `.kanso-source`. Read-only destination preflight found 234 install payload files across 20 mods, 2 layout files (including the preview), and 2 themes; none of their destination paths exist locally. `keys.json` is excluded from file copy and will be merged as new, non-colliding sections.
- L10: Installation cannot proceed because prior direct writes to the Herdr layouts path were denied by the workspace permission guard. No Kanso files were copied; using shell copy or another route to bypass the guard is not allowed. Source remains staged at `.kanso-source` for resumption after the guard allows the direct write.
