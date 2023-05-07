import { dialog } from "../dialog/dialog.js";
export let chat = {
    "deleteChatMessages": async function _deleteChatMessages() {
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        dialog.createNumberDialog(
            "Delete Chat Messages",
            "How far back?",
            "Minutes",
            "Delete",
            "minute",
            30,
            chatInternal.deleteChatMessages);
    },
    "pruneChatLog": async function _pruneChatLog() {
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
            chatInternal.pruneChatLog);
    }
};

let chatInternal = {
    "deleteChatMessages": async function deleteChatMessages(minutesBack) {
        let cutoffTimestamp = (new Date()).getTime() - (minutesBack * 60000);
        let messagesToDelete = game.messages.filter(m => m.timestamp >= cutoffTimestamp);
        messagesToDelete.forEach(m => {
            m.delete();
        });
    },
    "pruneChatLog": async function pruneChatLog(olderThanDays) {
        let startDate = new Date();
        startDate.setDate(startDate.getDate() - olderThanDays);
        console.log(`Start date = ${startDate}`)
        let cutoffTimestamp = startDate.getTime();
        let messagesToDelete = game.messages.filter(m => m.timestamp < cutoffTimestamp);
        if (!messagesToDelete || messagesToDelete.length == 0){
            console.log(`No messages exist that are older than ${olderThanDays} day${olderThanDays > 1 ? 's' : ''}`);
            return;
        }
        let timestamps = Array.from(messagesToDelete.map(m => m.timestamp));
        console.log(`Will delete ${timestamps.length} starting at ${new Date(Math.max.apply(Math, timestamps))}`);
        messagesToDelete.forEach(m => {
            m.delete();
        });
    }

};