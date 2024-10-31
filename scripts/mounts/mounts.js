import { gmFunctions } from "../gm/gmFunctions.js";
import { sdndConstants } from "../constants.js";
import { tokens } from "../tokens.js";
import { utility } from "../utility/utility.js";
import { getAverageHpFormula } from "../actors/actors.js";
import { backpacks, gmDropBackpack } from "../backpacks/backpacks.js";
import { sdndSettings } from "../settings.js";
import { lockActor } from "../backpacks/backpacks.js";
import { socket } from "../module.js";

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
        },
        "stroud-dnd-helpers": {
            "effectName": "Mounted"
        }
    },
    "tint": null
};

export let mounts = {
    "isMount": function _isMount(item) {
        return item.getFlag(sdndConstants.MODULE_ID, "IsMount") || (item.type == "container" && (item.name?.toLowerCase().includes("horse") || item.img?.toLowerCase()?.includes("horse") ||
            item.system?.description?.value?.toLowerCase()?.includes("horse")));
    },
    "changeHealth": async function changeHealth(actorUuid, healthPercentage) {
        let health = (Math.ceil(healthPercentage * 100 / 5) * 5);
        if (health < 0) {
            health = 0;
        }
        let actor = await fromUuid(actorUuid);
        if (this.isMount(actor)) {
            let tokens = actor.getActiveTokens();
            if (tokens?.length > 0) {
                await tokens[0].document.update({
                    "texture": {
                        "src": (health == 0 ? 'modules/stroud-dnd-helpers/images/icons/dead_mount.webp' : actor.img)
                    }
                });
            }
        }
        let horse = getHorse(actor);
        if (!horse) {
            return;
        }
        let effect = horse.effects.find(e => e.getFlag(sdndConstants.MODULE_ID, "effectName") == "Mounted");
        if (!effect) {
            return false;
        }
        let icon = `modules/stroud-dnd-helpers/images/icons/saddle_health/saddle_health_${health < 10 ? "0" : ""}${health}.webp`;
        await horse.updateEmbeddedDocuments(ActiveEffect.name, [{ "_id": effect.id, "icon": icon }])
    },
    "toggleMount": foundry.utils.debounce(toggleMount, 250),
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
        let mountData = await createMountData(item);
        await setMountData(item, mountData);
        await item.createEmbeddedDocuments('ActiveEffect', [effect]);
        let properties = item.system?.properties;
        if (!properties.has('weightlessContents')) {
            properties.add('weightlessContents');
            await item.update({ "system.properties": (Array.from(properties)) });
        }
    },
    "applyPatches": async function _applyPatches() {
        if (!game.user?.isTheGM) {
            return;
        }
        let actors = await game.actors.filter(a => a.items.filter(i => this.isMount(i) && !getMountData(i)?.actorUuid).length > 0);
        let summary = [];
        if (actors.length > 0) {
            for (let actor of actors) {
                summary.push(`Patching mount for ${actor.name}...`);
                let mount = actor.items.find(i => this.isMount(i) && !getMountData(i)?.actorUuid);
                if (!mount) {
                    summary.push(`Couldn't find the mount!`);
                    continue;
                }
                await this.createMount(mount.uuid, getAc(mount));
                await mount.update({ "system.equipped": true });
                summary.push("Patch successful!");
            }
        }
        let items = game.items.filter(i => this.isMount(i) && !getMountData(i)?.actorUuid);
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
    },
    "buffMounts": async function _buffMounts(useMax, multiplier) {
        if (!game.user?.isGM) {
            return false;
        }
        let actors = await game.actors.filter(a => a.items.filter(i => this.isMount(i)).length > 0);
        if (actors.length > 0) {
            for (let actor of actors) {
                let mount = actor.items.find(i => this.isMount(i));
                if (!mount) {
                    console.log(`Couldn't find the mount in actor ${actor.name}!`);
                    continue;
                }
                await buffMount(mount, useMax, multiplier);
            }
        }
        let items = game.items.filter(i => this.isMount(i));
        if (items.length > 0) {
            for (let item of items) {
                await buffMount(item, useMax, multiplier);
            }
        }
        return true;
    },
    "hooks": {
        "onDamageTaken": onDamageTaken,
        "onHealed": onHealed
    },
    "getMountData": getMountData,
    "setMountData": setMountData,
    "getHorse": getHorse
};

