# Crafting System User Guide

The **Crafting System** in Stroud's DnD Helpers provides a comprehensive framework for harvesting ingredients from defeated creatures and crafting powerful poisons. The system includes realistic skill checks, ingredient management, and recipe progression.

## Overview

The crafting system consists of two main components:
- **Harvesting**: Collect crafting ingredients from defeated creatures
- **Poison Crafting**: Use harvested ingredients to create various poisons with different effects

## Required Compendiums

The crafting system uses several compendiums from Stroud's DnD Helpers:

### **SDND Shared Macros**
Contains all the player-accessible macros for the crafting system:
- **Harvest Selected**: Target and harvest dead creatures
- **List Poison Recipes**: View available poison recipes for your character
- **Craft Poison**: Create poisons using ingredients and gold
- **Apply Poison**: Apply crafted poisons to weapons

### **SDND Items**
Contains all crafting ingredients and finished poison items:
- **Crafting Ingredients**: Materials harvested from creatures (e.g., Giant Poisonous Snake Gland, Wyrmtongue Petals)
- **Finished Poisons**: Completed poison items ready for use (e.g., Basic Poison, Advanced Poison, Death's Bite)

## Getting Started

### Accessing Compendiums
1. **Open Compendium Tab**: Click the "Compendium Packs" tab in the sidebar
2. **Find Module Compendiums**: Look for "Stroud's DnD Helpers" entries
3. **Import Macros**: 
   - Open "SDND Shared Macros" compendium
   - Right-click on crafting macros (Harvest Selected, Craft Poison, Apply Poison, List Poison Recipes)
   - Select "Import" to add them to your world
   - Drag imported macros to your macro hotbar for quick access

### Setting Up Characters
1. **Survival Skill**: Ensure at least one party member has good Survival skill for harvesting
2. **Poisoner's Kit**: Acquire and gain proficiency with Poisoner's Kit for crafting
3. **Storage**: Prepare containers or backpacks for ingredient organization

## Harvesting System

### How Harvesting Works

When creatures die in combat, they may become harvestable if they're included in the module's harvestable creatures list. Dead creatures that can be harvested will display a **harvesting icon** overlay on their token.

### Harvesting Process

1. **Target a Dead Creature**: Select a single dead creature token that shows the harvesting icon
2. **Run Harvest Macro**: Use the **"Harvest Selected"** macro from the "SDND Shared Macros" compendium
3. **Review Information**: A dialog will show:
   - Creature name
   - Required skill check
   - Difficulty Class (DC)
   - Possible rewards and their probability
   - Time required for harvesting
4. **Confirm Harvesting**: Click "Yes" to proceed with the harvesting attempt
5. **Make Skill Check**: The system automatically rolls the required skill check
6. **Receive Results**: Based on success/failure, you'll receive ingredients or nothing

### Harvesting Requirements

- **Player Characters Only**: Only characters in the "Active Players" folder can harvest
- **Dead Creatures**: Target must have 0 HP or less
- **Unharvested**: Each creature can only be harvested once
- **Time Investment**: Harvesting takes time (usually 10 minutes) and advances the game clock

### Skill Checks and Success

- **Default Skill**: Most harvesting uses Survival skill
- **Critical Success**: Doubles the quantity of materials received
- **Failure**: No materials gained, but time is still spent
- **Automatic Advancement**: Game time advances by the harvesting duration

## Harvestable Creatures

### Common Creatures
| Creature | DC | Skill | Rewards | Notes |
|----------|----|---------|---------|----- |
| **Bear** | 10 | Survival | Bear Pelt (80%), Bear Meat (20%) | Multiple possible rewards |
| **Wolf** | 10 | Survival | Wolf Pelt (100%) | Basic harvesting |
| **Dire Wolf** | 10 | Survival | Dire Wolf Pelt (100%) | Upgraded version |
| **Scarecrow** | 10 | Survival | 2x Wheat, 2x Barley | Guaranteed multiple items |

### Venomous Creatures
| Creature | DC | Skill | Rewards |
|----------|----|---------|---------| 
| **Giant Poisonous Snake** | 11 | Survival | Giant Poisonous Snake Gland |
| **Poisonous Snake** | 11 | Survival | Snake Venom |
| **Poisonous Spider** | 11 | Survival | Spider Venom |
| **Scorpion** | 11 | Survival | Scorpion Venom |
| **Giant Wasp** | 11 | Survival | Wasp Venom |

### Exotic Creatures
| Creature | DC | Skill | Rewards |
|----------|----|---------|---------| 
| **Purple Worm** | 18 | Survival | Purple Worm Venom |
| **Young Green Dragon** | 14 | Survival | Young Green Dragon Venom |
| **Wyvern** | 13 | Survival | Wyvern Venom |
| **Phase Spider** | 12 | Survival | Phase Spider Venom |
| **Carrion Crawler** | 12 | Survival | Carrion Crawler Mucus |

### Special Creatures
| Creature | DC | Skill | Rewards |
|----------|----|---------|---------| 
| **Cyclops** | 10 | Survival | Massive Diamond |
| **Ghost** | 10 | Survival | Gold Amulet |
| **Hill Giant** | 10 | Survival | Ironwood |
| **Ettercap** | 11 | Survival | Cap of Ettercap Fungi |
| **Myconid Sovereign** | 11 | Survival | Cap of Myconid Fungi |

## Poison Crafting System

### Available Poison Recipes

#### **Basic Poisons**
- **Basic Poison** (DC 10)
  - **Ingredient Cost**: 10 gp (no specific ingredients required)
  - **Effect**: Target takes 1d4 poison damage on failed save
  - **Type**: Injury poison

- **Advanced Poison** (DC 10)
  - **Ingredients**: Wyrmtongue Petals
  - **Ingredient Cost**: 15 gp
  - **Effect**: Target takes 1d4 + poison modifier damage per round and is poisoned
  - **Duration**: 1 minute

#### **Combat Poisons**
- **Scorpion's Sting** (DC 13, 200 gp)
  - Requires: Scorpion Venom OR Snake Venom OR Spider Venom
  - Versatile recipe with multiple ingredient options

- **Serpent Venom** (DC 17, 200 gp)
  - Requires: Giant Poisonous Snake Gland
  - Potent poison with high DC

- **Carrion Crawler Poison** (DC 17, 200 gp)
  - Requires: Carrion Crawler Mucus
  - Paralyzing effects, movement restriction

#### **Advanced Poisons**
- **Death's Bite** (DC 18, 200 gp)
  - Requires: Wyrmtongue Petals AND (Spineflower Berries OR Cap of Ettercap Fungi)
  - Deals necrotic damage over time

- **Wyvern's Sting** (DC 18, 1,200 gp)
  - Requires: Wyvern Venom
  - High-end poison with significant cost

#### **Exotic Poisons**
- **Dragon's Breath** (DC 14, 2,000 gp)
  - Requires: Young Green Dragon Venom OR Green Dragon Venom
  - Expensive but powerful

- **Purple Haze** (DC 20, 2,000 gp)
  - Requires: Purple Worm Venom
  - Highest DC crafting challenge

- **Jumping Jack Flash** (DC 14, 600 gp)
  - Requires: Phase Spider Venom
  - Specialized teleportation-based poison

- **Burnt Othur Fumes** (DC 13, 500 gp)
  - Requires: Wasp Venom
  - Area effect poison

### Poison Crafting Process

1. **Learn Recipes**: First acquire and consume recipe items to learn new poison formulas
2. **Check Known Recipes**: Use the **"List Poison Recipes"** macro to see all recipes you have learned
3. **Gather Materials**: Collect the required ingredients through harvesting or purchase
4. **Use Craft Macro**: Run the **"Craft Poison"** macro from "SDND Shared Macros" compendium
5. **Auto-Filtering**: The macro automatically checks your inventory and only shows recipes you can actually complete (have ingredients and gold)
6. **Select Recipe**: Choose from the filtered list of available recipes
7. **Tool Check**: Make a Poisoner's Kit tool check against the recipe DC
8. **Success/Failure**: 
   - **Success**: Receive the crafted poison
   - **Failure**: Lose ingredients and gold (realistic crafting failure)

### Using Crafted Poisons

1. **Equip Weapons**: Ensure your slashing or piercing weapons are equipped
2. **Apply to Weapons**: Use the **"Apply Poison"** macro from "SDND Shared Macros" compendium
3. **Auto-Detection**: The macro automatically lists only equipped slashing/piercing weapons
4. **Choose Poison**: Select which poison to apply from your inventory
5. **Combat Usage**: Poison is automatically applied on successful weapon attacks
6. **Expiration**: Poisons expire when charges are used up OR after a set duration, whichever comes first

### Recipe Learning System

- **Recipe Items**: Poison recipes exist as consumable items that must be acquired
- **Learning Process**: Consume a recipe item to permanently learn that poison formula
- **Recipe Sources**: Find or purchase recipe scrolls through gameplay, quests, or merchants
- **Permanent Knowledge**: Once learned, recipes remain available to that character
- **Recipe Tracking**: Use "List Poison Recipes" to see all formulas you've mastered
- **Progressive Unlocking**: Start with basic recipes and discover more complex formulas over time

## Module Settings

### **Enable Harvesting**
- **Location**: Module Settings > Enable Harvesting
- **Default**: Disabled
- **Effect**: When enabled, harvestable creatures show harvesting icons when they die
- **Requirements**: Requires module reload when changed

### **Poison DC Modifier**
- **Location**: Module Settings > Poison DC Modifier
- **Default**: 0
- **Effect**: Adjusts the save DC of all crafted poisons by this amount
- **Usage**: Allows GMs to balance poison difficulty for their campaign

## Best Practices

### For Players
1. **Plan Ahead**: Check what ingredients you need before hunting specific creatures
2. **Team Coordination**: Designate someone with high Survival for harvesting
3. **Inventory Management**: Organize ingredients in containers or backpacks
4. **Resource Investment**: Budget gold for poison crafting costs (ingredients cost money even when harvested)
5. **Tool Proficiency**: Invest in Poisoner's Kit proficiency for better success rates
6. **Compendium Access**: Import macros from "SDND Shared Macros" to your macro hotbar
7. **Reference Materials**: Use "List Poison Recipes" to see all formulas you've learned
8. **Recipe Collection**: Actively seek out recipe items to expand your crafting options
9. **Weapon Management**: Keep slashing/piercing weapons equipped for poison application
10. **Duration Awareness**: Track poison expiration times as they have limited duration

### For GMs
1. **Balance Encounters**: Consider the value of harvestable materials when designing encounters
2. **Economic Control**: Use poison costs to regulate the in-game economy
3. **Story Integration**: Incorporate rare ingredients as quest rewards or plot hooks
4. **Harvesting Time**: Remember that harvesting advances game time significantly
5. **Recipe Availability**: Control which recipes players have access to for campaign balance

## Troubleshooting

### Common Issues

**Harvesting Icon Not Appearing**:
- Check that "Enable Harvesting" is turned on in module settings
- Ensure the creature is actually dead (0 HP)
- Verify the creature is in the harvestable creatures list
- Make sure the creature hasn't already been harvested

**Cannot Harvest Target**:
- Only player characters can harvest (must be in "Active Players" folder)
- Target must be a single creature
- Creature must be dead and harvestable
- Each creature can only be harvested once

**Poison Crafting Fails**:
- Verify you have all required ingredients in your inventory
- Check that you have sufficient gold for the recipe cost
- Ensure you have learned the recipe by consuming a recipe item
- Confirm you're using a character with access to Poisoner's Kit
- Note: "Craft Poison" macro only shows recipes you can actually complete

**Poison Not Applying to Weapon**:
- Only piercing and slashing weapons can be poisoned
- Weapons must be equipped (not just in inventory)
- "Apply Poison" macro automatically filters to show only valid equipped weapons
- Some weapons may already have poison applied

**No Recipes Available**:
- You may not have learned any recipes yet - acquire and consume recipe items
- Check that you have both ingredients and gold for crafting
- Use "List Poison Recipes" to see what formulas you know

### Tips for Success

- **Survival Skill**: Invest in Survival skill to improve harvesting success
- **Poisoner's Kit**: Obtain proficiency for better poison crafting results
- **Ingredient Storage**: Use containers to organize harvesting materials
- **Team Specialization**: Have one character focus on crafting for efficiency
- **Economic Planning**: Budget for both ingredients and gold costs
- **Recipe Hunting**: Actively search for recipe items to expand crafting options
- **Equipment Strategy**: Keep poisonable weapons equipped for quick application
- **Time Management**: Monitor poison durations and reapply as needed

## Integration with Other Systems

### Combat System
- **Automatic Application**: Poisons apply automatically on successful weapon hits
- **Save Mechanics**: Targets make saves against poison effects per D&D 5e rules
- **Duration Tracking**: Poison effects are tracked through Foundry's effect system

### Inventory Management
- **Ingredient Organization**: Works with the module's container and backpack systems
- **Weight Tracking**: Ingredients and poisons have realistic weights
- **Item Management**: Integrates with Foundry's standard item management

This crafting system provides engaging progression mechanics while maintaining balance through realistic time investment, skill requirements, and resource costs. It encourages exploration, creature hunting, and strategic planning while rewarding investment in crafting skills.
