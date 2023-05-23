import { folders } from "../folders/folders.js";
import { gmFunctions } from "../gm/gmFunctions.js";
export let actors = {
    "ensureActor": ensureActor
}

async function ensureActor(actorName, packId, parentFolderName) {
    let actor = await game.actors.getName(actorName);
    if (!actor) {
        let pack = game.packs.get(packId);
        if (!pack) {
            ui.notifications.error(`Cannot find compendium ${packId}!`);
            return null;
        }
        let packActor = pack.index.getName(actorName);
        if (!packActor) {
            ui.notifications.error(`Cannot find actor ${actorName} compendium ${packId}!`);
            return null;
        }
        actor = await gmFunctions.importFromCompendium("Actor", packId, packActor._id, parentFolderName);
    }
    return actor;
}

