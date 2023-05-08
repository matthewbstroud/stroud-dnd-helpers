import { dialog } from "./dialog/dialog.js";

const EXCLUDE_FROM_OPTIONS = new Set(["manageTokens"]);
export let tokens = {
    "manageTokens": async function _manageTokens() {
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        let options = Object.entries(tokens).map(( [k, v] ) => ({ 'label': _.startCase(k), 'value': k })).filter(m => !EXCLUDE_FROM_OPTIONS.has(m.value));
        let option = await dialog.createButtonDialog("Manage Tokens", options);
        if (!option) {
            return;
        }
        let tokenFunction = tokens[option];
        await tokenFunction();
    },
    "showTokenArt": async function _showTokenArt() {
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        let actor = canvas.tokens.controlled[0]?.actor;
        if (!actor) {
            ui.notifications.notify('No token selected!');
            return;
        }
        let ip = new ImagePopout(actor.img, { uuid: actor.uuid });
        ip.render(true); // Display for self
        ip.shareImage(); // Display to all other players
    },
    "toggleNpcName": async function _toggleNpcName() {
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        if (canvas.tokens.controlled.length == 0) {
            ui.notifications.notify('No selected token');
            return;
        }

        const CUB_SCOPE = "combat-utility-belt";
        const CUB_HIDENAMES = "enableHideName";

        var currentToken = canvas.tokens.controlled[0];
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
};

