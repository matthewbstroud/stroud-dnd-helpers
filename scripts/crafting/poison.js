import { sdndConstants } from "../constants.js";
import { dialog } from "../dialog/dialog.js";
import { items } from "../items/items.js";
import { utility } from "../utility/utility.js";
import { gmFunctions } from "../gm/gmFunctions.js";
import { moneyInternal } from "../money/money.js";
import { sdndSettings } from "../settings.js";

const POISON_MACRO = "function.stroudDnD.crafting.poison.ItemMacro";
const RECIPE_MACRO = "function.stroudDnD.crafting.poison.UnlockRecipe";

const POISON_RECIPES = [
    {
        "name": "Basic Poison",
        "dc": 10,
        "ingredients": [],
        "cost": 10,
        "poisonUuid": 'Compendium.stroud-dnd-helpers.SDND-Items.Item.rrYk6P43QM47dotq'
    },
    {
        "name": "Advanced Poison",
        "dc": 10,
        "ingredients": [
            "Wyrmtongue Petals"
        ],
        "cost": 15,
        "poisonUuid": 'Compendium.stroud-dnd-helpers.SDND-Items.Item.X2Qzo01uoXO61mTo'
    },
    {
        "name": "Burnt Othur Fumes",
        "dc": 13,
        "ingredients": [
            "Wasp Venom"
        ],
        "cost": 500,
        "poisonUuid": 'Compendium.stroud-dnd-helpers.SDND-Items.Item.VbpRIO7Zr3H9JS5C'
    },
    {
        "name": "Carrion Crawler Poison",
        "dc": 17,
        "ingredients": [
            "Carrion Crawler Mucus"
        ],
        "cost": 200,
        "poisonUuid": 'Compendium.stroud-dnd-helpers.SDND-Items.Item.8dpkMmpBlSBmUMdq'
    },
    {
        "name": "Death's Bite",
        "dc": 18,
        "ingredients": [
            "Wyrmtongue Petals",
            ["Spineflower Berries", "Cap of Ettercap Fungi"]
        ],
        "cost": 200,
        "poisonUuid": 'Compendium.stroud-dnd-helpers.SDND-Items.Item.xDLWQTLejH7H2hKM'
    },
    {
        "name": "Dragon's Breath",
        "dc": 14,
        "ingredients": [
            ["Young Green Dragon Venom", "Green Dragon Venom"]
        ],
        "cost": 2000,
        "poisonUuid": 'Compendium.stroud-dnd-helpers.SDND-Items.Item.scX7VoN2ebH5sWEt'
    },
    {
        "name": "Jumping Jack Flash",
        "dc": 14,
        "ingredients": [
            "Phase Spider Venom"
        ],
        "cost": 600,
        "poisonUuid": 'Compendium.stroud-dnd-helpers.SDND-Items.Item.SmqukucHHz4zKp1l'
    },
    {
        "name": "Purple Haze",
        "dc": 20,
        "ingredients": [
            "Purple Worm Venom"
        ],
        "cost": 2000,
        "poisonUuid": 'Compendium.stroud-dnd-helpers.SDND-Items.Item.Z2zIUirtxuEVrbKL'
    },
    {
        "name": "Serpent Venom",
        "dc": 17,
        "ingredients": [
            "Giant Poisonous Snake Gland"
        ],
        "cost": 200,
        "poisonUuid": 'Compendium.stroud-dnd-helpers.SDND-Items.Item.QB00M2AOqudoBvba'
    },
    {
        "name": "Scorpion's Sting",
        "dc": 13,
        "ingredients": [
            ["Scorpion Venom", "Snake Venom", "Spider Venom"]
        ],
        "cost": 200,
        "poisonUuid": 'Compendium.stroud-dnd-helpers.SDND-Items.Item.zJwXeK5UH99LGKlR'
    },
    {
        "name": "Wyvern's Sting",
        "dc": 18,
        "ingredients": [
            "Wyvern Venom"
        ],
        "cost": 1200,
        "poisonUuid": 'Compendium.stroud-dnd-helpers.SDND-Items.Item.NX6ESFhr2A4zxVdj'
    }
];

