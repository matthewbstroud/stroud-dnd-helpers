import { dialog } from "../dialog/dialog.js";
import { craftingHelpers } from "../crafting/crafting.js";
import { gmFunctions } from "../gm/gmFunctions.js";
import { numbers } from "../utility/numbers.js";
import { tokens } from "../tokens.js";
import { utility } from "../utility/utility.js";

const dcLevels = [
    { "label": "15", "value": 15 },
    { "label": "20", "value": 20 },
    { "label": "25", "value": 25 },
    { "label": "30", "value": 30 }];

const rewards = {
    "intermediate": [
        "Minor Advantage"
    ],
    "high": [
        "Major Advantage"
    ]
}
const punishments = {
    "intermediate": [
        "Minor Disadvantage"
    ],
    "high": [
        "Major Disadvantage"
    ]
}


let heroicManeuversImp = {
    getSkillType: async function _getSkillType() {
        const skillButtons = Object.entries(CONFIG.DND5E.skills)
            .filter(([key, value]) => ['acr', 'ath', 'inv', 'per'].includes(key))
            .map(([key, value]) => ({ "label": value?.label, "value": key }));
        return await dialog.createButtonDialog("Select a Skill", skillButtons, 'column');
    },
    getDC: async function _getDC() {
        return await dialog.createButtonDialog("Select a Challenge Rating", dcLevels, 'column');
    },
    getRandomPunishment: function _getRandomPunishment(difficulty) {
        const punishmentsForDifficulty = punishments[difficulty];
        return punishmentsForDifficulty ? punishmentsForDifficulty[numbers.getRandomInt(0, punishmentsForDifficulty.length - 1)] : null;
    },
    getRandomReward: function _getRandomReward(difficulty) {
        const rewardsForDifficulty = rewards[difficulty];
        return rewardsForDifficulty ? rewardsForDifficulty[numbers.getRandomInt(0, rewardsForDifficulty.length - 1)] : null;
    }
}

export let heroicManeuvers = {
    execute: async function _execute() {
        let controlledToken = utility.getControlledToken();
        if (!controlledToken) {
            return;
        }
        let controlledActor = controlledToken.actor;
        if (!controlledActor) {
            ui.notifications.error("No controlled actor found.");
            return;
        }
        const skill = await heroicManeuversImp.getSkillType();
        if (!skill) return;
        const dc = await heroicManeuversImp.getDC();
        if (!dc) return;
        const skillCheck = await craftingHelpers.rollSkillCheck(controlledActor, skill, dc, `Heroic Maneuver: ${CONFIG.DND5E.skills[skill].label} (DC${dc})`, false);
        if (skillCheck.isSuccess) {
            await applyGroupBuff(controlledToken, heroicManeuversImp.getRandomReward("intermediate"), 10);
            return;
        }
        await applyGroupBuff(controlledToken, heroicManeuversImp.getRandomPunishment("intermediate"), 10);
    }
}

async function applyGroupBuff(token, buffName, range) {
    if (!token) {
        token = utility.getControlledToken();
    }
    if (!token) {
        return;
    }

    const buff = game.items.find(i => i.name == "Heroic Maneuver")?.effects.find(e => e.name == buffName);
    if (!buff) {
        ui.notifications.error(`Buff ${buffName} not found.`);
        return;
    }
    const targets = tokens.findNearby(token, range, "ally");
    targets.unshift(token); // Include the token itself in the targets
    for (const target of targets) {
        if (target.actor.effects.filter(e => e.name === buffName).length > 0) {
            console.log(`Target ${target.name} already has the effect ${buffName}.`);
            continue;

        }
        await gmFunctions.createEffects(target.actor.uuid, [buff]);
    }
}