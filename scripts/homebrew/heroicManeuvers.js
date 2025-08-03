import { dialog } from "../dialog/dialog.js";
import { craftingHelpers } from "../crafting/crafting.js";
import { gmFunctions } from "../gm/gmFunctions.js";
import { items } from "../items/items.js";
import { numbers } from "../utility/numbers.js";
import { tokens } from "../tokens.js";
import { utility } from "../utility/utility.js";
import { sdndConstants } from "../constants.js";

const HEROIC_MANEUVER = 'Heroic Maneuver';
const DC_LOW = 15;
const DC_INTERMEDIATE = 17;
const DC_HIGH = 20;

const difficultyLevels = [
    { "label": "Low", "value": DC_LOW },
    { "label": "Intermediate", "value": DC_INTERMEDIATE },
    { "label": "High", "value": DC_HIGH }
];

class Buff {
    constructor(name, range, maxTargets, modifier, critialModification, effectApplicator) {
        this.name = name;
        this.range = range;
        this.maxTargets = maxTargets;
        this.modifier = modifier;
        this.critialModification = critialModification ? critialModification : (buff) => { };
        this.effectApplicator = effectApplicator;
    }
    copy() {
        return new Buff(this.name, this.range, this.maxTargets, this.modifier, this.critialModification, this.effectApplicator);
    }
    async getEffect(effectName) {
        let heroicManeuver = (await items.getItemFromCompendium(
                sdndConstants.PACKS.COMPENDIUMS.ITEM.SPELLS,
                HEROIC_MANEUVER, true, null)) ?? game.items.find(i => i.name == HEROIC_MANEUVER);
        if (!heroicManeuver) {
            throw new Error(`Heroic Maneuver item not found in compendium.`);
        }
        return foundry.utils.duplicate(heroicManeuver.effects.find(e => e.name == effectName));
    }
    async getEffectData(isCritical) {
        let buff = this.copy();
        if (isCritical) {
            buff.critialModification(buff);
        }
        const buffEffect = await this.getEffect(this.name);
        if (buff.effectApplicator) {
            buff.effectApplicator(buff, buffEffect);
        }
        this.effect = buffEffect;
        return buffEffect;
    }
}

class EffectOnlyBuff extends Buff {
    constructor(name, range, maxTargets, critialModification, cancels) {
        super(name, range, maxTargets, 0, critialModification, null, cancels);
    }
    copy() {
        return new EffectOnlyBuff(this.name, this.range, this.maxTargets, this.critialModification);
    }
    async getEffectData(isCritical) { return await super.getEffectData(isCritical); }
}

class MinorEffectOnlyBuff extends EffectOnlyBuff {
    constructor(name, range = 10, maxTargets = 2) {
        super(name, range, maxTargets,
            (buff) => {
                buff.range = buff.range == 0 ? 10 : buff.range * 2;
                buff.maxTargets *= 2;
            },
            null
        );
    }
    copy() {
        return new MinorEffectOnlyBuff(this.name);
    }
    async getEffectData(isCritical) { return await super.getEffectData(isCritical); }
}

class MajorEffectOnlyBuff extends EffectOnlyBuff {
    constructor(name) {
        super(name, 20, -1,
            (buff) => {
                buff.range *= 2;
            },
            null
        );
    }
    copy() {
        return new MajorEffectOnlyBuff(this.name);
    }
    async getEffectData(isCritical) { return await super.getEffectData(isCritical); }
}

class ModifierBuff extends Buff {
    constructor(baseEffect, prefix, range, maxTargets, modifier) {
        super(baseEffect, range, maxTargets, modifier,
            (buff) => { buff.modifier *= 2; },
            (buff, buffEffect) => {
                let modifierText = buff.modifier > 0 ? `+${buff.modifier}` : `${buff.modifier}`;
                buffEffect.description = buffEffect.description.replace("sdnd.modifier", modifierText);
                buffEffect.changes[0].value = modifierText;
            }
        )
        this.prefix = prefix;
    }
    copy() {
        return new ModifierBuff(this.name, this.prefix, this.range, this.maxTargets, this.modifier);
    }
    async getEffectData(isCritical) {
        let buff = await super.getEffectData(isCritical);
        buff.name = `${this.prefix ? this.prefix + " " : ""}${buff.name}`;
        return buff;
    }
}