const POISON_EFFECTS = {
    "AdvancedPoison": {
        "name": "Advanced Poison",
        "icon": "modules/stroud-dnd-helpers/images/icons/poisoned.webp",
        "origin": "",
        "duration": {
            "rounds": 10,
            "startTime": null,
            "seconds": null,
            "combat": null,
            "turns": 0,
            "startRound": null,
            "startTurn": null
        },
        "disabled": false,
        "changes": [
            {
                "key": "flags.midi-qol.OverTime",
                "mode": 5,
                "value": "turn=start,label=Advanced Posion Effect,damageRoll=1d4,damageType=poison",
                "priority": 20
            },
            {
                "key": "flags.midi-qol.disadvantage.attack.all",
                "mode": 0,
                "value": "1",
                "priority": 0
            },
            {
                "key": "flags.midi-qol.disadvantage.ability.check.all",
                "mode": 0,
                "value": "1",
                "priority": 0
            }
        ],
        "description": "You are under the effects of an Advanced Poison.",
        "transfer": false,
        "statuses": [],
        "flags": {
            "dae": {
                "stackable": "noneName",
                "specialDuration": [],
                "disableIncapacitated": false,
                "showIcon": false,
                "macroRepeat": "none"
            },
            "ActiveAuras": {
                "isAura": false,
                "aura": "None",
                "nameOverride": "",
                "radius": "",
                "alignment": "",
                "type": "",
                "customCheck": "",
                "ignoreSelf": false,
                "height": false,
                "hidden": false,
                "displayTemp": false,
                "hostile": false,
                "onlyOnce": false,
                "wallsBlock": "system"
            },
            "times-up": {
                "durationSeconds": 60
            }
        },
        "tint": null
    },
    "CarrionCrawlerPoison": {
        "name": "Carrion Crawler Poison",
        "icon": "modules/stroud-dnd-helpers/images/icons/poisoned.webp",
        "changes": [
            {
                "key": "flags.midi-qol.OverTime",
                "value": "turn=end,saveDC=8,saveAbility=con,label=Carrion Crawler Mucus",
                "mode": 0,
                "priority": 20
            },
            {
                "key": "flags.midi-qol.disadvantage.ability.check.all",
                "value": "1",
                "mode": 0,
                "priority": 20
            },
            {
                "key": "flags.midi-qol.disadvantage.attack.all",
                "value": "1",
                "mode": 0,
                "priority": 20
            },
            {
                "key": "flags.midi-qol.fail.ability.save.dex",
                "mode": 0,
                "value": "1",
                "priority": null
            },
            {
                "key": "flags.midi-qol.fail.ability.save.str",
                "mode": 0,
                "value": "1",
                "priority": null
            },
            {
                "key": "flags.midi-qol.grants.advantage.attack.all",
                "mode": 0,
                "value": "1",
                "priority": null
            },
            {
                "key": "flags.midi-qol.grants.critical.range",
                "mode": 5,
                "value": "5",
                "priority": null
            },
            {
                "key": "system.attributes.movement.all",
                "mode": 0,
                "value": "0",
                "priority": 25
            }
        ],
        "disabled": false,
        "duration": {
            "startTime": null,
            "seconds": 60,
            "combat": null,
            "rounds": null,
            "turns": null,
            "startRound": null,
            "startTurn": null
        },
        "description": "",
        "origin": null,
        "transfer": false,
        "statuses": [],
        "flags": {
            "dae": {
                "stackable": "noneNameOnly",
                "specialDuration": [],
                "disableIncapacitated": false,
                "showIcon": false,
                "macroRepeat": "none"
            },
            "ActiveAuras": {
                "isAura": false,
                "aura": "None",
                "nameOverride": "",
                "radius": "",
                "alignment": "",
                "type": "",
                "customCheck": "",
                "ignoreSelf": false,
                "height": false,
                "hidden": false,
                "displayTemp": false,
                "hostile": false,
                "onlyOnce": false,
                "wallsBlock": "system"
            }
        },
        "tint": null
    },
    "DeathsBite": {
        "name": "Death's Bite",
        "icon": "modules/stroud-dnd-helpers/images/icons/poisoned.webp",
        "origin": "",
        "duration": {
            "rounds": 5,
            "startTime": null,
            "seconds": null,
            "combat": null,
            "turns": 0,
            "startRound": null,
            "startTurn": null
        },
        "disabled": false,
        "changes": [
            {
                "key": "flags.midi-qol.OverTime",
                "mode": 5,
                "value": "turn=start,label=Death's Bite,damageRoll=2d6,damageType=necrotic",
                "priority": 20
            },
            {
                "key": "flags.midi-qol.disadvantage.attack.all",
                "mode": 0,
                "value": "1",
                "priority": 0
            },
            {
                "key": "flags.midi-qol.disadvantage.ability.check.all",
                "mode": 0,
                "value": "1",
                "priority": 0
            }
        ],
        "description": "You are under the effects of Death's Bite. Take takes necrotic damage each round.",
        "transfer": false,
        "statuses": [],
        "flags": {
            "dae": {
                "stackable": "noneName",
                "specialDuration": [],
                "disableIncapacitated": false,
                "showIcon": false,
                "macroRepeat": "none"
            },
            "ActiveAuras": {
                "isAura": false,
                "aura": "None",
                "nameOverride": "",
                "radius": "",
                "alignment": "",
                "type": "",
                "customCheck": "",
                "ignoreSelf": false,
                "height": false,
                "hidden": false,
                "displayTemp": false,
                "hostile": false,
                "onlyOnce": false,
                "wallsBlock": "system"
            },
            "times-up": {
                "durationSeconds": 60
            }
        },
        "tint": null
    }
}

