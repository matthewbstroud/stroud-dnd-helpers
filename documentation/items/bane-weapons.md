# Bane Weapons User Guide

The **Bane Weapons** system in Stroud's DnD Helpers allows you to create weapons that deal extra damage against specific creature types. This system is ideal for creating weapons like "Giant Slayer," "Dragon Bane," or "Undead Hunter" weapons that are particularly effective against certain enemies.

## Overview

Bane weapons are enhanced weapons that:
- Deal bonus damage against specific creature types
- Work with both melee and ranged weapons
- Can target multiple creature types simultaneously
- Have optional duration limits for temporary enhancements
- Automatically apply extra damage on successful hits
- Double bonus damage on critical hits

## How Bane Weapons Work

### Damage Mechanics
- **Target Detection**: The weapon automatically identifies the creature type of targets
- **Bonus Damage**: Adds extra damage dice when hitting designated creature types
- **Critical Integration**: Bonus damage is doubled on critical hits (following D&D 5e rules)
- **Attack Types**: Works with both melee weapon attacks (mwak) and ranged weapon attacks (rwak)

### Creature Type Targeting
The system uses D&D 5e creature types:
- **Aberration**: Mind flayers, beholders, aboleths
- **Beast**: Animals, dire wolves, owlbears
- **Celestial**: Angels, devas, planetars
- **Construct**: Golems, animated objects, warforged
- **Dragon**: All dragon types and wyrmlings
- **Elemental**: Fire elementals, air elementals, etc.
- **Fey**: Pixies, dryads, hags
- **Fiend**: Devils, demons, succubi
- **Giant**: Hill giants, frost giants, ogres
- **Humanoid**: Humans, elves, orcs, goblins
- **Monstrosity**: Owlbears, bulettes, chimeras
- **Ooze**: Gelatinous cubes, black puddings
- **Plant**: Treants, shambling mounds, blights
- **Undead**: Zombies, skeletons, vampires

### Duration System
- **Permanent Enhancement**: Set duration to 0 for permanent bane weapons
- **Temporary Enhancement**: Set duration in hours for temporary effects
- **Auto-Expiration**: System automatically removes enhancement when time expires
- **Time Tracking**: Uses game world time for accurate duration tracking

## Creating Bane Weapons

⚠️ **GM Only**: Creating bane weapons requires GM permissions and must be done through the browser console or custom macros.

### Basic Creation Function

```javascript
await stroudDnD.items.weapons.baneWeapon.CreateBaneWeapon(
    itemUuid,           // UUID of the weapon to enhance
    creatureTypes,      // Creature type(s) to target
    dieFaces,          // Damage die size (4, 6, 8, 10, 12, 20)
    dieCount,          // Number of dice to roll
    damageType,        // Type of damage (piercing, slashing, fire, etc.)
    durationHours      // Duration in hours (0 = permanent)
);
```

### Step-by-Step Creation Process

#### 1. **Prepare the Base Weapon**
- Have the weapon in a character's inventory or as a world item
- Note the weapon's UUID

#### 2. **Determine Parameters**
- **Creature Types**: Decide which creature types the weapon should affect
- **Damage Amount**: Choose dice count and size for balance
- **Damage Type**: Select appropriate damage type
- **Duration**: Set permanent (0) or temporary duration

#### 3. **Execute Creation**
Open the browser console (F12) and run the creation function with your parameters.

### Creation Examples

#### **Giant Slayer Sword (Permanent)**
```javascript
await stroudDnD.items.weapons.baneWeapon.CreateBaneWeapon(
    "Actor.abc123.Item.def456",  // Weapon UUID
    "giant",                     // Target giants
    6,                           // d6 damage
    2,                           // 2d6 extra damage
    "slashing",                  // Slashing damage
    0                            // Permanent enhancement
);
```

#### **Dragon Bane Bow (24 Hours)**
```javascript
await stroudDnD.items.weapons.baneWeapon.CreateBaneWeapon(
    "Actor.xyz789.Item.uvw012",  // Bow UUID
    "dragon",                    // Target dragons
    8,                           // d8 damage
    1,                           // 1d8 extra damage
    "piercing",                  // Piercing damage
    24                           // 24-hour duration
);
```

