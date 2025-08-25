# Comprehensive Code Modification List for Foundry VTT v13 & D&D 5e v5

## 🔧 **Critical Breaking Changes - Activities System**

### **scripts/combat.js**
- **Line 240**: `item.system.activities.contents[0]` → Update to new Activities API structure
- **Line 238**: `CONFIG.DND5E.damageTypes[damageType]` → Verify config location in v5
- **Line 307**: `CONFIG.DND5E.abilities` → Update abilities config access
- **Line 470**: `CONFIG.DND5E.damageTypes[damageType]` → Verify config location
- **Lines 32-33**: `Hooks.on("dnd5e.damageActor", onDamageTaken)` → Verify hook names in v5
- **Line 100**: `item.system.uses` → Verify uses structure

### **scripts/weapons/ranged.js**
- **Line 52**: `weapon.system.activities.contents.find(a => a.type == "attack")` → Update activities access
- **Line 9**: `i.system.equipped == true && i.system.actionType == "rwak"` → Verify actionType location
- **Line 13**: `weapon.system.type.baseItem` → Update item type structure
- **Lines 43-45**: Weapon consume structure may need updating for new system
- **Lines 70-79**: Ammo system property access needs verification

### **scripts/spells/portent/portent.js**
- **Line 73**: `die.system.damage.parts[0] = ${face}` → Update damage parts structure
- **Line 78**: `Object.values(die.system.activities).find(a => a.type == "damage")` → Update activities access
- **Line 79**: `damageActivity.damage.parts[0].bonus = face` → Update damage structure
- **Line 80**: `damageActivity.description.chatFlavor` → Verify chatFlavor location
- **Lines 32, 36, 102**: `portent.system.uses.value` → Verify uses structure

### **scripts/backpacks/backpacks.js**
- **Line 178**: `'system.activities.' + activity._id + '.consumption.targets'` → Update activity path structure
- **Line 179**: `itemData.system.activities[activity._id].consumption.targets` → Update consumption access

## 🎭 **Hook Name Updates**

### **scripts/hooks.js**
- **Line 21**: `'getActorSheet5eHeaderButtons'` → `'getActorSheetHeaderButtons'`
- **Line 23**: `'getItemSheet5eHeaderButtons'` → `'getItemSheetHeaderButtons'`
- **Line 36**: `'renderActorSheet5e'` → `'renderActorSheet'`

### **scripts/backpacks/backpacks.js**
- **Line 59**: `'getItemSheet5eHeaderButtons'` → `'getItemSheetHeaderButtons'`

## 🏗️ **Document Type References**

### **scripts/utility/tagging.js**
- **Line 242**: `dnd5e.documents.TokenDocument5e` → Update to new document class name

### **scripts/lighting/lighting.js**
- **Line 71**: `dnd5e.documents.Actor5e` → Update to new document class name

### **scripts/backpacks/backpacks.js**
- **Line 141**: `dnd5e.documents.Actor5e` → Update to new document class name
- **Line 305**: `dnd5e.documents.Actor5e` → Update to new document class name
- **Line 341**: `dnd5e.documents.Actor5e` → Update to new document class name
- **Line 361**: `dnd5e.documents.Actor5e` → Update to new document class name
- **Line 824**: `dnd5e.documents.Actor5e` → Update to new document class name

## 📊 **Config Access Changes**

### **scripts/tokens.js**
- **Line 162**: `dnd5e.config.skills[skill]` → Update config location

### **scripts/homebrew/heroicManeuvers.js**
- **Line 163**: `CONFIG.DND5E.skills` → Verify skills config location
- **Line 219**: `CONFIG.DND5E.skills[skill].label` → Verify skills config access
- **Line 234**: `CONFIG.DND5E.skills[skill].label` → Verify skills config access

### **scripts/crafting/crafting.js**
- **Line 15**: `dnd5e.config.abilities[ability]` → Update abilities config location
- **Line 32**: `dnd5e.config.skills[skill]` → Update skills config location

### **scripts/crafting/harvesting.js**
- **Line 347**: `dnd5e.config.skills[harvestable.skill].label` → Update skills config
- **Line 493**: `dnd5e.config.skills[harvestable.skill].label` → Update skills config

