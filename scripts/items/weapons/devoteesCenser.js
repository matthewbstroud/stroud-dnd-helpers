import { gmFunctions } from "../../gm/gmFunctions.js";
import { sdndConstants } from "../../constants.js";
const DCI_FLAG = 'dci_last_heal_round';
const devoteesCenserUtil = {
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
    applyHeal: async function _applyHeal(caster, target) {
        let lastHealRound = target.getFlag(sdndConstants.MODULE_ID, DCI_FLAG) ?? 0;
        let round = game.combats?.active?.round ?? 0; 
        if (round <= lastHealRound) {
            return;
        }
        let current_HP = target.system?.attributes?.hp?.value ?? 0;
        let max_HP = (target.system?.attributes?.hp?.max ?? 0) + (target.system?.attributes?.hp?.tempmax ?? 0);

        if (current_HP == max_HP) {
            return;
        }

        // Roll Twilight Sanctuary temporary hit points
        let healRoll = await new Roll('1d4[heal]', caster.getRollData()).evaluate();

        healRoll.toMessage({
            user: game.user._id,
            speaker: ChatMessage._getSpeakerFromActor({actor: target}),
            flavor: "Devotee's Censer Healing Incense"
        });
        // Check if new roll is higher than old temp HP
        console.log(healRoll);
        let new_HP = current_HP + parseInt(healRoll.total);
        if (new_HP > max_HP) {
            new_HP = max_HP;
        }
        await target.update({ 'system.attributes.hp.value': new_HP });
        await target.setFlag(sdndConstants.MODULE_ID, DCI_FLAG, round);
    },
    itemMacro: async function _itemMacro({speaker, actor, token, character, item, args}) {
        if (args[0].tag === "OnUse") {
            // find the censer
            let censer = actor?.items?.find(i => i.name == "Devotee's Censer");
            if (!censer || !censer.system?.equipped || censer?.system.attunement != 2) {
                ui.notifications.warn("The Devotee's Censer must be equipped and attuned to use this!");
                return false;
            }
            return;
        }
    }
};

export let devoteesCenser = {
    "itemMacro": devoteesCenserUtil.itemMacro,
    "turnBegin": async function _onTurnBegin(casterUuid, actorUuid) {
        if (!game.combats.active) {
            return;
        }
        let caster = await gmFunctions.getTokenOrActor(casterUuid);
        let actor = await gmFunctions.getTokenOrActor(actorUuid);
        if (!caster || !actor) {
            return;
        }
        if (devoteesCenserUtil.getDistance(caster, actor) > 10) {
            return;
        }
        devoteesCenserUtil.applyHeal(caster, actor);
    },
    "removeFlags": async function _removeFlags() {
        let sceneActors = canvas.scene.tokens.filter(t => t.actor && t.actor.type == "character").map(t => t.actor);
        if (!sceneActors || sceneActors.length == 0) {
            return;
        }
        for (let actor of sceneActors) {
            actor.unsetFlag(sdndConstants.MODULE_ID, DCI_FLAG);
        }
    }
};




