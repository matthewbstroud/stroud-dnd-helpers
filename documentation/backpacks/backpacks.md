# Backpacks System User Guide

The **Backpacks** feature in Stroud's DnD Helpers provides an automated system for managing character backpacks, including dropping, picking up, and tracking backpack contents with realistic weight calculations.

## Overview

The backpack system allows characters to:
- **Drop backpacks** to reduce encumbrance during combat
- **Pick up backpacks** to retrieve stored items
- **Automatically track** backpack contents and weights
- **Handle orphaned backpacks** when characters are deleted
- **Force weight recalculation** when needed

## How Backpacks Work

### Automatic Backpack Creation
When a character drops their backpack:
1. A new backpack actor is created in the world
2. The items that had been in the container on the character are transferred to the backpack actor.
3. Character's weight is recalculated (reduced)
4. Backpack is placed on the scene as a token

## Using the Backpack System

### Accessing Backpack Macros
1. Navigate to **Compendiums** > **Stroud's DnD Helpers** > **Macros** > **SDND GM Macros** > **Backpacks**
2. Import the following macros:
   - **Drop Backpack**
   - **Pickup Backpack**
   - **Force Check** (weight recalculation)

### Dropping a Backpack

#### Step-by-Step Process:
1. **Select Character Token**: Click on the character token who wants to drop their backpack
2. **Run Drop Backpack Macro**: Execute the macro from your hotbar
3. **Automatic Transfer**: The system will:
   - Create a new backpack actor
   - Transfer non-essential items to the backpack
   - Update character's weight and encumbrance
   - Place backpack token on the scene near the character

#### What Happens:
```
Before: Character carrying 150 lbs (heavily encumbered)
After:  Character carrying 45 lbs + Backpack with 105 lbs
```

### Picking Up a Backpack

#### Step-by-Step Process:
1. **Select Character Token**: Click on the character who wants to pick up a backpack
2. **Select Backpack Token**: Hold Shift and click the backpack token
3. **Run Pickup Backpack Macro**: Execute the macro
4. **Automatic Transfer**: The system will:
   - Transfer all items from backpack to character
   - Update character's weight and encumbrance
   - Remove the backpack token from the scene
   - Delete the empty backpack actor

#### Requirements:
- Both character and backpack tokens must be selected
- Character must have permission to access the backpack
- Backpack must be within reasonable distance (optional setting)

### Interacting with Dropped Backpacks

#### Backpack Interaction Menu
When you click on a dropped backpack, you'll see an interaction menu with various options depending on your permissions and the backpack type:

**Available Options**:
- **Open**: Browse the backpack contents and inventory
- **Pick up**: Retrieve the backpack and transfer all items back to character (owner only)
- **Grant Permission**: Share access with other players (owner only)

#### Distance Requirements
- **10 feet maximum**: Characters must be within 10 feet of a backpack to interact with it
- **Bypassed for GMs**: Game masters can interact with backpacks at any distance
- **Visual feedback**: System shows warning if character is too far away

#### Accessing Backpack Contents
1. **Click the backpack token** to see the interaction menu
2. **Select "Open"** to browse the backpack inventory
3. **Drag items** from backpack to character sheet (if you have permission)
4. **Drop items** from character sheet onto backpack to store them

#### Repositioning Backpacks
- **Drag the backpack token** to move it to a new location on the scene
- **Use standard token controls** (rotate, resize if needed)
- **Position strategically** for easy party access or concealment

#### Looting from Backpacks
1. **Click the backpack token** and select "Open"
2. **Drag desired items** from the backpack inventory to your character sheet
3. **System automatically updates** weight calculations for both characters
4. **Chat notifications** show what items were transferred

#### Storing Items in Backpacks
1. **Open your character sheet** and the backpack through the interaction menu
2. **Drag items** from your inventory to the backpack inventory
3. **Drop items directly** onto the backpack token (if supported)
4. **Use inventory management** tools to organize contents

### Managing Backpack Permissions

#### In-Game Permission Granting
The easiest way to grant access is through the interaction menu:

1. **Click the backpack token** (as the owner)
2. **Select "Grant Permission"** from the menu
3. **Choose a player** from the list of online users
4. **System automatically grants** Owner-level access
5. **Chat notification** confirms permission was granted

#### Manual Permission Configuration
For more detailed permission control:

1. **Right-click the backpack token** and select "Configure"
2. **Go to the Permissions tab**
3. **Set player permissions**:
   - **Observer**: Can see contents but not take items
   - **Owner**: Can take and add items freely
   - **Limited**: Can see basic information only

#### Alternative Permission Method
1. **Open the backpack's actor sheet**
2. **Click the permissions button** (usually a lock icon)
3. **Add specific players** with desired permission levels
4. **Save changes** to apply new permissions

#### Permission Features
- **Owner Protection**: Only backpack owners see "Grant Permission" option
- **Active Users Only**: Permission list shows only online, non-GM players
- **Automatic Ownership**: Granted users get full access to backpack contents
- **Chat Feedback**: System announces when permissions are granted

### Force Weight Check

