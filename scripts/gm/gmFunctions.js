import { socket } from "../module.js";
import { folders } from "../folders/folders.js";
import { identifyItem } from "../identification/identification.js";
import { keybinds } from "../keyboard/keybinds.js";
import { gmCheckActorWeight, gmDropBackpack, gmPickupBackpack } from "../backpacks/backpacks.js";
import { gmPickupLightable, gmDropLightable } from "../lighting/lighting.js";
import { sdndConstants } from "../constants.js";
import { MagicBloom } from "../items/trinkets/ringOfBlooming.js";

const RUN_MODES = {
    RUN_LOCAL: "RUN_LOCAL",
    RUN_REMOTE: "RUN_REMOTE",
    NO_RUN: "NO_RUN"
}
function areActiveGms() {
    return game.users.find(u => u.isGM && u.active);
}

async function getRunMode() {
    if (!areActiveGms()) {
        ui.notifications.error("No Active GMs!");
        return RUN_MODES.NO_RUN;
    }
    if (!game.user.isTheGM) {
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
    if (!uuid) {
        return null;
    }
    let tokenOrActor = await fromUuid(uuid);
    if (!tokenOrActor) {
        return null;
    }
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
        return run(
            async () => {
                if (effectData.name && actor.effects.find(e => e.name == effectData.name)) {
                    return;
                }
                await actor.createEmbeddedDocuments("ActiveEffect", effectData);
            },
            async () => await socket.executeAsGM("createEffects", actorUuid, effectData)
        );
    },
    "createEmbeddedDocuments": async function _createEmbeddedDocuments(uuid, documentType, documentData) {
        let document = await fromUuid(uuid);
        if (!document) {
            ui.notifications.error($`Cannot find document with uuid: ${uuid}`);
            return;
        }
        return run(
            async () => {
                await document.createEmbeddedDocuments(documentType, documentData);
            },
            async () => await socket.executeAsGM("createEmbeddedDocuments", uuid, documentType, documentData)
        );
    },
    "checkActorWeight": async function _checkActorWeight(actorUuid, scope) {
        return run(
            async () => await gmCheckActorWeight(actorUuid, false, scope),
            async () => await socket.executeAsGM("checkActorWeight", actorUuid, scope)
        );
    },
    "selectToken": async function _selectToken(tokenId) {
        selectToken(tokenId);
    },
    "dropBackpack": async function _dropBackpack(tokenId, backpackId, userUuid, isMount) {
        return run(
            async () => await gmDropBackpack(tokenId, backpackId, userUuid, isMount).then(
                function () {
                    const userId = userUuid.split(".").pop();
                    socket.executeForUsers("selectToken", [userId], tokenId);
                },
                function (err) { console.log(err.message); }
            ),
            async () => await socket.executeAsGM("dropBackpack", tokenId, backpackId, userUuid, isMount)
        );
    },
    "pickupBackpack": async function _pickupBackpack(pileUuid, userId, targetUuid) {
        return run(
            async () => {
                let tokenId = null;
                let pile = await fromUuid(pileUuid);
                let actorUuid = pile?.actor?.getFlag(sdndConstants.MODULE_ID, "DroppedBy");
                if (actorUuid) {
                    let actor = await fromUuid(actorUuid);
                    let activeTokens = actor?.getActiveTokens();
                    if (activeTokens && activeTokens.length == 1) {
                        tokenId = activeTokens[0].id;
                    }
                }
                await gmPickupBackpack(pileUuid, targetUuid).then(
                    function () {
                        if (!userId || !tokenId) {
                            return;
                        }
                        socket.executeForUsers("selectToken", [userId], tokenId);
                    },

                    function (err) { console.log(err.message); }
                );
            },
            async () => { return await socket.executeAsGM("pickupBackpack", pileUuid, userId, targetUuid) }
        );
    },
    "dropLightable": async function _dropLightable(tokenId, itemId, userId) {
        return run(
            async () => {
                await gmDropLightable(tokenId, itemId).then(
                    function () {
                        if (!userId || !tokenId) {
                            return;
                        }
                        socket.executeForUsers("selectToken", [userId], tokenId);
                    },

                    function (err) { console.log(err.message); }
                );
            },
            async () => { return await socket.executeAsGM("dropLightable", tokenId, itemId, userId) }
        );
    },
    "pickupLightable": async function _pickupLightable(pileUuid, actorUuid, userId) {
        return run(
            async () => {
                let tokenId = null;
                let pile = await fromUuid(pileUuid);
                let actor = await fromUuid(actorUuid);
                if (actor) {
                    let activeTokens = actor?.getActiveTokens();
                    if (activeTokens && activeTokens.length == 1) {
                        tokenId = activeTokens[0].id;
                    }
                }
                await gmPickupLightable(pile, actor).then(
                    function () {
                        if (!userId || !tokenId) {
                            return;
                        }
                        socket.executeForUsers("selectToken", [userId], tokenId);
                    },

                    function (err) { console.log(err.message); }
                );
            },
            async () => { return await socket.executeAsGM("pickupLightable", pileUuid, actorUuid, userId) }
        );
    },
    "deleteActor": async function _deleteActor(actorId) {
        if (!actorId) {
            return;
        }
        return run(
            async () => {
                let actor = game.actors.get(actorId);
                if (actor) {
                    await actor.delete();
                }
            },
            async () => await socket.executeAsGM("deleteActor", actorId)
        );
    },
    "deleteTokens": async function _deleteTokens(arrayOfTokenIds /* [tokenUuid] */) {
        if (!arrayOfTokenIds || arrayOfTokenIds.length == 0) {
            return;
        }
        return run(
            async () => canvas.scene.deleteEmbeddedDocuments("Token", arrayOfTokenIds),
            async () => await socket.executeAsGM("deleteTokens", arrayOfTokenIds)
        );
    },
    "createFolder": async function _createFolder(folderName, folderType, parentID) {
        return run(
            async () => await createFolder(folderName, folderType, parentID),
            async () => await socket.executeAsGM("createFolder", folderName, folderType, parentID)
        );
    },
    "identifyItem": async function _identifyItem(alias, token, itemID) {
        return run(
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
        return run(
            async () => {
                for (const effectID of effectIDs) {
                    try {
                        const effect = await fromUuid(effectID);
                        if (effect) {
                            await effect.delete();
                        }
                    } catch (err) {
                        console.warn(`Failed to remove effect ${effectID}: ${err.message}`);
                    }
                }
            },
            async () => await socket.executeAsGM("removeEffects", effectIDs)
        );
    },
    "removeActorEffects": async function _removeActorEffects(actorUuid, effectIDs) {
        if (!actorUuid || !effectIDs || effectIDs.length == 0) {
            return;
        }
        return run(
            async () => {
                let actor = await fromUuid(actorUuid);
                await actor.deleteEmbeddedDocuments(ActiveEffect.name, effectIDs);
            },
            async () => await socket.executeAsGM("removeActorEffects", actorUuid, effectIDs)
        );
    },
    "setFlag": async function _setFlag(uuid, scope, key, value) {
        return run(
            async () => {
                let document = await fromUuid(uuid);
                if (!document) {
                    console.log(`Could not find: ${uuid}`);
                    return;
                }
                await document.setFlag(scope, key, value);
            },
            async () => await socket.executeAsGM("setFlag", uuid, scope, key, value)
        );
    },
    "unsetFlag": async function _unsetFlag(uuid, scope, key) {
        return run(
            async () => {
                let document = await fromUuid(uuid);
                if (!document) {
                    console.log(`Could not find: ${uuid}`);
                    return;
                }
                await document.unsetFlag(scope, key);
            },
            async () => await socket.executeAsGM("unsetFlag", uuid, scope, key)
        );
    },
    "importFromCompendium": async function _importFromCompedium(type, packId, packItemId, parentFolderId) {
        return run(
            async () => await importFromCompedium(type, packId, packItemId, parentFolderId),
            async () => await socket.executeAsGM("importFromCompendium", type, packId, packItemId, parentFolderId)
        );
    },
    "startClock": async function _startClock() {
        if (!game.modules.get('simple-calendar')?.active) {
            return;
        }
        if (!SimpleCalendar?.api?.isPrimaryGM() ?? false) {
            socket.executeForOtherGMs("startClock");
            return;
        }
        SimpleCalendar.api.startClock();
    },
    "advanceTime": async function _advanceTime(seconds) {
        return run(
            async () => {
                if (!game.modules.get('simple-calendar')?.active) {
                    await game.time.advance(seconds);
                    return;
                }
                await SimpleCalendar.api.changeDate({ "seconds": seconds });
            },
            async () => await socket.executeAsGM("advanceTime", seconds)
        );
    },
    "notify": async function _notify(type, message) {
        ui.notifications.notify(message, type);
    },
    "createBloom": async function _createBloom(tokenUuid, spellLevel) {
        return run(
            async () => {
                const token = await fromUuid(tokenUuid);
                await MagicBloom.create(token, spellLevel);
            },
            async () => await socket.executeAsGM("createBloom", tokenUuid, spellLevel)
        );
    },
};

function selectToken(tokenId) {
    if (!tokenId) {
        let activeTokens = game.user?.character?.getActiveTokens();

    }
    let token = canvas.tokens.get(tokenId);
    token.control({ releaseOthers: true });
}

export async function importFromCompedium(type, packId, packItemId, parentFolderName) {
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