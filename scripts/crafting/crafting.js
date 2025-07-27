import { sdndConstants } from "../constants.js";
import { sdndSettings } from "../settings.js";
import { harvesting } from "./harvesting.js";
import { poison } from "./poison.js";



export let crafting = {
    "harvesting": harvesting,
    "poison": poison
}

export let craftingHelpers = {
    "rollAblityCheck": async function _rollAbilityCheck(actor, ability, dc, flavor, fastForward) {
        let ability5e = dnd5e.config.abilities[ability];
        flavor == flavor ?? `(DC ${dc}) ${ability5e.label} check against ${flavor}`;
        fastForward = fastForward ?? true;
        let rollOptions = {
            targetValue: dc,
            fastForward: fastForward,
            chatMessage: true,
            flavor: flavor
        };
        let roll = await actor.rollAbility(ability5e.abbreviation, rollOptions);
        return { 
            "isCritical": roll.isCritical, 
            "isSuccess": (roll.options?.success ?? roll.isSuccess ?? roll.total >= dc),
            "total": roll.total
        };
    },
    "rollSkillCheck": async function _rollSkillCheck(actor, skill, dc, flavor, fastForward) {
        let skill5e = dnd5e.config.skills[skill];
        flavor == flavor ?? `(DC ${dc}) check against ${skill5e.label}`;
        fastForward = fastForward ?? true;
        let rollOptions = {
            targetValue: dc,
            fastForward: fastForward,
            chatMessage: true,
            flavor: flavor
        };

        let roll = await actor.rollSkill(skill, rollOptions);
        const bonus = (roll?.data?.skills?.[skill]?.total ?? 0);
        const chanceOfSuccess = ((21 - dc + bonus) / 20) * 100;
        const minPossible = bonus + 1;
        const maxPossible = bonus + 20;
        const averageRoll = Math.floor((minPossible + maxPossible) / 2);
        return { 
            "isCritical": roll.isCritical, 
            "isSuccess": (roll.options?.success ?? roll.isSuccess ?? (roll.total >= dc)),
            "isFumble": (roll.options?.fumble ?? roll.isFumble ?? (roll.total - bonus <= 1)),
            "total": roll.total,
            "chanceOfSuccess": chanceOfSuccess,
            "averageRoll": averageRoll,
            "actualRoll": roll.total - bonus,
        };
    }
}