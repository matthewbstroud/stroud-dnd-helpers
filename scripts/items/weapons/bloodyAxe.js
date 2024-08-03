import { sdndConstants } from "../../constants.js";
import { gmFunctions } from "../../gm/gmFunctions.js";
export let bloodyAxe = {
    "onDamageTaken": onDamageTaken
}
async function onDamageTaken(actor, changes, update, userId) {
    if (!actor) {
        return;
    }
    if (actor.effects?.find(e => e.name == "Berserk")) {
        return; // already gone berserk
    }
    let axe = actor.items?.find(i => i.flags[sdndConstants.MODULE_ID]?.name == "bloody axe" || i.name == "Bloody Axe");
    if (!axe || !axe.system?.equipped) {
        return;
    }
    const dieRoll = await actor.rollAbilitySave(dnd5e.config.abilities.wis.abbreviation, {
        targetValue: 15,
        fastForward: true,
        chatMessage: false
    });

    if (!dieRoll.options.success) {
        await gmFunctions.createEffects(actor.uuid, [createBerserkEffect(axe.uuid)]);
        await ChatMessage.create({
            emote: true,
            speaker: { "actor": actor },
            content: `A strange look comes over ${actor.name}...`
        });
    }

}

function createBerserkEffect(itemUuid) {
    return {
        "name": "Berserk",
        "icon": "modules/stroud-dnd-helpers/images/icons/berserker.webp",
        "changes": [],
        "disabled": false,
        "duration": {
            "startTime": null,
            "seconds": null,
            "combat": null,
            "rounds": null,
            "turns": null,
            "startRound": null,
            "startTurn": null
        },
        "description": `While berserk, you must use your action each round to attack the creature nearest to you with the axe. 
        If you can make extra attacks as part of the Attack action, you use those extra attacks, moving to attack the next nearest creature after you fell your current target. 
        If you have multiple possible targets, you attack one at random. You are berserk until you start your turn with no creatures within 60 feet of you that you can see or hear.`,
        "origin": itemUuid,
        "transfer": false,
        "statuses": [],
        "flags": {
            "dae": {
                "stackable": "noneName",
                "specialDuration": [
                    "zeroHP"
                ],
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
            }
        },
        "tint": null
    };
}