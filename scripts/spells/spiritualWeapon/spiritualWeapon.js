import { sdndConstants } from "../../constants.js";
import { versioning } from "../../versioning.js";

export let spiritualWeapon = {
    "castOrUse": foundry.utils.debounce(_castOrUse, 250)
};

async function _castOrUse() {
    if (canvas.tokens.controlled.length != 1) {
        ui.notifications.notify(`Please select a single actor!`);
        return;
    }
    const { weaponActor, casterActor} = await resolveWeaponAndCasterActors(canvas.tokens.controlled[0]?.actor);
    if (!casterActor) {
        ui.notifications.notify(`Please select a player or the spiritual weapon!`);
        return;
    }
    if (weaponActor) {
        await getSpritualWeaponAttack(casterActor)?.use();
        return;
    }

    let spiritualWeaponSpell = getSpritualWeaponSpell(casterActor);
    if (!spiritualWeaponSpell) {
        ui.notifications.notify(`${casterActor.name} doesn't know ${sdndConstants.SPELLS.SPIRITUAL_WEAPON}!`);
        return;
    }

    await spiritualWeaponSpell.use();
}

async function resolveWeaponAndCasterActors(controlledActor) {
    let result = {
        "weaponActor": {},
        "casterActor": {}
    };
    const casterActorUuid = controlledActor.getFlag("chris-premades", "summons.control.actor");
    if (casterActorUuid) { // weapon selected
        result.casterActor = await fromUuid(casterActorUuid);
        result.weaponActor = controlledActor;
        return result;
    }
    // actor selected
    result.casterActor = controlledActor;
    result.weaponActor = canvas.scene.tokens.find(t => t.actor?.getFlag("chris-premades", "summons.control.actor") == controlledActor.uuid);
    return result;
}

function getSpritualWeaponSpell(actor) {
    return getSpiritualWeaponByActivityType(actor, "utility") ??
        actor?.items?.find(i => i.getFlag("chris-premades", "info.identifier") == "spiritualWeapon");
}

function getSpritualWeaponAttack(actor) {
    return getSpiritualWeaponByActivityType(actor, "attack") ??
        actor?.items?.find(i => i.getFlag("chris-premades", "info.identifier") == "spiritualWeaponAttack");
}

function getSpiritualWeaponByActivityType(actor, activityType) {
    return actor?.items?.find(i => i.getFlag("chris-premades", "info.identifier") == "spiritualWeapon")
        ?.system?.activities?.contents
        ?.find(a => a.type == activityType);
}