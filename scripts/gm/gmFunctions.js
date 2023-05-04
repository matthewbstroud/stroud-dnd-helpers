//import { socket } from "../socket/socket.js";
function areActiveGms() {
    return !!game.users.find(u => u.isGM && u.active);
}

export async function tokenOrActor(uuid){
    let tokenOrActor = await fromUuid(uuid);
    return tokenOrActor.actor ? tokenOrActor.actor : tokenOrActor;
}
export let gmFunctions = {
    "registerFunctions": async function _registerFunctions(socket) {
        for (let func in gmFunctions) {
            if (func == "registerFunctions") {
                continue;
            }
            socket.register(func, this[func]);
        }
    },
    "createEffects": async function _createEffects(actorUuid, effectData /* [effectData] */) {
        let actor = await tokenOrActor(actorUuid);
        if (!actor) {
            ui.notifications.error($`Cannot find actor with uuid: ${actorUuid}`);
            return;
        }
        if (!areActiveGms()) {
            ui.notifications.error("No Active GMs!");
            return;
        }
        if (!game.user.isGM) {
            return await socket.executeAsGM("createEffects", arrayOfTokenIds);
        }
        await actor.createEmbeddedDocuments('ActiveEffect', effectData);
    },
    "dismissTokens": async function _removeTokens(arrayOfTokenIds /* [tokenUuid] */) {
        if (!arrayOfTokenIds) {
            return;
        }
        if (!areActiveGms()) {
            ui.notifications.error("No Active GMs!");
            return;
        }
        if (!game.user.isGM) {
            return await socket.executeAsGM("dismissTokens", arrayOfTokenIds);
        }
        arrayOfTokenIds.forEach(tokenId => {
            let token = canvas.tokens.get(tokenId);
            if (token) {
                warpgate.dismiss(token)
            }
        });
    },
    "deleteTokens": async function _deleteTokens(arrayOfTokenIds /* [tokenUuid] */) {
        if (!arrayOfTokenIds || arrayOfTokenIds.length == 0) {
            return;
        }
        if (!areActiveGms()) {
            ui.notifications.error("No Active GMs!");
            return;
        }
        if (!game.user.isGM) {
            return await socket.executeAsGM("deleteTokens", arrayOfTokenIds);
        }
        canvas.scene.deleteEmbeddedDocuments("Token", arrayOfTokenIds);
    },
    "removeEffects": async function _removeEffects(effectIDs) {
        if (!effectIDs || effectIDs.length == 0) {
            return;
        }
        if (!areActiveGms()) {
            ui.notifications.error("No Active GMs!");
            return;
        }
        if (!game.user.isGM) {
            return await socket.executeAsGM("removeEffects", arrayOfTokenIds);
        }
        for (const effectID of effectIDs) {
            const effect = await fromUuid(effectID);
            effect.delete();
        }
    }
};