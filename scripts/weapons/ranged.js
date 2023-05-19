import { dialog } from "../dialog/dialog.js";

export let ranged = {
    "reload": _reload
};

let reloader = {
    getEqippedRangedWeapons: function _getEqippedRangedWeapons(target) {
        return target.items.filter(i => i.system.equipped == true && i.type == "weapon" && i.system.actionType == "rwak");
    },
    getAmmo: function _getAmmo(target, weapon) {
        let ammoType = "unknown";
        switch (weapon.system.baseItem) {
            case "longbow":
            case "shortbow":
                ammoType = "arrow";
                break;
            case "heavycrossbow":
            case "lightcrossbow":
            case "handcrossbow":
                ammoType = "bolt";
                break;
            case "sling":
                ammoType = "bullet";
                break;
        }
        if (ammoType == "unknown") {
            return [];
        }
        return target.items.filter(i => i.type == "consumable" && i.system.quantity > 0 && i.system.actionType == "rwak" && i.name.toLowerCase().includes(ammoType));
    },
    loadWeapon: async function _loadWeapon(weapon, ammo){
        await weapon.update(
            { 
                "system.consume.type": "ammo",
                "system.consume.target": ammo.id,
                "system.consume.amount": 1
            }
        );
        
    }
};
async function _reload(){
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
    
    let selectedWeaponID = await dialog.createButtonDialog("Select Weapon", equippedRangeWeapons.map(w => ({label: w.name, value: w.id})), "column");
    if (!selectedWeaponID) {
        return;
    }
    let selectedWeapon = equippedRangeWeapons.find(w => w.id == selectedWeaponID);
    let availableAmmo = reloader.getAmmo(controlledActor, selectedWeapon);
    
    if (availableAmmo.length < 1) {
        ui.notifications.notify(`${controlledActor.name} has no available ammo for ${selectedWeapon.name}!`);
        return;
    }
    
    let selectedAmmoID = await dialog.createButtonDialog("Select Ammo", availableAmmo.map(a => ({label: `${a.name} (${a.system.quantity})`, value: a.id})), "column");
    if (!selectedAmmoID) {
        return;
    }
    let selectedAmmo = availableAmmo.find(a => a.id == selectedAmmoID);
    
    await reloader.loadWeapon(selectedWeapon, selectedAmmo);
    ChatMessage.create({ speaker: { alias: controlledActor.name }, content: `Loads ${selectedAmmo.name} into ${selectedWeapon.name}...` });
}
