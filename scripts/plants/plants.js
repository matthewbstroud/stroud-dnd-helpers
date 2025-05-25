import { sdndConstants } from "../constants.js";
import { gmFunctions } from "../gm/gmFunctions.js";
import { items } from "../items/items.js";

export let plants = {
  "BlightIcorItemMacro": blightIcorItemMacro,
  "RyathRootItemMacro": ryathRootItemMacro
};

async function blightIcorItemMacro({ speaker, actor, token, character, item, args }) {
  if (!actor) {
    return;
  }
  let compendiumUuid = items.getItemUuid(sdndConstants.PACKS.COMPENDIUMS.ITEM.ITEMS, "Blight Icor");
  let currentTime = game.time.worldTime;
  let lastTaken = await actor.getFlag(sdndConstants.MODULE_ID, "BlightIcorLastTaken");
  if (lastTaken && ((currentTime - lastTaken) / 60 / 60) < 24) {
    const dieRoll = await actor.rollAbilitySave(dnd5e.config.abilities.con.abbreviation, {
      targetValue: 15,
      fastForward: true,
      chatMessage: true,
      flavor: "Consuming excessive Blight Icor (Constitution Save)"
    });

    if (!dieRoll.options.success) {
      // add poisoned
      let poisonedEffect = JSON.parse(POISONED);
      let poisonedDurationMultiplier = await new Roll(`1d6`).evaluate();
      poisonedEffect.duration.seconds = poisonedDurationMultiplier.total * 3600;
      poisonedEffect.origin = compendiumUuid;
      await gmFunctions.createEffects(actor.uuid, [poisonedEffect]);
      await actor.setFlag(sdndConstants.MODULE_ID, "BlightIcorLastTaken", currentTime);
      await ChatMessage.create({
        speaker: { alias: actor.name },
        content: `${actor.name} has eaten too much Blight Icor and feels ill.`,
        type: CONST.CHAT_MESSAGE_TYPES.EMOTE
      });
      return;
    }

  }
  await actor.setFlag(sdndConstants.MODULE_ID, "BlightIcorLastTaken", currentTime);
  let type = actor.system?.details?.type?.value;
  let effect = JSON.parse(type == "undead" ? BLIGHT_ICOR_UNDEAD : BLIGHT_ICOR);
  effect.origin = compendiumUuid;
  await gmFunctions.createEffects(actor.uuid, [effect]);
  await ChatMessage.create({
    speaker: {
      actor: actor._id
    },
    type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
    content: `${actor.name} eats some Blight Icor...  Yuck.`
  });
}

async function ryathRootItemMacro({ speaker, actor, token, character, item, args }) {
  if (!actor) {
    return;
  }
  let currentTime = game.time.worldTime;
  let lastTaken = await actor.getFlag(sdndConstants.MODULE_ID, "RyathRootLastTaken");
  if (lastTaken && ((currentTime - lastTaken) / 60 / 60) < 24) {
    const dieRoll = await actor.rollAbilitySave(dnd5e.config.abilities.con.abbreviation, {
      targetValue: 13,
      fastForward: true,
      chatMessage: true,
      flavor: "Consuming excessive Ryath Root (Constitution Save)"
    });

    if (!dieRoll.options.success) {
      // add poisoned
      let poisonedEffect = JSON.parse(POISONED);
      let ryathRootUuid = items.getItemUuid(sdndConstants.PACKS.COMPENDIUMS.ITEM.ITEMS, "Ryath Root");
      poisonedEffect.origin = ryathRootUuid;
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
  let healRoll = await new Roll(formula, target.getRollData()).evaluate();

  healRoll.toMessage({
    user: game.user._id,
    speaker: ChatMessage._getSpeakerFromActor({ actor: target }),
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
  "name": "Poisoned",
  "icon": "modules/${sdndConstants.MODULE_ID}/images/icons/poisoned.webp",
  "origin": null,
  "duration": {
    "rounds": null,
    "startTime": null,
    "seconds": 3600,
    "combat": null,
    "turns": null,
    "startRound": null,
    "startTurn": null
  },
  "disabled": false,
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
  "transfer": false,
  "statuses": [],
  "flags": {
    "dae": {
      "disableIncapacitated": false,
      "stackable": "noneName",
      "showIcon": false,
      "durationExpression": "",
      "macroRepeat": "none",
      "specialDuration": [],
      "selfTarget": false,
      "selfTargetAlways": false,
      "dontApply": false
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
}
`;

const BLIGHT_ICOR = `
{
  "name": "Blight Icor",
  "icon": "modules/stroud-dnd-helpers/images/items/crafting_ingredient.webp",
  "origin": null,
  "duration": {
    "rounds": null,
    "startTime": null,
    "seconds": 3600,
    "combat": null,
    "turns": null,
    "startRound": null,
    "startTurn": null
  },
  "disabled": false,
  "changes": [
    {
      "key": "flags.midi-qol.advantage.ability.check.int",
      "mode": 0,
      "value": "1",
      "priority": 20
    },
    {
      "key": "flags.midi-qol.advantage.ability.check.wis",
      "mode": 0,
      "value": "1",
      "priority": 20
    },
    {
      "key": "system.traits.dv.value",
      "mode": 0,
      "value": "psychic",
      "priority": 20
    }
  ],
  "description": "You feel smart, but nervous...",
  "transfer": false,
  "statuses": [],
  "flags": {
    "dae": {
      "disableIncapacitated": false,
      "stackable": "noneName",
      "showIcon": false,
      "durationExpression": "",
      "macroRepeat": "none",
      "specialDuration": [],
      "selfTarget": false,
      "selfTargetAlways": false,
      "dontApply": false
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
}`;

const BLIGHT_ICOR_UNDEAD = `
{
  "name": "Blight Icor (Undead)",
  "icon": "modules/stroud-dnd-helpers/images/items/crafting_ingredient.webp",
  "origin": null,
  "duration": {
    "rounds": 1,
    "startTime": null,
    "seconds": 3600,
    "combat": null,
    "turns": null,
    "startRound": null,
    "startTurn": null
  },
  "disabled": false,
  "changes": [
    {
      "key": "flags.midi-qol.advantage.ability.check.dex",
      "mode": 0,
      "value": "1",
      "priority": 20
    },
    {
      "key": "system.traits.ci.value",
      "mode": 2,
      "value": "frightened",
      "priority": 20
    }
  ],
  "description": "You feel very agile, for a dead guy.",
  "transfer": false,
  "statuses": [],
  "flags": {
    "dae": {
      "disableIncapacitated": false,
      "selfTarget": false,
      "selfTargetAlways": false,
      "dontApply": false,
      "stackable": "noneName",
      "showIcon": false,
      "durationExpression": "",
      "macroRepeat": "none",
      "specialDuration": []
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
}`;
