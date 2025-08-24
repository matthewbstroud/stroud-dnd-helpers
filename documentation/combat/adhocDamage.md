# Ad-Hoc Damage User Guide

The **Ad-Hoc Damage** feature allows GMs to quickly apply custom damage to selected tokens with flexible options for damage types, dice rolls, and saving throws.

## Overview

Ad-Hoc Damage can be applied in two ways:
- **Without Saves**: Direct damage that cannot be avoided
- **With Saves**: Damage that allows a saving throw to reduce or negate the effect

## Basic Usage

### Accessing Ad-Hoc Damage
1. Navigate to **Compendiums** > **Stroud's DnD Helpers** > **Macros** > **SDND GM Macros**
2. Find and import the **Apply Adhoc Damage** macro
3. Drag it to your hotbar for quick access

### Quick Application
1. Select one or more tokens on the canvas
2. Click the **Apply Adhoc Damage** macro
3. Fill out the damage dialog
4. Click **Apply** to execute

## Damage Without Saves

When you don't allow saves, the damage is applied directly to all selected tokens.

### Example Usage:
- Environmental damage (falling rocks, lava)
- Unavoidable magical effects
- Narrative damage

### Configuration:
- **Allow Save**: Set to **No**
- **Damage Type**: Choose appropriate type
- **Dice**: Specify damage dice
- **Count**: Number of dice to roll

## Damage With Saves

When you allow saves, tokens can make a saving throw to potentially reduce or avoid damage.

### Save Options:
- **Save Ability**: Choose from STR, DEX, CON, INT, WIS, or CHA
- **Save DC**: Set the difficulty class (typically 10-20)
- **Damage on Save**: 
  - **Half**: Take half damage on successful save
  - **None**: Take no damage on successful save

### Example Usage:
- Spell effects (Fireball, Lightning Bolt)
- Trap damage with reaction time
- Area effects that can be dodged

## Damage Types

Choose from standard D&D 5e damage types:

### Physical Damage:
- **Bludgeoning**: Clubs, hammers, falling
- **Piercing**: Arrows, spears, spikes
- **Slashing**: Swords, claws, blades

### Elemental Damage:
- **Fire**: Flames, heat, burning
- **Cold**: Ice, freezing, frost
- **Lightning**: Electrical damage
- **Thunder**: Sonic damage, sound waves

### Magical Damage:
- **Acid**: Corrosive substances
- **Poison**: Toxic substances
- **Necrotic**: Death magic, life drain
- **Radiant**: Holy damage, light energy
- **Force**: Pure magical energy
- **Psychic**: Mental damage

## Dice Configuration

### Dice Types:
- **d4**: Small damage (1-4 per die)
- **d6**: Standard damage (1-6 per die)
- **d8**: Medium damage (1-8 per die)
- **d10**: High damage (1-10 per die)
- **d12**: Very high damage (1-12 per die)

### Dice Count:
- Enter the number of dice to roll
- Example: 3d6 = Count: 3, Dice: d6

## Handling Resistances

The system automatically handles resistances and immunities based on token properties:

### Resistance Types:
- **Resistance**: Damage is halved
- **Vulnerability**: Damage is doubled
- **Immunity**: No damage is taken

### Automatic Application:
- The system checks each token's resistances
- Damage is modified before application
- Results are displayed in chat

## Examples

### Environmental Hazard (No Save):
```
Damage Type: Fire
Dice: d6
Count: 2
Allow Save: No
Result: 2d6 fire damage to all selected tokens
```

### Spell Effect (With Save):
```
Damage Type: Lightning
Dice: d8
Count: 6
Allow Save: Yes
Save Ability: Dexterity
Save DC: 15
Damage on Save: Half
Result: 6d8 lightning damage, DEX save DC 15 for half
```

### Massive Environmental Damage:
```
Damage Type: Bludgeoning
Dice: d10
Count: 8
Allow Save: Yes
Save Ability: Dexterity
Save DC: 18
Damage on Save: Half
Result: 8d10 bludgeoning damage, DEX save DC 18 for half
```

## Best Practices

1. **Select Targets First**: Always select tokens before running the macro
2. **Choose Appropriate Damage Types**: Match the damage type to the source
3. **Consider Resistances**: Remember that some creatures have resistances or immunities
4. **Use Saves for Avoidable Damage**: Allow saves when the damage source can be dodged or resisted
5. **Set Reasonable DCs**: Use standard DC guidelines (Easy: 10, Medium: 15, Hard: 20)

## Tips

- **Multiple Damage Types**: Run the macro multiple times for different damage types
- **Scaling Damage**: Adjust dice count and type based on character level
- **Narrative Impact**: Use damage types that match your story description
- **Chat Output**: The system provides detailed chat messages showing results for each token

## Scripter API

For advanced users and scripters, Ad-Hoc Damage can be called directly through the Stroud's DnD API:

### Function Signature
```javascript
stroudDnD.combat.applyAdhocDamageDirect(damageType, damageDice, diceCount, allowSave, saveAbility, saveDC, damageOnSave)
```

### Parameters
- **damageType** (string): The type of damage (e.g., "fire", "slashing", "necrotic")
- **damageDice** (string): The die type as a string (e.g., "6", "8", "10")
- **diceCount** (number): Number of dice to roll
- **allowSave** (boolean): Whether to allow a saving throw
- **saveAbility** (string): Save ability ("str", "dex", "con", "int", "wis", "cha") - required if allowSave is true
- **saveDC** (number): Save DC value - required if allowSave is true
- **damageOnSave** (string): "half" or "none" - required if allowSave is true

### Examples

#### Simple Damage (No Save)
```javascript
// Apply 3d6 fire damage with no save
stroudDnD.combat.applyAdhocDamageDirect("fire", "6", 3, false);
```

#### Damage with Save
```javascript
// Apply 8d6 lightning damage, DEX save DC 15 for half
stroudDnD.combat.applyAdhocDamageDirect("lightning", "6", 8, true, "dex", 15, "half");
```

#### Environmental Hazard
```javascript
// Apply 4d10 bludgeoning damage, DEX save DC 18 for no damage
stroudDnD.combat.applyAdhocDamageDirect("bludgeoning", "10", 4, true, "dex", 18, "none");
```

### Notes for Scripters
- Select tokens before calling the function - it applies to all controlled tokens
- The function is debounced with a 250ms delay to prevent rapid-fire calls
- Only GMs can execute this function
- The function handles all resistance/immunity calculations automatically
- Chat messages are generated automatically with results

This feature streamlines combat and environmental encounters by providing quick, flexible damage application with full D&D 5e rule integration.
