import { huntersMark } from "./huntersmark/huntersMark.js";
import { spiritualWeapon } from "./spiritualWeapon/spiritualWeapon.js";

export async function getSpellData(abilityName){
    if (canvas.tokens.controlled.length != 1) {
        ui.notifications.notify(`Please select a single actor!`);
        return null;
    }
    let targetActor = canvas.tokens.controlled[0].actor;
    if (!targetActor) {
        ui.notifications.notify(`Please select an actor!`);
        return null;
    }
    
    var abilityItem = await targetActor.items.getName(abilityName);
    if (!abilityItem) {
        ui.notifications.notify(`${targetActor.name} doesn't know ${abilityName}!`);
        return;
    }
    
    let targets = Array.from(game.user.targets);
    
    return {
        actor: targetActor,
        item: abilityItem,
        targets: targets
    };
}

export let spells = {
    "HuntersMark": huntersMark,
    "SpiritualWeapon": spiritualWeapon
}