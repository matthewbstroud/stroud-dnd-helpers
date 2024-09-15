import { sdndConstants } from "../../constants.js";
import { dialog } from "../../dialog/dialog.js";
import { items } from "../items.js";
import { utility } from "../../utility/utility.js";

const POISON_MACRO = "function.stroudDnD.items.poison.ItemMacro";

const POISONS = [
    { "name": 'Basic Poison', "dc": 10, "dieFaces": 4, "dieCount": 1}
];

export let poison = {
    "ApplyPoison": async function _applyPoison() {
        let controlledActor = utility.getControlledToken()?.actor;
        if (!controlledActor) {
            return;
        }
        let poisons = await getPoisons(controlledActor);
        if (!poisons || poisons.length == 0) {
            ui.notifications.notify(`${controlledActor.name} has no poisons.`);
            return;
        }
        let poisonButtons = poisons.map(p => ({ label: p.name, value: p.uuid}));
        let poisonUuid = await dialog.createButtonDialog("Select Poison To Apply", poisonButtons, 'column');
        if (!poisonUuid || poisonUuid.length == 0) {
            return;
        }
        let poison = await fromUuid(poisonUuid);
        let weapons = await getWeapons(controlledActor);
        if (!weapons || weapons.length == 0) {
            ui.notifications.notify(`${controlledActor.name} has no weapons that can be poisoned.`);
            return;
        }
        let weaponButtons = weapons.map(w => ({ label: w.name, value: w.uuid }));
        let weaponUuid = await dialog.createButtonDialog("Select Weapon to Poison", weaponButtons, 'column');
        if (!weaponUuid || weaponUuid.length == 0) {
            return;
        }
        let weapon = await fromUuid(weaponUuid);
        let poisonType = poison.getFlag(sdndConstants.MODULE_ID, "PoisonType");

        this.ApplyPoisonToItem(weaponUuid, 
            poisonType.name, 
            poisonType.dieFaces, 
            poisonType.dieCount, 
            poisonType.damageType, 
            poisonType.duration, 
            poisonType.charges, 
            poisonType.dc, 
            poisonType.ability, 
            poisonType.halfDamageOnSave);
        let charges = (poison.system?.uses?.value ?? 0) - 1;
        if (charges <= 0) {
            await poison.delete();
        }
        else {
            await poison.update({ "system": { "uses": { "value": charges}}});
        }
        await ChatMessage.create({
            emote: true,
            speaker: { "actor": controlledActor },
            content: `${controlledActor.name} has applied ${poison.name} to ${weapon.name}...`
        });
        console.log(weaponUuid);
    },
    "ApplyPoisonToItem": function _applyPoisonToItem(itemUuid, poisonName, dieFaces, dieCount, damageType, durationHours, charges, dc, ability, halfDamageOnSave) {
        durationHours = durationHours ?? 0;
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
            "charges": charges,
            "duration": durationHours,
            "startTime": (durationHours > 0 ? game.time.worldTime : null),
            "dc": dc,
            "priorData": {
                "midiProperties": (item.flags["midiProperties"]),
                "save": item.system?.save
            }
        });
        items.midiQol.addOnUseMacro(item, "damageBonus", POISON_MACRO);
        if (dc > 0) {
            items.midiQol.addBonusDamageSave(item, ability, dc, halfDamageOnSave);
        }
    },
    "CreatePoison": function _createPoison(itemUuid, name, dieFaces, dieCount, durationHours, charges, dc, damageType, ability, halfDamageOnSave) {
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
            "duration": durationHours,
            "startTime": (durationHours > 0 ? game.time.worldTime : null),
            "dc": dc,
            "abilitySave": ability,
            "halfDamageOnSave": halfDamageOnSave
        });
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

    if (poisonData.duration > 0) {
        let elapsed = (game.time.worldTime - poisonData.startTime) / 60 / 60;
        if (poisonData.charges == 0 || elapsed > poisonData.duration) {
            item.unsetFlag(sdndConstants.MODULE_ID, "PoisonData");
            items.midiQol.removeOnUseMacro(item, "damageBonus", POISON_MACRO);
            if (poisonData.dc > 0) {
                items.midiQol.removeBonusDamageSave(item, poisonData.priorData);
            }
            ui.notifications.info(`(${actor.name}) ${poisonData.name} has worn off of ${item.name}...`);
            return;
        }
    }

    let isCritical = args[0].isCritical;
    let dieCount = isCritical ? 2 * poisonData.dieCount : poisonData.dieCount;
    var rollData = `${dieCount}d${poisonData.dieFaces}[${poisonData.damageType}]`;
    return { damageRoll: rollData, flavor: `${poisonData.name} damage!` };
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