export let poison = {
    "ApplyPoison": foundry.utils.debounce(applyPoison, 250),
    "ApplyPoisonToItem": async function _applyPoisonToItem(itemUuid, poisonName, dieFaces, dieCount, bonusDamage, damageType, durationMinutes, charges, dc, effect, ability, halfDamageOnSave) {
        durationMinutes = durationMinutes ?? 0;
        dc = dc ?? 0;
        ability = ability ?? dnd5e.config.abilities.con.abbreviation;
        halfDamageOnSave = halfDamageOnSave ?? false;
        let item = await fromUuid(itemUuid);
        let poisonData = await item.getFlag(sdndConstants.MODULE_ID, "PoisonData");
        if (poisonData && poisonData.duration > 0 && poisonData.charges > 0) {
            let elapsed = (game.time.worldTime - poisonData.startTime) / 60 / 60;
            if (elapsed < poisonData.duration) {
                ui.notifications.warn(`${item.name} is already poisoned with ${poisonData.name}!`);
                return;
            }
        }

        await gmFunctions.setFlag(itemUuid, sdndConstants.MODULE_ID, "PoisonData", {
            "name": poisonName,
            "dieFaces": dieFaces,
            "dieCount": dieCount,
            "damageType": damageType,
            "bonusDamage": bonusDamage,
            "ability": ability,
            "charges": charges,
            "duration": durationMinutes,
            "startTime": (durationMinutes > 0 ? game.time.worldTime : null),
            "dc": dc,
            "effect": effect,
            "halfDamageOnSave": halfDamageOnSave,
            "priorData": {
                "midiProperties": (item.flags["midiProperties"]),
                "save": item.system?.save
            }
        });
        await items.midiQol.addOnUseMacro(item, "damageBonus", POISON_MACRO);
    },
    "CreatePoison": function _createPoison(itemUuid, name, dieFaces, dieCount, durationMinutes, charges, dc, effect, damageType, ability, halfDamageOnSave, includeBonusDamage) {
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        let item = fromUuidSync(itemUuid);
        if (!item) {
            console.log("Item not found!");
            return;
        }
        charges = charges ?? 5;
        damageType = damageType ?? "poison";
        dc = dc ?? 0;
        ability = ability ?? dnd5e.config.abilities.con.abbreviation;
        halfDamageOnSave = halfDamageOnSave ?? true;
        includeBonusDamage = includeBonusDamage ?? false;
        item.setFlag(sdndConstants.MODULE_ID, "PoisonType", {
            "name": name,
            "dieFaces": dieFaces,
            "dieCount": dieCount,
            "damageType": damageType,
            "includeBonusDamage": includeBonusDamage,
            "charges": charges,
            "duration": durationMinutes,
            "dc": dc,
            "effect": effect,
            "abilitySave": ability,
            "halfDamageOnSave": halfDamageOnSave
        });
    },
    "CraftPoison": foundry.utils.debounce(craftPoison, 250),
    "CreateRecipe": async function _createRecipe(itemUuid, recipeName) {
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        let item = await fromUuid(itemUuid);
        if (!item) {
            console.log("Item not found!");
            return;
        }
        await item.setFlag(sdndConstants.MODULE_ID, "Recipe.name", recipeName);
        await items.midiQol.addOnUseMacro(item, "postNoAction", RECIPE_MACRO);
    },
    "ListRecipes": foundry.utils.debounce(listRecipes, 250),
    "UnlockRecipe": function _unlockRecipe({ speaker, actor, token, character, item, args }) {
        let recipeName = item.getFlag(sdndConstants.MODULE_ID, "Recipe.name");
        if (!recipeName || recipeName.length == 0) {
            console.log("Could not find recipe name on this item!");
            return;
        }
        let recipes = actor.getFlag(sdndConstants.MODULE_ID, "Recipes.Poison") ?? [];

        if (recipes.includes(recipeName)) {
            ui.notifications.info(`${actor.name} already knows ${recipeName}!`);
            return;
        }
        recipes.push(recipeName);
        recipes.sort();
        gmFunctions.setFlag(actor.uuid, sdndConstants.MODULE_ID, "Recipes.Poison", recipes);
    },
    "ItemMacro": _itemMacro,
    "ItemMacros": {
        "BurntOthurFumes": async function _itemMacro({ speaker, actor, token, character, item, args }) {
            if (args[0].macroPass == 'postActiveEffects') {
                let savedActor = args[0]?.saves[0]?.actor;
                if (!savedActor) {
                    return;
                }
                let saveCount = await savedActor.getFlag(sdndConstants.MODULE_ID, "SaveCount.BurntOthurFumes") ?? 0;
                if (++saveCount == 3) {
                    let effect = savedActor.effects.find(e => e.name == "Burnt Othur Fumes");
                    if (effect) {
                        await gmFunctions.removeEffects([effect.uuid]);
                        await gmFunctions.unsetFlag(savedActor.uuid, sdndConstants.MODULE_ID, "SaveCount.BurntOthurFumes");
                        await ChatMessage.create({
                            emote: true,
                            speaker: { "actor": savedActor },
                            content: `${savedActor.name} has finally shrugged off Burnt Othur Fumes...`
                        });
                        return;
                    }
                }
                await gmFunctions.setFlag(savedActor.uuid, sdndConstants.MODULE_ID, "SaveCount.BurntOthurFumes", saveCount);
                await ChatMessage.create({
                    emote: true,
                    speaker: { "actor": savedActor },
                    content: `${savedActor.name} has made save (${saveCount} of 3) against Burnt Othur Fumes...`
                });
            }

        }
    }
};

