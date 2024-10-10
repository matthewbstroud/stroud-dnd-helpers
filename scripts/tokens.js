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
    "setMorphData": foundry.utils.debounce(addMorphData, 250),
    "getDistance": function _getDistance(sourceToken, targetToken) {
        let distance = canvas.dimensions.distance;
        let sourceCenter = (sourceToken instanceof dnd5e.documents.TokenDocument5e) ? 
            canvas.tokens.get(sourceToken.id)?.center : sourceToken.center;
        let targetCenter = (targetToken instanceof dnd5e.documents.TokenDocument5e) ? 
        canvas.tokens.get(targetToken.id)?.center : targetToken.center;
        return distance * Math.round(canvas.grid.measureDistance(sourceCenter, targetCenter) / distance);
    }
};

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

function getMorphData(actor) {
    return actor?.getFlag(sdndConstants.MODULE_ID, "morphData");
}

async function setMorphData(actor, morphData) {
    await actor?.setFlag(sdndConstants.MODULE_ID, "morphData", morphData);
}

async function manageTokens() {
    if (!game.user.isGM) {
        ui.notifications.notify(`Can only be run by the gamemaster!`);
        return false;
    }
    if (canvas.tokens.controlled?.length != 1) {
        ui.notifications.notify('Only select a single token!');
        return false;
    }
    let token = canvas.tokens.controlled[0];
    let actor = token?.actor;
    if (!actor) {
        ui.notifications.notify('Selected token does not have an associated actor!');
        return false;
    }

    let options = [
        { label: "Show Token Art", value: "showTokenArt" },
        { label: "Toggle Npc Name", value: "toggleNpcName" },
        { label: "Push Prototype Changes", value: "pushTokenPrototype" }
    ];
    const morphData = getMorphData(actor);
    if (morphData) {
        options.push({ label: "Morph Token", value: "morphToken" });
    }
    let option = await dialog.createButtonDialog("Manage Tokens", options);
    if (!option) {
        return;
    }
    let tokenFunction = tokens[option];
    await tokenFunction(token);
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

async function pushTokenPrototype(token, source, applyTo) {
    if (!game.user.isGM) {
        ui.notifications.notify(`Can only be run by the gamemaster!`);
        return;
    }
    source ??= token.actor;
    applyTo ??= token.actor.getActiveTokens();
    let updates = applyTo.map(t => {
        let token = foundry.utils.duplicate(t.document);
        let rotation = token.rotation;
        let elevation = token.elevation;
        let newData = foundry.utils.mergeObject(token, source.prototypeToken);
        newData.elevation = elevation;
        newData.rotation = rotation;
        return newData;
    });

    if (!updates || updates.length == 0) {
        return;
    }

    return await canvas.scene.updateEmbeddedDocuments("Token", updates);
}

async function addMorphData(actorUuid, altActorUuid) {
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
    return await setMorphData(actor, { "actorUuid": actor.uuid, "altActorUuid": altActor.uuid, "current": actor.uuid });
}

async function morphToken(token) {
    if (!game.user.isGM) {
        ui.notifications.notify(`Can only be run by the gamemaster!`);
        return;
    }
    const actor = token?.actor;
    const morphData = getMorphData(actor);
    if (!morphData) {
        return false;
    }
    morphData.current = morphData.current == morphData.actorUuid ? morphData.altActorUuid : morphData.actorUuid; 
    let morphActor = await fromUuid(morphData.current);
    if (!morphActor) {
        return false;
    }
    await setMorphData(actor, morphData);
    return await pushTokenPrototype(token, morphActor, [token]);
}