async function onHealed(actor, changes, update, userId) {
    if (!sdndSettings.EnableHorseDamage.getValue()) {
        return;
    }
    // is this a lone horse?
    const isMount = actor.getFlag(sdndConstants.MODULE_ID, "IsMount") ?? false;
    if (!isMount) {
        return;
    }
    let mountData = getMountData(actor);
    mountData.hp.value = update?.system?.attributes?.hp?.value ?? (mountData.hp.value + changes.total);
    if (mountData.hp.value > mountData.hp.max) {
        mountData.hp.value = mountData.hp.max;
    }
    await setMountData(actor, mountData);
    await mounts.changeHealth(actor.uuid, (mountData.hp.value / mountData.hp.max));
    if (mountData.hp.value > 0) {
        let ids = getConditionIds(['dead']);
        let effectsToRemove = actor.effects.filter(e => ids.includes(e._id)).map(e => e.id);
        if (effectsToRemove && effectsToRemove.length > 0) {
            await actor.deleteEmbeddedDocuments(ActiveEffect.name, effectsToRemove);
        }
    }
}

function getConditionIds(conditions) {
    let ids = [];
    for (let condition of conditions) {
        let id = CONFIG.statusEffects.find(e => e.id == condition)?._id;
        if (id) {
            ids.push(id);
        }
    }
    return ids;
}

async function onDamageTaken(actor, changes, update, userId) {
    if (!sdndSettings.EnableHorseDamage.getValue()) {
        return;
    }
    // is this a lone horse?
    const isMount = actor.getFlag(sdndConstants.MODULE_ID, "IsMount") ?? false;
    if (isMount) {
        let isDead = await applyDamageToHorse(null, actor, changes.total);
        if (isDead) {
            changes.hp = 0;
            changes.temp = 0;
            changes.total = 0;
            await actor.update({"system.attributes.hp.value": 0});
            let currentEffects = actor.effects.map(e => e.id)
            if ((currentEffects?.length ?? 0) > 0) {
                await actor.deleteEmbeddedDocuments(ActiveEffect.name, currentEffects);
            }
            await chrisPremades?.utils.effectUtils.applyConditions(actor, ['dead', 'prone']);
        }
        return;
    }
    let horse = getHorse(actor);
    if (!horse) {
        return;
    }
    let actorTotalDamage = Math.floor(changes.total / 2);
    let horseDamage = changes.total - actorTotalDamage;
    let actorHpDiff = changes.hp - actorTotalDamage;
    if (actorHpDiff > 0) {
        changes.hp = 0;
        changes.temp += actorHpDiff;
    }
    else {
        changes.hp = actorHpDiff;
    }
    await applyDamageToHorse(actor, horse, horseDamage);
}

async function applyDamageToHorse(actor, horse, damage) {
    let mountData = getMountData(horse);
    mountData.hp.value += damage;
    if (mountData.hp.value < 0) {
        mountData.hp.value = 0;
    }
    const isDead = mountData.hp.value <= 0;
    await setMountData(horse, mountData);
    await ChatMessage.create({
        flavor: "Mount injured!",
        content: `${horse.name} has taken ${Math.abs(damage)} hp of damage ${(isDead ? " and has perished." : "")}`
    });
    await mounts.changeHealth((actor?.uuid ?? horse?.uuid), (mountData.hp.value / mountData.hp.max));
    if (!actor) {
        return isDead;
    }
    if (isDead) {
        await lockActor(actor);
        let tokenId = actor.getActiveTokens()?.pop()?.id;
        let userUuid = game.users.find(u => u.character?.uuid == actor.uuid)?.id ?? game.user.id;
        await gmDropBackpack(tokenId, horse.id, userUuid, true).then(
            function () {
                const userId = userUuid?.split(".")?.pop();
                if (!userId || !tokenId) {
                    return;
                }
                socket.executeForUsers("selectToken", [userId], tokenId);
            },
            function (err) { console.log(err.message); }
        );
        return;
    }
}

