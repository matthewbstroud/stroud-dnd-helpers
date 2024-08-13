import { sdndConstants } from "../constants.js";
import { gmFunctions } from "../gm/gmFunctions.js";

export let plants = {
    "RyathRootItemMacro":  ryathRootItemMacro
};

async function ryathRootItemMacro({speaker, actor, token, character, item, args}) {
    if (!actor) {
        return;
    }

    let currentTime = (new Date()).getTime();
    let lastTaken = await actor.getFlag(sdndConstants.MODULE_ID, "RyathRootLastTaken");
    if (lastTaken && ((currentTime - lastTaken) / 1000 / 60 / 60) < 24) {
        const dieRoll = await actor.rollAbilitySave(dnd5e.config.abilities.con.abbreviation, {
            targetValue: 13,
            fastForward: true,
            chatMessage: true,
            flavor: "Consuming excessive Ryath Root (Constitution Save)"
        });
    
        if (!dieRoll.options.success) {
            // add poisoned
            let poisonedEffect = JSON.parse(POISONED);
            // poisonedEffect.duration.startTime = currentTime;
            poisonedEffect.origin = item.uuid;
            await gmFunctions.createEffects(actor.uuid, [poisonedEffect]);
            await actor.setFlag(sdndConstants.MODULE_ID, "RyathRootLastTaken", currentTime);
            await ChatMessage.create({
                speaker: { alias: actor.name },
                content: `${actor.name} has taken too much Ryath Root and feels ill.`,
                type: CONST.CHAT_MESSAGE_TYPES.EMOTE
            });
            return;
        }
        
    }
    await actor.setFlag(sdndConstants.MODULE_ID, "RyathRootLastTaken", currentTime);
    await applyTempHP(actor, "2d4", "You are bolstered by Ryath Root.");
}

async function applyTempHP(target, formula, flavor) {
    let current_tempHP = target.system?.attributes?.hp?.temp;

    // Roll Temp HP
    let healRoll = new Roll(formula, target.getRollData()).evaluate({ async: false });

    healRoll.toMessage({
        user: game.user._id,
        speaker: ChatMessage._getSpeakerFromActor({actor: target}),
        flavor: flavor
    });
    // Check if new roll is higher than old temp HP
    console.log(healRoll);
    let new_tempHP = parseInt(healRoll.total);

    if (current_tempHP && current_tempHP >= new_tempHP) {
        return;
    }

    await target.update({ 'system.attributes.hp.temp': new_tempHP });
}

const POISONED = `
{
    "changes": [
      {
        "key": "flags.midi-qol.disadvantage.attack.all",
        "mode": 0,
        "value": "1",
        "priority": 0
      },
      {
        "key": "flags.midi-qol.disadvantage.ability.check.all",
        "mode": 0,
        "value": "1",
        "priority": 0
      }
    ],
    "description": "<p>- A poisoned creature has disadvantage on attack rolls and ability checks.</p>",
    "disabled": false,
    "duration": {
      "rounds": null,
      "seconds": 3600,
      "turns": null,
      "startTime": null,
      "combat": null,
      "startRound": null,
      "startTurn": null
    },
    "flags": {
      "core": {},
      "dae": {
        "stackable": "noneName",
        "specialDuration": [],
        "disableIncapacitated": false,
        "showIcon": false,
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
    "icon": "modules/${sdndConstants.MODULE_ID}/images/icons/poisoned.webp",
    "name": "Poisoned",
    "origin": null,
    "tint": null,
    "transfer": false,
    "statuses": []
  }
`