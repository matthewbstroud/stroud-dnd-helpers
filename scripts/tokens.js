import { sdndConstants } from "./constants.js";
import { dialog } from "./dialog/dialog.js";
import { sdndSettings } from "./settings.js";

export let tokens = {
    "manageTokens": foundry.utils.debounce(manageTokens, 250),
    "releaseInvalidTokens": function _releaseInvalidTokens(allowInCombat) {
        function shouldRelease(token, allowInCombat) {
            let excludedFolders = [sdndConstants.FOLDERS.ACTOR.TEMP];
            excludedFolders = excludedFolders.concat(sdndSettings.ExcludedFolders.getValue()?.split(','));
            if (!allowInCombat && token.inCombat) {
                return true;
            }
            var folderName = token?.actor?.folder?.name ?? "root";
            if (excludedFolders.includes(folderName)) {
                return true;
            }
            if (token.actor.effects.filter(e => e.name == "Dead").length > 0) {
                return true;
            }

            return false;
        }
        let tokensToRelease = canvas.tokens.controlled.filter(t => shouldRelease(t, allowInCombat));
        tokensToRelease.forEach(t => {
            t.release();
        });
    },
    "showTokenArt": foundry.utils.debounce(showTokenArt, 250),
    "toggleNpcName": foundry.utils.debounce(toggleNpcName, 250),
    "pushTokenPrototype":  foundry.utils.debounce(pushTokenPrototype, 250),
    "morphToken":  foundry.utils.debounce(morphToken, 250),
    "setMorphData": async function _setMorphData(actorUuid, altActorUuid, preservedData) {
        return dbAddMorphData(actorUuid, altActorUuid, preservedData);
    },
    "getDistance": function _getDistance(sourceToken, targetToken) {
        const a = sourceToken.center ?? canvas.tokens.get(sourceToken.id)?.center;
        const b = targetToken.center ?? canvas.tokens.get(targetToken.id)?.center;
        if (a && b) {
            return canvas.grid.measurePath([a, b]).distance;
        }
        return 0;
    },
    "fixImagePath": async function _fixImagePath(searchPattern, replacement, previewOnly) {
        let scenes = game.scenes.filter(s => s.tokens.filter(t => t?.texture?.src?.includes(searchPattern)).length > 0);
        let updates = [];
        for (let scene of scenes) {
            let sceneUpdates = scene?.tokens?.filter(t => t?.texture?.src?.includes(searchPattern)).map(r => ({
                "_id": r._id,
                "texture": {
                    "src": (r.texture.src.replace(searchPattern, replacement))
                }
            }));
            if (previewOnly) {
                updates.push({"scene": scene.name, "updates": sceneUpdates});
                continue;
            }
        }
        return updates;
    }
};

function getExecutionMethod(methodName) {
    switch (methodName) {
        case 'showTokenArt':
            return showTokenArt;
        case 'toggleNpcName':
            return toggleNpcName;
        case 'pushTokenPrototype':
            return pushTokenPrototype;
        case 'morphToken':
            return morphToken;
    }
    return async function (token) { console.log('do nothing'); };
}

async function showTokenArt(token) {
    if (!game.user.isGM) {
        ui.notifications.notify(`Can only be run by the gamemaster!`);
        return false;
    }
    if (!token) {
        if (canvas.tokens.controlled.length != 1) {
            ui.notifications.notify(`Please select a single token!`);
            return false;
        }
        token = canvas.tokens.controlled[0];
    }
    let actor = token?.actor;
    if (!actor) {
        ui.notifications.notify('No token selected!');
        return;
    }
    // search for existing popout
    var popout = Object.values(ui.windows)?.find(v => v instanceof ImagePopout && v?.options.uuid == actor.uuid);
    if (popout) {
        // already shown
        return;
    }
    let ip = new ImagePopout(actor.img, { uuid: actor.uuid });
    ip.render(true); // Display for self
    ip.shareImage(); // Display to all other players
}

async function getMorphData(token) {
    let morphData = token.document.getFlag(sdndConstants.MODULE_ID, "morphData");
    if (!morphData) {
        morphData = token.actor?.getFlag(sdndConstants.MODULE_ID, "morphData");
        if (!morphData) {
            return null;
        }
        await setMorphData(token, morphData);
    }
    morphData.preservedProperties ??= [];
    return morphData;
}

async function setMorphData(token, morphData) {
    return await token.document.setFlag(sdndConstants.MODULE_ID, "morphData", morphData);
}

async function setActorMorphData(actor, morphData) {
    return await actor?.setFlag(sdndConstants.MODULE_ID, "morphData", morphData);
}

async function manageTokens() {
    if (!game.user.isGM) {
        ui.notifications.notify(`Can only be run by the gamemaster!`);
        return false;
    }
    let selectedTokens  = canvas.tokens.controlled.filter(t => t.actor);
    if (selectedTokens.length == 0) {
        ui.notifications.notify('You have no actor tokens selected!');
        return false;
    }
    let options = [
        { label: "Toggle Npc Name", value: "toggleNpcName" },
        { label: "Push Prototype Changes", value: "pushTokenPrototype" }
    ];
    if (selectedTokens.length == 1) {
        options.unshift({ label: "Show Token Art", value: "showTokenArt" });
    }
    let allCanBeMorphed = true;
    for (let token of selectedTokens) {
        if (!(await getMorphData(token))){
            allCanBeMorphed = false;
            break;
        }
    }
    if (allCanBeMorphed) {
        options.push({ label: "Morph Token", value: "morphToken" });
    }
    let option = await dialog.createButtonDialog("Manage Tokens", options);
    if (!option) {
        return;
    }
    let tokenFunction = getExecutionMethod(option);
    let executions = [];
    for (let token of selectedTokens) {
        executions.push(tokenFunction(token));
    }
    Promise.all(executions);
    return true;
}

