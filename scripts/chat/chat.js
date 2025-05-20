import { dialog } from "../dialog/dialog.js";
import { guid } from "../utility/guid.js";
import { socket } from "../module.js";
import { sdndConstants } from "../constants.js";
import { gmFunctions } from "../gm/gmFunctions.js";

export let chat = {
    "prune": async function _prune() {
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        let choices = [{
            label: "Remove Recent Messages",
            value: "removeRecent"
        },
        {
            label: "Remove Old Messages",
            value: "removeOld"
        }];
        let choice = await dialog.createButtonDialog("Remove Chat Messages", choices, "column");
        if (!choice) {
            return;
        }
        await chatInternal[choice]();
    }, 
    "removeRecent": async function _removeRecent(minutesBack) {
        let cutoffTimestamp = (new Date()).getTime() - (minutesBack * 60000);
        let messagesToDelete = game.messages.filter(m => m.timestamp >= cutoffTimestamp);
        messagesToDelete.forEach(m => {
            m.delete();
        });
    },
    "removeOld": async function _removeOld(olderThanDays) {
        let startDate = new Date();
        startDate.setDate(startDate.getDate() - olderThanDays);
        console.log(`Start date = ${startDate}`)
        let cutoffTimestamp = startDate.getTime();
        let messagesToDelete = game.messages.filter(m => m.timestamp < cutoffTimestamp);
        if (!messagesToDelete || messagesToDelete.length == 0) {
            console.log(`No messages exist that are older than ${olderThanDays} day${olderThanDays > 1 ? 's' : ''}`);
            return;
        }
        let timestamps = Array.from(messagesToDelete.map(m => m.timestamp));
        console.log(`Will delete ${timestamps.length} starting at ${new Date(Math.max.apply(Math, timestamps))}`);
        messagesToDelete.forEach(m => {
            m.delete();
        });
    },
    "secretMessage": async function _secretMessage() {
        await dialog.textPrompt("Secret Message", "Send Message", async function(message) {
            const secretId = guid.uuidv4();
            let htmlContent = `
            <div id="message_${secretId}">This message is yet to be revealed...</div>
            <button type="button" id="button_${secretId}">Reveal</button>
            `;
            let chatMessage = await ChatMessage.create({
                speaker: {
                    actor: game.user.character?._id
                },
                content: htmlContent,
                flags: {
                    [sdndConstants.MODULE_ID]: {
                        "SecretMessage": message
                    }
                }
            });
            if (chatMessage.getHTML) {
                await chatMessage.getHTML();
            }
            $(`#button_${secretId}`).one("click", function(e) { 
                socket.executeAsGM("revealSecret", chatMessage.id);
            });
        });
    },
    "forceReveal": async function _forceReveal(messageID) {
        if (!game.user.isTheGM) {
            return;
        }
        gmFunctions.revealSecret(messageID);
    },
    "revealAll": async function _revealAll() {
        if (!game.user.isTheGM) {
            return;
        }
        game.messages.filter(m => m.content.includes("Reveal"))
            .forEach((m) => gmFunctions.revealSecret(m.id));
    }
};


let chatInternal = {
    "removeRecent": async function _removeRecent() {
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        dialog.createNumberDialog(
            "Remove Recent Chat Messages",
            "How far back?",
            "Minutes",
            "Delete",
            "minute",
            30,
            chat.removeRecent);
    },
    "removeOld": async function _removeOld() {
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        dialog.createNumberDialog(
            "Prune Chat Log",
            "Remove messages older than?",
            "Days",
            "Prune",
            "day",
            7,
            chat.removeOld);
    }
};