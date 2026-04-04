# Development Guidelines

## Asset Management
- **Mandatory Import Check**: Whenever adding a new asset (sprite, sound, etc.) to `src/assets/assets.js`, **ALWAYS** verify all files that need to use it.
- **Reference Tracking**: Search for usage patterns of similar assets (e.g., platforms, items) to identify rendering modules that require new import statements.
- **Runtime Verification**: Always test level loads after adding assets to ensure no `ReferenceError` occurs due to missing imports in the rendering pipeline.