async function _itemMacro({ speaker, actor, token, character, item, args }) {
    if (args[0]?.macroPass != "DamageBonus") {
        return;
    }
    if (!["mwak", "rwak"].includes(args[0].item.system.actionType)) return {};
    if (args[0].hitTargets.length < 1) return {};


    token = canvas.tokens.get(args[0].tokenId);
    actor = token.actor;
    if (!actor || !token || args[0].hitTargets.length < 1) return {};

    let target = canvas.tokens.get(args[0].hitTargets[0].id ?? args[0].hitTargets[0]._id);
    if (!target) MidiQOL.error("Poison macro failed");

    let poisonData = await item?.getFlag(sdndConstants.MODULE_ID, "PoisonData");
    if (!poisonData) {
        console.log(`${item?.name} does not have poison data!`);
        return;
    }

    poisonData.charges -= 1;
    await gmFunctions.setFlag(item.uuid, sdndConstants.MODULE_ID, "PoisonData", poisonData);

    if (poisonData.duration > 0) {
        let elapsedMinutes = (game.time.worldTime - poisonData.startTime) / 60;
        if (elapsedMinutes > poisonData.duration) {
            await removePoison(actor, item, poisonData);
            return;
        }
    }
    if (poisonData.charges <= 0) {
        await removePoison(actor, item, poisonData);
    }
    let saveDiceRoll = await rollDC(target.actor, poisonData);
    if (poisonData.effect) {
        if (saveDiceRoll?.options?.success) {
            await ChatMessage.create({
                emote: true,
                speaker: { "actor": target.actor },
                content: `${target.actor.name} resists ${poisonData.name}...`
            });
            return;
        }
        if (await applyEffect(item, target.actor, poisonData)) {
            await removePoison(actor, item, poisonData);
        }
        return;
    }
    if (poisonData.dc > 0 && saveDiceRoll?.options?.success && !poisonData.halfDamageOnSave) {
        return;
    }
    const halfDamage = saveDiceRoll?.options?.success ?? false;
    let isCritical = args[0].isCritical;
    let dieCount = isCritical ? 2 * poisonData.dieCount : poisonData.dieCount;

    const rollOptions = {
        type: poisonData.damageType,
        flavor: `${poisonData.name}${halfDamage ? " (Half Damage)" : ""}`,
    };
    let damageRoll = `${dieCount}d${poisonData.dieFaces}`;
    if (halfDamage) {
        damageRoll = `floor(${damageRoll}/2)`;
    }
    let roll = await new CONFIG.Dice.DamageRoll(damageRoll, item?.getRollData() ?? target.actor.getRollData(), rollOptions).evaluate({ async: true });
    return roll;
}