### **scripts/crafting/poison.js**
- **Line 413**: `dnd5e.config.abilities.con.abbreviation` → Update abilities config
- **Line 459**: `dnd5e.config.abilities.con.abbreviation` → Update abilities config
- **Line 830**: `dnd5e.config.abilities[poisonData.ability]` → Update abilities config

### **scripts/plants/plants.js**
- **Line 18**: `dnd5e.config.abilities.con.abbreviation` → Update abilities config
- **Line 63**: `dnd5e.config.abilities.con.abbreviation` → Update abilities config

### **scripts/items/weapons/bloodyAxe.js**
- **Line 24**: `dnd5e.config.abilities.wis.label` → Update abilities config
- **Line 26**: `dnd5e.config.abilities.wis.abbreviation` → Update abilities config

## 🎯 **Actor/Item System Property Access**

### **scripts/journal/journal.js**
- **Line 85**: `actor.system.details.xp.value` → Verify XP structure
- **Line 86**: `actor.system.attributes.hp.value` & `actor.system.attributes.hp.temp` → Verify HP structure
- **Lines 87-91**: `actor.system.currency.*` → Verify currency structure

### **scripts/money/money.js**
- **Line 75**: `a.system.currency` → Verify currency structure
- **Line 135**: `actor.system.currency` → Verify currency structure
- **Line 151**: `actor.system.currency` → Verify currency structure

### **scripts/mounts/mounts.js**
- **Line 443**: `game.packs.get("dnd5e.monsters")` → Verify pack name in v5
- **Line 449**: `mountActor.system.attributes.ac` → Verify AC structure
- **Line 450**: `mountActor.system.attributes.hp` → Verify HP structure
- **Line 151**: `item.system?.properties` → Verify properties structure
- **Line 186**: `"system.equipped": true` → Verify equipped property

### **scripts/spells/drained/drainingAttack.js**
- **Line 32**: `targetActor.system.attributes.hp.max` & `targetActor.system.attributes.hp.tempmax` → Verify HP structure
- **Line 89**: `targetActor.system.attributes.hp.max` → Verify HP structure
- **Line 93**: `targetActor.system.attributes.hp.value` → Verify HP structure

### **scripts/spells/huntersmark/huntersMark.js**
- **Line 132**: `markedTarget.system.attributes.hp.value` → Verify HP structure
- **Line 90**: `args[0].item?.system?.actionType` → Verify actionType location
- **Lines 50, 146**: `"flags.dnd5e.DamageBonusMacro"` → Verify flag structure in v5

### **scripts/spells/twilightDomain/twilightDomain.js**
- **Line 13**: `item.system.consume.target` → Verify consume structure
- **Line 75**: `caster.system.attributes.hp.value` → Verify HP structure

## ⚙️ **Item Properties & Equipment**

### **scripts/identification/identification.js**
- **Line 89**: `item.system.weight` → Verify weight property
- **Line 110**: `item.system.description.value` → Verify description structure
- **Line 157**: `actualItemData.system.identified` → Verify identified property
- **Line 158**: `placeHolderItem.system.quantity` → Verify quantity structure

### **scripts/items/items.js**
- **Line 59**: `item.system?.identifier` → Verify identifier property
- **Lines 121, 129, 143**: `item.system.identifier` → Verify identifier access
- **Line 425**: `item.system.rarity` → Verify rarity property

### **scripts/items/weapons/baneWeapon.js**
- **Line 27**: `args[0].item?.system?.actionType` → Verify actionType location

### **scripts/items/weapons/devoteesCenser.js**
- **Line 26**: `target.system?.attributes?.hp?.max` & `target.system?.attributes?.hp?.tempmax` → Verify HP structure
- **Line 53**: `censer.system?.equipped` & `censer?.system.attunement` → Verify equipment properties

### **scripts/items/weapons/lightBringer.js**
- **Line 10**: `args[0].item.system.actionType` → Verify actionType location

### **scripts/items/weapons/bloodyAxe.js**
- **Line 14**: `axe.system?.equipped` → Verify equipped property

### **scripts/lighting/bullseye.js**
- **Line 50**: `i._stats.compendiumSource` → Verify compendium source access
- **Lines 84, 96, 106**: `item.system.equipped` → Verify equipped property

### **scripts/lighting/lighting.js**
- **Lines 155, 182**: `"system.equipped": true` → Verify equipped property
- **Line 245**: `existingReward.system.quantity` → Verify quantity property

