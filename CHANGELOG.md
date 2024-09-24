# v11.6.6
# Bug Fixes
- Harvesting
  - Fix name typos
# v11.6.5
# New Features
- Poisons
  - Burnt Othur Fumes
  - Dragon's Breath
  - Jumping Jack Flash
  - Purple Haze
  - Scorpion's Sting
  - Wyvern's Sting
# v11.6.4
# Bug Fixes
- Fixing permission issues when setting flag on npc.
# v11.6.3
# Bug Fixes
- Harvesting
  - Added an event handler for harvesting that must be enabled in settings.
  - An icon will now be placed on a mob when it dies to indicate it can be harvested.  Harvesting the mob will remove the icon.
# v11.6.2
# New Features
- Poisons
  - Death's Bite
# v11.6.1
# New Features
- Harvesting
# Bug Fixes
- Poisons
  - Will now prompt player for roll when crafting.
# v11.6.0
# New Features
- Move Crafting Materials and Roll Tables to DND-Helpers
- New Poison
  - Serpent Venom
# Bug Fixes
- Fixed issue with poison half-damage
# v11.5.13
# New Features
- New Poisons
  - Carrion Crawler Poison
- Added Setting to adjust base poison DC..
- Added Confirmation to Poison Crafting
# v11.5.12
# New Features
- List Poison Recipes Macro
- Craft Poison
  - Now Advances Game Time
# v11.5.11
# New Features
- Poison Recipes
  - Basic Poison
  - Advanced Poison
# v11.5.10
# New Features
- Craft Poisons
  - Basic Poison
  - Advanced Poison
# v11.5.9
# New Features
- Poisons
  - Basic Poison
  - Advanced Poison
# Bug Fixes
- Make times based off simple calendar.
# v11.5.8
# New Features
- Added Bane Weapons
# v11.5.7
# Bug Fixes
- Buff NPCs: fix macro prompt.
# v11.5.6
# New Features
- Actors
  - Added macro for Buff NPCs
# Bug Fixes
- Give Money: Fixed issue with NPCs with no folder.
- Buff NPCs: do not log to console if no change is made.
# v11.5.5
# New Features
- Tagging
  - Toggle Tiles Active State
# Bug Fixes
- Update Scene Token Bars should now properly save the changes.
# v11.5.4
# New Features
- New shared images.
# v11.5.3
# New Features
- Add ability to filter spells by Usability.
# v11.5.2
# Bug Fixes
- Add missing image files.
# v11.5.1
# Bug Fixes
- Restore missing context menus for GM.
# v11.5.0
# New Features
- Add macro to list tags in scene.
# v11.4.9
# New Features
- Add tagging macros.
- Add healed version of bloody axe.
# v11.4.8
# Bug Fixes
- Fix Package Version.
# v11.4.7
# New Features
- Tagging
  - Doors
  - Lighting
  - SFX
  - Tiles
# Bug Fixes
- Async bug with Create Effects.
# v11.4.6
# Bug Fixes
- Async bug with Create Effects.
# v11.4.5
# New Features
- Handle Blight Icor
# Bug Fixes
- Persist Secret Messages once revealed.
# v11.4.4
# Bug Fixes
- Bloody Axe events should only fire for GM.
# v11.4.3
# New Features
- Ryath Root
# v11.4.2
# Bug Fixes 
- buffNpc function
# v11.4.1
# New Features
- Added new command line functions
  - **BuffNpc**:  Allows for changing the HP of a set of NPC actors in bulk.
  - **setPrototypeTokenBarsVisibility**: Allows for change the bar visibility for all tokens.
  - **setTokenBarsVisibility**: Allows changing token bar visibility across a collection of scenes.
# Bug Fixes 
- Fix tiles in training room
# v11.4.0
# Bug Fixes 
- Update Readme
- Update manifest
# v11.3.9
# New Features 
- Make Anonymous an optional feature.
- Add force weight check for all players in scene.
# v11.3.8
# Bug Fixes
- Fix Bloody Axe
- Fix dropping items with CPR adding feats automatically.
# v11.3.7
# New Features 
- Add Bloody Axe
# Bug Fixes
- Handle Simple Calendar not being installed.
# v11.3.6
# Bug Fixes
- Fix Reveal Secret
- Remove unsupported key from module.json
# v11.3.5
# New Features
- Secret Message Macro
- Dropped support of Magic Missle
# v11.3.4
# Bug Fixes
- Backpack fixes.
  - Need to be in an excluded folder.
  - Should not be able to execute the drop backpack macro with a backpack token selected.
  - Should not be considered friendly for buffs.
- Fix issue with play next song being out of range. 
# v11.3.3
# Bug Fixes
- Fix bug drop backpack
# v11.3.2
# Bug Fixes
- Fix bug with re-wire fireplaces.
# v11.3.1
# Bug Fixes
- More bug fixes with checking weight.
- Fix bug with re-wire fireplaces.
# v11.3.0
# Bug Fixes
- Fix chat card damage display in adhoc damage for v12.
# v11.2.9
# Bug Fixes
- Manifest Fix
# v11.2.8
# Bug Fixes
- Make DF Fred Optional
# v11.2.7
# Bug Fixes
- Fix setting primary backpack toggle.
- Allow any container to be dropped.
# v11.2.6
# Bug Fixes
- Fix bug with encumbrance tracking.
- Fix default pemission on drop backpack macro.
# v11.2.5
# New Features
- Items
  - Staff of Defense
# Bug Fixes
- Music in Cabin Limbo
- Make sure active_effects are included in release zip.
# v11.2.4
# New Features
- Drop Backpack
  - Designate your primary pack.
  - Drop pack with all items at your feet.
  - Double-click the item on the ground to retrieve it.
- SDND Encumbrance Rules
  - At 50% max carry weight
    - -2 AC
    - -2 Attack Rolls
    - -2 Strength and Dexterity Saves/Checks
    - -2 Initiative Rolls
  - At 75% max carry weight
    - -4 AC
    - Disadvantage on the following
      - Attack Rolls
      - Initiative
      - Strength Checks/Saves
      - Dexterity Checks/Saves
# Bug Fixes
- Updated Twilight Domain to remove deprecated fields.
# v11.2.3
# New Features
- Remove dependencies for the following
  - Ative Template Lighting
  - Item Macro
  - Simple Calendar
  - Template Macros
# Bug Fixes
- Updated Hunter's Mark to remove deprecated fields.
# v11.2.2
# Bug Fixes
- Upgrade compendiums to DND5e v3.1.2
# v11.2.1
# Bug Fixes
- Fix Ogran icon.
- Made Warpgate optional.
  - Refactored AdHoc Damage to not require warpgate.
# v11.2.0
# Bug Fixes
- Fix button where SDND icon displayed on non-backpack items.
# v11.1.8
# New Features
- Items
  - Added Devotee's Censer.
# v11.1.7
# New Features
- Backpack Helpers (Requires Zhell's Backpack Manager)
  - Added a one-click mechanism for creating a backpack actor and setting the permissions.
  - Added a Transfer Backpack mechanism to give a backpack with all its contents to another player.
  - Added automatic permission synchronization between a player and their backpacks.  
# v11.1.6
# New Features
- Documentation
  - Added documentation for Manage Money
- Features Compendium
  - Added toggles for Great Weapon Master and Sharpshooter.  Player can click this feature and their next attack will apply the feature modifiers.
# v11.1.5
# New Features
- Documentation
  - Added help for Change Lights
  - Added help for Fireplaces
# Bug Fixes
- Trying auto deploy
# v11.1.4
# Bug Fixes
- Fix build issue
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

