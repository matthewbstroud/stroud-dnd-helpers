import { numbers } from "../utility/numbers.js";
import { sdndSettings } from "../settings.js";

const SUMMARY_FOLDER_NAME = "Session Summaries";
const SUMMARY_JOURNAL_NAME = "Session End Summary";

export let journal = {
    "generateSessionSummary": async function _generateSessionSummary() {
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        const playersFolderName = sdndSettings.ActivePlayersFolder.getValue();
        let playersFolder = game.folders.getName(playersFolderName);
        if (!playersFolder) {
            ui.notifications.warn(`Make sure your players are in an actors folder named ${playersFolderName}...`);
            return;
        }
        let players = canvas.scene.tokens.filter((token) => token.actor && token.actor?.folder?.name == playersFolderName).map(t => t.actor).sort(sortByName);
        if (players.length == 0) {
            ui.notifications.notify('There are no player tokens in this scene.');
            return;
        }
        var folder = game.folders.getName(SUMMARY_FOLDER_NAME);

        if (!folder) {
            folder = await Folder.create({ "name": SUMMARY_FOLDER_NAME, "type": "JournalEntry" });
        }
        journalInternal.pruneSessionSummaries(folder.id);
        await JournalEntry.create({
            "name": `${SUMMARY_JOURNAL_NAME}: ${(new Date()).toLocaleString()}`,
            "folder": folder.id,
            "pages": [{
                "name": "Player Summary",
                "type": 'text',
                "text": {
                    "content": (journalInternal.generateSummaryHtml(players))
                }
            }]
        });
    }
};


let journalInternal = {
    "generateSummaryHtml": function _generateSummaryHtml(players) {
        function generateActorSummary(actor) {
            return `
          <tr>
            <td style="text-align:left">${actor.name}</td>
            <td style="text-align:right">${actor.system.details.xp.value}</td>
            <td style="text-align:right">${actor.system.attributes.hp.value} (${numbers.toNumber(actor.system.attributes.hp.temp)})</td>
            <td style='text-align:right;color:#90A2B6'>${numbers.toNumber(actor.system.currency.pp)}</td>
            <td style='text-align:right;color:#B08C34'>${numbers.toNumber(actor.system.currency.gp)}</td>
            <td style='text-align:right;color:#617480'>${numbers.toNumber(actor.system.currency.ep)}</td>
            <td style='text-align:right;color:#717773'>${numbers.toNumber(actor.system.currency.sp)}</td>
            <td style='text-align:right;color:#9D5934'>${numbers.toNumber(actor.system.currency.cp)}</td>
          </tr>
        `;
        }
        let sessionEndSummaryHtml = `
        <table>
          <tr>
            <th style="text-align:left">Character</th>
            <th style="text-align:right">Exp</th>
            <th style="text-align:right">HP (TEMP)</th>
            <th style="text-align:right">PP</th>
            <th style="text-align:right">GP</th>
            <th style="text-align:right">EP</th>
            <th style="text-align:right">SP</th>
            <th style="text-align:right">CP</th>
          </tr>`;
        players.forEach(actor => {
            sessionEndSummaryHtml += generateActorSummary(actor);
        });
        sessionEndSummaryHtml += `</table>`;
        return sessionEndSummaryHtml;
    },
    "pruneSessionSummaries": async function _pruneSessionSummaries(folderID){
        let summaries = await game.journal.filter(j => j.folder?.id == folderID);
        let maxTimestamp = Math.max(...summaries.map(s => s._stats.createdTime));
        let summariesToDelete = summaries.filter(s => s._stats.createdTime < maxTimestamp);
        summariesToDelete.forEach(summary => {
            summary.delete();
        });
    }
}

function sortByName(a, b) {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}