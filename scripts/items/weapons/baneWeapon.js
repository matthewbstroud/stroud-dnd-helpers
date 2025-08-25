import { sdndConstants } from "../../constants.js";
import { items } from "../items.js";

const BANE_MACRO = "function.stroudDnD.items.weapons.baneWeapon.ItemMacro";

export let baneWeapon = {
    "CreateBaneWeapon": async function _createBaneWeapon(itemUuid, baneCreatureType, dieFaces, dieCount, damageType, durationHours) {
        durationHours = durationHours ?? 0;
        let item = fromUuidSync(itemUuid);
        await item.setFlag(sdndConstants.MODULE_ID, "BaneWeaponData", {
            "CreatureType": baneCreatureType,
            "DieFaces": dieFaces,
            "DieCount": dieCount,
            "DamageType": damageType,
            "Duration": durationHours,
            "StartTime": (durationHours > 0 ? game.time.worldTime : null)
        });
        await items.midiQol.addOnUseMacro(item, "damageBonus", BANE_MACRO);
    },
    "RemoveBaneWeapon": async function _removeBaneWeapon(itemUuid) {
        let item = fromUuidSync(itemUuid);
        await item.unsetFlag(sdndConstants.MODULE_ID, "BaneWeaponData");
        await items.midiQol.removeOnUseMacro(item, "damageBonus", BANE_MACRO);
    },
    "ItemMacro": _itemMacro
};

async function _itemMacro({ speaker, actor, token, character, item, args }) {
    if (args[0]?.macroPass != "DamageBonus") {
        return;
    }
    const actionType = args[0].item?.system?.actionType ?? args[0].workflow.activity.actionType;
    if (!["mwak", "rwak"].includes(actionType)) return {};
    if (args[0].hitTargets.length < 1) return {};

    if (!actor || !token || args[0].hitTargets.length < 1) return {};

    let target = canvas.tokens.get(args[0].hitTargets[0].id ?? args[0].hitTargets[0]._id);
    if (!target) MidiQOL.error("Bane Weapon macro failed");

    let baneWeaponData = await item?.getFlag(sdndConstants.MODULE_ID, "BaneWeaponData");
    if (!baneWeaponData) {
        console.log(`${item?.name} does not have bane weapon data!`);
        return;
    }

    if (baneWeaponData.Duration > 0) {
        let elapsed = (game.time.worldTime - baneWeaponData.StartTime) / 60 / 60;
        if (elapsed > baneWeaponData.Duration) {
            await item.unsetFlag(sdndConstants.MODULE_ID, "BaneWeaponData");
            await items.midiQol.removeOnUseMacro(item, "damageBonus", BANE_MACRO);
            ui.notifications.info(`(${actor.name}) Bane Weapon has worn off of ${item.name}...`);
            return;
        }
    }

    let targetType = target.actor.system.details.type.value;
    const baneCreatureTypes = baneWeaponData.CreatureType.split(",");
    if (!baneCreatureTypes.includes(targetType)) return {};
    let isCritical = args[0].isCritical;
    let dieCount = isCritical ? 2 * baneWeaponData.DieCount : baneWeaponData.DieCount;
    var rollData = `${dieCount}d${baneWeaponData.DieFaces}[${baneWeaponData.DamageType}]`;
    return { damageRoll: rollData, flavor: `Extra ${baneWeaponData.DamageType} damage vs ${targetType}!` };
}
