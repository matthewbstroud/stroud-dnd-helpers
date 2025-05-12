import { craftingHelpers } from "./crafting.js";
import { sdndConstants } from "../constants.js";
import { dialog } from "../dialog/dialog.js";
import { utility } from "../utility/utility.js";
import { sdndSettings } from "../settings.js";
import { gmFunctions } from "../gm/gmFunctions.js";
import { macros } from "../macros/macros.js";

const DEFAULTS = {
    "dc": 10,
    "duration": 10,
    "percentage": 100,
    "skill": 'sur'
}
const HARVESTABLES = [
    {
        "name": "Auroch",
        "rewards": [
            {
                "name": "Auroch's Blood"
            }
        ]
    },
    {
        "name": "Bear",
        "rewards": [
            {
                "name": "Bear Pelt",
                "percentage": 80
            },
            {
                "name": "Bear Meat",
                "percentage": 20
            }
        ]
    },
    {
        "name": "Carrion Crawler",
        "dc": 12,
        "rewards": [
            {
                "name": "Carrion Crawler Mucus"
            }
        ]
    },
    {
        "name": "Cave Fisher",
        "rewards": [
            {
                "name": "Cave Fisher Blood"            
            }
        ]
    },
    {
        "name": "Cyclops",
        "rewards": [
            {
                "name": "Massive Diamond"
            }
        ]
    },
    {
        "name": "Dire Wolf",
        "rewards": [
            {
                "name": "Dire Wolf Pelt"
            }
        ]
    },
    {
        "name": "Ettercap",
        "dc": 11,
        "rewards": [
            {
                "name": "Cap of Ettercap Fungi"
            }
        ]
    },
    {
        "name": "Flumph",
        "rewards": [
            {
                "name": "Flumph Spray"
            }
        ]
    },
    {
        "name": "Giant Crocodile",
        "rewards": [
            {
                "name": "Crocodile Hide (Giant)",
                "percentage": 90
            },
            {
                "name": "Emerald",
                "percentage": 10
            }
        ]
    },
    {
        "name": "Giant Poisonous Snake",
        "dc": 11,
        "rewards": [
            {
                "name": "Giant Poisonous Snake Gland"
            }
        ]
    },
    {
        "name": "Giant Wasp",
        "dc": 11,
        "rewards": [
            {
                "name": "Wasp Venom"
            }
        ]
    },
    {
        "name": "Ghost",
        "rewards": [
            {
                "name": "Gold Amulet"
            }
        ]
    },
    {
        "name": "Hill Giant",
        "rewards": [
            {
                "name": "Ironwood"
            }
        ]
    },
    {
        "name": "Myconid Sovereign",
        "dc": 11,
        "rewards": [
            {
                "name": "Cap of Myconid Fungi"               
            }
        ]
    },
    {
        "name": "Phase Spider",
        "dc": 12,
        "rewards": [
            {
                "name": "Phase Spider Venom"              
            }
        ]
    },
    {
        "name": "Poisonous Snake",
        "dc": 11,
        "rewards": [
            {
                "name": "Snake Venom"
            }
        ]
    },
    {
        "name": "Poisonous Spider",
        "dc": 11,
        "rewards": [
            {
                "name": "Spider Venom"
            }
        ]
    },
    {
        "name": "Purple Worm",
        "dc": 18,
        "rewards": [
            {
                "name": "Purple Worm Venom"
            }
        ]
    },
    {
        "name": "Scarecrow",
        "rewards": [
            {
                "name": "Wheat",
                "count": 2
            },
            {
                "name": "Barley",
                "count": 2
            }
        ]
    },
    {
        "name": "Scorpion",
        "dc": 11,
        "rewards": [
            {
                "name": "Scorpion Venom"
            }
        ]
    },
    {
        "name": "Werewolf",
        "rewards": [
            {
                "name": "Werewolf Pelt"
            }
        ]
    },
    {
        "name": "Wolf",
        "rewards": [
            {
                "name": "Wolf Pelt"
            }
        ]
    },
    {
        "name": "Vampire Spawn",
        "rewards": [
            {
                "name": "Vampire Fang"
            }
        ]
    },
    {
        "name": "Young Green Dragon",
        "dc": 14,
        "rewards": [
            {
                "name": "Young Green Dragon Venom"
            }
        ]
    },
    {
        "name": "Wyvern",
        "dc": 13,
        "rewards": [
            {
                "name": "Wyvern Venom"
            }
        ]
    }
];

