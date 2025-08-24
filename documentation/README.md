# Stroud's DnD Helpers

A Foundry VTT module that provides a collection of tools and utilities to enhance your D&D 5e games. This module includes features for combat management, actor handling, scene organization, and more.

## Features Overview

### **Combat Management**
- **[Ad-Hoc Damage](combat/adhocDamage.md)**: Apply custom damage with flexible saving throws and damage types
- **[Filtered Combat Start](combat/startFilteredCombat.md)**: Streamlined combat initiation with automatic token filtering
- **[Heroic Maneuvers](heroic_maneuvers.md)**: Special combat actions and tactical options for dynamic encounters

### **Inventory & Equipment Systems**
- **[Backpacks Automation](backpacks/backpacks.md)**: Drop and retrieve backpacks with full inventory management and Item Piles integration
- **[Mounts & Hitchables](mounts/mounts.md)**: Complete mount system with damage sharing, carrying capacity, and vehicle attachments
- **[Bane Weapons](items/bane-weapons.md)**: Create weapons that deal bonus damage to specific creature types

### **Crafting & Harvesting**
- **[Harvesting System](crafting/crafting.md)**: Collect ingredients from defeated creatures using skill checks
- **[Poison Crafting](crafting/crafting.md)**: Create various poisons using harvested materials and recipes
- **Recipe Learning**: Consume recipe items to unlock new crafting formulas

### **Scene & Token Management**
- **[Tagging System](tagging.md)**: Organize and categorize scene elements with custom tags
- **[Token Morphing](morphTokens.md)**: Transform tokens between different forms and appearances
- **Lighting Controls**: Advanced lighting management and scene organization tools

### **GM Utilities**
- **Macro Collections**: Comprehensive GM and shared macro libraries
- **Music Integration**: Automatic combat music and playlist management
- **Time Management**: Calendar integration with combat and activity tracking
- **Folder Organization**: Automated folder management for actors and scenes

### **Automation Features**
- **Damage Distribution**: Automatic damage sharing between riders and mounts
- **Effect Management**: Temporary and permanent item enhancements
- **Permission Systems**: Granular access control for backpacks and mounts
- **Weight Tracking**: Realistic encumbrance with visual feedback

## Documentation Index

### **Core Systems**
- [Macros Guide](macros.md) - Comprehensive list of available macros and their usage
- [Backpacks Automation](backpacks/backpacks.md) - Drop and manage backpacks with full inventory control
- [Mounts System](mounts/mounts.md) - Complete guide to mounts, hitchables, and damage sharing
- [Crafting System](crafting/crafting.md) - Harvesting ingredients and poison crafting system

### **Combat Tools**
- [Ad-Hoc Damage](combat/adhocDamage.md) - Apply custom damage with flexible saving throw options
- [Filtered Combat Start](combat/startFilteredCombat.md) - Streamlined combat initiation with music integration
- [Heroic Maneuvers](heroic_maneuvers.md) - Special combat actions and tactical maneuvers

### **Item & Equipment Systems**
- [Bane Weapons](items/bane-weapons.md) - Create weapons with bonus damage vs. specific creature types

### **Scene & Token Management**
- [Tagging System](tagging.md) - Organize scene elements with custom categorization
- [Token Morphing](morphTokens.md) - Transform tokens between different forms

## Requirements

### **System Requirements**
- **Foundry VTT**: v11 minimum, v12 verified (maximum v12.x)
- **D&D 5e System**: v4.0.0 minimum, v4.4.2 verified (maximum v4.4.x)

### **Required Modules**
The following modules must be installed and active for Stroud's DnD Helpers to function properly:

- **[Active Auras](https://github.com/kandashi/Active-Auras)** (v0.12.2+) - Aura effects management
- **[Automated Animations](https://github.com/theripper93/autoanimations)** (v4.2.70+) - Visual animations for spells and effects
- **[DAE (Dynamic Active Effects)](https://gitlab.com/tposney/dae)** (v11.1.7+) - Advanced active effects system
- **[Effect Macro](https://github.com/krbz999/effectmacro)** (v11.0.3+) - Macro execution from effects
- **[libWrapper](https://github.com/ruipin/fvtt-lib-wrapper)** (v1.12.13.0+) - Library for safe function wrapping
- **[Midi QOL](https://gitlab.com/tposney/midi-qol)** (v11.3.11+) - Quality of Life improvements for D&D 5e
- **[Monk's Active Tiles](https://github.com/ironmonk88/monks-active-tiles)** (v11.19+) - Interactive scene tiles
- **[socketlib](https://github.com/farling42/foundryvtt-socketlib)** (v1.0.13+) - Socket communication library

### **Optional Modules**
These modules enhance functionality but are not required:

- **[Anonymous](https://github.com/reonZ/anonymous)** (v1.4.4+) - Anonymous rolling capabilities
- **[Active Token Lighting (ATL)](https://github.com/kandashi/Active-Token-Lighting)** (v0.7.0+) - Dynamic token lighting
- **[Chris's Premades](https://github.com/chrisk123999/chris-premades)** (v0.11.12+) - Pre-configured spells and items
- **[Simple Calendar](https://github.com/vigoren/foundryvtt-simple-calendar)** (v2.4.3+) - Calendar and time tracking
- **[Token Magic FX](https://github.com/Feu-Secret/Tokenmagic)** (v0.6.5.0+) - Visual effects for tokens
- **[Item Macro](https://github.com/Foundry-Workshop/Item-Macro)** (v1.10.5+) - Macros embedded in items
- **[Multi Token Edit](https://github.com/Aedif/multi-token-edit)** (v1.70.0+) - Bulk token editing
- **[Visual Active Effects](https://github.com/krbz999/visual-active-effects)** (v11.0.6+) - Enhanced visual effects

### **Important Notes**
- **Item Piles**: Required for mounts and backpack systems (install separately)
- **Module Dependencies**: All required modules must be active before enabling Stroud's DnD Helpers
- **Version Compatibility**: Use the verified versions listed above for best compatibility

## Installation

1. In Foundry VTT's module manager, search for Stroud's
2. Select the Module.
3. Click "Install"

## Getting Started

1. Enable the module in your world's module settings
2. Access the macros through Compendiums > Stroud's DnD Helpers > Macros:
   - **SDND GM Macros**: Contains macros for GM use only
   - **SDND Shared Macros**: Contains macros that can be used by all players
3. Right-click on any macro and select "Import" to add it to your world's Macro Directory
4. Drag imported macros to your macro hotbar for quick access


## Support

For bug reports or feature requests, please file an issue on the GitHub repository.

## License

This module is licensed under the MIT License. See the LICENSE file for details.