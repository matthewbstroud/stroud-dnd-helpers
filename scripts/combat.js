import { dialog } from "./dialog/dialog.js";
import { actors } from "./actors/actors.js";
import { playlists } from "./playlists.js";
import { numbers } from "./utility/numbers.js";
import { ranged } from "./weapons/ranged.js";
import { sdndConstants } from "./constants.js";
import { sdndSettings } from "./settings.js";
import { tokens } from "./tokens.js";
import { bloodyAxe } from "./items/weapons/bloodyAxe.js";
import { mounts } from "./mounts/mounts.js";
import { tagging } from "./utility/tagging.js";
import { versioning } from "./versioning.js";
import { folders } from "./folders/folders.js";
import { importFromCompedium } from "./gm/gmFunctions.js";
import { items } from "./items/items.js";

export let combat = {
    "applyAdhocDamage": foundry.utils.debounce(applyAdhocDamage, 250),
    "simulatedAttackers": foundry.utils.debounce(simulateAttackers, 250),
    "startFilteredCombat": foundry.utils.debounce(startFilteredCombat, 250),
    "toggleWallsBlockRange": foundry.utils.debounce(toggleWallsBlockRanged, 250),
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
                Hooks.on("dnd5e.healActor", onHealed);
            }
        }
    },
    "getWeaponDamageTypes": getWeaponDamageTypes
};

const WALLS_BLOCK_RANGE = "optionalRules.wallsBlockRange";
async function toggleWallsBlockRanged() {

    let midiConfig = game.settings.get("midi-qol", "ConfigSettings");
    const currentSetting = foundry.utils.getProperty(midiConfig, WALLS_BLOCK_RANGE);
    let wallsBlockRange = currentSetting != "none";
    let messageContent = wallsBlockRange ? "Walls will not block range." : "Walls block range.";
    if (wallsBlockRange) {
        await game.user.setFlag(sdndConstants.MODULE_ID, WALLS_BLOCK_RANGE, currentSetting);
    }
    const newSetting = wallsBlockRange ?
        "none" :
        game.user.getFlag(sdndConstants.MODULE_ID, WALLS_BLOCK_RANGE) ?? "center";
    foundry.utils.setProperty(midiConfig, WALLS_BLOCK_RANGE, newSetting);
    await game.settings.set("midi-qol", "ConfigSettings", midiConfig);
    await ChatMessage.create({
        content: messageContent,
        whisper: ChatMessage.getWhisperRecipients('GM'),
    });
}