const HARVESETABLE_EFFECT = 
{
    "name": "Harvestable",
    "icon": "modules/stroud-dnd-helpers/images/icons/harvesting.webp",
    "origin": "",
    "duration": {
        "startTime": null,
        "seconds": null,
        "combat": null,
        "rounds": null,
        "turns": null,
        "startRound": null,
        "startTurn": null
    },
    "disabled": false,
    "changes": [],
    "description": "",
    "transfer": false,
    "statuses": [],
    "flags": {
        "dae": {
            "stackable": "multi",
            "specialDuration": [],
            "disableIncapacitated": false,
            "showIcon": true,
            "macroRepeat": "none"
        },
        "ActiveAuras": {
            "isAura": false,
            "aura": "None",
            "nameOverride": "",
            "radius": "",
            "alignment": "",
            "type": "",
            "customCheck": "",
            "ignoreSelf": false,
            "height": false,
            "hidden": false,
            "displayTemp": false,
            "hostile": false,
            "onlyOnce": false,
            "wallsBlock": "system"
        },
        "core": {
            "overlay": true
        }
    },
    "tint": null
}

export let harvesting = {
    "hooks": {
        "ready": async function _ready() {
            if (game.user.isTheGM && sdndSettings.HarvestingEnabled.getValue()) {
                Hooks.on("dnd5e.damageActor", onApplyDamage);
                Hooks.on("dnd5e.healActor", onApplyDamage);
            }
        }
    },
    "ValidateHarvestables": function _ValidatedHarvestables() {
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        for (let harvestable of HARVESTABLES) {
            resolveRewardUuids(harvestable.rewards);
        }
    },
    "HarvestSelected": foundry.utils.debounce(harvestSelected, 250)
};

async function harvestSelected() {
    let controlledActor = utility.getControlledToken()?.actor;
    if (!controlledActor || controlledActor.folder?.name != sdndSettings.ActivePlayersFolder.getValue()) {
        ui.notifications.warn("Only players can harvest!");
        return;
    }

    let targets = Array.from(game.user.targets);
    if (targets.length != 1) {
        ui.notifications.warn("Please target a single creature.");
        return;
    }
    let target = targets.pop()?.actor;
    let harvestable = getHarvestingData(target);
    if (!harvestable || target?.type != "npc") {
        ui.notifications.warn(`${target.name} is not harvestable.`);
        return;
    }
    if ((target.system?.attributes?.hp?.value ?? 0) > 0) {
        ui.notifications.warn(`${target.name} is not dead!  Gross!`);
        return;
    }
    if (await getHarvested(target)) {
        ui.notifications.warn(`${target.name} has already been harvested.`);
        return;
    }
    let confirmation = await dialog.confirmation("Confirm Harvesting", summarizeHarvestable(harvestable) +
        "<p><i>Would you like to continue?</i></p>");
    if (confirmation != "True") {
        return;
    }
    const flavor = `DC${harvestable.dc} ${dnd5e.config.skills[harvestable.skill].label} check to harvest ${harvestable.name}`;
    let result = await craftingHelpers.rollSkillCheck(controlledActor, harvestable.skill, harvestable.dc, flavor, false);
    await gmFunctions.advanceTime((harvestable.duration ?? 10) * 60)
    await setHarvested(target, controlledActor.uuid);
    if (!result.isSuccess) {
        await ChatMessage.create({
            emote: true,
            speaker: { "actor": controlledActor },
            content: `${controlledActor.name} has failed to harvest ${harvestable.name}...`
        });
        return;
    }
    let rewards = await selectRewards(harvestable);
    let summary = await createRewards(controlledActor, rewards, result.isCritical);
    await ChatMessage.create({
        emote: true,
        speaker: { "actor": controlledActor },
        content: `${(result.isCritical ? 'Critical Success! ' : '')} Result:<br/>${summary}`
    });
}

async function onApplyDamage(actor, damageAmount, options) {
    if (actor.type != 'npc') {
        return;
    }
    if (await getHarvested(actor)) {
        return;  // already harvested
    }
    let harvestingData = getHarvestingData(actor);
    if (!harvestingData) {
        return;
    }
    let currentHp = actor.system?.attributes?.hp.value ?? 0;
    await setHarvestable(actor, (currentHp <=0));
}

async function toggleEffect(actor, effect, enabled) {
    let currentEffect = actor.effects.find(e => e.name == effect.name);
    if (enabled && !currentEffect) {
        await gmFunctions.createEffects(actor.uuid, [effect]);
    }
    else if (!enabled && currentEffect) {
        await gmFunctions.removeEffects([currentEffect.uuid]);
    }
}

