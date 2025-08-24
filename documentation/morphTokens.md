# MorphToken Documentation

## Overview
MorphToken functionality allows tokens to transform between different forms while maintaining game state and properties. This is implemented through the setMorphData API.

## Basic Usage

### Setting up Token Morphing
1. Select a token in your scene
2. Use the setMorphData API to configure morph properties:
    ```javascript
    await stroudDnD.tokens.setMorphData(
      "Actor.xxxSourceActorId",  // Source Actor UUID
      "Actor.xxxTargetActorId",  // Target Actor UUID
      ["name", "disposition"]    // Properties to preserve during morph
    );
    ```

### API Reference

#### setMorphData(sourceActorUuid, targetActorUuid, preservedProperties)
- `sourceActorUuid`: UUID of the source actor
- `targetActorUuid`: UUID of the actor to morph into
- `preservedProperties`: Array of TokenDocument properties to preserve when morphed (e.g., "name", "disposition", "elevation", "rotation", "alpha", "hidden", "vision", "lockRotation")

### Development Console Commands

Access the development console (`F12` in most browsers) to use these commands:

