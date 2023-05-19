# Readme
My collection of automation for DND 5e

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
- **Tokens**
  - **Manage Tokens**
    - **Toggle NPC Name**: Works in conjunction with Hide Name from Combat Utility Belt.  Toggles an NPC token between display name hover owner and display name hover all.  Also toggles the hide npc name in CUB.
    - **Show Token Art**: Show the character art associated with the selected token as an image popout.
- **Weapons**
  - **Reload Ranged Weapon**: Allows you to select an equipped ranged weapon and reload it with any available ammo from your inventory.

# Supported Class Features
|Class|Feature|Compendium Feature|Cast or Use Macro|Required NPC|Comments|
|---|---|---|---|---|
|Cleric|Twilight Domain|True|False|None|Handles checking for range to caster for each player at end of turn.  Prompts player to clear a condition or apply temp hp. Automatically rolls a final heal on removal, if out of combat.|

# Supported Spells
|Spell|Compendium Spell|Cast or Use Macro|Required NPC|Comments|
|---|---|---|---|---|
|Hunter's Mark|True|True|None|Allows multiple players to mark the same target simultaneously.|
|Magic Missile|True|True|None|Allows casting each missile individually without spell prompts.|
|Spiritual Weapon|True|True|Spiritual Weapon||
  
# Required Modules  
| Module | Verified Version |  
| --- | --- |  
| Midi-Qol | 10.0.36 |  
| Automated Animations | 4.2.32 |  
| Compendium Folders | 2.5.7 |  
| DFreds Convenient Effects | 4.1.1 |  
| Effect Macro | 10.0.15 |  
| Item Macro | 1.8.0 |  
| Jules & Ben's Animated Assets | 0.5.2 |  
| Monk's Active Tile Triggers | 10.15 |  
| Sequencer | 10.0.0 |  
| Socket Lib | 1.0.12 |  
| Warpgate | 1.16.0 |  
  
# Optional supported modules:  
- Custom Character Sheet Sections  
- D&D Beyond Importer  
- Tidy5e Sheet  
- Token Magic FX  
- Visual Active Effects  

