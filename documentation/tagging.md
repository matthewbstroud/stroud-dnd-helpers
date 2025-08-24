# Tag System Documentation

The tag system provides a set of GM Macros for efficient management of scene elements in Foundry VTT. Using a single "Tag Selected" macro, you can apply tags to tokens, tiles, lights, and doors. The macro automatically validates that all selected elements are of the same type before applying tags.

## Available Macros

### Main Tagging Macros
- **Tag Selected** - Add tags to selected elements (tokens, tiles, lights, or doors)
- **List Tags** - Display all tags currently in use in the scene

Example output from List Tags:

**Tags in Scene: My Scene**:
- Doors
  - door_celldoors: 5
- Lights 
  - light_outside_torches: 2
- Sounds
  - sfx_bells: 3 
- Tiles
  - None
- Tokens 
  - tok_guards: 2
  - tok_villager: 10

### Bulk Operation Macros

#### Token Operations
- **MorphTokens** - Change the appearance of tagged tokens to a different actor. See [Morphing](morphTokens.md).
- **ToggleTokens** - Show/hide tagged tokens in the scene

#### Tile Operations
- **ToggleTiles** - Show/hide tagged tiles
- **ToggleTilesEnabled** - Enable/disable interaction with tagged tiles
- **TriggerTiles** - Activate tagged tiles as if they were clicked

#### Light Operations
- **ToggleLights** - Turn tagged lights on/off

#### Door Operations
- **SetDoorState** - Set tagged doors to a specific state (open, closed, locked)
- **ToggleDoors** - Change the state of tagged doors

#### Special Effects
- **ToggleSfx** - Toggle special effects associated with tagged elements

## Using Tags

### Adding Tags
1. Select scene elements (must be of the same type)
2. Run the Tag Selected macro
3. Enter tag name when prompted
4. Confirm to apply

### Managing Tagged Elements
1. Run the desired bulk operation macro
2. Enter the target tag
3. Confirm the operation

## Best Practices
- Use descriptive, consistent tag names
- Document tags used in your scenes
- Consider using prefixes for different element types
    - `tok_` for tokens
    - `tile_` for tiles
    - `light_` for lights
    - `door_` for doors

## Technical Notes
- Tags are stored in element flags
- Case-sensitive
- Persists between sessions
- Exportable with scene data