function getSortedNames(targets) {
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

function getWeaponDamageTypes(weapon) {
    const damage = weapon?.system?.damage;
    if (!damage) {
        return [];
    }
    let damageTypes = versioning.dndVersioned(() => getWeaponDamageTypesV4(damage), () => getWeaponDamageTypesV3(damage));
    return damageTypes ?? [];
}

function getWeaponDamageTypesV3(damage) {
    const damageTypes = damage?.parts;
    if (!damageTypes) {
        return null;
    }
    let damageTypesSet = new Set();
    for (let damageType of damageTypes) {
        if (damageType.length > 0) {
            let embeddedType = /\[(?<type>\w+)\]/.exec(damageType[1])?.groups?.type;
            if (embeddedType) {
                damageTypesSet.add(embeddedType);
            }
        }
        if (damageType.length > 1) {
            damageTypesSet.add(damageType[1]);
        }
    }
    return Array.from(damageTypesSet);
}

function getWeaponDamageTypesV4(damage) {
    return Array.from(damage?.base?.types);
}

async function startFilteredCombat() {
    if (!game.user.isGM) {
        ui.notifications.notify(`Can only be run by the gamemaster!`);
        return;
    }
    tokens.releaseInvalidTokens(false);
    await TokenDocument.createCombatants(canvas.tokens.controlled);
    await game.combat.rollNPC();
    if (game.combats.active?.getFlag(sdndConstants.MODULE_ID, "CombatInitialized") ?? false) {
        return;
    }
    var combatPlaylistId = sdndSettings.CombatPlayList.getValue();
    if (!combatPlaylistId || combatPlaylistId == "none") {
        return;
    }
    await game.combats.active?.setFlag(sdndConstants.MODULE_ID, "CombatInitialized", true);
    Hooks.once("deleteCombat", async function () {
        playlists.stop(combatPlaylistId);
        SimpleCalendar?.api.startClock();
        tagging.sfx.toggle("SceneMusic", false);
    });
    tagging.sfx.toggle("SceneMusic", true);
    playlists.start(combatPlaylistId, true);
}

async function onDamageTaken(actor, changes, update, userId) {
    await bloodyAxe.onDamageTaken(actor, changes, update, userId);
    await mounts.hooks.onDamageTaken(actor, changes, update, userId);
}

async function onHealed(actor, changes, update, userId) {
    await mounts.hooks.onHealed(actor, changes, update, userId);
}

async function createAdhocItem(adhocDamageType, damageType, damageDice, diceCount, saveData, targets) {
    let adhocActor = await actors.ensureActor("Adhoc Damage", sdndConstants.PACKS.COMPENDIUMS.ACTOR.TEMP, folders.Actor.TempActors.name);
    if (!adhocActor) {
        adhocActor = await importFromCompedium("Actor", sdndConstants.PACKS.COMPENDIUMS.ACTOR.TEMP, "7vOYBKZ0yWut0zCw", tempActorsFolder.name);
    }
    let item = adhocActor.items.find(i => i.name === adhocDamageType);
    if (!item) {
        await ui.notifications.error("Could not create adhoc damage synthetic item!");
        return null;
    }
    const dnd5eDamageType = CONFIG.DND5E.damageTypes[damageType];
    const damageImage = `modules/stroud-dnd-helpers/images/icons/damageTypes/${damageType}_damage.webp`;
    let activity = item.system.activities.contents[0];
    let parentActor = item.parent;
    await parentActor.updateEmbeddedDocuments(Item.name, [
        {
            "_id": item._id,
            "system": {
                description: {
                    "chat": `<img src='${damageImage}' style='border: 0!important'/>`
                }
            }
        }
    ]);
    const flavor = `${getSortedNames(targets)} been struck with <span style='${dnd5eDamageType.color}'>${dnd5eDamageType.label}</span> damage!`;
    let changes = {
        name: dnd5eDamageType.label,
        description: {
            chatFlavor: flavor
        },
        damage: {
            parts: [
                {
                    denomination: numbers.toNumber(damageDice),
                    number: numbers.toNumber(diceCount),
                    types: [damageType]
                }
            ]
        }
    };
    if (saveData) {
        changes.damage.onSave = saveData.damageOnSave;
        changes.save = {
            ability: [saveData.ability],
            dc: {
                formula: `${saveData.dc}`,
                value: saveData.dc
            }
        }
    }
    await activity.update(changes);
    return item;
}

// apply adhoc damage to selected tokens
async function applyAdhocDamage() {
    if (!game.user.isGM) {
        ui.notifications.notify(`Can only be run by the gamemaster!`);
        return;
    }
    let adHocDamage = {
        getAdhocDamageType: async function _getAdhocDamageType() {
            return await dialog.createButtonDialog("Adhoc Damage Type", sdndConstants.BUTTON_LISTS.ADHOC_DAMAGE_TYPE, 'column');
        },
        getDamageType: async function _getDamageType() {
            return await dialog.createButtonDialog("Select Damage Type", sdndConstants.BUTTON_LISTS.DAMAGE_5E, 'column');
        },
        getDamageDice: async function _getDamageDice() {
            return await dialog.createButtonDialog("Select Damage Dice", sdndConstants.BUTTON_LISTS.DICE_TYPES, 'column');
        },
        getDiceCount: async function _getDiceCount() {
            let numberButtons = [];
            for (let i = 1; i <= 20; i++) {
                numberButtons.push({ label: `${i}`, value: i });
            }
            return await dialog.createButtonDialog("How Many Dice?", numberButtons, 'row');
        },
        "getSortedNames": getSortedNames,
        getSaveAbility: async function _getSaveAbility() {
            const abilities = Object.values(CONFIG.DND5E.abilities).map(a => ({ label: a.label, value: a.abbreviation }));
            return await dialog.createButtonDialog("Select Save Ability", abilities, "column");
        },
        getSaveDC: async function _getSaveDC() {
            const values = [5, 10, 15, 20, 25, 30].map(v => ({
                label: v,
                value: v
            }));
            return await dialog.createButtonDialog("Select Save DC", values, "column");
        },
        getDamageOnSave: async function _getDamageOnSave() {
            const values = [
                {
                    label: "Half Damage",
                    value: "half"
                },
                {
                    label: "No Damage",
                    value: "none"
                }
            ];
            return await dialog.createButtonDialog("Select Damage on Save", values, "column");
        },
        collectInputData: async function _collectInputData() {
            let saveData = null;
            let adhocDamageType = versioning.isLegacyVersion() ? "legacy" : await adHocDamage.getAdhocDamageType();
            if (!adhocDamageType) {
                return;
            }

            if (adhocDamageType === "Damage") {
                const saveAbility = await adHocDamage.getSaveAbility();
                if (!saveAbility) {
                    return;
                }
                const saveDC = await adHocDamage.getSaveDC();
                if (!saveDC) {
                    return;
                }
                const damageOnSave = await adHocDamage.getDamageOnSave();
                if (!damageOnSave) {
                    return;
                }
                saveData = {
                    ability: saveAbility,
                    dc: saveDC,
                    damageOnSave: damageOnSave
                };
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

            return {
                adhocDamageType,
                damageType,
                damageDice,
                diceCount,
                saveData
            };
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
    const inputData = await adHocDamage.collectInputData();
    if (!inputData) {
        return;
    }
    const { adhocDamageType, damageType, damageDice, diceCount, saveData } = inputData;
    return await versioning.dndVersionedAsync(
        async () => await applyDamage(adhocDamageType, damageType, damageDice, diceCount, saveData, targets),
        async () => await applyDamageLegacyMode(damageType, damageDice, diceCount, targets)
    );
}

async function applyDamage(adhocDamageType, damageType, damageDice, diceCount, saveData, targets) {
    const item = await createAdhocItem(adhocDamageType, damageType, damageDice, diceCount, saveData, targets);
    return await chrisPremades.utils.workflowUtils.syntheticItemRoll(item, targets, { userId: game.userId });
}

async function applyDamageLegacyMode(damageType, damageDice, diceCount, targets) {
    const damageRoll = await new Roll(`${diceCount}d${damageDice}[${damageType}]`).evaluate();
    const dnd5eDamageType = CONFIG.DND5E.damageTypes[damageType];
    let color = dnd5eDamageType.color;
    if (color) {
        color = `color:${color}`;
    }
    damageRoll.toMessage({ flavor: `${getSortedNames(targets)} been struck with <span style='${color}'>${dnd5eDamageType.label}</span> damage!` });
    await MidiQOL.applyTokenDamage([{ type: `${damageType}`, damage: damageRoll.total }], damageRoll.total, new Set(targets), null, new Set(), { forceApply: true });
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
    let results = Object.fromEntries(canvas.tokens.controlled.map(t => [t.id, { 'name': t.name, 'hits': 0, 'damage': 0 }]));
    let damageType = damageMatch.exec(rollFormula)?.groups["damage"] ?? 'slashing';
    for (let i = 0; i < attackerCount; i++) {
        let currentTarget = targets[i % targets.length];
        const hitRoll = await new Roll(`1d20+${hitModifier}`).evaluate();
        if (hitRoll.total <= (currentTarget?.actor?.system?.attributes?.ac?.value ?? 10)) {
            continue;
        }
        const damageRoll = await new Roll(rollFormula).evaluate();
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