async function craftPoison() {
    let controlledActor = utility.getControlledToken()?.actor;
    if (!controlledActor) {
        return;
    }
    let kit = controlledActor.items.find(i => i.name == "Poisoner's Kit");
    if (!kit) {
        ui.notifications.warn(`${controlledActor.name} does not have a poisoner's kit!`);
        return;
    }
    let poisoning = controlledActor.system?.tools?.pois;
    if (!poisoning || (poisoning?.prof?.multiplier ?? 0) == 0) {
        ui.notifications.warn(`${controlledActor.name} is not proficient with a poisoner's kit!`);
        return;
    }
    let recipes = await getRecipes(controlledActor);
    if (!recipes || recipes.length == 0) {
        ui.notifications.warn(`${controlledActor.name} has no recipes with required components or they are broke.`);
        return;
    }
    let recipieButtons = recipes.map(p => ({ label: p.name, value: p.name }));
    let recipieName = await dialog.createButtonDialog("Select Recipie to Craft", recipieButtons, 'column');
    if (!recipieName || recipieName.length == 0) {
        return;
    }
    let recipe = POISON_RECIPES.find(r => r.name == recipieName);
    if (!recipe) {
        console.log(`Could not resolve ${recipieName}!`);
        return;
    }
    let confirmation = await dialog.confirmation("Confirm Recipe", summarizeRecipe(recipe) +
        "<p>Creating this recipe will cost you non-refundable time, money, and ingredients.</p><p><i>Would you like to continue?</i></p>");
    if (confirmation != "True") {
        return;
    }

    let totalCopper = moneyInternal.getTotalCopper(controlledActor);
    if (totalCopper < (recipe.cost * 100)) {
        ui.notifications.warn(`${controlledActor.name} doesn't have the ${recipe.cost} gp required for this recipie.`);
        return;
    }
    let selectedIngredients = await selectIngredients(controlledActor, recipe);
    if (selectedIngredients == "cancel") {
        return;
    }
    let result = await rollToolCheck(controlledActor, recipe);
    await moneyInternal.takeCurrency([controlledActor.uuid], 0, recipe.cost, 0, 0, 0);
    await deleteIngredients(controlledActor, selectedIngredients);
    await gmFunctions.advanceTime((recipe.duration ?? 10) * 60);
    if (!result) {
        await ChatMessage.create({
            emote: true,
            speaker: { "actor": controlledActor },
            content: `${controlledActor.name} has failed to create ${recipe.name}...`
        });
        return;
    }
    const isCrit = (result == "Critical");
    let existingPotion = controlledActor.items.find(i => i.getFlag(sdndConstants.MODULE_ID, "PoisonType.name") == recipe.name);
    if (existingPotion) {
        await existingPotion.update({ "system": { "quantity": (existingPotion.system?.quantity ?? 0) + (isCrit ? 2 : 1) } });
    }
    else {
        let poison = await fromUuid(recipe.poisonUuid);
        let newItems = await controlledActor.createEmbeddedDocuments('Item', [poison]);
        if (isCrit) {
            let newItem = newItems[0];
            newItem.update({ "system": { "quantity": 2 } })
        }
    }
    await ChatMessage.create({
        emote: true,
        speaker: { "actor": controlledActor },
        content: `${(isCrit ? 'Critical Success! ' : '')}${controlledActor.name} has successfully crafted ${(isCrit ? 'two ' : '')}${recipe.name}...`
    });
}