const rewards = {
    [DC_LOW]: [
        (new MinorEffectOnlyBuff("Minor Advantage", 0, 1)),             // self only, crit upgrades to Intermediate effects
        (new ModifierBuff("Hit Bonus", "Minor", 0, 1, 1)),              // self only +1 next attack, crit doubles hit bonus
        (new ModifierBuff("Armor Bonus", "Minor", 0, 1, 1))             // self only +1 AC for 1 round, crit doubles armor bonus
    ],
    [DC_INTERMEDIATE]: [
        (new MinorEffectOnlyBuff("Minor Advantage")),                   // 10 range, 2 max targets, crit doubles range and max targets    
        (new ModifierBuff("Hit Bonus", "Major", 10, 2, 2)),             // 10 range, 2 max targets, +2 next attack, crit doubles bonus, range and max targets
        (new ModifierBuff("Armor Bonus", "Major", 10, 2, 2))            // 10 range, 2 max targets, +2 AC for 1 round, crit doubles armor bonus, range and max targets
    ],
    [DC_HIGH]: [
        (new MajorEffectOnlyBuff("Major Advantage")),                   // 20 range, unlimited targets, crit doubles range 
        (new ModifierBuff("Hit Bonus", "Exceptional", 20, -1, 4)),      // 20 range, unlimited targets, +4 next attack, crit doubles bonus and range
        (new ModifierBuff("Armor Bonus", "Exceptional", 20, -1, 4))     // 20 range, unlimited targets, +4 AC for 1 round, crit doubles armor bonus and range
    ]
}
const punishments = {
    [DC_LOW]: [
        (new MinorEffectOnlyBuff("Minor Disadvantage", 0, 1)),          // self only, crit upgrades to Intermediate effects
        (new ModifierBuff("Hit Handicap", "Minor", 0, 1, -1)),          // self only -1 next attack, crit doubles hit handicap
        (new ModifierBuff("Armor Handicap", "Minor", 0, 1, -1))         // self only -1 AC for 1 round, crit doubles armor handicap
    ],
    [DC_INTERMEDIATE]: [
        (new MinorEffectOnlyBuff("Minor Disadvantage")),                // 10 range, 2 max targets, crit doubles range and max targets
        (new ModifierBuff("Hit Handicap", "Major", 10, 2, -2)),         // 10 range, 2 max targets, -2 next attack, crit doubles hit handicap, range and max targets
        (new ModifierBuff("Armor Handicap", "Major", 10, 2, -2))        // 10 range, 2 max targets, -2 AC for 1 round, crit doubles armor handicap, range and max targets
    ],
    [DC_HIGH]: [
        (new MajorEffectOnlyBuff("Major Disadvantage")),                // 20 range, unlimited targets, crit doubles range
        (new ModifierBuff("Hit Handicap", "Exceptional", 20, -1, -4)),  // 20 range, unlimited targets, -4 next attack, crit doubles hit handicap and range
        (new ModifierBuff("Armor Handicap", "Major", 20, -1, -4))          // 20 range, unlimited targets, -4 AC for 1 round, crit doubles armor handicap and range
    ]
}

const doNotReplaceOnMinMax = [
    "Armor Bonus",
    "Hit Bonus",
    "Armor Handicap",
    "Hit Handicap"
];

let heroicManeuversImp = {
    getSkillType: async function _getSkillType() {
        const skillButtons = Object.entries(CONFIG.DND5E.skills)
            .filter(([key, value]) => ['acr', 'ath', 'inv', 'prc'].includes(key))
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
        if (!ensureMidiSettings()) {
            return;
        }
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
        const skillCheck = await tokens.rollSkillCheck(controlledToken, skill, dc, `Heroic Maneuver: ${CONFIG.DND5E.skills[skill].label} (DC${dc})`, false);
        if (!skillCheck) {
            return;
        }
        let buff = skillCheck.isSuccess ? heroicManeuversImp.getRandomReward(dc) : heroicManeuversImp.getRandomPunishment(dc);
        if (!buff) {
            ui.notifications.error("No buff or punishment available for this challenge rating.");
            return;
        }
        let additionTargets = await applyGroupBuff(controlledToken, buff, skillCheck);
        const isCritical = (skillCheck.isCritical || skillCheck.isFumble);
        await ChatMessage.create({
            "speaker": ChatMessage.getSpeaker({ actor: controlledActor }),
            "content": `<strong>Heroic Maneuver</strong><br>
                        <strong>Skill:</strong> ${CONFIG.DND5E.skills[skill].label}<br>
                        <strong>DC:</strong> ${dc}<br>
                        <strong>Result:</strong> ${isCritical ? "Critical " : ""} ${skillCheck.isSuccess ? "Success" : "Failure"}<br>
                        <strong>Total:</strong> ${skillCheck.total}<br>
                        <strong>Buff/Punishment:</strong> ${buff ? buff.name : "None"} <br>
                        <strong>Description:</strong> ${buff.effect.description}
                        <strong>Additional Targets:</strong> ${(additionTargets?.length ?? 0) > 0 ? additionTargets.map(t => t.name).join(", ") : "None"}<br>`
        });
    }
}