#### When to Use:
- After manually adding/removing items
- When encumbrance seems incorrect
- After importing characters
- When troubleshooting weight calculations

#### How to Use:
1. **Select Character Token(s)**: Select one or more character tokens
2. **Run Force Check Macro**: Execute from hotbar
3. **Automatic Recalculation**: System recalculates all weights and encumbrance levels

## Weight and Encumbrance

### Encumbrance Levels
The system uses D&D 5e encumbrance rules:

**Normal**: Up to 5 × Strength score
- No movement penalty
- Full movement speed

**Encumbered**: 5 × Str to 10 × Str  
- Speed reduced by 10 feet
- Disadvantage on ability checks, attack rolls, and saving throws using Strength, Dexterity, or Constitution

**Heavily Encumbered**: 10 × Str to 15 × Str
- Speed reduced by 20 feet  
- Disadvantage on ability checks, attack rolls, and saving throws using Strength, Dexterity, or Constitution

**Over Limit**: More than 15 × Strength
- Cannot move
- Must drop items to continue

### Weight Calculation
- **Automatic**: System calculates weight based on item quantities and individual weights
- **Real-time**: Updates immediately when items are added/removed
- **Visual Indicators**: Character sheets show encumbrance status
- **Chat Notifications**: System reports weight changes in chat

## Backpack Management

### Backpack Permissions
- **Owner**: Character who dropped the backpack maintains ownership
- **Party Access**: Other party members can view but not edit (configurable)
- **GM Access**: GMs have full access to all backpacks

### Backpack Organization
- **Automatic Sorting**: Items transferred in logical order
- **Quantity Preservation**: Stack sizes maintained during transfer
- **Identification**: Backpacks named after original owner
- **Location Tracking**: System remembers where backpack was dropped

### Orphaned Backpack Cleanup

#### What Are Orphaned Backpacks:
- Backpacks whose original owner was deleted
- Backpacks with broken ownership links
- Abandoned backpacks from previous sessions

#### Cleanup Process:
1. **Run Cleanup Macro**: Use "Remove Orphans" from GM macros
2. **Review List**: System shows all orphaned backpacks
3. **Confirm Deletion**: Choose to delete or reassign ownership
4. **Automatic Cleanup**: System removes tokens and actors

## Advanced Features

### Automatic Event Handling
The system responds to various game events:

**Item Addition**: 
- Recalculates weight when items added to character
- Updates encumbrance status
- Shows notifications if encumbrance level changes

**Item Removal**:
- Reduces character weight accordingly
- Updates movement speeds
- Removes penalties if no longer encumbered

**Actor Deletion**:
- Marks associated backpacks as orphaned
- Prevents broken references
- Enables cleanup later

### Debounced Processing
- **Performance Optimization**: Multiple rapid changes processed together
- **Prevents Spam**: Avoids excessive notifications
- **Smooth Operation**: No lag during bulk item operations

### Integration with Other Systems
- **Mounts System**: Works with mount carrying capacity
- **Combat System**: Considers encumbrance in initiative
- **Inventory Management**: Compatible with other inventory modules

## Best Practices

### For Players:
1. **Drop Before Combat**: Drop heavy backpacks before fighting for better mobility
2. **Organize Gear**: Keep essential items equipped, store extras in backpack
3. **Check Weight**: Use force check after major gear changes
4. **Communicate**: Let party know when dropping backpacks in shared spaces
5. **Set Permissions**: Grant party access to your backpack for emergencies
6. **Position Strategically**: Place backpacks in safe, accessible locations
7. **Loot Responsibly**: Ask permission before taking items from others' backpacks

### For GMs:
1. **Regular Cleanup**: Periodically clean up orphaned backpacks
2. **Monitor Encumbrance**: Use system notifications to track party mobility
3. **Realistic Consequences**: Enforce movement penalties for encumbered characters
4. **Backup Important Items**: Note valuable items before major transfers

## Troubleshooting

### Common Issues:

**Weight Not Updating**:
- Run Force Check macro on affected character
- Verify item weights are set correctly
- Check for duplicate items

**Can't Pick Up Backpack**:
- Ensure both character and backpack are selected
- Check ownership permissions
- Verify backpack isn't locked by another player

**Missing Items After Transfer**:
- Check both character and backpack inventories
- Look for items in different categories
- Run Force Check to refresh displays

**Backpack Won't Drop**:
- Ensure character has items to transfer
- Check for permission issues
- Verify character isn't in combat (if restricted)

### Debug Information:
The system provides console logging for troubleshooting:
- Item transfer details
- Weight calculations
- Permission checks
- Error messages

## Configuration Options

### Module Settings:
- **Auto-calculate Weight**: Enable/disable automatic weight calculation
- **Encumbrance Penalties**: Apply movement and ability penalties
- **Distance Restrictions**: Limit pickup range for backpacks
- **Combat Restrictions**: Prevent backpack operations during combat
- **Notification Level**: Control chat message frequency

This backpack system provides realistic inventory management while maintaining game flow and reducing micromanagement for both players and GMs.
