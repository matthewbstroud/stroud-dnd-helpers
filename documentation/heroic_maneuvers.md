# Stroud's DnD Helpers: Heroic Maneuvers Module

## Overview

The **Heroic Maneuvers** module for Foundry VTT adds a flexible system for rewarding or punishing characters based on skill checks, using buffs and debuffs that can affect single or multiple targets. It is designed for D&D 5e and leverages the Midi-QOL module for effect application and automation.

## Features

- **Skill-Based Buffs & Punishments:** Players select a skill and challenge rating, then roll a skill check. Success grants a reward; failure applies a punishment.
- **Dynamic Buffs:** Buffs and debuffs scale with difficulty and can affect multiple targets within range.
- **Critical/Fumble Handling:** Critical successes and fumbles modify the effects.
- **Automated Effect Application:** Uses Midi-QOL for immediate effect processing.
- **Configurable DCs:** Challenge rating DCs can be customized via SDND Helper settings.

## Requirements

- **D&D 5e System**
- **Midi-QOL** (must be installed and active)

## Usage

1. **Trigger Heroic Maneuver:** Use the module's macro or UI button to start a maneuver.
   1. Macro is located in compendium Stroud's DnD Helpers\SDND GM Macros\Combat
2. **Select Skill:** A dialog will prompt you to choose a skill (e.g., Acrobatics, Athletics).
3. **Select Challenge Rating:** Choose the difficulty (Low, Intermediate, High).
4. **Roll Skill Check:** The player will be prompted to roll the skill check.
5. **Apply Buff/Punishment:** The appropriate effect is applied to the actor and nearby allies (if applicable).
6. **Chat Output:** Results are posted in chat, including skill, DC, result, effect, and affected targets.

## Buffs & Punishments

- **Buffs:** Minor, Major, and Exceptional bonuses to hit, armor, or advantage.
- **Punishments:** Minor, Major, and Exceptional penalties to hit, armor, or disadvantage.
- **Range & Targets:** Effects can be self-only or affect multiple allies within a specified range.

## Configuration

- **DC Settings:** Default DCs are 15 (Low), 17 (Intermediate), 19 (High). These can be changed in the module settings.
- **Midi-QOL Integration:** The module ensures `actionSpecialDurationImmediate` is enabled for proper effect timing.

## Example Macro

```javascript
await stroudDnD.combat.executeHeroicManeuver();
```

## Troubleshooting

- **Midi-QOL Not Active:** The module will notify you if Midi-QOL is not enabled.
- **No Controlled Token:** Ensure a token is selected before running a maneuver.
- **Buff Not Found:** Make sure the required items/effects exist in your compendium.
