# v1.0.16: 
# New Features
- Enchance Change Lights
  - Now shows all unique configurations in the scene and allows them to be updated.
  - Can now adjust the following:
    - Animation Type
    - Color
    - Intensity
    - Bright Distance
    - Dim Distance
    - Darkness Activation (min/max)
# v1.0.15: 
# Bug Fixes
- Fix bug with update token from prototype.
# v1.0.14: 
# New Features
- Portent Dice
  - Add a new shared macro that will allow a character with portent dice to create them as single use items in their inventory.
# v1.0.13: 
# New Features
- Token Management
  - Added a function to push prototype changes to all tokens for an actor in the current scene.
# v1.0.12: 
# Bug Fixes
- Sort names in money functions, give, take, and equalize.
# v1.0.11: 
# Bug Fixes
- Fix bug with create session summary.
- Add Identify to auto replace list.
- Handle null check in rewire monk's active tiles.
- Do not default Lightbringer to be equipped.
# v1.0.10: 
# Bug Fixes
- Change parameters for Twilight Sanctuary
- Add midi-QOL settings
# v1.0.9: 
# Bug fixes
- Ending combats started with filtered combat should now auto restart the clock.
- Magic Missile fixes
  - Store Magic Dart in compendium and load from there...  (Allows migration path)
  - Replace Roll() with Use()
# New Features
- Spell installation wizard.  You can now click SDND from your character sheet to replace any applicable spells/features with those from SDND.
# v1.0.7: Bug fixes
- Fix permissions with spawned spiritual weapon.
- Fix summons folder from tokens.releaseInvalid.
- Fix macro folder initialization.
- Update dependencies.
- Make Lightbringer no longer dependent on Item Macro.
# v1.0.6: Bug Fixes
- Spiritual Weapon should automatically load the summon actor when used the first time.
  - Will create an actor folder called SDND Temp Actors
- Spells no longer have dependency on ItemMacro.
# v1.0.5: Bug Fixes
- Change event for Hunter's Mark.
- Session Summary: handle case where token folder is null.
- Change the way that twilight sanctuary works on caster.
- Fix the manage tokens options.
- Fix create fireplace to automatically load the associated macro.
# v1.0.4: Bug Fixes
- Prompt users to accept keybinding updates.
- Automatically trigger combat music to stop when combat ends.
- Don't show release invalid tokens under token management dialog.
# v1.0.3: Macro Consolidation
- Consolidate Delete Chat Messages and Prune Chat log into a single macro that gives a choice.
# v1.0.2: Bug fixes
- Fixed module dependencies.
# v1.0.1: Bug fixes
- Fixed missing images.
# v1.0.0: First test release
- Included all content converted from v9.