#### **Multi-Target Weapon**
```javascript
await stroudDnD.items.weapons.baneWeapon.CreateBaneWeapon(
    "Actor.abc123.Item.def456",  // Weapon UUID
    "undead,fiend",              // Target undead AND fiends
    6,                           // d6 damage
    1,                           // 1d6 extra damage
    "radiant",                   // Radiant damage
    0                            // Permanent enhancement
);
```

## Using Bane Weapons

### In Combat
1. **Equip the Weapon**: Ensure the bane weapon is equipped and ready
2. **Make Attacks Normally**: Use the weapon as you would any other weapon
3. **Automatic Detection**: The system automatically checks target creature types
4. **Bonus Damage**: Extra damage is applied automatically on hits against target types
5. **Visual Feedback**: Chat messages show when bonus damage is applied

### Visual Indicators
- **Chat Flavor**: Messages like "Extra radiant damage vs undead!" appear in chat
- **Damage Breakdown**: Bonus damage is clearly separated in damage rolls
- **Expiration Notices**: System notifies when temporary enhancements expire

## Weapon Management

### Checking Weapon Status
- Bane weapon data is stored in the weapon's flags
- GMs can inspect weapon flags to see current bane configurations
- Duration and remaining time are tracked automatically

### Removing Bane Effects
When a bane weapon expires or needs to be removed:
- The system automatically cleans up expired temporary enhancements
- For manual removal, GMs would need to clear the weapon flags

### Modifying Existing Bane Weapons
To change a bane weapon's properties:
1. The existing enhancement will be replaced
2. Run the CreateBaneWeapon function again with new parameters
3. New settings will overwrite the previous configuration

## Balance Considerations

### Damage Guidelines
- **Low Power**: 1d4 or 1d6 bonus damage
- **Medium Power**: 1d8 or 2d6 bonus damage  
- **High Power**: 1d10, 1d12, or 2d8 bonus damage
- **Legendary**: 2d10 or higher for epic-tier weapons

### Creature Type Scope
- **Narrow Focus**: Single creature type (e.g., "dragon")
- **Moderate Scope**: Two related types (e.g., "undead,fiend")
- **Broad Scope**: Multiple types for versatile weapons

### Duration Balancing
- **Permanent**: Powerful magic items, artifacts
- **Long Duration**: 24+ hours for significant magic
- **Medium Duration**: 4-12 hours for spell-like effects
- **Short Duration**: 1-3 hours for temporary enchantments

## Integration with Other Systems

### MidiQOL Compatibility
- Fully integrated with MidiQOL damage workflows
- Respects critical hit rules and damage multipliers
- Works with other damage bonuses and effects

### Combat Automation
- Automatically applies damage without manual intervention
- Integrates with Foundry's attack and damage resolution
- Supports both targeted and area effect attacks

## Troubleshooting

### Common Issues

**Bane Effect Not Triggering**:
- Verify the target is the correct creature type
- Check that the weapon has bane data in its flags
- Ensure MidiQOL is properly configured
- Confirm the attack is a weapon attack (mwak/rwak)

**Duration Not Working**:
- Check that game world time is advancing properly
- Verify the start time was set correctly during creation
- Ensure the duration parameter was set properly

**Wrong Damage Type**:
- The damage type is set during creation and cannot be easily changed
- Create a new bane enhancement to replace the existing one

### GM Debugging
- Check browser console for error messages
- Verify weapon flags contain BaneWeaponData
- Test with simple single-type targets first
- Ensure all module dependencies are loaded

## Best Practices

### For GMs
1. **Balance Testing**: Test damage amounts against expected encounters
2. **Story Integration**: Tie bane weapons to campaign themes and enemies
3. **Progressive Power**: Start with weaker effects and increase over time
4. **Clear Communication**: Explain bane effects to players when weapons are acquired
5. **Duration Management**: Use appropriate durations for the power level

### For Players
1. **Target Identification**: Learn to identify creature types for tactical advantage
2. **Weapon Swapping**: Keep multiple bane weapons for different enemy types
3. **Resource Management**: For temporary enhancements, use strategically
4. **Team Coordination**: Share bane weapon information with party members

This bane weapon system provides a flexible framework for creating flavorful, mechanically interesting weapons that enhance combat tactics and provide meaningful choices in weapon selection.
