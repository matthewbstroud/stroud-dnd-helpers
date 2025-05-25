# Readme
My collection of automation for foundy v12 and DND 5e (v4.4.2)

If you appreciate the module support me [HERE](https://ko-fi.com/sdnddonations)

Configuring midi-QOL tends to be a challenge for new players.  I have included my settings [HERE](/misc/StroudDnDMidiQOLSettings_v11.json "download").  
Feel free to download them and install them as a starting point.

You can install these settings as follows: 
- Configure Settings
- midi-QOL Settings
- Click Workflow Settings
- Select Misc tab
- Click the Import midi-qol settings from JSON file. 

There are also some convenient effects that I use in the adventures
Grab them [HERE](/misc/fred_custom_effects.json "download").  

# Utility Macros
- **Chat**
  - **Prune Chat Log**: Click to gain access to two options
    - **Remove Recent Messages**:  Delete messages that were created less than a specified number of minutes ago.  (Defaults to 30)
    - **Remove Old Messages**: Delete messages older than a specified number of days. (Defaults to 7)
- **Combat**
  - **Apply Adhoc Damage**: A macro that allows you select 1 to many tokens and then apply any type of damage to them. Creates both a chat message and midi-QOL damage card.  You can specify in settings whether or not to automatically apply the damage card.
  - **Start Filtered Combat**: Allows you to select everything on the battlefield, but exclude tokens that belong to specific folders or are already dead.
- **Item Piles Integration**
  - **Drop Containers**: You can drop a backpack filled with items.  You can open and interact with the backpack on the ground as well as moving its position.  You can pick up the backpack to return it to your inventory with all items still inside.
- **Identification**: Helper methods for creating unidentified items and allowing them to be identified either by the Gamemaster or through the identify spell.
  - **Create Unidentified Item**:Create an unidentified item from the currently viewed magic item.  Item will be placed in the same folder as the original.
  - **Identify Item**: Macro for Gamemaster to identify an item in the player's inventory.  (Useful for NPC based identification.)
  - **ItemMacro for Identify Spell**:  Allows a player to cast identify and be presented with a list of unidentified items in their inventory.
- **Journal**
  - **Session Summaries**:  Generates a journal entry that is a snapshot of each player's current hp, experience, and money.
- **Lighting**
  - **Lights**: Helper functions to manage lights.
    - **Update**: Search for lights based on color and animation and change their settings.
  - **Fireplaces**:  Functions for creating an active tile to toggle a fireplace light and sound effect on and off.
    - **Create Fireplace**: draw a tile that overlaps your fireplace light and sound effect, then run this macro to create a monk's active tile that will toggle the fireplace on and off.
    - **Toggle Fireplace**: a behind the scenes macro triggered by the fireplace tile.
    - **Rewire Fireplaces**:  looks for fireplaces with the macro toggleFireplace.  This will automatically import the toggleFireplace macro from the compendium and set it as the active macro.  This function is there to fix any copied maps.
- **Macros**
  - **Organize**: Automatically organizes all macros under a Player Macros folder.  A sub-folder is created for each user.  If a macro was created by a user that no longer exists, it will be removed.
- **Manage Money**: Click to activate one of the following
  - **Give Money**: Specify an amount of money to give to all or specific players.
  - **Take Money**: Take an specified amount of money from a selected player or evenly from amount all players.
  - **Equalize Money**: Get the sum of all players money and then distribute it equally across all characters.
- **Music**
  - **Combat**: Combat playlist can be set in the module settings.
    - **Start**: Start combat music if it isn't already playing.
    - **Toggle**: Toggle the current state of combat music.
- **Poisons**
  - Add the ability to craft and use poisons.
    - Basic Poison
    - Advanced Poison
- **Scene**: Scene macros
  - **Rewire Monk's Active Tiles**: When you duplicate a scene, the links to other scene tiles still point to the original scene.  This macro will rewire them to the current scene.
- **Tagging**: Allows a simple command-line system for tagging selected placeables and then having the ability to toggle their state.
  - Doors
    - tagSelected
    - setDoorState
  - Lights
    - tagSelected
    - toggle (on/off)
  - SFX
    - tagSelected
    - toggle (on/off)
  - Tiles
    - tagSelected
    - trigger
- **Tokens**
  - **Manage Tokens**
    - **Toggle NPC Name**: Works in conjunction with Hide Name from Combat Utility Belt.  Toggles an NPC token between display name hover owner and display name hover all.  Also toggles the hide npc name in CUB.
    - **Show Token Art**: Show the character art associated with the selected token as an image popout.
    - **Push Prototype Changes**: This will allow you to push prototype changes to the current scene.  Simply select a token and run the macro.
- **Weapons**
  - **Reload Ranged Weapon**: Allows you to select an equipped ranged weapon and reload it with any available ammo from your inventory.

# Supported Class Features
|Class|Feature|Compendium Feature|Cast or Use Macro|Required NPC|Comments|
|---|---|---|---|---|---|
|Cleric|Twilight Sanctuary|True|False|None|Handles checking for range to caster for each player at end of turn.  Prompts player to clear a condition or apply temp hp. Automatically rolls a final heal on removal, if out of combat.|
|Wizard|Portent Dice|False|False|None|Macro under Stroud DnD Shared Macros that will create the players portent dice.  Each die is a single use item and this feature is sync with their Portent daily uses.|

# Feature Helpers
Feature|Compendium Feature|Cast or Use Macro|Required NPC|Comments|
|---|---|---|---|---|
|Enable Great Weapon Master|True|False|None|When used, your next attack will be at -5 attack roll and +10 damage roll.|
|Enable Sharpshooter|True|False|None|When used, your next ranged attack will be at -5 attack roll and +10 damage roll.|

# Supported Spells
|Spell|Compendium Spell|Cast or Use Macro|Required NPC|Comments|
|---|---|---|---|---|
|Hunter's Mark|True|True|None|Allows multiple players to mark the same target simultaneously.|
|Spiritual Weapon|True|True|Spiritual Weapon||

# Magic Items
|Type|Name|Notes|
|---|---|---|
|Melee Weapon|Lightbringer|Gives a passive effect that can be enabled/disabled by the user.  When enabled the weapon will hit for an extra 1d6 damage against undead targets.|
|Melee Weapon|Ogran|+2 Maul that also adds +1 AC.|
|Melee Weapon|Devotee's Censer|Does radiant damage and can heal allies.|
  
# Required Modules  
| Module | Verified Version | manifest location 
| --- | --- | --- | 
| Active Auras | 0.12.2 | https://github.com/kandashi/Active-Auras/releases/latest/download/module.json |
| Active Token Effects | 0.8.1 | https://github.com/kandashi/Active-Token-Lighting/releases/download/v0.8.1/module.json |
| Automated Animations | 4.2.74 | https://github.com/otigon/automated-jb2a-animations/releases/latest/download/module.json |
| Dynamic effects using Active Effects (DAE) | 12.0.25 | https://gitlab.com/tposney/dae/raw/dndv4/package/module.json |
| Effect Macro | 12.1.1 | https://github.com/krbz999/effectmacro/releases/latest/download/module.json |
| libWrapper | 1.13.2.0 | https://github.com/ruipin/fvtt-lib-wrapper/releases/latest/download/module.json |
| Midi QOL | 12.4.53 | https://gitlab.com/tposney/midi-qol/raw/v12dnd4/package/module.json |
| Monk's Active Tile Triggers | 12.02 | https://github.com/ironmonk88/monks-active-tiles/releases/latest/download/module.json |
| socketlib | 1.1.2 | https://github.com/farling42/foundryvtt-socketlib/releases/latest/download/module.json |
  
# Optional supported modules:  
- Anonymous
- D&D Beyond Importer  
- Token Magic FX  
- Visual Active Effects  
- JBA Free or Patreon
- Simple Calendar


