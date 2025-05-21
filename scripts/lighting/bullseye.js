import { sdndConstants } from "../constants.js";
import { gmFunctions } from "../gm/gmFunctions.js";


export let bullseyeLantern = {
    "itemMacro": _itemMacro,
    "toggleEffectHandler": toggleEffect,
    "createBullseye": async function _createBullseye(unlitUuid, litUuid) {
        let unlit = await fromUuid(unlitUuid);
        let lit = await fromUuid(litUuid);
        if (!unlit || !lit) {
            console.log("bad ids");
            return;
        }
        unlit.setFlag(sdndConstants.MODULE_ID, "lightable", {
            "unlitImg": unlit.img,
            "litUuid": litUuid
        });
    }
}

async function _itemMacro({ speaker, actor, token, character, item, args }) {
    // check oil level
    let effect = await getEffect(item);
    if (args[0].macroPass == "preItemRoll" && !handlePreRoll(item, actor, effect)) {
        return false;
    }
    if (args[0].macroPass != "postActiveEffects") {
        return;
    }
    await createEffect(item);
}

function handlePreRoll(item, actor, effect) {
    if (!effect) {
        let flaskOfOil = checkForOil(actor);
        if (!flaskOfOil) {
            ui.notifications.warn(`${actor.name} does not have any oil with which to light this lantern.`);
            return false;
        }
    }
    const isBurning = !effect.isSuppressed;
    const remaining = isBurning ? (effect?.duration?.remaining ?? 1) : (item.getFlag(sdndConstants.MODULE_ID, "lightable.remaining"));
    const hours =  Math.round((remaining / 60 / 60) * 100) / 100;
    ui.notifications.warn(`${item.name} is ${isBurning ? '' : ' not' } burning and has ${hours} hours worth of oil left.`);
    return false;
}

function checkForOil(actor) {
    let flaskOfOil = actor?.items.find(i => i._stats.compendiumSource == "Compendium.dnd5e.items.Item.psoZaItkOScMVaHL");
    if (!flaskOfOil) {
        flaskOfOil = actor?.items.find(i => i.name == "Oil Flask" && i.type == "consumable");
    }
    return flaskOfOil;
}

async function getEffect(item) {
    const effects = item.effects.contents;
    if (effects.length == 0) {
        return null;
    } 
    return await fromUuid(effects[0].uuid);
}

async function createEffect(item) {
    var litItemUuidd = item.getFlag(sdndConstants.MODULE_ID, "lightable.litUuid");
    if (!litItemUuidd) {
        ui.notifications.error(`${item.name} is not a valid SDND light!`);
        return;
    }
    var litItem = await fromUuid(litItemUuidd);
    if (!litItem) {
        ui.notifications.error(`Could not find ${litItemUuidd}!`);
        return;
    }
    const effects = litItem.effects.contents;
    if (effects.length == 0) {
        return;
    } 
    let litEffect = foundry.utils.duplicate(effects[0]);
    litEffect.duration.startTime = game.time.worldTime;
    await item.setFlag(sdndConstants.MODULE_ID, "lightable.remaining", litEffect.duration.seconds);
    await gmFunctions.createEmbeddedDocuments(item.uuid, ActiveEffect.name, [litEffect]);
    await item.update({ "system.equipped": true });
    await toggleImage(item, litEffect, true);
}

async function toggleImage(item, effect, enabled) {
    let img = enabled ? effect.img : item.getFlag(sdndConstants.MODULE_ID, "lightable.unlitImg");
    if (item.img == img) {
        return;
    }
    let changes = {
        "img": img
    };
    if (enabled && !(item.system.equipped ?? false)) {
        changes.system = {
            "equipped": true
        }
    }

    await item.update(changes);
} 

async function toggleEffect(actor, item, effect, force) {
    const equipped = item.system.equipped ?? false;
    const disabled = effect.disabled ?? false;
    if (disabled) {
        await toggleImage(item, effect, false);
        await effect.delete();
        return;
    }
    let effectChanges = {
        "_id": effect._id,
        "isSuppressed": effect.isSuppressed,
        "duration": foundry.utils.duplicate(effect.duration)
    }
    let remaining =  item.getFlag(sdndConstants.MODULE_ID, "lightable.remaining");
    if (equipped) {
        effectChanges.duration.startTime = game.time.worldTime;
        effectChanges.duration.seconds = remaining;
        effectChanges.duration.duration = remaining;
    }
    else {
        await item.setFlag(sdndConstants.MODULE_ID, "lightable.remaining", effect.duration.remaining);
        effectChanges.duration.seconds = null;
        effectChanges.duration.duration = null;
    }
    await item.updateEmbeddedDocuments(ActiveEffect.name, [effectChanges]);
    await toggleImage(item, effect, (equipped && !effect.disabled));
}