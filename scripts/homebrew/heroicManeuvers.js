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
    { "label": "30", "value": 30 }
];

const DC_LOW = 15;
const DC_INTERMEDIATE = 17;
const DC_HIGH = 20;

const difficultyLevels = [
    { "label": "Low", "value": DC_LOW },
    { "label": "Intermediate", "value": DC_INTERMEDIATE },
    { "label": "High", "value": DC_HIGH }
];

function CreateBuff(name, range, maxTargets, modifier, critialModification, effectApplicator) {
    return {
        "name": name,
        "range": range,
        "maxTargets": maxTargets,
        "modifier": modifier,
        "critialModification": critialModification ? critialModification : (buff) => {},
        "effectApplicator": effectApplicator,
        "getEffectData": function (isCritical) {
            if (isCritical) {
                this.critialModification(this);
            }
            const buffEffect = foundry.utils.duplicate(game.items.find(i => i.name == "Heroic Maneuver")?.effects.find(e => e.name == this.name));
            if (this.effectApplicator) {
                this.effectApplicator(this, buffEffect);
            }
            return buffEffect;
        }   
    };
}
// ensure the folling arrays are executed once
const rewards = {
    [DC_LOW]: [
        CreateBuff("Minor Hit Bonus", 0, 1, 1, 
            (buff) => { 
                buff.modifier *= 2; 
            }, 
            (buff, buffEffect) => {
                let modifierText = buff.modifier > 0 ? `+${buff.modifier}` : `${buff.modifier}`;
                buffEffect.description = buffEffect.description.replace("sdnd.modifier", modifierText);
                buffEffect.changes[0].value = modifierText;
            }
        )
    ],
    [DC_INTERMEDIATE]: [
        CreateBuff("Minor Advantage", 10, 1, 0, (buff) => { buff.range = 15; buff.maxTargets = 2 })
    ],
    [DC_HIGH]: [
        CreateBuff("Major Advantage", 20, -1, 0, (buff) => { buff.range = 40;})
    ]
}
const punishments = {
    [DC_LOW]: [
        CreateBuff("Minor Hit Handicap", 0, 1, -1, 
            (buff) => { 
                buff.modifier *= 2; 
            }, 
            (buff, buffEffect) => {
                let modifierText = buff.modifier > 0 ? `+${buff.modifier}` : `${buff.modifier}`;
                buffEffect.description = buffEffect.description.replace("sdnd.modifier", modifierText);
                buffEffect.changes[0].value = modifierText;
            }
        )
    ],
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
        return await dialog.createButtonDialog("Select a Challenge Rating", difficultyLevels, 'column');
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
        let buff = skillCheck.isSuccess ? heroicManeuversImp.getRandomReward(dc) : heroicManeuversImp.getRandomPunishment(dc);
        let additionTargets = await applyGroupBuff(controlledToken, buff, skillCheck);
        await ChatMessage.create({
            "speaker": ChatMessage.getSpeaker({ actor: controlledActor }),
            "content": `<strong>Heroic Maneuver</strong><br>
                        <strong>Skill:</strong> ${CONFIG.DND5E.skills[skill].label}<br>
                        <strong>DC:</strong> ${dc}<br>
                        <strong>Result:</strong> ${skillCheck.isSuccess ? "Success" : "Failure"}<br>
                        <strong>Total:</strong> ${skillCheck.total}<br>
                        <strong>Buff/Punishment:</strong> ${buff ? buff.name : "None"}
                        <strong>Additional Targets:</strong> ${additionTargets.length > 0 ? additionTargets.map(t => t.name).join(", ") : "None"}<br>
                        <strong>Critical:</strong> ${skillCheck.isCritical ? "Yes" : "No"}<br>`
        });
    }
}

async function applyGroupBuff(token, buff, skillCheck) {
    if (!token) {
        token = utility.getControlledToken();
    }
    if (!token) {
        return;
    }

    const buffEffect = buff.getEffectData(skillCheck.isCritical);
    if (!buffEffect) {
        ui.notifications.error(`Buff ${buff.name} not found.`);
        return;
    }
    await applyBuff(token, buffEffect);
    if (!buff.range || buff.range <= 0) {
        console.log("No range specified for buff, applying to token only.");
        return [];
    }
    const allies = tokens.findNearby(token, buff.range, "ally");
    if (!allies || allies.length === 0) {
        console.log("No allies found within range.");
        return [];
    }
    let count = 0;
    let additionTargets = [];
    for (const ally of allies) {
        if (await applyBuff(ally, buffEffect)) {
            count++;
            additionTargets.push(ally);
        }
        if (count >= buff.maxTargets && buff.maxTargets > 0) {
            console.log(`Reached maximum targets for buff ${buff.name}.`);
            break;
        }
    }
    return additionTargets;
}

async function applyBuff(token, buff) {
    if (!token || !token.actor) {
        return false;
    }
    if (token.actor.effects.filter(e => e.name === buff.name).length > 0) {
        console.log(`Target ${token.name} already has the effect ${buff.name}.`);
        return false;
    }
    await gmFunctions.createEffects(token.actor.uuid, [buff]);
    return true;
}