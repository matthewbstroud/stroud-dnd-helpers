import { sdndConstants } from "../../constants.js";

const BANE_MACRO = "[damageBonus]function.stroudDnD.items.weapons.baneWeapon.ItemMacro";

export let baneWeapon = {
    "CreateBaneWeapon": function _createBaneWeapon(itemId, baneCreatureType, dieFaces, dieCount, damageType) {
        let item = game.items.get(itemId);
        item.setFlag(sdndConstants.MODULE_ID, "BaneWeaponData", {
            "CreatureType": baneCreatureType,
            "DieFaces": dieFaces,
            "DieCount": dieCount,
            "DamageType": damageType
        });
        let onUseMacro = item.getFlag("midi-qol", "onUseMacroName") ?? "";
        if (onUseMacro.includes(BANE_MACRO)){
            return;
        }
        let finalMacro = BANE_MACRO;
        if (onUseMacro.length > 0) {
            finalMacro += "," + onUseMacro
        }
        item.setFlag("midi-qol", "onUseMacroName", finalMacro);
    },
    "ItemMacro": _itemMacro
};

async function _itemMacro({speaker, actor, token, character, item, args}) {
    if (args[0]?.macroPass != "DamageBonus") {
        return;
    }
    if (!["mwak", "rwak"].includes(args[0].item.system.actionType)) return {};
    if (args[0].hitTargets.length < 1) return {};

    
    token = canvas.tokens.get(args[0].tokenId);
    actor = token.actor;
    if (!actor || !token || args[0].hitTargets.length < 1) return {};

    let target = canvas.tokens.get(args[0].hitTargets[0].id ?? args[0].hitTargets[0]._id);
    if (!target) MidiQOL.error("Bane Weapon macro failed");

    let baneWeaponData = item?.getFlag(sdndConstants.MODULE_ID, "BaneWeaponData");
    if (!baneWeaponData) {
        console.log(`${item?.name} does not have bane weapon data!`);
        return;
    }

    let targetType = target.actor.system.details.type.value;
    const baneCreatureTypes = baneWeaponData.CreatureType.split(",");
    if (!baneCreatureTypes.includes(targetType)) return {};
    let isCritical = args[0].isCritical;
    let dieCount = isCritical ? 2 * baneWeaponData.DieCount : baneWeaponData.DieCount;
    var rollData = `${dieCount}d${baneWeaponData.DieFaces}[${baneWeaponData.DamageType}]`;
    return { damageRoll: rollData, flavor: `Extra ${baneWeaponData.DamageType} damage vs ${targetType}!` };
}
