import { sdndConstants } from "../../constants.js";
import { items } from "../../items/items.js";
import { numbers } from "../../utility/numbers.js";
import { gmFunctions } from "../../gm/gmFunctions.js";

const DRAINING_ATTACK = 'Draining Attack';
const DRAINED_EFFECT = 'Drained';
const DAMAGE_TYPE = "drainingAttack.damageType";
const NO_DRAIN_ON_SAVE = "drainingAttack.noDrainOnSave";
const DELAYED_DRAINED = "drainingAttack.delayedDamage";

export let drainingAttack = {
    "itemMacro": _itemMacro,
    "setSpellDamageType": function _setSpellDamageType(spellUuid, damageType) {
        let spell = fromUuidSync(spellUuid);
        spell.setFlag(sdndConstants.MODULE_ID, DAMAGE_TYPE, damageType);
    },
    "setSpellNoDrainOnSave": function _setSpellNoDrainOnSave(spellUuid, val) {
        let spell = fromUuidSync(spellUuid);
        spell.setFlag(sdndConstants.MODULE_ID, NO_DRAIN_ON_SAVE, val);
    }
};

async function _itemMacro({ speaker, actor, token, character, item, args }) {
    if (args[0].hitTargets.length == 0) return;
    if (args[0].macroPass == "preActiveEffects") {
        return await handlePreActiveEffects({ speaker, actor, token, character, item, args });
    }
    const targetTokenDocument = args[0].hitTargets[0];
    let targetActor = targetTokenDocument.actor;
    const damageTotal = calculateAppliedDamage(item, args[0]);
    const damageDelta = targetActor.system.attributes.hp.max + (targetActor.system.attributes.hp.tempmax - damageTotal);
    const delayedDamage = targetActor.getFlag(sdndConstants.MODULE_ID, DELAYED_DRAINED);
    if (damageDelta > 0) {
        if (delayedDamage) {
            await targetActor.unsetFlag(sdndConstants.MODULE_ID, DELAYED_DRAINED);
            setTimeout(function () { updateEffect(targetActor.uuid, delayedDamage); }, 1000);
        }
        return;
    }
    await ChatMessage.create({
        emote: true,
        speaker: { "actor": targetActor },
        content: `${targetActor.name} has had their hitpoints reduced to zero and perished...`
    });
    setTimeout(function () { removeEffects(targetActor.uuid); }, 1000);
}

async function updateEffect(actorUuid, delayedDamage) {
    let actor = await fromUuid(actorUuid);
    if (!delayedDamage) {
        return;
    }
    let drainedEffect = findDrainedEffect(actor);
    if (!drainedEffect) {
        return;
    }
    drainedEffect.changes[0].value = delayedDamage;
    const update =
    {
        "_id": drainedEffect._id,
        "changes": drainedEffect.changes
    };
    await actor.updateEmbeddedDocuments("ActiveEffect", [update]);
}

async function removeEffects(actorUuid) {
    let actor = await fromUuid(actorUuid);
    let currentEffects = actor.effects.filter(e => e.name == DRAINED_EFFECT || ["dnd5eunconscious", "dnd5eincapacitat"].includes(e._id)).map(e => e._id);
    await gmFunctions.removeActorEffects(actorUuid, currentEffects);
    await chrisPremades?.utils.effectUtils.applyConditions(actor, ['dead']);
}

async function handlePreActiveEffects({ speaker, actor, token, character, item, args }) {
    if (args[0].hitTargets.length == 0) return;
    const damageTotal = calculateAppliedDamage(item, args[0]);
    if (damageTotal == 0) {
        return;
    }
    const targetTokenDocument = args[0].hitTargets[0];
    if (skipDrainOnSave(item) && args[0].saveUuids?.includes(targetTokenDocument.uuid)){
        return;
    }
    let targetActor = targetTokenDocument.actor;
    let drainedEffect = findDrainedEffect(targetActor) ??
        await createDrainedEffect(item, 0);
    let hpDrained = numbers.toNumber(drainedEffect.changes[0].value);
    hpDrained -= damageTotal;
    const hpMax = targetActor.system.attributes.hp.max;
    if (Math.abs(hpDrained) > hpMax) {
        hpDrained = hpMax * -1;
    }
    if (targetActor.system.attributes.hp.value == 0) {
        await targetActor.setFlag(sdndConstants.MODULE_ID, DELAYED_DRAINED, hpDrained);
        return;
    }
    await targetActor.unsetFlag(sdndConstants.MODULE_ID, DELAYED_DRAINED);
    drainedEffect.changes[0].value = hpDrained;
    if (effectExists(targetActor, drainedEffect._id)) {
        const update =
        {
            "_id": drainedEffect._id,
            "changes": drainedEffect.changes
        };
        await targetActor.updateEmbeddedDocuments("ActiveEffect", [update]);
    }
    else {
        await targetActor.createEmbeddedDocuments("ActiveEffect", [drainedEffect]);
    }
}

function calculateAppliedDamage(item, workflowData) {
    return Math.floor(calculateAppliedDamageImp(item, workflowData));
}

function calculateAppliedDamageImp(item, workflowData) {
    let damageTotal = workflowData.damageTotal ?? 0;
    if (damageTotal == 0) {
        return damageTotal;
    }
    let damageType = item.getFlag(sdndConstants.MODULE_ID, DAMAGE_TYPE);
    if (!damageType || !workflowData.damageList || workflowData.damageList.length == 0) {
        return damageTotal;
    }
    damageTotal = workflowData.damageList[0].damageDetail.find(d => d.type == damageType)?.value ?? damageTotal;
    return damageTotal;
}

function effectExists(actor, effectId) {
    return actor?.effects?.contents?.filter(e => e._id == effectId).length > 0;
}

function findDrainedEffect(actor) {
    let drainedEffect = actor.effects
        ?.find(e => e.name == DRAINED_EFFECT);
    if (drainedEffect) {
        drainedEffect = foundry.utils.duplicate(drainedEffect);
    }
    return drainedEffect;
}

function skipDrainOnSave(item) {
    return item.getFlag(sdndConstants.MODULE_ID, NO_DRAIN_ON_SAVE) ?? false; 
}

async function createDrainedEffect(sourceAttack, hpReduction) {
    let drainingAttack = await items.getItemFromCompendium(
        sdndConstants.PACKS.COMPENDIUMS.ITEM.SPELLS,
        DRAINING_ATTACK, false, null);
    let drainedEffect = foundry.utils.duplicate(drainingAttack.effects.find(e => e.name == DRAINED_EFFECT));
    drainedEffect.origin = sourceAttack.uuid;
    drainedEffect.changes[0].value = `-${hpReduction}`;
    return drainedEffect;
}