async function applyPoison() {
    let controlledActor = utility.getControlledToken()?.actor;
    if (!controlledActor) {
        return;
    }
    let poisons = await getPoisons(controlledActor);
    if (!poisons || poisons.length == 0) {
        ui.notifications.warn(`${controlledActor.name} has no poisons.`);
        return;
    }
    let poisonButtons = poisons.map(p => ({ label: p.name, value: p.uuid }));
    let poisonUuid = await dialog.createButtonDialog("Select Poison To Apply", poisonButtons, 'column');
    if (!poisonUuid || poisonUuid.length == 0) {
        return;
    }
    let poison = await fromUuid(poisonUuid);
    let weapons = await getWeapons(controlledActor);
    if (!weapons || weapons.length == 0) {
        ui.notifications.warn(`${controlledActor.name} has no weapons that can be poisoned.`);
        return;
    }
    let weaponButtons = weapons.map(w => ({ label: w.name, value: w.uuid }));
    let weaponUuid = await dialog.createButtonDialog("Select Weapon to Poison", weaponButtons, 'column');
    if (!weaponUuid || weaponUuid.length == 0) {
        return;
    }
    let weapon = await fromUuid(weaponUuid);
    let poisonType = await poison.getFlag(sdndConstants.MODULE_ID, "PoisonType");
    const dcModifier = sdndSettings.PoisonDCModifier.getValue();
    if (poisonType.dc > 0 && dcModifier != 0) {
        poisonType.dc += dcModifier;
    }
    let bonusDamage = 0;
    let poisoning = controlledActor.system?.tools?.pois;
    if (poisonType.dc > 0 && (poisoning?.prof?.multiplier ?? 0) > 0) {
        let profBonus = (poisoning?.total ?? 0);
        if (poisonType.includeBonusDamage) {
            bonusDamage = profBonus;
        }
        poisonType.dc += profBonus;
    }
    await this.ApplyPoisonToItem(weaponUuid,
        poisonType.name,
        poisonType.dieFaces,
        poisonType.dieCount,
        bonusDamage,
        poisonType.damageType,
        poisonType.duration,
        poisonType.charges,
        poisonType.dc,
        poisonType.effect,
        poisonType.ability,
        poisonType.halfDamageOnSave);
    let charges = (poison.system?.uses?.value ?? 0) - 1;
    if (charges <= 0) {
        if (poison.system?.quantity == 1) {
            await poison.delete();
        }
        else {
            await poison.update({ "system": { "quantity": (poison.system?.quantity - 1) } });
        }
    }
    else {
        await poison.update({ "system": { "uses": { "value": charges } } });
    }
    await ChatMessage.create({
        emote: true,
        speaker: { "actor": controlledActor },
        content: `${controlledActor.name} has applied ${poison.name} to ${weapon.name}...`
    });
}

