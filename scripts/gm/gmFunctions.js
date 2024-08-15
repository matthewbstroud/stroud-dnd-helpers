import { socket } from "../module.js";
import { folders } from "../folders/folders.js";
import { identifyItem } from "../identification/identification.js";
import { keybinds } from "../keyboard/keybinds.js";
import { spawnSpirtualWeapon } from "../spells/spiritualWeapon/spiritualWeapon.js";
import { gmCheckActorWeight, gmDropBackpack, gmPickupBackpack } from "../backpacks/backpacks.js";
import { sdndConstants } from "../constants.js";

const RUN_MODES = {
    RUN_LOCAL: "RUN_LOCAL",
    RUN_REMOTE: "RUN_REMOTE",
    NO_RUN: "NO_RUN"
}
function areActiveGms() {
    return !!game.users.find(u => u.isGM && u.active);
}

async function getRunMode() {
    if (!areActiveGms()) {
        ui.notifications.error("No Active GMs!");
        return RUN_MODES.NO_RUN;
    }
    if (!game.user.isGM) {
        return RUN_MODES.RUN_REMOTE;
    }
    return RUN_MODES.RUN_LOCAL;
}

async function run(local, remote) {
    let runMode = await getRunMode();
    switch (runMode) {
        case RUN_MODES.RUN_LOCAL:
            return await local();
        case RUN_MODES.RUN_REMOTE:
            return await remote();
    }
}

async function getTokenOrActor(uuid) {
    let tokenOrActor = await fromUuid(uuid);
    return tokenOrActor.actor ? tokenOrActor.actor : tokenOrActor;
}

