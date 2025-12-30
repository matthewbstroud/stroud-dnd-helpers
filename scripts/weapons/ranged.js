import { dialog } from "../dialog/dialog.js";
import { versioning } from "../versioning.js";
export let ranged = {
    "reload": foundry.utils.debounce(_reload, 250)
};

let reloader = {
    getEqippedRangedWeapons: function _getEqippedRangedWeapons(target) {
        return target.items.filter(i => i.system.equipped == true && i.type == "weapon" && i.system.ammunition?.type);
    },
    getAmmo: function _getAmmo(target, weapon) {
        let ammoType = "unknown";
        switch (weapon.system.type.baseItem) {
            case "longbow":
            case "shortbow":
                ammoType = { name: "arrow", subtype: "arrow" };
                break;
            case "heavycrossbow":
            case "lightcrossbow":
            case "handcrossbow":
                ammoType = { name: "bolt", subtype: "crossbowBolt" };
                break;
            case "sling":
                ammoType = { name: "bullet", subtype: "slingBullet" };
                break;
        }
        if (ammoType == "unknown") {
            return [];
        }
        return target.items.filter(i => itemIsValueForAmmoType(i, ammoType));
    },
    loadWeapon: async function _loadWeapon(weapon, ammo) {
        await versioning.dndVersionedAsync(
            () => loadWeaponV4(weapon, ammo),
            () => loadWeaponV3(weapon, ammo)
        );
    }
};

async function loadWeaponV3(weapon, ammo) {
    await weapon.update(
        {
            "system.consume.type": "ammo",
            "system.consume.target": ammo.id,
            "system.consume.amount": 1
        }
    );

}

async function loadWeaponV4(weapon, ammo) {
    let attackActivity = weapon.system.activities.contents.find(a => a.type == "attack");
    if (!attackActivity) {
        ui.notifications.error(`Do not know how to load ${weapon.name}!`);
        return;
    }
    await attackActivity.update({ "ammunition": ammo.id });
    await weapon.setFlag("dnd5e", `last.${attackActivity.id}.ammunition`, ammo.id);
}

function itemIsValueForAmmoType(item, ammoType) {
    return versioning.dndVersioned(
        () => itemIsValueForAmmoTypeV4(item, ammoType),
        () => itemIsValueForAmmoTypeV3(item, ammoType)
    );
}

function itemIsValueForAmmoTypeV3(item, ammoType) {
    return item.type == "consumable"
        && item.system?.quantity > 0
        && item.system?.actionType == "rwak"
        && item.name.toLowerCase().includes(ammoType.name);
}

function itemIsValueForAmmoTypeV4(item, ammoType) {
    return item.type == "consumable"
        && item.system?.type?.value == "ammo"
        && item.system?.type?.subtype == ammoType.subtype
        && item.system?.quantity > 0;
}

async function _reload() {
    let controlledActors = canvas.tokens.controlled.filter((token) => token.actor && token.actor.type == 'character').map(t => t.actor)
    if (controlledActors.length != 1) {
        ui.notifications.notify(`You must select a single player token!`);
        return;
    }
    let controlledActor = controlledActors[0];
    let equippedRangeWeapons = reloader.getEqippedRangedWeapons(controlledActor);

    if (equippedRangeWeapons.length < 1) {
        ui.notifications.notify(`${controlledActor.name} has no equipped ranged weapons!`);
        return;
    }

    let selectedWeaponID = await dialog.createButtonDialog("Select Weapon", equippedRangeWeapons.map(w => ({ label: w.name, value: w.id })), "column");
    if (!selectedWeaponID) {
        return;
    }
    let selectedWeapon = equippedRangeWeapons.find(w => w.id == selectedWeaponID);
    let availableAmmo = reloader.getAmmo(controlledActor, selectedWeapon);

    if (availableAmmo.length < 1) {
        ui.notifications.notify(`${controlledActor.name} has no available ammo for ${selectedWeapon.name}!`);
        return;
    }

    let selectedAmmoID = await dialog.createButtonDialog("Select Ammo", availableAmmo.map(a => ({ label: `${a.name} (${a.system.quantity})`, value: a.id })), "column");
    if (!selectedAmmoID) {
        return;
    }
    let selectedAmmo = availableAmmo.find(a => a.id == selectedAmmoID);

    await reloader.loadWeapon(selectedWeapon, selectedAmmo);
    ChatMessage.create({ speaker: { alias: controlledActor.name }, content: `Loads ${selectedAmmo.name} into ${selectedWeapon.name}...` });
}