function actorHasIngredients(actor, recipe) {
    if (recipe.ingredients.length == 0) {
        return true;
    }
    let result = false;
    for (let ingredient of recipe.ingredients) {
        let items = actor.items.filter(i => ingredient.includes(i.name));
        if (items.length == 0) {
            return false;
        }
    }
    return true;
}

async function getRecipes(actor) {
    let knownRecipes = await listRecipes(actor, true);
    let totalCopper = moneyInternal.getTotalCopper(actor);
    return POISON_RECIPES.filter(recipie => {
        if (!knownRecipes.includes(recipie.name)) {
            return false;
        }
        if (totalCopper < (recipie.cost * 100)) {
            return false;
        }
        if (!actorHasIngredients(actor, recipie)) {
            return false;
        }
        return true;
    });
}

async function getPoisons(actor) {
    return actor?.items?.filter(i => i.getFlag(sdndConstants.MODULE_ID, "PoisonType"));
}

async function getWeapons(actor) {
    let weapons = actor?.items?.filter(i => i.type == "weapon" &&
        (i?.system?.damage?.parts?.find(d => d.includes('slashing')) ||
            i?.system?.damage?.parts?.find(d => d.includes('piercing')))
    );
    return weapons.filter(w => {
        let poisonData = w.getFlag(sdndConstants.MODULE_ID, "PoisonData");
        if (!poisonData) {
            return true;
        }
        if (poisonData.duration > 0) {
            let elapsed = (game.time.worldTime - poisonData.startTime) / 60 / 60;
            return (elapsed > poisonData.duration);
        }
        return true;
    });
}

async function rollDC(targetActor, poisonData) {
    if (poisonData.dc <= 0) {
        return false;
    }
    let ability = dnd5e.config.abilities[poisonData.ability];
    let rollOptions = {
        targetValue: poisonData.dc,
        fastForward: true,
        chatMessage: true,
        flavor: `(DC ${poisonData.dc}) ${ability.label} save against ${poisonData.name}`
    };
    return await targetActor.rollAbilitySave(ability.abbreviation, rollOptions);
}

async function rollToolCheck(actor, recipie) {
    let rollOptions = {
        targetValue: recipie.dc,
        fastForward: false,
        chatMessage: true,
        flavor: `(DC ${recipie.dc}) attempt to craft ${recipie.name}`
    };
    const dieRoll = await actor.rollToolCheck("pois", rollOptions);
    if (dieRoll.isCritical) {
        return "Critical";
    }
    return (dieRoll._total >= recipie.dc) ? true : false;
}

async function removePoison(actor, item, poisonData) {
    await gmFunctions.unsetFlag(item.uuid, sdndConstants.MODULE_ID, "PoisonData");
    await items.midiQol.removeOnUseMacro(item, "damageBonus", POISON_MACRO);
    ui.notifications.info(`(${actor.name}) ${poisonData.name} has worn off of ${item.name}...`);
}

