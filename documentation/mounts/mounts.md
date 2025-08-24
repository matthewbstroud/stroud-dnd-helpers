# Mounts System User Guide

The **Mounts** feature in Stroud's DnD Helpers provides a comprehensive system for managing mounts and their equipment, including mounting/dismounting, damage sharing, and hitchable items that modify carrying capacity.

## Requirements

⚠️ **Important**: The Mounts system requires the **Item Piles** module to function properly. 

- **Item Piles Module**: [https://foundryvtt.com/packages/item-piles](https://foundryvtt.com/packages/item-piles)
- **Installation**: Install and enable Item Piles before using the mounts system
- **Integration**: Mounts use Item Piles for inventory management, token interaction, and container functionality

Without Item Piles installed and active, the mounts system will not work.

## System Architecture

Mounts are built as a specialized extension of the **Backpacks** system. They function as intelligent containers with additional mounting capabilities, health tracking, and combat integration. This design allows mounts to seamlessly integrate with the module's inventory management while providing unique mounting mechanics.

## Overview

The mounts system includes:
- **Mount Management**: Mounting and dismounting horses with realistic effects
- **Damage Sharing**: Shared damage between rider and mount during combat (configurable)
- **Health Tracking**: Visual health indicators on mount tokens
- **Hitchable Items**: Carts, sleds, and wagons that increase carrying capacity
- **Automatic Effects**: Mounted combat penalties and AC bonuses
- **Container Integration**: Built on the backpacks system for inventory management

## Mount Types

The module includes three types of mounts, each with different statistics and capabilities:

### **Riding Horse**
- **HP**: 13 (2d10 + 2)
- **AC**: 10 (natural armor)
- **Carrying Capacity**: 480 lbs
- **AC Bonus When Mounted**: +2
- **Cost**: 75 gp

### **Draft Horse**
- **HP**: 19 (3d10 + 3)
- **AC**: 10 (natural armor)
- **Carrying Capacity**: 540 lbs
- **AC Bonus When Mounted**: +1
- **Cost**: 50 gp

### **Warhorse**
- **HP**: 19 (3d10 + 3)
- **AC**: 11 (natural armor)
- **Carrying Capacity**: 540 lbs
- **AC Bonus When Mounted**: +4
- **Cost**: 400 gp

## How Mounts Work

### Mounting Effects
When a character mounts a horse, they receive:

**Benefits**:
- **AC Bonus**: Varies by mount type (+1 to +4)
- **Increased Mobility**: Move at mount's speed

**Penalties**:
- **Disadvantage on Attacks**: All attack rolls while mounted
- **Disadvantage on Dexterity**: Ability checks and saving throws
- **Limited Maneuverability**: Restricted movement options

### Mount Health System
- **Shared Damage**: When a mounted character takes damage, it's split between rider and mount (can be disabled in module settings)
- **Visual Health Indicators**: Mount token shows health percentage with different saddle icons
- **Death Mechanics**: When a mount dies, it automatically dismounts the rider
- **Configurable Damage**: Horse damage sharing can be enabled/disabled via the "Use Stroud DnD Horse Damage" setting

## Using Mounts

### Acquiring a Mount
1. **Purchase from Compendium**: Get mount items from "Stroud's DnD Helpers - Items"
2. **Add to Character**: Drag mount item to character sheet
3. **Equip Mount**: Ensure mount is equipped in inventory

### Dismounting Process
1. **Use Toggle Mount**: Run the same macro to dismount
2. **Drop Mount**: Mount appears as a token on the scene
3. **Effect Removal**: Mounted effects are automatically removed

### Mounting Process
1. **Select Character Token**: Click on the character who wants to mount
2. **Use Mount Macro**: Run the "Toggle Mount" macro or use the interaction menu
3. **Automatic Effects**: System applies mounted effects and visual changes

### Mount Interaction Menu
When interacting with a dropped mount, options include:
- **Open**: Browse mount's inventory and storage
- **Mount**: Mount the horse (owner only)
- **Grant Permission**: Allow other players to access the mount
- **Hitch**: Attach hitchable items to increase capacity

## Hitchable Items

Hitchables are special items (carts, sleds, wagons) that can be attached to mounts to dramatically increase their carrying capacity.

### How Hitchables Work
- **Capacity Multiplier**: When hitched, mount carrying capacity is multiplied by 5
- **Weight Distribution**: Hitchable items distribute weight more efficiently
- **Realistic Mechanics**: Based on D&D rules for vehicles and pack animals

### Carrying Capacity Examples
**Without Hitchable**:
- Draft Horse: 540 lbs carrying capacity

**With Hitchable**:
- Draft Horse + Cart: 2,700 lbs carrying capacity (540 × 5)

### Hitching Process

Hitchables can be attached to mounts in two simple ways:

#### Method 1: Direct Inventory Addition
1. **Open Mount Inventory**: Access the mount's container (either equipped mount or dropped mount token)
2. **Add Hitchable**: Simply drag the hitchable item (cart, wagon, sled) into the mount's inventory
3. **Automatic Capacity**: The system automatically detects the hitchable and multiplies carrying capacity by 5

#### Method 2: Interaction Menu (For Unhitched Items)
1. **Approach Hitchables**: Character must be within 10 feet of hitchable
2. **Click Hitchable Token**: Access the interaction menu
3. **Select "Hitch"**: Choose this option if you have compatible hitchables

### Unhitching Process

#### Using Interaction Menu
1. **Toggle Mount**: To dismount
2. **Click Mount Token**: Access the mount's interaction menu
3. **Select "Unhitch [Item Name]"**: Option appears if mount has hitchable attached
4. **Automatic Separation**: System removes hitchable and restores normal capacity

#### Effects of Unhitching
- **Capacity Reduction**: Mount returns to normal carrying capacity
- **Item Separation**: Hitchable becomes separate item/token
- **Weight Redistribution**: Items may need to be redistributed if over new limit

## Mount Management Features

### Primary Container System
- **Star Icon**: Use the star button on mount item sheets to set as primary
- **Quick Access**: Primary mounts are used first in drop/pickup operations
- **Organization**: Helps manage multiple mounts and containers

### Health and Damage
- **Damage Sharing**: Combat damage is split between rider and mount (50/50) when enabled
- **Setting Control**: Damage sharing can be toggled via "Use Stroud DnD Horse Damage" in module settings
- **Health Icons**: Mount tokens show visual health status
- **Death Handling**: Dead mounts can still be interacted with for inventory access
- **Healing**: Mounts can be healed separately from riders

### Automatic Weight Management
- **Real-time Calculation**: System tracks mount encumbrance automatically
- **Capacity Warnings**: Notifications when approaching weight limits
- **Hitchable Integration**: Capacity updates automatically when hitching/unhitching

## Advanced Features

### Combat Integration
- **Damage Distribution**: Incoming damage is automatically split
- **Mount Death**: System handles mount death and automatic dismounting
- **Effect Management**: Mounted effects are applied and removed automatically

### Permission System
- **Mount Ownership**: Mounts maintain ownership relationships
- **Party Access**: Grant permission for others to use your mounts
- **Emergency Access**: Allow party members to help with mount management

### Visual Feedback
- **Health Indicators**: Saddle icons show mount health (0-100% in 5% increments)
- **Token Management**: Mount tokens are automatically sized and positioned
- **Effect Icons**: Clear visual indicators for mounted status

## Best Practices

### For Players
1. **Manage Weight**: Use hitchables for heavy cargo transport
2. **Protect Mounts**: Remember that mount damage affects you too
3. **Strategic Dismounting**: Dismount before dangerous encounters when possible
4. **Inventory Organization**: Use mounts as mobile storage solutions

### For GMs
1. **Realistic Consequences**: Enforce movement and combat penalties
2. **Environmental Challenges**: Consider terrain effects on mounts
3. **Economic Balance**: Use mount costs and maintenance as gameplay elements
4. **Combat Tactics**: Leverage mount mechanics for interesting encounters

## Troubleshooting

### Common Issues

**Mounts System Not Working**:
- **Check Item Piles**: Ensure the Item Piles module is installed and enabled
- **Module Compatibility**: Verify Item Piles version is compatible with your Foundry version
- **Console Errors**: Check browser console (F12) for Item Piles related errors

**Mount Won't Attach Hitchable**:
- Ensure both items are properly configured as mount and hitchable
- Check that character has permission to both items
- Verify items are in correct container relationships

**Damage Not Splitting**:
- Check that "Use Stroud DnD Horse Damage" is enabled in module settings
- Ensure mount is properly configured with mount data
- Verify character is actually mounted (check for mounted effect)

**Capacity Not Updating**:
- Run force weight check macro
- Ensure hitchable is properly attached
- Check mount data configuration

## Module Settings

The mounts system can be configured through the module settings:

### **Use Stroud DnD Horse Damage**
- **Location**: Module Settings > Use Stroud DnD Horse Damage
- **Default**: Disabled
- **Effect**: When enabled, damage taken by mounted characters is split 50/50 between rider and mount
- **Requirements**: Requires "On Character Damage Support" to be enabled
- **Note**: Requires module reload when changed

### **Related Settings**
- **On Character Damage Support**: Must be enabled for horse damage to function
- **Use Stroud DnD Helpers Encumbrance Rules**: Works with mount carrying capacity calculations
- **Backpacks Folder**: Specifies where dropped mounts are stored (defaults to "Managed Backpacks")

## Integration with Other Systems

### Backpack System
- **Container Architecture**: Mounts are built as specialized containers using the backpack system
- **Seamless Integration**: Mounts work with the backpack dropping system
- **Weight Calculation**: Combined weight tracking across all systems
- **Inventory Management**: Unified approach to character storage

### Combat System
- **Effect Integration**: Mounted effects work with combat automation
- **Damage Processing**: Integrated with module's damage systems when enabled
- **Initiative Handling**: Mounted characters handled appropriately

This mount system provides realistic and engaging mechanics for mounted combat and travel while maintaining ease of use for both players and GMs.
