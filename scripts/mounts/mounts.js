import { gmFunctions } from "../gm/gmFunctions.js";
import { sdndConstants } from "../constants.js";
import { tokens } from "../tokens.js";
import { utility } from "../utility/utility.js";

export let mounts = {
    "isMount": function _isMount(item) {
        return (item.type == "container" && (item.name?.toLowerCase().includes("horse") || item.img?.toLowerCase()?.includes("horse") ||
            item.system?.description?.value?.toLowerCase()?.includes("horse")));
    },
    "toggleMount": async function _targetMount() {
        let controlledToken = utility.getControlledToken();
        if (!controlledToken?.actor) {
            return;
        }
        else if (controlledToken.actor.getFlag(sdndConstants.MODULE_ID, "DroppedBy")) {
            return;
        }
        if (!controlledToken?.actor?.ownership[game.user.id] == foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
            ui.notifications.warn("You can only handle your own mount!");
            return;
        }
        let actor = controlledToken.actor;
        let horse = getHorse(actor);
        if (horse) {
            await dismount(controlledToken.id, horse.id);
            return true;
        }
        // find the horse
        let horseToken = findHorseToken(actor);
        if (!horseToken) {
            ui.notifications.warn(`${actor.name} has no owned mount in this scene!`);
            return false;
        }
        const distance = tokens.getDistance(controlledToken, horseToken);
        if (distance > 30) {
            let horseName = horseToken?.actor?.name?.split("(")?.shift() ?? "";
            ui.notifications.warn(`You must be within 30 feet to call ${horseName.trim()}!`);
            return false;
        }
        await gmFunctions.pickupBackpack(horseToken.uuid);
    }
};

function getHorse(actor) {
    let horses = actor.items?.filter(i => i.type == "container" && (i.name?.toLowerCase().includes("horse") || i.img?.toLowerCase()?.includes("horse") ||
        i.system?.description?.value?.toLowerCase()?.includes("horse")));
    if (horses.length == 1) {
        return horses[0];
    }
    return null;
}

function findHorseToken(actor) {
    return canvas.scene.tokens.find(t => t.actor?.getFlag(sdndConstants.MODULE_ID, "DroppedBy", actor.uuid) && 
        t.actor?.getFlag(sdndConstants.MODULE_ID, "IsMount"));
}

async function dismount(tokenId, horseId) {
    await gmFunctions.dropBackpack(tokenId, horseId, game.user.uuid, true);
}
