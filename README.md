# Stroud's DnD Helpers

A comprehensive Foundry VTT module that provides a collection of tools and utilities to enhance your D&D 5e games. This module includes features for combat management, inventory automation, crafting systems, scene organization, and much more.

If you appreciate the module, support me [HERE](https://ko-fi.com/sdnddonations)

## Features Overview

### **Combat Management**
- **[Ad-Hoc Damage](documentation/combat/adhocDamage.md)**: Apply custom damage with flexible saving throws and damage types
- **[Filtered Combat Start](documentation/combat/startFilteredCombat.md)**: Streamlined combat initiation with automatic token filtering
- **[Heroic Maneuvers](documentation/heroic_maneuvers.md)**: Special combat actions and tactical options for dynamic encounters

### **Inventory & Equipment Systems**
- **[Backpacks Automation](documentation/backpacks/backpacks.md)**: Drop and retrieve backpacks with full inventory management and Item Piles integration
- **[Mounts & Hitchables](documentation/mounts/mounts.md)**: Complete mount system with damage sharing, carrying capacity, and vehicle attachments
- **[Bane Weapons](documentation/items/bane-weapons.md)**: Create weapons that deal bonus damage to specific creature types

### **Crafting & Harvesting**
- **[Harvesting System](documentation/crafting/crafting.md)**: Collect ingredients from defeated creatures using skill checks
- **[Poison Crafting](documentation/crafting/crafting.md)**: Create various poisons using harvested materials and recipes
- **Recipe Learning**: Consume recipe items to unlock new crafting formulas

### **Scene & Token Management**
- **[Tagging System](documentation/tagging.md)**: Organize and categorize scene elements with custom tags
- **[Token Morphing](documentation/morphTokens.md)**: Transform tokens between different forms and appearances
- **Lighting Controls**: Advanced lighting management and scene organization tools

### **GM Utilities**
- **[Macro Collections](documentation/macros.md)**: Comprehensive GM and shared macro libraries
- **Music Integration**: Automatic combat music and playlist management
- **Time Management**: Calendar integration with combat and activity tracking
- **Folder Organization**: Automated folder management for actors and scenes

### **Automation Features**
- **Damage Distribution**: Automatic damage sharing between riders and mounts
- **Effect Management**: Temporary and permanent item enhancements
- **Permission Systems**: Granular access control for backpacks and mounts
- **Weight Tracking**: Realistic encumbrance with visual feedback

## Documentation

For detailed guides and documentation, see the [Documentation Index](documentation/README.md) which includes:

### **Core Systems**
- [Macros Guide](documentation/macros.md) - Comprehensive list of available macros and their usage
- [Backpacks Automation](documentation/backpacks/backpacks.md) - Drop and manage backpacks with full inventory control
- [Mounts System](documentation/mounts/mounts.md) - Complete guide to mounts, hitchables, and damage sharing
- [Crafting System](documentation/crafting/crafting.md) - Harvesting ingredients and poison crafting system

### **Combat Tools**
- [Ad-Hoc Damage](documentation/combat/adhocDamage.md) - Apply custom damage with flexible saving throw options
- [Filtered Combat Start](documentation/combat/startFilteredCombat.md) - Streamlined combat initiation with music integration
- [Heroic Maneuvers](documentation/heroic_maneuvers.md) - Special combat actions and tactical maneuvers

### **Item & Equipment Systems**
- [Bane Weapons](documentation/items/bane-weapons.md) - Create weapons with bonus damage vs. specific creature types

### **Scene & Token Management**
- [Tagging System](documentation/tagging.md) - Organize scene elements with custom categorization
- [Token Morphing](documentation/morphTokens.md) - Transform tokens between different forms

## Installation & Requirements

### **Core Requirements**
All of the following modules are **required** for this module to function properly:

| Module | Minimum Version | Purpose |
|--------|-----------------|---------|
| [Active Auras](https://foundryvtt.com/packages/ActiveAuras) | 5.1.0 | Active effect management and area-based effects |
| [Automated Animations](https://foundryvtt.com/packages/automated-jb2a-patreon) | 4.2.93 | Visual effects for spells and abilities |
| [Dynamic Active Effects](https://foundryvtt.com/packages/dae) | 12.0.6 | Advanced active effect calculations |
| [Effect Macro](https://foundryvtt.com/packages/effectmacro) | 12.0.6 | Execute macros from active effects |
| [libWrapper](https://foundryvtt.com/packages/lib-wrapper) | 1.12.14.0 | Function wrapping for compatibility |
| [Midi QOL](https://foundryvtt.com/packages/midi-qol) | 11.6.12 | Advanced damage workflows and automation |
| [Monk's Active Tiles](https://foundryvtt.com/packages/monks-active-tiles) | 12.05 | Interactive scene tiles |
| [socketlib](https://foundryvtt.com/packages/socketlib) | 1.0.13 | Cross-client communication |

### **Optional Enhancements**
These modules enhance functionality but are not required:

| Module | Minimum Version | Enhanced Features |
|--------|-----------------|-------------------|
| [Item Piles](https://foundryvtt.com/packages/item-piles) | 3.0.8 | Backpack and mount inventory management |
| [Combat Utility Belt](https://foundryvtt.com/packages/combat-utility-belt) | - | Token visibility and combat enhancements |
| [Monk's Enhanced Journal](https://foundryvtt.com/packages/monks-enhanced-journal) | - | Improved journal functionality |
| [Playlist Importer](https://foundryvtt.com/packages/playlist_import) | - | Enhanced music management |
| [Simple Calendar](https://foundryvtt.com/packages/foundryvtt-simple-calendar) | - | Time tracking integration |
| [Compendium Folders](https://foundryvtt.com/packages/compendium-folders) | - | Better compendium organization |
| [Drag Upload](https://foundryvtt.com/packages/dragupload) | - | Simplified file uploads |
| [DF Chat Enhancements](https://foundryvtt.com/packages/df-chat-enhance) | - | Improved chat functionality |

### **System Requirements**
- **Foundry VTT**: Version 11 - 12 (optimized for v12)
- **D&D 5e System**: Version 4.0.0 - 4.4.x

## Installation

1. Install all required modules listed above
2. In Foundry's Module Management, use the following manifest URL:
   ```
   https://github.com/matthewbstroud/stroud-dnd-helpers/releases/latest/download/module.json
   ```
3. Enable the module and all required dependencies
4. Configure module settings in the game settings panel

## Quick Start

1. **Import Compendiums**: The module includes 9 compendium packs with macros, items, and documentation
2. **Configure Settings**: Review module settings for combat music, backpack permissions, and automation preferences
3. **Test Core Features**: Try the backpack system, ad-hoc damage, or heroic maneuvers to familiarize yourself with the tools
4. **Review Documentation**: Check the [Documentation Index](documentation/README.md) for detailed guides on each system

## Support & Contributing

- **Issues**: Report bugs and feature requests on [GitHub](https://github.com/matthewbstroud/stroud-dnd-helpers/issues)
- **Support**: [Ko-fi Donations](https://ko-fi.com/sdnddonations)
- **Community**: Join discussions and share feedback

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

For a complete list of changes and updates, see [CHANGELOG.md](CHANGELOG.md).


