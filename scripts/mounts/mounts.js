import { gmFunctions } from "../gm/gmFunctions.js";
import { sdndConstants } from "../constants.js";
import { tokens } from "../tokens.js";
import { utility } from "../utility/utility.js";

const MOUNTED_EFFECT = {
    "name": "Mounted",
    "changes": [
      {
        "key": "flags.midi-qol.disadvantage.attack.all",
        "mode": 0,
        "value": "1",
        "priority": 20
      },
      {
        "key": "flags.midi-qol.disadvantage.ability.check.dex",
        "mode": 0,
        "value": "1",
        "priority": 20
      },
      {
        "key": "system.attributes.ac.bonus",
        "mode": 2,
        "value": "4",
        "priority": 20
      }
    ],
    "transfer": true,
    "icon": "modules/stroud-dnd-helpers/images/icons/saddle.webp",
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
    "description": "",
    "origin": null,
    "statuses": [],
    "flags": {
      "dae": {
        "disableCondition": "",
        "disableIncapacitated": false,
        "stackable": "noneName",
        "showIcon": true,
        "durationExpression": "",
        "macroRepeat": "none",
        "specialDuration": []
      },
      "core": {
        "overlay": false
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

export let mounts = {
    "isMount": function _isMount(item) {
        return item.getFlag(sdndConstants.MODULE_ID, "IsMount") || (item.type == "container" && (item.name?.toLowerCase().includes("horse") || item.img?.toLowerCase()?.includes("horse") ||
            item.system?.description?.value?.toLowerCase()?.includes("horse")));
    },
    "toggleMount": async function _targetMount() {
        let controlledToken = utility.getControlledToken();
        if (!controlledToken?.actor) {
            return;
        }
        else if (controlledToken.actor.getFlag(sdndConstants.MODULE_ID, "DroppedBy")) {
            return;
        }
        if (!controlledToken?.actor?.ownership[game.user.id] == foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
            ui.notifications.warn("You can only handle your own mount!");
            return;
        }
        let actor = controlledToken.actor;
        let horse = getHorse(actor);
        if (horse) {
            await dismount(controlledToken.id, horse.id);
            return true;
        }
        // find the horse
        let horseToken = findHorseToken(actor);
        if (!horseToken) {
            ui.notifications.warn(`${actor.name} has no owned mount in this scene!`);
            return false;
        }
        const distance = tokens.getDistance(controlledToken, horseToken);
        if (distance > 30) {
            let horseName = horseToken?.actor?.name?.split("(")?.shift() ?? "";
            ui.notifications.warn(`You must be within 30 feet to call ${horseName.trim()}!`);
            return false;
        }
        await gmFunctions.pickupBackpack(horseToken.uuid);
    },
    "createMount": async function _createMount(itemUuid, ac) {
        if (!game.user?.isTheGM) {
            return;
        }
        let item = await fromUuid(itemUuid);
        if (!item || item.type != "container") {
            console.log(`${itemUuid} cannot be turned into a mount!`);
            return false;
        } 
        ac ??= getAc(item);
        let existingEffect = item.effects.find(e => e.name == "Mounted");
        if (existingEffect) {
            await existingEffect.delete();
        }
        let effect = structuredClone(MOUNTED_EFFECT);
        effect.origin = itemUuid;
        if (ac != 4) {
            let acMod = effect.changes.find(c => c.key == "system.attributes.ac.bonus");
            if (acMod) {
                acMod.value = ac;
            }
        }
        await item.setFlag(sdndConstants.MODULE_ID, "IsMount", true);
        await item.createEmbeddedDocuments('ActiveEffect', [effect]);
        let properties = item.system?.properties;
        if (!properties.has('weightlessContents')) {
            properties.add('weightlessContents');
            await item.update( { "system.properties": (Array.from(properties)) });
        }
    },
    "applyPatches": async function _applyPatches() {
        if (!game.user?.isTheGM) {
            return;
        }
        let actors = await game.actors.filter(a => a.items.filter(i => this.isMount(i) && !i.effects.find(e => e.name == "Mounted")).length > 0);
        let summary = [];
        if (actors.length > 0) {
            for (let actor of actors) {
                summary.push(`Patching mount for ${actor.name}...`);
                let mount = actor.items.find(i => this.isMount(i));
                if (!mount) {
                    summary.push(`Couldn't find the mount!`);
                    continue;
                }
                await this.createMount(mount.uuid, getAc(mount));
                await mount.update({ "system.equipped": true });
                summary.push("Patch successful!");
            }
        }
        let items = game.items.filter(i => this.isMount(i) && !i.effects.find(e => e.name == "Mounted"));
        if (items.length > 0) {
            for (let item of items) {
                summary.push(`Patching item ${item.name}...`);
                await this.createMount(item.uuid, getAc(item));
                summary.push("Patch successful!");
            }
        }
        if (summary.length == 0) {
            return false;
        }
        await ChatMessage.create({
            content: (summary.join("<br/>")),
            whisper: ChatMessage.getWhisperRecipients('GM'),
        });
        return true;
    }
};

function getHorse(actor) {
    let horses = actor.items?.filter(i => i.type == "container" && (i.name?.toLowerCase().includes("horse") || i.img?.toLowerCase()?.includes("horse") ||
        i.system?.description?.value?.toLowerCase()?.includes("horse")));
    if (horses.length == 1) {
        return horses[0];
    }
    return null;
}

function getAc(item) {
    const desc = item?.system?.description?.value?.toLowerCase() ?? "";

    if (desc.includes("warhorse")) {
        return 6;
    }
    else if (desc.includes("riding horse")) {
        return 4;
    }
    return 2;
}

function findHorseToken(actor) {
    return canvas.scene.tokens.find(t => t.actor?.getFlag(sdndConstants.MODULE_ID, "DroppedBy", actor.uuid) &&
        t.actor?.getFlag(sdndConstants.MODULE_ID, "IsMount"));
}

async function dismount(tokenId, horseId) {
    await gmFunctions.dropBackpack(tokenId, horseId, game.user.uuid, true);
}

