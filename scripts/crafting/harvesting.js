import { craftingHelpers } from "./crafting.js";
import { sdndConstants } from "../constants.js";
import { dialog } from "../dialog/dialog.js";
import { utility } from "../utility/utility.js";
import { sdndSettings } from "../settings.js";

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
                "name": "Auroch's Blood",
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.S97ovCbt5PVnTU28"
            }
        ]
    },
    {
        "name": "Bear",
        "rewards": [
            {
                "name": "Bear Pelt",
                "percentage": 80,
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.bUwyCd0y904K6NCo"
            },
            {
                "name": "Bear Meat",
                "percentage": 20,
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.xqbt4fmzr1jayeDR"
            }
        ]
    },
    {
        "name": "Carrion Crawler",
        "rewards": [
            {
                "name": "Carrion Crawler Mucus",
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.WVwUgNP0FjuuJ1Bj"
            }
        ]
    },
    {
        "name": "Cave Fisher",
        "rewards": [
            {
                "name": "Cave Fisher Blood",
                'itemUuid': "Compendium.stroud-dnd-helpers.SDND-Items.Item.u51GU15mqkVwAA6f"                
            }
        ]
    },
    {
        "name": "Cyclops",
        "rewards": [
            {
                "name": "Massive Diamond",
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.7UvuGoqBRIPUu4qL"
            }
        ]
    },
    {
        "name": "Dire Wolf",
        "rewards": [
            {
                "name": "Dire Wolf Pelt",
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.gyzo4uxxzYRP7TN3"
            }
        ]
    },
    {
        "name": "Ettercap",
        "rewards": [
            {
                "name": "Cap of Ettercap Fungi",
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.TCpkXLKMlvzFXJ22"
            }
        ]
    },
    {
        "name": "Flumph",
        "rewards": [
            {
                "name": "Flumph Spray",
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.156SsvPINavk5jwf"
            }
        ]
    },
    {
        "name": "Giant Crocodile",
        "rewards": [
            {
                "name": "Crocodile Hide (Giant)",
                "percentage": 90,
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.6hUjkpLn9U81O27j"
            },
            {
                "name": "Emerald",
                "percentage": 10,
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.4lQiW1WB5cEYkill"
            }
        ]
    },
    {
        "name": "Giant Wasp",
        "rewards": [
            {
                "name": "Wasp Venom",
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.cucIFquwJ7YKN2hz"
            }
        ]
    },
    {
        "name": "Ghost",
        "rewards": [
            {
                "name": "Gold Amulet",
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.8ZknyAUfhexwMZwb"
            }
        ]
    },
    {
        "name": "Hill Giant",
        "rewards": [
            {
                "name": "Ironwood",
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.Z5EodU6dKoxw0BHN"
            }
        ]
    },
    {
        "name": "Myconid Sovereign",
        "rewards": [
            {
                "name": "Cap of Myconid Fungi",
                'itemUuid': "Compendium.stroud-dnd-helpers.SDND-Items.Item.TWvfYRld8SrAeoFG"                
            }
        ]
    },
    {
        "name": "Phase Spider",
        "rewards": [
            {
                "name": "Phase Spider Venom",
                'itemUuid': "Compendium.stroud-dnd-helpers.SDND-Items.Item.gdf3eUKVwM9P63fU"                
            }
        ]
    },
    {
        "name": "Poisonus Snake",
        "rewards": [
            {
                "name": "Snake Venom",
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.exZ9tqiwze2MQKBu"
            }
        ]
    },
    {
        "name": "Poisonus Spider",
        "rewards": [
            {
                "name": "Spider Venom",
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.eQZgBd4e3Herm4Cp"
            }
        ]
    },
    {
        "name": "Purple Worm",
        "rewards": [
            {
                "name": "Purple Worm Venom",
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.YeNaSAHhGMkQf8XG"
            }
        ]
    },
    {
        "name": "Scarecrow",
        "rewards": [
            {
                "name": "Wheat",
                "count": 2,
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.WJPNdVbyPcopj0mz"
            },
            {
                "name": "Barley",
                "count": 2,
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.1PMpSIUPiJ2mDY2y"
            }
        ]
    },
    {
        "name": "Scorpion",
        "rewards": [
            {
                "name": "Scorpion Venom",
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.NCtW2RyGBT0giBmR"
            }
        ]
    },
    {
        "name": "Werewolf",
        "rewards": [
            {
                "name": "Werewolf Pelt",
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.Bm2YOvkGwUdXFqbW"
            }
        ]
    },
    {
        "name": "Wolf",
        "rewards": [
            {
                "name": "Wolf Pelt",
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.3FkvXIKGQkBpcICX"
            }
        ]
    },
    {
        "name": "Vampire Spawn",
        "rewards": [
            {
                "name": "Vampire Fang",
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.GjBQMPPAPrUck9I2"
            }
        ]
    },
    {
        "name": "Young Green Dragon",
        "rewards": [
            {
                "name": "Young Green Dragon Venom",
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.73jd1QizuHK7AaR0"
            }
        ]
    },
    {
        "name": "Wyvern",
        "rewards": [
            {
                "name": "Wyvern Venom",
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.zsY7RkljTnOdrRFX"
            }
        ]
    },
    {
        "name": "TestWolf",
        "rewards": [
            {
                "name": "Wolf Pelt",
                "percentage": 80,
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.3FkvXIKGQkBpcICX"
            },
            {
                "name": "Wolf Tooth",
                "percentage": 15,
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.TCpkXLKMlvzFXJ22"
            },
            {
                "name": "Wolf Spleen",
                "percentage": 5,
                "itemUuid": "Compendium.stroud-dnd-helpers.SDND-Items.Item.TCpkXLKMlvzFXJ22"
            }
        ]
    }
];

export let harvesting = {
    "HarvestSelected": async function _harvestSelected() {
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
        let harvestable = await getHarvestingData(target);
        if (!harvestable) {
            ui.notifications.warn(`${target.name} is not harvestable.`);
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
        await setHarvested(target);
        const flavor = `DC${harvestable.dc} ${dnd5e.config.skills[harvestable.skill].label} check to harvest ${harvestable.name}`;
        let result = await craftingHelpers.rollSkillCheck(controlledActor, harvestable.skill, harvestable.dc, flavor, false);
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
};

async function getHarvested(actor) {
    return (await actor.getFlag(sdndConstants.MODULE_ID, "Harvested")) ?? false;
}

async function setHarvested(actor) {
    await actor.setFlag(sdndConstants.MODULE_ID, "Harvested", true);
}

function getHarvestingData(actor) {
    let harvestable = HARVESTABLES.find(h => h.name == actor?.name);
    harvestable.dc = harvestable.dc ?? DEFAULTS.dc;
    harvestable.skill = harvestable.skill ?? DEFAULTS.skill;
    harvestable.duration = harvestable.duration ?? DEFAULTS.duration;
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
    let roll = await new Roll('1d100').evaluate({ async: true });
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