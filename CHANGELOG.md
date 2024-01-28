# v11.1.3
# Bug Fixes
- Delay auto creation of macro folder.
- Fix readme file.
- Setup auto-publish for FoundryVTT
# v11.1.2
# Bug Fixes
- Remove requirement for Free JBA
- Remove requirement for Advanced Macros
# v11.1.1
# New Features
- Moving hard coded-values into settings.
# v11.1.0
# New Features
- Added a setting to hide the text beside the SDND icon in the Actor sheet.
  - Only show the SDND icon if there is a supported item on the actor.
# Bug Fixes
- Change versioning to match major FoundryVTT version.
# v1.11.13
# Bug Fixes
- Null ref on folder.
# v1.11.12
# New Features
- Add Cabin Limbo to this module.
# v1.11.11
# Bug fixes
- Fix language error
# v1.11.10
# Bug fixes
- Fix build error
# v1.11.9
# Bug fixes
- Fix build error
# v1.11.8
# New Features
- Added a regenerate thumbnails context item to the Scene Folder.
- Added an export module thumbnails context item to the Compendium Item.
- Rewire fireplaces should now also remap the tile image.
# Bug fixes
- Fix image link for Lightbringer
# v1.11.7
# New Features
- utility.scene.packAdventureThumbnails
- utility.dumpDependencies
# v1.11.0
# New Features
- Version 11 Support.
# v1.0.27
# New Features
- Add a manual reset for combat sound tracking.
# v1.0.26
# New Features
- Add a tracker to combat music to ensure no songs repeat until all have been played.
# v1.0.25
# Bug Fixes
- Fix broken cover image.
# v1.0.24: 
# Bug Fixes
- Simulated combat will only be applied to tokens that are not in the current combat tracker.
# v1.0.23: 
# Bug Fixes
- Do not show token art if is already loaded...  (Stop double-click issue.)
# v1.0.22: 
# New Features
- Added new GM Macro to simulate combat damage to a group of selected tokens.
# v1.0.21: 
# Bug Fixes
- Fix system version on calendar gm scripts.
# v1.0.20: 
# New Features
- Add ability for secondary GMs to start the clock on Simple Calendar.
# v1.0.19: 
# Bug Fixes
- Error on toggle npc name.
# v1.0.18: 
# New Features
- Refactored Toggle NPC Name to use the module Anonymous.
# Bug Fixes:
- Remove getUniqueConfigsFromScene from public API.
# v1.0.17: 
# Bug Fixes
- Handle no animation.
# v1.0.16: 
# New Features
- Enhance Change Lights
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

