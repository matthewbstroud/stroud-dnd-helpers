import { dialog } from "../dialog/dialog.js";
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