async function getHarvested(actor) {
    return (await actor.getFlag(sdndConstants.MODULE_ID, "Harvested")) ?? false;
}

async function setHarvested(actor) {
    await setHarvestable(actor, false);
    await gmFunctions.setFlag(actor.uuid, sdndConstants.MODULE_ID, "Harvested", true);
}

async function setHarvestable(actor, enabled) {
    await toggleEffect(actor, HARVESETABLE_EFFECT, enabled);
}

function getItemUuidFromCompendium(name) {
    let pack = game.packs.get(sdndConstants.PACKS.COMPENDIUMS.ITEM.ITEMS);
    if (!pack) {
        throw `Cannot find pack ${sdndConstants.PACKS.COMPENDIUMS.ITEM.ITEMS}`;
    }
    let item = pack.index.getName(name);
    if (!item) {
        throw `${name} does not exist in compendium ${pack.metadata.label}!`;
    }
    return item.uuid;
}

function resolveRewardUuids(rewards) {
    for (let reward of rewards) {
        reward.itemUuid = reward.itemUuid ?? getItemUuidFromCompendium(reward.name);
    }
}

function getHarvestingData(actor) {
    let harvestable = HARVESTABLES.find(h => h.name == actor?.name);
    if (!harvestable) {
        return null;
    }
    harvestable.dc = harvestable.dc ?? DEFAULTS.dc;
    harvestable.skill = harvestable.skill ?? DEFAULTS.skill;
    harvestable.duration = harvestable.duration ?? DEFAULTS.duration;
    resolveRewardUuids(harvestable.rewards);
    if (harvestable.rewards.length == 1) {
        harvestable.rewards[0].percentage = harvestable.rewards[0].percentage ?? DEFAULTS.percentage;
    }
    return harvestable;
}

async function selectRewards(harvestable) {
    if (harvestable.rewards.length == 1) {
        return harvestable.rewards[0];
    }
    // if multiple items and no percentages, then we will include them all
    if (harvestable.rewards.every((v, i, a) => !a[i].percentage)) {
        return harvestable.rewards;
    }
    // otherwise we create a rolltable to select one.
    let index = 1;
    let rollResults = {};
    for (let reward of harvestable.rewards){
        for (let i=1; i <= reward.percentage; i++) {
            rollResults[`${(index++)}`] = reward;
        }
    }
    let roll = await new Roll('1d100').evaluate();
    return rollResults[`${roll.total}`];
}

async function createRewards(controlledActor, rewards, isCritical) {
    if (!Array.isArray(rewards)) {
        rewards = [rewards];
    }
    let summaries = [];
    for (let reward of rewards) {
        let existingReward = controlledActor.items.find(i => i.flags?.core?.sourceId == reward.itemUuid);
        let count = reward.count ?? 1;
        if (isCritical ?? false) {
            count *= 2;
        }
        let summary = reward.name;
        if (count > 1) {
            summary = `${count} x ${summary}` 
        }
        summaries.push(summary);
        if (existingReward) {
            await existingReward.update({ "system": { "quantity": (existingReward.system?.quantity ?? 0) + count } });
        }
        else {
            let newHarvestable = await fromUuid(reward.itemUuid);
            let newItems = await controlledActor.createEmbeddedDocuments('Item', [newHarvestable]);
            let remainToCreate = count - 1;
            if (remainToCreate > 0) {
                let newItem = newItems[0];
                newItem.update({ "system": { "quantity": ((newItem.system?.quantity ?? 0) + remainToCreate) } })
            }
        }
    }
    return summaries.join("<br/>");
}

function summarizeHarvestable(harvestable) {
    return `<b>${harvestable.name}</b><br/>
&nbsp;&nbsp;Skill: ${dnd5e.config.skills[harvestable.skill].label}<br/>
&nbsp;&nbsp;DC: ${harvestable.dc}<br/>
&nbsp;&nbsp;Rewards: ${summarizeRewards(harvestable.rewards)}<br/>
&nbsp;&nbsp;Harvesting Time: ${harvestable.duration ?? 10} minutes
`;
}

function summarizeRewards(rewards) {
    if (!Array.isArray(rewards)) {
        rewards = [rewards];
    }
    return rewards.map(r =>`${((r.count ?? 1) > 1 ? `${r.count} x ` : '')}${r.name} (${r.percentage ?? 100}%)`).join(', ');
}