//import { socket } from "../socket/socket.js";
function areActiveGms(){
    return !!game.users.find( u => u.isGM && u.active);
}
export let gmFunctions = {
    "registerFunctions": async function _registerFunctions(socket) {
        for (let func in gmFunctions) {
            if (func == "registerFunctions"){
                continue;
            }
            socket.register(func, this[func]);
        }
    },
    "createEffect": async function _createEffect(actorUuid, effectData /* [effectData] */) {
        let actor = fromUuid(actorUuid);
        if (!actor){
            ui.notifications.error($`Cannot find actor with uuid: ${actorUuid}`);
            return;
        }
        if (game.user.isGM) {
			await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
		} else {
			await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': actor.uuid, 'effects': [effectData]});
		}
    },
    "dismissTokens": async function _removeTokens(arrayOfTokenIds /* [tokenUuid] */) {
        if (!arrayOfTokenIds)  {
            return;
        }
        if (!areActiveGms()){
            ui.notifications.error("No Active GMs!");
            return;
        }
        if (!game.user.isGM) {
			return await socket.executeAsGM("dismissTokens", arrayOfTokenIds);
		}
        arrayOfTokenIds.forEach(tokenId  => {
            let token = canvas.tokens.get(tokenId);
            if (token) {
                warpgate.dismiss(token)
            }
        });
    },
    "deleteTokens": async function _deleteTokens(arrayOfTokenIds /* [tokenUuid] */) {
        if (!arrayOfTokenIds || arrayOfTokenIds.length == 0)  {
            return;
        }
        if (!areActiveGms()){
            ui.notifications.error("No Active GMs!");
            return;
        }
        if (!game.user.isGM) {
			return await socket.executeAsGM("deleteTokens", arrayOfTokenIds);
		}
        canvas.scene.deleteEmbeddedDocuments("Token", arrayOfTokenIds);
    }
};