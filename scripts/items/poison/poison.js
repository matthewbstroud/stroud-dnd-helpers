import { sdndConstants } from "../../constants.js";
import { dialog } from "../../dialog/dialog.js";
import { items } from "../items.js";
import { money } from "../../money/money.js";
import { utility } from "../../utility/utility.js";
import { gmFunctions } from "../../gm/gmFunctions.js";
import { moneyInternal } from "../../money/money.js";

const POISON_MACRO = "function.stroudDnD.items.poison.ItemMacro";
const RECIPE_MACRO = "function.stroudDnD.items.poison.UnlockRecipe";

const POISON_RECIPIES = [
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
                "stackable": "multi",
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
    "ApplyPoison": async function _applyPoison() {
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
        let poisonType = poison.getFlag(sdndConstants.MODULE_ID, "PoisonType");
        let poisoning = controlledActor.system?.tools?.pois;
        if (poisonType.dc > 0 && (poisoning?.prof?.multiplier ?? 0) > 0) {
            poisonType.dc += (poisoning?.total ?? 0);
        }
        this.ApplyPoisonToItem(weaponUuid,
            poisonType.name,
            poisonType.dieFaces,
            poisonType.dieCount,
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
    },
    "ApplyPoisonToItem": function _applyPoisonToItem(itemUuid, poisonName, dieFaces, dieCount, damageType, durationMinutes, charges, dc, effect, ability, halfDamageOnSave) {
        durationMinutes = durationMinutes ?? 0;
        dc = dc ?? 0;
        ability = ability ?? dnd5e.config.abilities.con.abbreviation;
        halfDamageOnSave = halfDamageOnSave ?? true;
        let item = fromUuidSync(itemUuid);
        let poisonData = item.getFlag(sdndConstants.MODULE_ID, "PoisonData");
        if (poisonData && poisonData.duration > 0 && poisonData.charges > 0) {
            let elapsed = (game.time.worldTime - poisonData.startTime) / 60 / 60;
            if (elapsed < poisonData.duration) {
                ui.notifications.warn(`${item.name} is already poisoned with ${poisonData.name}!`);
                return;
            }
        }
        
        item.setFlag(sdndConstants.MODULE_ID, "PoisonData", {
            "name": poisonName,
            "dieFaces": dieFaces,
            "dieCount": dieCount,
            "damageType": damageType,
            "ability": ability,
            "charges": charges,
            "duration": durationMinutes,
            "startTime": (durationMinutes > 0 ? game.time.worldTime : null),
            "dc": dc,
            "effect": effect,
            "priorData": {
                "midiProperties": (item.flags["midiProperties"]),
                "save": item.system?.save
            }
        });
        items.midiQol.addOnUseMacro(item, "damageBonus", POISON_MACRO);
    },
    "CreatePoison": function _createPoison(itemUuid, name, dieFaces, dieCount, durationMinutes, charges, dc, effect, damageType, ability, halfDamageOnSave) {
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
        item.setFlag(sdndConstants.MODULE_ID, "PoisonType", {
            "name": name,
            "dieFaces": dieFaces,
            "dieCount": dieCount,
            "damageType": damageType,
            "charges": charges,
            "duration": durationMinutes,
            "dc": dc,
            "effect": effect,
            "abilitySave": ability,
            "halfDamageOnSave": halfDamageOnSave
        });
    },
    "CraftPoison": async function _CraftPoison() {
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
        let recipies = await getRecipies(controlledActor);
        if (!recipies || recipies.length == 0) {
            ui.notifications.warn(`${controlledActor.name} has no recipies with required components or they are broke.`);
            return;
        }
        let recipieButtons = recipies.map(p => ({ label: p.name, value: p.name }));
        let recipieName = await dialog.createButtonDialog("Select Recipie to Craft", recipieButtons, 'column');
        if (!recipieName || recipieName.length == 0) {
            return;
        }
        let recipie = POISON_RECIPIES.find(r => r.name == recipieName);
        if (!recipie) {
            console.log(`Could not resolve ${recipieName}!`);
            return;
        }
        let totalCopper = moneyInternal.getTotalCopper(controlledActor);
        if (totalCopper < (recipie.cost * 100)) {
            ui.notifications.warn(`${controlledActor.name} doesn't have the ${recipie.cost} gp required for this recipie.`);
            return;
        }
        await moneyInternal.takeCurrency([controlledActor.uuid], 0, recipie.cost, 0, 0, 0);
        await deleteIngredients(controlledActor, recipie);
        await gmFunctions.advanceTime(600);
        let result = await rollToolCheck(controlledActor, recipie);
        if (!result) {
            await ChatMessage.create({
                emote: true,
                speaker: { "actor": controlledActor },
                content: `${controlledActor.name} has failed to create ${recipie.name}...`
            });
            return;
        }
        const isCrit = (result == "Critical");
        let existingPotion = controlledActor.items.find(i => i.getFlag(sdndConstants.MODULE_ID, "PoisonType.name") == recipie.name);
        if (existingPotion) {
            await existingPotion.update({ "system": { "quantity": (existingPotion.system?.quantity ?? 0) + (isCrit ? 2 : 1) }});
        }
        else {
            let poison = await fromUuid(recipie.poisonUuid);
            let newItems = await controlledActor.createEmbeddedDocuments('Item', [poison]);
            if (isCrit) {
                let newItem = newItems[0];
                newItem.update({ "system": { "quantity": 2 }})
            }
        }
        await ChatMessage.create({
            emote: true,
            speaker: { "actor": controlledActor },
            content: `${(isCrit ? 'Critical Success! ' : '')}${controlledActor.name} has successfully crafted ${(isCrit ? 'two ' : '')}${recipie.name}...`
        });
    },
    "CreateRecipe": async function _createRecipe(itemUuid, recipeName) {
        let item = fromUuidSync(itemUuid);
        if (!item) {
            console.log("Item not found!");
            return;
        }
        await item.setFlag(sdndConstants.MODULE_ID, "Recipe.name", recipeName);
        items.midiQol.addOnUseMacro(item, "postNoAction", RECIPE_MACRO);
    },
    "ListRecipes": async function _listRecipes(actor) {
        return await listRecipes(actor, false);
    },
    "UnlockRecipe": function _unlockRecipe({ speaker, actor, token, character, item, args }) {
        let recipeName = item.getFlag(sdndConstants.MODULE_ID, "Recipe.name");
        if (!recipeName || recipeName.length == 0) {
            console.log("Could not find recipe name on this item!");
            return;
        }
        let recipies = actor.getFlag(sdndConstants.MODULE_ID, "Recipies.Poison") ?? [];
        
        if (recipies.includes(recipeName)) {
            ui.notifications.info(`${actor.name} already knows ${recipeName}!`);
            return;
        }
        recipies.push(recipeName);
        recipies.sort();
        actor.setFlag(sdndConstants.MODULE_ID, "Recipies.Poison", recipies);
    },
    "ItemMacro": _itemMacro
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

    let poisonData = item?.getFlag(sdndConstants.MODULE_ID, "PoisonData");
    if (!poisonData) {
        console.log(`${item?.name} does not have poison data!`);
        return;
    }

    poisonData.charges -= 1;
    item.setFlag(sdndConstants.MODULE_ID, "PoisonData", poisonData);

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
    if (await rollDC(target.actor, poisonData)) {
        return;
    }
    if (poisonData.effect) {
        if (await applyEffect(item, target.actor, poisonData)) {
            await removePoison(actor, item, poisonData);
        }
        return;
    }
    let isCritical = args[0].isCritical;
    let dieCount = isCritical ? 2 * poisonData.dieCount : poisonData.dieCount;
    var rollData = `${dieCount}d${poisonData.dieFaces}[${poisonData.damageType}]`;
    return { damageRoll: rollData, flavor: `${poisonData.name} damage!` };
}

async function getRecipies(actor) {
    let knownRecipies = await listRecipes(actor, true);
    let totalCopper = moneyInternal.getTotalCopper(actor);
    return POISON_RECIPIES.filter(recipie => {
        if (!knownRecipies.includes(recipie.name)) {
            return false;
        }
        if (totalCopper < (recipie.cost * 100)) {
            return false;
        }
        for (let ingredient of recipie.ingredients) {
            if (!actor.items.find(i => i.name == ingredient)) {
                return false;
            }
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
    const dieRoll = await targetActor.rollAbilitySave(ability.abbreviation, rollOptions);

    if (dieRoll.options.success) {
        await ChatMessage.create({
            emote: true,
            speaker: { "actor": targetActor },
            content: `${targetActor.name} resists ${poisonData.name}...`
        });
        return true;
    }
    return false;
}

async function rollToolCheck(actor, recipie) {
    let rollOptions = {
        targetValue: recipie.dc,
        fastForward: true,
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
    item.unsetFlag(sdndConstants.MODULE_ID, "PoisonData");
    items.midiQol.removeOnUseMacro(item, "damageBonus", POISON_MACRO);
    ui.notifications.info(`(${actor.name}) ${poisonData.name} has worn off of ${item.name}...`);
}

async function applyEffect(item, targetActor, poisonData) {
    let effect = POISON_EFFECTS[poisonData.effect];
    if (targetActor?.effects.find(e => e.name == effect.name)) {
        return false;
    }
    effect.startTime = game.time.worldTime;
    effect.origin = item.uuid;
    await gmFunctions.createEffects(targetActor.uuid, [effect]);
    await ChatMessage.create({
        emote: true,
        speaker: { "actor": targetActor },
        content: `${targetActor.name} has been afflicted with ${effect.name}...`
    });
    return true;
}

async function deleteIngredients(actor, recipie) {
    if (!recipie?.ingredients || recipie.ingredients.length == 0) {
        return;
    }
    for (let ingredientName of recipie.ingredients) {
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
    let recipies = actor.getFlag(sdndConstants.MODULE_ID, "Recipies.Poison") ?? [];
    if (retrieveOnly) {
        return recipies;
    }
    let known = recipies.length == 0 ? "No known poisons." : 
    recipies.map(r => summarizeRecipe(POISON_RECIPIES.find(pr => pr.name == r))).join('<br/>');
    await ChatMessage.create({
        emote: true,
        speaker: { "actor": actor },
        content: `<b>${actor.name} poison recipes:</b><br/>${known}`
    });
    return recipies;
}

function summarizeRecipe(recipe) {
    if (!recipe) {
        return '';
    }
    return `<b>${recipe.name}</b><br/>
&nbsp;&nbsp;DC: ${recipe.dc}<br/>
&nbsp;&nbsp;Cost: ${recipe.cost} GP<br/>
&nbsp;&nbsp;Ingredients: ${recipe.ingredients.length == 0 ? "None": recipe.ingredients.join(", ")}
`;
}