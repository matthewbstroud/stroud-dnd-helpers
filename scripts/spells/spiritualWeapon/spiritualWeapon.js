import { sdndConstants } from "../../constants.js";

export let spiritualWeapon = {
    "castOrUse": _castOrUse
};

async function _castOrUse() {
    if (canvas.tokens.controlled.length != 1) {
        ui.notifications.notify(`Please select a single actor!`);
        return;
    }
    let targetActor = canvas.tokens.controlled[0]?.actor;
    let casterActor = targetActor;
    let casterActorUuid = await targetActor.getFlag("chris-premades", "summons.control.actor");
    if (casterActorUuid && casterActorUuid.length > 0) {
        casterActor = await fromUuid(casterActorUuid);
    }
    if (!casterActor) {
        ui.notifications.notify(`Please select a player or the spiritual weapon!`);
        return;
    }

    // does the weapon exist in the scene?
    let weaponActor = canvas.scene.tokens.find(t => t.actor?.getFlag("chris-premades", "summons.control.actor") == casterActor.uuid);
    if (weaponActor) {
        let attack = casterActor.items.find(i => i.getFlag("chris-premades", "info.identifier") == "spiritualWeaponAttack");
        if (attack) {
            attack.use();
            return;
        }
        return;
    }

    let spiritualWeaponSpell = targetActor?.items.find(i => i.getFlag("chris-premades", "info.identifier") == "spiritualWeapon");
    if (!spiritualWeaponSpell) {
        ui.notifications.notify(`${targetActor.name} doesn't know ${sdndConstants.SPELLS.SPIRITUAL_WEAPON}!`);
        return;
    }

    spiritualWeaponSpell.use();
}

