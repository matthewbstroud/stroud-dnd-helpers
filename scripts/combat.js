import { dialog } from "./dialog/dialog.js";
import { playlists } from "./playlists.js";
import { numbers } from "./utility/numbers.js";
import { ranged } from "./weapons/ranged.js";
import { sdndConstants } from "./constants.js";
import { sdndSettings } from "./settings.js";
import { tokens } from "./tokens.js";
import { bloodyAxe } from "./items/weapons/bloodyAxe.js";

export let combat = {
    "applyAdhocDamage": applyAdhocDamage,
    "simulatedAttackers": simulateAttackers,
    "startFilteredCombat": async function _startFilteredCombat() {
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        tokens.releaseInvalidTokens(false);
        await canvas.tokens.toggleCombat();
        await game.combat.rollNPC();

        var combatPlaylistId = sdndSettings.CombatPlayList.getValue();
        if (!combatPlaylistId || combatPlaylistId == "none") {
            return;
        }
        Hooks.once("deleteCombat", async function () {
            playlists.stop(combatPlaylistId);
            SimpleCalendar?.api.startClock();
        });
        playlists.start(combatPlaylistId, true);
    },
    "weapons": {
        "ranged": ranged
    },
    "eventHandlers": {
        "onDamageTaken": onDamageTaken
    },
    "hooks": {
        "ready": async function _ready() {
            if (game.user.isTheGM && sdndSettings.OnDamageEvents.getValue()) {
                Hooks.on("dnd5e.damageActor", onDamageTaken);
            }
        }
    }
};

async function onDamageTaken(actor, changes, update, userId) {
    bloodyAxe.onDamageTaken(actor, changes, update, userId);
}

// apply adhoc damage to selected tokens
async function applyAdhocDamage() {
    if (!game.user.isGM) {
        ui.notifications.notify(`Can only be run by the gamemaster!`);
        return;
    }
    let adHocDamage = {
        getDamageType: async function _getDamageType() {
            return await dialog.createButtonDialog("Select Damage Type", sdndConstants.BUTTON_LISTS.DAMAGE_5E, 'column');
        },
        getDamageDice: async function _getDamageDice() {
            let diceButtons = ['d4', 'd6', 'd8', 'd10', 'd20', 'd100'];
            return await dialog.createButtonDialog("Select Damage Dice", diceButtons.map(v => ({ label: v, value: v })), 'column');
        },
        getDiceCount: async function _getDiceCount() {
            let numberButtons = [];
            for (let i = 1; i <= 20; i++) {
                numberButtons.push({ label: `${i}`, value: i });
            }
            return await dialog.createButtonDialog("How Many Dice?", numberButtons, 'row');
        },
        getSortedNames: function _getSortedNames(targets) {
            let sortedNames = targets.map(t => t.name).sort();
            let targetNames = sortedNames.slice(0, sortedNames.length - 1).join(`, `);
            if (sortedNames.length > 1) {
                targetNames += ` and ${sortedNames[sortedNames.length - 1]} have`;
            }
            else {
                targetNames = `${sortedNames[0]} has`;
            }
            return targetNames;
        }
    };

    // release tokens that shouldn't take damage
    tokens.releaseInvalidTokens(true);
    // get the tokens remaining
    let targets = canvas.tokens.controlled;
    if (!targets || targets.length == 0) {
        ui.notifications.notify(`No valid tokens selected!`);
        return;
    }

    let damageType = await adHocDamage.getDamageType();
    if (!damageType) {
        return;
    }
    let damageDice = await adHocDamage.getDamageDice();
    if (!damageDice) {
        return;
    }
    let diceCount = await adHocDamage.getDiceCount();
    if (!diceCount) {
        return;
    }
    const damageRoll = await new Roll(`${diceCount}${damageDice}[${damageType}]`).evaluate({ async: true })
    const dnd5eDamageType = CONFIG.DND5E.damageTypes[damageType];
    let color = dnd5eDamageType.color;
    if (color) {
        color = `color:${color}`;
    }
    damageRoll.toMessage({ flavor: `${adHocDamage.getSortedNames(targets)} been struck with <span style='${color}'>${dnd5eDamageType.label}</span> damage!` });
    let autoApplyAdhocDamage = sdndSettings.AutoApplyAdhocDamage.getValue();
    await MidiQOL.applyTokenDamage([{ type: `${damageType}`, damage: damageRoll.total }], damageRoll.total, new Set(targets), null, new Set(), { forceApply: autoApplyAdhocDamage });
}

const damageMatch = /\[(?<damage>\w+)\]/;
const rollFormulaMatch = /\d+d\d+\+*\d*\[\w+\]/;

