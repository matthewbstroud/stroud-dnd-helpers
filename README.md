# Readme
My collection of automation for DND 5e

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
  - **Delete Chat Messages**: Delete messages that were created less than a specified number of minutes ago.  (Defaults to 30)
  - **Prune Chat Log**: Delete messages older than a specified number of days.  (Defaults to 7)
- **Combat**
  - **Apply Adhoc Damage**: A macro that allows you select 1 to many tokens and then apply any type of damage to them. Creates both a chat message and midi-QOL damage card.  You can specify in settings whether or not to automatically apply the damage card.
  - **Start Filtered Combat**: Allows you to select everything on the battlefield, but exclude tokens that belong to specific folders or are already dead.
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
- **Scene**: Scene macros
  - **Rewire Monk's Active Tiles**: When you duplicate a scene, the links to other scene tiles still point to the original scene.  This macro will rewire them to the current scene.
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

# Supported Spells
|Spell|Compendium Spell|Cast or Use Macro|Required NPC|Comments|
|---|---|---|---|---|
|Hunter's Mark|True|True|None|Allows multiple players to mark the same target simultaneously.|
|Magic Missile|True|True|None|Allows casting each missile individually without spell prompts.|
|Spiritual Weapon|True|True|Spiritual Weapon||

# Magic Items
|Type|Name|Notes|
|---|---|---|
|Melee Weapon|Lightbringer|Gives a passive effect that can be enabled/disabled by the user.  When enabled the weapon will hit for an extra 1d6 damage against undead targets.|
|Melee Weapon|Ogran|+2 Maul that also adds +1 AC.|
  
# Required Modules  
| Module | Verified Version |  
| --- | --- |  
| Active Auras | 0.9.2 |
| Active Token Effects | 0.7.0 |
| Anonymous | 1.4.4 |
| Automated Animations | 4.2.70 |
| DFreds Convenient Effects | 6.0.0 |
| Dynamic effects using Active Effects (DAE) | 11.1.7 |
| Effect Macro | 11.0.3 |
| Simple Calendar | 2.4.3 |
| Item Macro | 1.10.5 |
| JB2A - Jules and Ben's Animated Assets - Free Content | 0.6.4 |
| libWrapper | 1.12.13.0 |
| Midi QOL | 11.3.11 |
| Monk's Active Tile Triggers | 11.19 |
| socketlib | 1.0.13 |
| Template Macro | 11.0.1 |
| Warp Gate | 1.19.2 |
  
# Optional supported modules:  
- D&D Beyond Importer  
- Tidy5e Sheet  
- Token Magic FX  
- Visual Active Effects  