async function ensureMidiSettings() {
    if (!game.modules.get("midi-qol")?.active) {
        ui.notifications.error("Midi-QOL module is not active. Please enable it to use this feature.");
        return false;
    }
    const settings = game.settings.get('midi-qol', 'ConfigSettings');
    if (!settings.optionalRules?.actionSpecialDurationImmediate) {
        await ChatMessage.create({
            "content": "Midi must process next attack immediately for heroic maneuvers to function properly.  This setting has been turned on automatically...",
            "speaker": { "alias": "Stroud's DnD Helpers" }
        });
    }
    settings.optionalRules.actionSpecialDurationImmediate = true;
    await game.settings.set('midi-qol', 'ConfigSettings', settings);
    return true;
}

async function applyGroupBuff(token, buff, skillCheck) {
    if (!token) {
        token = utility.getControlledToken();
    }
    if (!token) {
        return;
    }

    const buffEffect = await buff.getEffectData(skillCheck.isCritical);
    if (!buffEffect) {
        ui.notifications.error(`Buff ${buff.name} not found.`);
        return;
    }
    buffEffect.origin = token.actor.uuid;
    buffEffect.flags[sdndConstants.MODULE_ID] = {
        "minmax": (skillCheck.isCritical || skillCheck.isFumble)
    };
    await applyBuff(token.actor, token, buffEffect);
    if (!buff.range || buff.range <= 0) {
        console.log("No range specified for buff, applying to token only.");
        return [];
    }
    if (buff.maxTargets == 1) {
        console.log("Buff cannot affect additional targets.");
    }
    const allies = tokens.findNearby(token, buff.range, "ally");
    if (!allies || allies.length === 0) {
        console.log("No allies found within range.");
        return [];
    }
    const allyCount = buff.maxTargets == -1 ? allies.length : buff.maxTargets - 1;
    let additionTargets = getRandomItems(allies, allyCount);
    for (const target of additionTargets) {
        await applyBuff(token.actor, target, buffEffect);
    }
    return additionTargets;
}

/**
 * Returns N random unique items from an array.
 * If N is greater than array.length, returns a shuffled copy of the array.
 * @param {Array} arr - The original array.
 * @param {number} n - The number of random items to return.
 * @returns {Array} An array of N random items.
 */
function getRandomItems(arr, n) {
    if (!Array.isArray(arr)) throw new TypeError('First argument must be an array');
    if (typeof n !== 'number' || n < 0) throw new TypeError('Second argument must be a non-negative number');
    if (n >= arr.length) {
        return arr;
    }
    // Create a copy to avoid mutating the original array
    const arrCopy = arr.slice();
    // Shuffle using Fisher-Yates
    for (let i = arrCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrCopy[i], arrCopy[j]] = [arrCopy[j], arrCopy[i]];
    }
    return arrCopy.slice(0, n);
}

function stringIncludesAny(str, arr) {
    // Ensure arr is an array
    if (!Array.isArray(arr)) {
        throw new TypeError('Second argument must be an array');
    }
    // Convert str to string in case it's not
    str = String(str);

    return arr.some(function (substring) {
        return str.includes(substring);
    });
}

function buffCannotBeReplaced(effect, sourceActorUuid, buff) {
    const minMax = buff.flags?.[sdndConstants.MODULE_ID]?.minmax ?? false;
    if (stringIncludesAny(effect.name, doNotReplaceOnMinMax) && effect.getFlag(sdndConstants.MODULE_ID, "minmax") == true && !minMax) {
        return true;
    }
    return effect.origin === sourceActorUuid;
}

async function applyBuff(sourceActor, token, buff) {
    if (!token || !token.actor) {
        return false;
    }
    if (token.actor.effects.filter(e => e.name === buff.name && buffCannotBeReplaced(e, sourceActor.uuid, buff)).length > 0) {
        console.log(`Target ${token.name} already has the effect ${buff.name}.`);
        return false;
    }
    await gmFunctions.createEffects(token.actor.uuid, [buff]);
    return true;
}