async function applyAttackers(attackerCount, rollFormula, hitModifier, autoApplyDamage) {
    game.user.setFlag('world', 'sdnd.simulateAttackers', { count: attackerCount, formula: rollFormula, hit: hitModifier, auto: autoApplyDamage });

    // release tokens that shouldn't take damage
    tokens.releaseInvalidTokens(false);
    // get the tokens remaining
    let targets = canvas.tokens.controlled;
    if (!targets || targets.length == 0) {
        ui.notifications.notify(`No valid tokens selected!`);
        return;
    }
    let results = Object.fromEntries(canvas.tokens.controlled.map(t =>  [t.id, { 'name': t.name, 'hits': 0, 'damage': 0 }]));
    let damageType = damageMatch.exec(rollFormula)?.groups["damage"] ?? 'slashing';
    for (let i = 0; i < attackerCount; i++) {
        let currentTarget = targets[i % targets.length];
        const hitRoll = await new Roll(`1d20+${hitModifier}`).evaluate({ async: true });
        if (hitRoll.total <= (currentTarget?.actor?.system?.attributes?.ac?.value ?? 10)){
            continue;
        }
        const damageRoll = await new Roll(rollFormula).evaluate({ async: true });
        let totalDamage = damageRoll.total;
        if (hitRoll.total == 20 + hitModifier) {
            totalDamage *= 2;
        }
        await MidiQOL.applyTokenDamage([{ type: `${damageType}`, damage: totalDamage }], totalDamage, new Set([currentTarget]), null, new Set(), { forceApply: autoApplyDamage });
        results[currentTarget.id].hits++;
        results[currentTarget.id].damage += totalDamage;
    }

    let messageData = { content: generateSummary(results) };
    messageData.whisper = ChatMessage.getWhisperRecipients('GM');
    ChatMessage.create(messageData);
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

function generateSummary(results) {
    let playerResults = "";
    for (let result of Object.values(results).sort(sortByName)) {
        playerResults += `
            <tr>
                <td style="text-align:left">${result.name}</td>
                <td style="text-align:right">${result.hits}</td>
                <td style="text-align:right">${result.damage}</td>
            </tr>`;
    }
    let summaryHtml = `
        <table>
          <tr>
            <th style="text-align:left">Character</th>
            <th style="text-align:right">Hits</th>
            <th style="text-align:right">Total Damage</th>
          </tr>
          ${playerResults}
        </table>`;
    return summaryHtml;
}

async function simulateAttackers() {
    if (!game.user.isGM) {
        ui.notifications.notify(`Can only be run by the gamemaster!`);
        return;
    }
    let currentFlags = game.user.getFlag('world', 'sdnd.simulateAttackers');
    let title = `Simulated Attacks`;
    const formHtml = `
<script type="text/javascript">

</script>
<b>Attacker Configuration:</b><br />
<div style="display: flex; width: 100%; margin: 10px 0px 10px 0px">
    <label for="numberOfAttackers" style="white-space: nowrap; margin: 4px 10px 0px 10px;"># of Attackers:</label>
    <input type="number" id="numberOfAttackers" name="numberOfAttackers" value="${currentFlags?.count ?? 1}"/>
    <label for="rollFormula" style="white-space: nowrap; margin: 4px 10px 0px 10px;">Roll Formula:</label>
    <input type="text" id="rollFormula" name="rollFormula" size="50" style="min-width: 200px" placeholder="1d8[slashing]" value="${currentFlags?.formula ?? ''}"/>
    <label for="hitModifier" style="white-space: nowrap; margin: 4px 10px 0px 10px;">Hit Modifier:</label>
    <input type="number" id="hitModifier" name="hitModifier" value="${currentFlags?.hit ?? 0}" />
    <label for="autoapply" style="white-space: nowrap; margin: 4px 10px 0px 10px;">Auto Apply:</label>
    <input type="checkbox" id="autoapply" name="autoapply" ${(currentFlags?.auto ?? false) ? 'checked' : ''} />
</div>
`;

    new Dialog({
        title: title,
        content: `
        <form>
            ${formHtml}
        </form>
    `,
        buttons: {
            yes: {
                icon: "<i class='fas fa-check'></i>",
                label: "Apply",
                callback: (html) => {
                    let numberOfAttackers = numbers.toNumber(html.find('#numberOfAttackers').val());
                    if (numberOfAttackers == 0) {
                        ui.notifications.error(`Number of attackers must be at least 1!`);
                        return;
                    }
                    let rollFormula = html.find('#rollFormula').val();
                    if (!rollFormulaMatch.exec(rollFormula)?.length == 1) {
                        ui.notifications.error(`${rollFormula} is not a valid roll formula!`);
                        return;
                    }
                    let hitModifier = numbers.toNumber(html.find('#hitModifier').val());
                    let autoApply = html.find('#autoapply')?.is(":checked") ?? false;
                    applyAttackers(numberOfAttackers, rollFormula, hitModifier, autoApply);
                }
            },
            no: {
                icon: "<i class='fas fa-times'></i>",
                label: `Cancel`
            },
        },
        default: "yes"
    }, { width: 800 }).render(true)
}