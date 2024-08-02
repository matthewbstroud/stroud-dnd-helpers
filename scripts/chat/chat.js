import { dialog } from "../dialog/dialog.js";
import { guid } from "../utility/guid.js";
import { socket } from "../module.js";

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
        await promptForMessage(async function(message) {
            const secretId = guid.uuidv4();
            let htmlContent = `
            <input id="secret_${secretId}" type="hidden" value="${message}" />
            <div id="message_${secretId}">This message is yet to be revealed...</div>
            <button type="button" id="button_${secretId}">Reveal</button>
            `;
            await ChatMessage.create({content: htmlContent});
            $(`#button_${secretId}`).one("click", function(e) { 
                socket.executeForEveryone("revealSecret", secretId);
            });
        });
    }
};

async function promptForMessage(callback) {
    let title = `Secret Message`;

    new Dialog({
        title: title,
        content: `
        <form>
            <input id="secretMessage" type="text" />
        </form>
    `,
        buttons: {
            yes: {
                icon: "<i class='fas fa-check'></i>",
                label: "Send Message",
                callback: (html) => {
                    callback(html.find("#secretMessage").val());
                }
            },
            no: {
                icon: "<i class='fas fa-times'></i>",
                label: `Cancel`
            },
        },
        default: "yes"
    }).render(true)
}

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