const INTERNAL_FUNCTIONS = new Set(["getTokenOrActor", "registerFunctions"]);
export let gmFunctions = {
    "getTokenOrActor": getTokenOrActor,
    "registerFunctions": async function _registerFunctions(socket) {
        for (let func in gmFunctions) {
            if (INTERNAL_FUNCTIONS.has(func)) {
                continue;
            }
            socket.register(func, this[func]);
        }
    },
    "createEffects": async function _createEffects(actorUuid, effectData /* [effectData] */) {
        let actor = await gmFunctions.getTokenOrActor(actorUuid);
        if (!actor) {
            ui.notifications.error($`Cannot find actor with uuid: ${actorUuid}`);
            return;
        }
        run(
            async () => {
                if (effectData.name && actor.effects.find(e => e.name == effectData.name)) {
                    return;
                }
                await actor.createEmbeddedDocuments("ActiveEffect", effectData);
            },
            async () => await socket.executeAsGM("createEffects", actorUuid, effectData)
        );
    },
    "checkActorWeight": async function _checkActorWeight(actorUuid) {
        run(
            async () => await gmCheckActorWeight(actorUuid),
            async () => await socket.executeAsGM("checkActorWeight", actorUuid)
        );
    },
    "dropBackpack": async function _dropBackpack(tokenId, backpackId, userUuid) {
        run(
            async () => await gmDropBackpack(tokenId, backpackId, userUuid),
            async () => await socket.executeAsGM("dropBackpack", tokenId, backpackId, userUuid)
        );
    },
    "pickupBackpack": async function _pickupBackpack(pileUuid) {
        run(
            async () => await gmPickupBackpack(pileUuid),
            async () => await socket.executeAsGM("pickupBackpack", pileUuid)
        );
    },
    // "dismissTokens": async function _removeTokens(arrayOfTokenIds /* [tokenUuid] */) {
    //     if (!arrayOfTokenIds) {
    //         return;
    //     }
    //     if (!areActiveGms()) {
    //         ui.notifications.error("No Active GMs!");
    //         return;
    //     }
    //     run(
    //         async () => {
    //             arrayOfTokenIds.forEach(tokenId => {
    //                 let token = canvas.tokens.get(tokenId);
    //                 if (token) {
    //                     warpgate.dismiss(token)
    //                 }
    //             });
    //         },
    //         async () => await socket.executeAsGM("dismissTokens", arrayOfTokenIds)
    //     );
    // },
    "deleteTokens": async function _deleteTokens(arrayOfTokenIds /* [tokenUuid] */) {
        if (!arrayOfTokenIds || arrayOfTokenIds.length == 0) {
            return;
        }
        run(
            async () => canvas.scene.deleteEmbeddedDocuments("Token", arrayOfTokenIds),
            async () => await socket.executeAsGM("deleteTokens", arrayOfTokenIds)
        );
    },
    "createFolder": async function _createFolder(folderName, folderType, parentID) {
        run(
            async () => await createFolder(folderName, folderType, parentID),
            async () => await socket.executeAsGM("createFolder", folderName, folderType, parentID)
        );
    },
    "identifyItem": async function _identifyItem(alias, token, itemID) {
        run(
            async () => identifyItem(alias, token, itemID),
            async () => await socket.executeAsGM("identifyItem", alias, token, itemID)
        );
    },
    "pushKeybindsToPlayers": async function _pushKeybindsToPlayers() {
        if (!game?.user?.isGM) {
            Dialog.confirm({
                title: `Update Key Mappings`,
                content: `The Gamemaster would like to push default keybinds to your machine.  This will ensure all players are using the same keys for advantage/disadvantage modifiers.<br/><br/>Do you consent?<br/>`,
                yes: () => { keybinds.setCommonKeybinds() },
                defaultYes: true
            });
        }
        else {
            keybinds.setCommonKeybinds();
        }
    },
    "revealSecret": async function _revealSecret(messageId) {
        let message = await game.messages.get(messageId);
        if (!message) {
            return;
        }
        let secret = message.getFlag(sdndConstants.MODULE_ID, "SecretMessage");
        if (!secret) {
            return;
        }
        await message.update({ "content": `The secret has been revealed to be:<br/><b>${secret}</b>` });
    },
    "removeEffects": async function _removeEffects(effectIDs) {
        if (!effectIDs || effectIDs.length == 0) {
            return;
        }
        run(
            async () => {
                for (const effectID of effectIDs) {
                    const effect = await fromUuid(effectID);
                    if (effect) {
                        await effect.delete();
                    }
                }
            },
            async () => await socket.executeAsGM("removeEffects", effectIDs)
        );
    },
    "spawnSpiritualWeapon": async function _spawnSpiritualWeapon(userID, actorID, tokenID, level, x, y) {
        run(
            async () => spawnSpirtualWeapon(userID, actorID, tokenID, level, x, y),
            async () => await socket.executeAsGM("spawnSpiritualWeapon", userID, actorID, tokenID, level, x, y)
        );
    },
    "importFromCompendium": async function _importFromCompedium(type, packId, packItemId, parentFolderId){
        run(
            async () => await importFromCompedium(type, packId, packItemId, parentFolderId),
            async ()  => await socket.executeAsGM("importFromCompendium", type, packId, packItemId, parentFolderId)
        );
    },
    "startClock": async function _startClock(){
        if (!SimpleCalendar) {
            return;
        }
        if (!SimpleCalendar?.api?.isPrimaryGM() ?? false) {
            socket.executeForOtherGMs("startClock");
            return;
        }
        SimpleCalendar.api.startClock();
    },
    "notify": async function _notify(type, message) {
        ui.notifications.notify(message, type);
    }
};

async function importFromCompedium(type, packId, packItemId, parentFolderName) {
    let pack = game.packs.get(packId);
    if (!pack) {
        ui.notifications.error(`Cannot find compendium ${packId}!`);
        return null;
    }
    let parentFolder = await folders.ensureFolder(parentFolderName, type);
    switch (type) {
        case "Actor":
            return await game.actors.importFromCompendium(pack, packItemId, { "folder": parentFolder?._id });
        case "Macro":
            return await game.macros.importFromCompendium(pack, packItemId, { "folder": parentFolder?._id });
    }
    return null;
}