### **scripts/actors/actors.js**
- **Line 671**: `i.system.properties.has("ritual")` → Verify properties structure

## 🔄 **Version Detection & Migration**

### **scripts/versioning.js**
- **Line 8**: `dnd5e.version[0]` → Update version detection for v5

### **scripts/crafting/poison.js**
- **Line 847**: `dnd5e.version[0]` → Update version detection

### **scripts/utility/utility.js**
- **Line 49**: `dnd5e.migrations.migrateCompendium(pack)` → Verify migration API

## 🎵 **Hook Events**

### **scripts/crafting/harvesting.js**
- **Line 299**: `"dnd5e.damageActor"` → Verify hook name in v5
- **Line 300**: `"dnd5e.healActor"` → Verify hook name in v5

### **scripts/crafting/poison.js**
- **Line 547**: `args[0].item?.system?.actionType` → Verify actionType location

## 🗂️ **Data Structure Access**

### **scripts/lighting/fireplace.js**
- **Line 74**: `a.data.entity.name` → Update to new data structure
- **Line 78**: `scriptAction.data.entity.id` → Update to new data structure

### **scripts/dialog/dialog.js**
- **Line 137**: `...data.options` → Verify data structure spread operation

## 📋 **Summary of Priority Levels**

### **🚨 CRITICAL (Must Fix for Basic Functionality)**
1. Activities system changes (combat.js, weapons, spells)
2. Hook name updates (all render hooks)
3. Document class name updates
4. CONFIG object location changes

### **⚠️ HIGH PRIORITY (Core Features Affected)**
1. Actor/Item system property access
2. Equipment and item property verification
3. Currency and HP structure validation
4. Version detection updates

### **🔧 MEDIUM PRIORITY (Feature-Specific)**
1. Compendium access patterns
2. Flag structure verification
3. Migration API updates
4. Damage/heal hook verification

### **📝 LOW PRIORITY (Polish & Optimization)**
1. Data structure spread operations
2. Legacy code cleanup
3. Console logging updates
4. Error message improvements

## 📊 **Module Configuration Updates Required**

### **module.json Changes**
- [ ] Update `compatibility.minimum` to `13`
- [ ] Update `compatibility.verified` to `13` 
- [ ] Update `compatibility.maximum` to `13` (or higher)
- [ ] Update D&D 5e system compatibility:
  - [ ] `minimum`: `"5.0.0"`
  - [ ] `verified`: `"5.0.x"` (latest stable)
  - [ ] `maximum`: `"5.x.x"`
- [ ] Update required module versions for v13 compatibility:
  - [ ] Active Auras: Check latest v13 compatible version
  - [ ] Automated Animations: Update to v13 compatible version
  - [ ] DAE: Update to latest v13 version
  - [ ] Effect Macro: Update to v13 compatible version
  - [ ] libWrapper: Update to latest version
  - [ ] Midi QOL: Update to v13/v5 compatible version
  - [ ] Monk's Active Tiles: Update to v13 compatible version
  - [ ] socketlib: Update to latest version

## 🧪 **Testing Checklist**

### **Critical Functions to Test After Updates**
- [ ] **Backpack System**: Drop, pickup, permissions, Item Piles integration
- [ ] **Mount System**: Damage sharing, health tracking, hitchables
- [ ] **Combat Tools**: Ad-hoc damage, filtered combat start
- [ ] **Crafting System**: Harvesting, poison creation, recipes
- [ ] **Weapon Systems**: Bane weapons, ranged weapon reloading
- [ ] **Spell Systems**: Hunter's Mark, Spiritual Weapon, Portent Dice
- [ ] **Token Management**: Morphing, tagging, lighting controls

### **Compatibility Testing**
- [ ] Test with all required modules updated to v13 versions
- [ ] Verify macro functionality in new system
- [ ] Test compendium access and migration
- [ ] Validate socket communication still works

---

**Total Identified Issues**: 157 specific locations across 34 files

**Estimated Development Time**: 40-60 hours for full migration and testing

**Recommended Approach**: 
1. Create v13 development branch
2. Update module dependencies first
3. Fix critical issues (Activities system) 
4. Address hook and document class changes
5. Verify and test all system property access
6. Comprehensive testing of all features