async function toggleNpcName(token) {
    if (!game.user.isGM) {
        ui.notifications.notify(`Can only be run by the gamemaster!`);
        return;
    }
    if (!token) {
        if (canvas.tokens.controlled.length != 1) {
            ui.notifications.notify(`Please select a single token!`);
            return false;
        }
        token = canvas.tokens.controlled[0];
    }
    var currentToken = token;
    let strVal = "";
    let api = game.modules.get("anonymous")?.api;
    if (api) {
        strVal = await _toggleNpcNameAnon(api, currentToken);
    }
    else if (game.modules.get("combat-utility-belt")?.active ?? false) {
        strVal = await _toggleNpcNameCub(currentToken);
    }
    else {
        ui.notifications.error("Requires Anonymous or Combat Utility Belt!");
        return;
    }

    if (strVal.length > 0) {
        ChatMessage.create({
            content: `${currentToken.name} has been set to ${strVal}`,
            whisper: ChatMessage.getWhisperRecipients('GM'),
        });
    }
    else {
        ChatMessage.create({
            content: `Nothing changed...`,
            whisper: ChatMessage.getWhisperRecipients('GM'),
        });
    }
}

async function _toggleNpcNameCub(currentToken) {
    const CUB_SCOPE = "combat-utility-belt";
    const CUB_HIDENAMES = "enableHideName";

    let strVal = "";
    // maybe exit if it is a player character
    if (currentToken.document.displayName == CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER) {
        currentToken.document.update({ "displayName": CONST.TOKEN_DISPLAY_MODES.HOVER });
        currentToken.actor.setFlag(CUB_SCOPE, CUB_HIDENAMES, false);
        strVal = "Hover Anyone";
        ChatMessage.create({
            content: `You will now recognize ${currentToken.name}.`,
            type: CONST.CHAT_MESSAGE_TYPES.OOC
        });
    }
    else if (currentToken.document.displayName == CONST.TOKEN_DISPLAY_MODES.HOVER) {
        currentToken.document.update({ "displayName": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER });
        currentToken.actor.setFlag(CUB_SCOPE, CUB_HIDENAMES, true);
        strVal = "Hover Owner";
    }

    return strVal;
}

async function _toggleNpcNameAnon(api, currentToken) {
    let strVal = "";
    let playersSeeName = api.playersSeeName(currentToken.actor);

    if (playersSeeName) {
        currentToken.document.update({ "displayName": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER });
        api.toggleSeeName(currentToken.actor);
        strVal = "Hover Owner";
    }
    else {
        currentToken.document.update({ "displayName": CONST.TOKEN_DISPLAY_MODES.HOVER });
        api.toggleSeeName(currentToken.actor);
        strVal = "Hover Anyone";
        ChatMessage.create({
            content: `You will now recognize ${currentToken.name}.`,
            type: CONST.CHAT_MESSAGE_TYPES.OOC
        });
    }

    return strVal;

}

async function pushTokenPrototype(token, source, applyTo, preservedProperties) {
    if (!game.user.isGM) {
        ui.notifications.notify(`Can only be run by the gamemaster!`);
        return;
    }
    preservedProperties ??= [];
    preservedProperties.push('rotation', 'elevation');
    source ??= token.actor;
    applyTo ??= token.actor.getActiveTokens();
    let updates = applyTo.map(t => {
        let token = foundry.utils.duplicate(t.document);
        let preservedData = preservedProperties.map(p => ({ "key": p, "value": (token[p]) }));
        let newData = foundry.utils.mergeObject(token, source.prototypeToken);
        for (let data of preservedData) {
            newData[data.key] = data.value;
        }
        return newData;
    });

    if (!updates || updates.length == 0) {
        return;
    }

    return await canvas.scene.updateEmbeddedDocuments(Token.name, updates);
}

let dbAddMorphData = foundry.utils.debounce(addMorphData, 250);
async function addMorphData(actorUuid, altActorUuid, preservedProperties) {
    preservedProperties ??= [];
    let actor = await fromUuid(actorUuid);
    let altActor = await fromUuid(altActorUuid);
    if (!actor) {
        console.log(`${actorUuid} does not exist!`);
        return false;
    }
    if (!altActor) {
        console.log(`${altActorUuid} does not exist!`);
        return false;
    }
    return await setActorMorphData(actor, { 
        "actorUuid": actor.uuid, 
        "altActorUuid": altActor.uuid, 
        "preservedProperties": preservedProperties,
        "current": actor.uuid 
    });
}

export async function morphToken(token) {
    if (!game.user.isGM) {
        ui.notifications.notify(`Can only be run by the gamemaster!`);
        return false;
    }
    const morphData = await getMorphData(token);
    if (!morphData) {
        return false;
    }
    morphData.current = morphData.current == morphData.actorUuid ? morphData.altActorUuid : morphData.actorUuid; 
    let morphActor = await fromUuid(morphData.current);
    if (!morphActor) {
        return false;
    }
    await setMorphData(token, morphData);
    await pushTokenPrototype(token, morphActor, [token], morphData.preservedProperties);
    return true;
}