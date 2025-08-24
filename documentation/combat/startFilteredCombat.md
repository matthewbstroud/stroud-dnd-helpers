# Start Filtered Combat User Guide

The **Start Filtered Combat** feature allows GMs to quickly initiate combat with selected tokens while automatically filtering out invalid tokens and setting up combat music and effects.

## Overview

This feature streamlines the combat initiation process by:
- Automatically filtering out invalid tokens (dead, unconscious, etc.)
- Adding controlled tokens to the combat tracker
- Rolling initiative for NPCs
- Starting combat music
- Pausing the calendar clock during combat
- Managing scene music transitions

## Basic Usage

### Accessing Start Filtered Combat
1. Navigate to **Compendiums** > **Stroud's DnD Helpers** > **Macros** > **SDND GM Macros**
2. Find and import the **Start Combat** macro
3. Drag it to your hotbar for quick access

### Quick Combat Start
1. Select the tokens you want to include in combat
2. Click the **Start Combat** macro
3. The system will automatically:
   - Filter out invalid tokens
   - Create combat encounter
   - Roll NPC initiative
   - Start combat music (if configured)
   - Pause the calendar

## Token Filtering

The system automatically excludes tokens that shouldn't participate in combat:

### Excluded Token Types:
- **Dead Tokens**: Tokens with 0 HP or marked as defeated
- **Unconscious Tokens**: Tokens with the unconscious condition
- **Non-Combat Tokens**: Tokens without actor data
- **Invalid Actors**: Actors that don't have proper combat statistics

### Setting Up Excluded Directories
You can configure which actor folders should be excluded from combat filtering:

1. **Open Module Settings**:
   - Go to **Game Settings** > **Configure Settings** > **Module Settings**
   - Find **Stroud's DnD Helpers** in the list

2. **Configure Excluded Folders**:
   - Look for **Combat Exclusion Settings**
   - Add folder names or IDs that should be excluded
   - Common exclusions include:
     - "Mounts"
     - "Familiars" 
     - "Summons"
     - "NPCs - Non-Combat"
     - "Vehicles"

3. **Folder Path Examples**:
   ```
   Actors/Mounts
   Actors/NPCs/Non-Combat
   Summons and Familiars
   ```

### Manual Token Exclusion
You can also manually exclude specific tokens:

1. **Using Flags**: Set a flag on the actor to exclude them
2. **Token Settings**: Configure token disposition settings
3. **Actor Type**: Use specific actor types that are auto-excluded

## Combat Music Configuration

### Setting Up Combat Playlist
1. **Create Combat Playlist**:
   - Go to the **Playlists** tab
   - Create a new playlist named "Combat" or similar
   - Add your combat music tracks

2. **Configure in Module Settings**:
   - Open **Stroud's DnD Helpers** settings
   - Find **Combat Playlist** setting
   - Select your combat playlist from the dropdown

3. **Music Behavior**:
   - Combat music starts when filtered combat begins
   - Scene music is paused during combat
   - Music stops automatically when combat ends
   - Scene music resumes after combat

### Playlist Options
- **None**: No combat music (default)
- **Combat**: Your designated combat playlist
- **Custom**: Any playlist you've created

## Calendar Integration

If you're using **Simple Calendar**, the system will:
- **Pause the clock** when combat starts
- **Resume the clock** when combat ends
- This prevents time from advancing during tactical combat

## Advanced Features

### Automatic NPC Initiative
- All NPC tokens have initiative rolled automatically
- Uses the NPC's initiative bonus from their stat block
- Results are sorted in initiative order

### Combat State Tracking
- The system tracks combat initialization to prevent duplicate setup
- Combat music won't restart if already playing
- Proper cleanup occurs when combat ends

### Scene Music Management
- Tagged scene music is automatically paused
- Combat music takes priority
- Smooth transitions between music states

## Best Practices

1. **Pre-Select Tokens**: Always select your combat tokens before running the macro
2. **Organize Actors**: Use folder structure to separate combat and non-combat actors
3. **Test Playlists**: Ensure your combat playlist is working before the session
4. **Review Exclusions**: Regularly check your excluded folders list
5. **Initiative Order**: Review and adjust initiative after automatic rolling

## Troubleshooting

### Common Issues:

**No Tokens Added to Combat**:
- Check that tokens are selected
- Verify tokens have valid actors
- Ensure actors aren't in excluded folders

**Music Not Playing**:
- Verify combat playlist is configured
- Check playlist permissions
- Ensure audio is enabled in Foundry

**Calendar Not Pausing**:
- Confirm Simple Calendar module is active
- Check module compatibility
- Verify GM permissions

**Initiative Not Rolling**:
- Check NPC stat blocks have initiative values
- Verify combat tracker permissions
- Ensure tokens have proper actor links

## Examples

### Typical Combat Setup:
1. Select 3 goblin tokens and 1 orc token
2. Run **Start Filtered Combat** macro
3. System adds 4 tokens to combat tracker
4. Initiative is rolled: Orc (15), Goblin 1 (12), Goblin 2 (8), Goblin 3 (6)
5. Combat music starts playing
6. Calendar pauses at current time

### Filtered Combat Example:
1. Select 2 goblins, 1 dead goblin, 1 unconscious player, 1 mount
2. Run **Start Filtered Combat** macro
3. System adds only 2 goblin tokens (excludes dead, unconscious, and mount)
4. Combat proceeds with valid tokens only

This feature significantly speeds up combat initiation while ensuring only appropriate tokens participate in the encounter.
