import { dialog } from "../../dialog/dialog.js";
import { gmFunctions } from "../../gm/gmFunctions.js";
import { sdndConstants } from "../../constants.js";
import { items } from "../../items/items.js";
import { tokens } from "../../tokens.js";

const twilightUtil = {
    ensureResourceLink: async function _ensureResourceLink(actor, item) {
        let channelDivinity = actor.items.getName("Channel Divinity");
        if (!channelDivinity) {
            return;
        }
        if (item.system.consume.target != channelDivinity.id) {
            await item.update({
                "system.consume": {
                    "amount": 1,
                    "target": `${channelDivinity.id}`,
                    "type": "charges"
                }
            });
        }
    },
    getDistance: function _getDistance(source, target) {
        let sourceTokens = source.getActiveTokens();
        let targetTokens = target.getActiveTokens();
        if (!sourceTokens || sourceTokens.length > 1) {
            ui.notifications.notify(`${source.name} can only have 1 active token in the scene!`);
            return 50;
        }
        if (!targetTokens || targetTokens.length > 1) {
            ui.notifications.notify(`${target.name} can only have 1 active token in the scene!`);
            return 50;
        }
        return tokens.getDistance(sourceTokens[0], targetTokens[0]);
    },
    getUserChoice: async function _createDialog(actor) {
        let buttons = [
            {
                label: "Heal Temp HP",
                value: "heal"
            }
        ];

        buttons = buttons.concat(
            actor.effects.contents
                .filter(e => e.name.match(/(charmed|feared|frightened)/gi))
                .map(e => ({ label: `Remove: ${e.name}`, value: e.uuid })));
        return await dialog.createButtonDialog(sdndConstants.FEATURES.TWILIGHT_SANCTUARY, buttons, "column");
    },
    applyTempHP: async function _applyTempHP(caster, target) {
        let current_tempHP = target.system?.attributes?.hp?.temp;

        // Roll Twilight Sanctuary temporary hit points
        let healRoll = await new Roll('1d6 + @classes.cleric.levels', caster.getRollData()).evaluate();

        healRoll.toMessage({
            user: game.user._id,
            speaker: ChatMessage._getSpeakerFromActor({actor: target}),
            flavor: "Twilight Sanctuary - Temp HP"
        });
        // Check if new roll is higher than old temp HP
        console.log(healRoll);
        let new_tempHP = parseInt(healRoll.total);

        if (current_tempHP && current_tempHP >= new_tempHP) {
            return;
        }

        await target.update({ 'system.attributes.hp.temp': new_tempHP });
    },
    removeEffect: async function _removeEffect(effectID) {
        await gmFunctions.removeEffects([effectID]);
    },
    shouldTerminate: function _shouldTerminate(caster) {
        return caster.system.attributes.hp.value <= 0 || caster.effects.contents
            .filter(e => e.name.match(/(unconscious|incapacitated)/gi)).length > 0;
    },
    removeTwilightEffects: async function _removeTwilightEffects(caster) {
        let twilightEffects = [];
        canvas.scene.tokens
            .filter(t => t.actor && t.actor.type == 'character').forEach(t => {
                let removeEffects = t.actor.effects.contents.filter(e => e.origin?.startsWith(`Actor.${caster.id}`) && e.name.match(/(twilight sanctuary|tsaura)/gi));
                twilightEffects = twilightEffects.concat(removeEffects);
            });
        if (!twilightEffects || twilightEffects.length == 0) {
            return;
        }
        await gmFunctions.removeEffects(twilightEffects.map(e => e.uuid));
    },
    itemMacro: async function _itemMacro({speaker, actor, token, character, item, args}) {
        if (args[0]?.macroPass == "preItemRoll") {
            await twilightUtil.ensureResourceLink(actor, item);
        }
        else if (args[0]?.macroPass == "postActiveEffects") {
            game.user.updateTokenTargets();
        }
    }
};

export let twilightDomain = {
    "itemMacro": twilightUtil.itemMacro,
    "turnEnd": async function _onTurnEnd(casterUuid, actorUuid) {
        if (!game.combats.active) {
            return;
        }
        let caster = await gmFunctions.getTokenOrActor(casterUuid);
        let actor = await gmFunctions.getTokenOrActor(actorUuid);
        if (!caster || !actor) {
            return;
        }
        if (twilightUtil.shouldTerminate(caster)) {
            await twilightUtil.removeTwilightEffects(caster);
            return;
        }

        if (twilightUtil.getDistance(caster, actor) > 30) {
            return;
        }

        let choice = await twilightUtil.getUserChoice(actor);
        if (!choice) {
            return;
        }
        switch (choice) {
            case "heal":
                await twilightUtil.applyTempHP(caster, actor);
                break;
            default:
                await twilightUtil.removeEffect(actor, choice);
        }
    },
    "finalTurn": async function _finalTurn(casterUuid, actorUuid, effectName) {
        if (game.combats.active) {
            // if the effect fell off in combat, no final heal
            return;
        }

        if (casterUuid == actorUuid && effectName != "TSAura"){
            return;
        }

        let caster = await gmFunctions.getTokenOrActor(casterUuid);
        if (!caster) {
            return;
        }

        let actor = await gmFunctions.getTokenOrActor(actorUuid);
        if (!actor) {
            return;
        }

        if (twilightUtil.shouldTerminate(caster)) {
            return;
        }

        if (twilightUtil.getDistance(caster, actor) > 30) {
            return;
        }

        await twilightUtil.applyTempHP(caster, actor);
    },
    "removeTwilightEffects": async function _removeTwilightEffects(casterUuid) {
        let caster = await gmFunctions.getTokenOrActor(casterUuid);
        if (!caster) {
            return;
        }

        await twilightUtil.removeTwilightEffects(caster);
    },
    "applyPatches": async function _applyPatches() {
        let actors = await game.actors.filter(a => a.items.filter(i => i.effects.filter(e => e.getFlag("effectmacro", "onDelete.script")?.includes("?.label")).length > 0).length > 0);
        if (actors.length == 0) {
            return;
        }
        let summary = [];
        let fromCompendium = await items.getItemFromCompendium(sdndConstants.PACKS.COMPENDIUMS.ITEM.FEATURES, "Channel Divinity: Twilight Sanctuary", true, null);
        if (!fromCompendium) {
            return;
        }
        for (let actor of actors) {
            summary.push(`Patching Twilight Domain on ${actor.name}...`);
            let twlightSanctuary = actor.items.find(i => i.img.includes("modules/stroud-dnd-helpers/images/icons/twilightsanctuary.webp"));
            if (!twlightSanctuary) {
                summary.push(`Couldn't find SDND Twilight Sanctuary`);
                continue;
            }
            await actor.createEmbeddedDocuments('Item', [fromCompendium]);
            await twlightSanctuary.delete();
            summary.push("Patch successful!");
        }
        if (summary.length == 0) {
            return;
        }
        ChatMessage.create({
            content: (summary.join("<br/>")),
            whisper: ChatMessage.getWhisperRecipients('GM'),
        });
    }
};




