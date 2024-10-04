import { backpacks } from "../backpacks/backpacks.js";

export let mounts = {
    "dismount": async function _dismount(actor) {
        let horse = getHorse(actor);
        if (!horse) {
            return;
        }
        console.log(`${actor.name} is dismounting ${horse.name}...`);
    }
};

function isMounted(actor) {

    return 
}

function getHorse(actor) {
    let horses = actor.items?.filter(i => i.name?.toLowerCase().includes("horse"));
    if (horses.length == 1) {
        return horses[0];
    }
    return null;
}