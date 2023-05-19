import { dialog } from "../../dialog/dialog.js";
import { gmFunctions } from "../../gm/gmFunctions.js";
import { sdndConstants } from "../../constants.js";

export let twilightDomain = {
    "turnEnd": async function _onTurnEnd(casterUuid, actorUuid){
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
        switch(choice) {
            case "heal":
                await twilightUtil.applyTempHP(caster, actor);
                break;
            default:
                await twilightUtil.removeEffect(actor, choice);
        }
    },
    "finalTurn": async function _finalTurn(casterUuid, actorUuid){
        if (game.combats.active) {
            // if the effect fell off in combat, no final heal
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
    }
};


const twilightUtil = {
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
        let distance = canvas.dimensions.distance;
        return distance * Math.round(canvas.grid.measureDistance(sourceTokens[0].center, targetTokens[0].center) / distance);
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
                .filter(e => e.label.match(/(charmed|feared|frightened)/gi))
                .map(e => ({ label: `Remove: ${e.label}`, value: e.uuid })));
        return await dialog.createButtonDialog(sdndConstants.FEATURES.TWILIGHT_SANCTUARY, buttons, "column");
    },
    applyTempHP: async function _applyTempHP(caster, target){
        let current_tempHP = target.system?.attributes?.hp?.temp;
    
        // Roll Twilight Sanctuary temporary hit points
        let healRoll = new Roll('1d6 + @classes.cleric.levels', caster.getRollData()).evaluate({ async: false });
    
        healRoll.toMessage({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
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
                    .filter(e => e.label.match(/(unconscious|incapacitated)/gi)).length > 0;
    },
    removeTwilightEffects: async function _removeTwilightEffects(caster) {
        let twilightEffects = [];
        canvas.scene.tokens
            .filter(t => t.actor && t.actor.type == 'character').forEach(t => {
                let removeEffects = t.actor.effects.contents.filter(e => e.origin?.startsWith(`Actor.${caster.id}`) && e.label.match(/(twilight sanctuary \(sdnd\)|tsaura)/gi));
                twilightEffects = twilightEffects.concat(removeEffects);
            });
        if (!twilightEffects || twilightEffects.length == 0){
            return;
        }
        await gmFunctions.removeEffects(twilightEffects.map(e => e.uuid));
    }
};