async function applyEffect(item, targetActor, poisonData) {
    let effect = POISON_EFFECTS[poisonData.effect];
    if (targetActor?.effects.find(e => e.name == effect.name)) {
        return false;
    }
    let overtimeChange = effect.changes.find(e => e.key == "flags.midi-qol.OverTime");
    if (overtimeChange) {
        let overtime = Object.fromEntries(overtimeChange.value.split(",").map(i => i.split("=")));
        if (overtime.saveDc) {
            overtime.saveDc = poisonData.dc;
        }
        if (overtime.damageRoll) {
            overtime.damageRoll += `+${poisonData.bonusDamage}`;
        }
        overtimeChange.value = Object.entries(overtime).map(e => `${e[0]}=${e[1]}`).join(",");
    }
    effect.origin = item.uuid;
    await gmFunctions.createEffects(targetActor.uuid, [effect]);
    await ChatMessage.create({
        emote: true,
        speaker: { "actor": targetActor },
        content: `${targetActor.name} has been afflicted with ${effect.name}...`
    });
    return true;
}

async function selectIngredients(actor, recipe) {
    let selectedIngredients = [];
    if (recipe.ingredients.length == 0) {
        return selectedIngredients;
    }
    for (let ingredient of recipe.ingredients) {
        if (Array.isArray(ingredient)) {
            let items = actor.items.filter(i => ingredient.includes(i.name));
            if (items.length == 1) {
                selectedIngredients.push(items[0].name);
                continue;
            }
            let ingredientButtons = items.map(i => ({ label: i.name, value: i.name }));
            let selectedIngredient = await dialog.createButtonDialog("Select Ingredient", ingredientButtons, 'column');
            if (!selectedIngredient) {
                return "cancel";
            }
            selectedIngredients.push(selectedIngredient)
        }
        else {
            selectedIngredients.push(ingredient);
        }
    }
    return selectedIngredients;
}

async function deleteIngredients(actor, ingredients) {
    if (!ingredients || ingredients.length == 0) {
        return;
    }
    for (let ingredientName of ingredients) {
        let ingredient = actor.items.find(i => i.name == ingredientName);
        if (!ingredient) {
            continue;
        }
        if (ingredient.system?.quantity == 1) {
            await ingredient.delete();
        }
        else {
            await ingredient.update({ "system": { "quantity": (ingredient.system?.quantity - 1) } });
        }
    }
}

async function listRecipes(actor, retrieveOnly) {
    if (!actor) {
        return;
    }
    retrieveOnly = retrieveOnly ?? false;
    let recipes = await actor.getFlag(sdndConstants.MODULE_ID, "Recipes.Poison") ?? [];
    if (retrieveOnly) {
        return recipes;
    }
    let known = recipes.length == 0 ? "No known poisons." :
        recipes.map(r => summarizeRecipe(POISON_RECIPES.find(pr => pr.name == r))).join('<br/>');
    await ChatMessage.create({
        emote: true,
        speaker: { "actor": actor },
        content: `<b>${actor.name} poison recipes:</b><br/>${known}`
    });
    return recipes;
}

function listIngredients(recipe) {
    if (recipe.ingredients.length == 0) {
        return "None";
    }
    let ingredientlist = [];
    for (let ingredient of recipe.ingredients) {
        if (Array.isArray(ingredient)) {
            ingredientlist.push(`(${ingredient.join(" | ")})`);
        }
        else {
            ingredientlist.push(ingredient);
        }
    }
    return ingredientlist.join(", ");
}

function summarizeRecipe(recipe) {
    if (!recipe) {
        return '';
    }
    return `<b>${recipe.name}</b><br/>
&nbsp;&nbsp;DC: ${recipe.dc}<br/>
&nbsp;&nbsp;Cost: ${recipe.cost} GP<br/>
&nbsp;&nbsp;Ingredients: ${listIngredients(recipe)}<br/>
&nbsp;&nbsp;Crafting Time: ${recipe.duration ?? 10} minutes
`;
}