async function buffMount(mount, useMax, multiplier) {
    let mod = Number.parseFloat(multiplier);
    if (!mod) {
        mod = 1;
    }
    let mountData = getMountData(mount);
    const hp = mountData.hp;

    const rollFormula = useMax ? hp.formula.replace("d", "*") : getAverageHpFormula(hp.formula);
    let maxHp = Math.floor(eval(rollFormula));
    if (isNaN(maxHp)) {
        maxHp = hp.max;
    }
    if (mod > 0) {
        maxHp = Math.floor(maxHp * mod);
    }
    if (hp.value == maxHp) {
        return;
    }
    console.log(`Updating ${mount.name}: hp from ${hp.max} to ${maxHp}...`);
    const resetCurrent = (hp.value == hp.max);
    mountData.hp.max = maxHp;
    if (resetCurrent) {
        mountData.hp.value = maxHp;
    }
    await setMountData(mount, mountData);
}

async function createMountData(mountItem) {
    let mountActorUuid = game.packs.get("dnd5e.monsters").index.getName(mountItem.name).uuid;
    let mountActor = await fromUuid(mountActorUuid);
    let type = getType(mountItem.name);
    return {
        "type": type,
        "actorUuid": mountActorUuid,
        "ac": foundry.utils.duplicate(mountActor.system.attributes.ac),
        "hp": foundry.utils.duplicate(mountActor.system.attributes.hp)
    };
}

function getType(name) {
    switch (name) {
        case "Draft Horse":
            return "draft";
        case "Riding Horse":
            return "riding";
        case "Warhorse":
            return "war";
    }
    return "unknown";
}

async function setMountData(item, mountData) {
    await item.setFlag(sdndConstants.MODULE_ID, "MountData", mountData);
}

function getMountData(item) {
    return item.getFlag(sdndConstants.MODULE_ID, "MountData");
}

async function toggleMount() {
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
    try {
        let horse = getHorse(actor);
        if (horse) {
            await dismount(controlledToken, horse);
            return true;
        }
        // find the horse
        let horseToken = findHorseToken(actor);
        if (!horseToken) {
            ui.notifications.warn(`${actor.name} has no living mount in this scene!`);
            return false;
        }
        const distance = tokens.getDistance(controlledToken, horseToken);
        if (distance > 30) {
            let horseName = horseToken?.actor?.name?.split("(")?.shift() ?? "";
            ui.notifications.warn(`You must be within 30 feet to call ${horseName.trim()}!`);
            return false;
        }
        await lockActor(actor);
        await gmFunctions.pickupBackpack(horseToken.uuid, game.user.id);
    }
    catch (exception) {
        ui.notifications.error(exception.message);
    }
}

function getHorse(actor) {
    let horses = actor.items?.filter(i => i.getFlag(sdndConstants.MODULE_ID, "IsMount") || i.type == "container" && (i.name?.toLowerCase().includes("horse") || i.img?.toLowerCase()?.includes("horse") ||
        i.system?.description?.value?.toLowerCase()?.includes("horse")));
    if (horses.length == 1) {
        return horses[0];
    }
    return null;
}

function getAc(item) {
    const desc = item?.system?.description?.value?.toLowerCase() ?? "";

    if (desc.includes("warhorse")) {
        return 4;
    }
    else if (desc.includes("riding horse")) {
        return 2;
    }
    return 1;
}

function findHorseToken(actor) {
    return canvas.scene.tokens.find(t => t.actor?.getFlag(sdndConstants.MODULE_ID, "DroppedBy") == actor.uuid &&
        t.actor?.getFlag(sdndConstants.MODULE_ID, "IsMount") && (t.actor?.system?.attributes?.hp?.value ?? 0) > 0);
}

async function dismount(token, horse) {
    await lockActor(token.actor);
    await gmFunctions.dropBackpack(token.id, horse.id, game.user.uuid, true);
}

