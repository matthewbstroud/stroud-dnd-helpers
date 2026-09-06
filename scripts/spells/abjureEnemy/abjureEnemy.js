import { sdndConstants } from "../../constants.js";

/**
 * Channel Divinity: Abjure Enemy automation for Midi-QOL
 */
export let abjureEnemy = {
    "itemMacro": _itemMacro
};

async function _itemMacro(options) {
    const context = options?.args?.[0] ?? options;
    const macroPass = context?.macroPass;

    if (macroPass === "preSave") {
        await handlePreSave(context);
    } else if (macroPass === "postActiveEffects" || macroPass === "postSave") {
        await handlePostSave(context);
    }
}

function getTargets(context) {
    if (!context) return [];
    const raw = context.targets ?? context.hitTargets ?? context.targetTokens ?? context.workflow?.targets ?? context.workflow?.hitTargets;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (raw instanceof Set) return Array.from(raw);
    if (typeof raw.values === "function") return Array.from(raw.values());
    if (typeof raw.contents !== "undefined") return raw.contents;
    return [];
}

function getFirstTarget(context) {
    const targets = getTargets(context);
    return targets.length > 0 ? targets[0] : null;
}

function getActorFromTarget(target) {
    if (!target) return null;
    if (target instanceof Actor) return target;
    return target.actor ?? (target.document?.actor ?? null);
}

function isImmuneToFrightened(targetActor) {
    if (!targetActor) return false;
    const ci = targetActor.system?.traits?.ci?.value;
    const isImmuneInCi = (ci instanceof Set ? ci.has("frightened") : Array.isArray(ci) ? ci.includes("frightened") : false);
    const isImmuneCustom = (targetActor.system?.traits?.ci?.custom || "").toLowerCase().includes("frightened");
    return isImmuneInCi || isImmuneCustom;
}

function isFiendOrUndead(targetActor) {
    if (!targetActor) return false;
    const typeValue = (typeof targetActor.system?.details?.type?.value === "string" ? targetActor.system.details.type.value : "") || "";
    const typeCustom = (typeof targetActor.system?.details?.type?.custom === "string" ? targetActor.system.details.type.custom : "") || "";
    const race = (typeof targetActor.system?.details?.race === "string"
        ? targetActor.system.details.race
        : (targetActor.system?.details?.race?.name || targetActor.system?.details?.race?.identifier || "")) || "";
    const combined = `${typeValue} ${typeCustom} ${race}`.toLowerCase();
    return combined.includes("fiend") || combined.includes("undead");
}

/**
 * Checks condition immunity to frightened and grants disadvantage to fiends/undead before save rolls.
 */
async function handlePreSave(context) {
    const workflow = context.workflow ?? context;
    if (!workflow) return;

    const targets = getTargets(context);
    if (!targets.length) return;

    // Register a temporary hook on midi-qol.preTargetSave to inject disadvantage for Fiends/Undead
    const hookId = Hooks.on("midi-qol.preTargetSave", (targetToken, wf, saveDetails) => {
        if (wf?.id === workflow.id) {
            const actor = getActorFromTarget(targetToken);
            if (isFiendOrUndead(actor)) {
                saveDetails.disadvantage = true;
            }
        }
    });

    const cleanup = () => {
        Hooks.off("midi-qol.preTargetSave", hookId);
        Hooks.off("midi-qol.postCheckSaves", cleanup);
        Hooks.off("midi-qol.RollComplete", cleanup);
    };
    Hooks.once("midi-qol.postCheckSaves", cleanup);
    Hooks.once("midi-qol.RollComplete", cleanup);

    // Check frightened condition immunity on targets
    let immuneCount = 0;
    for (const target of targets) {
        const targetActor = getActorFromTarget(target);
        if (isImmuneToFrightened(targetActor)) {
            immuneCount++;
            ui.notifications.info(`${targetActor.name} is immune to being frightened! Abjure Enemy has no effect.`);
            if (workflow.targets instanceof Set) {
                workflow.targets.delete(target);
            } else if (Array.isArray(workflow.targets)) {
                workflow.targets = workflow.targets.filter(t => t !== target && t.id !== target.id);
            }
            if (workflow.hitTargets instanceof Set) {
                workflow.hitTargets.delete(target);
            } else if (Array.isArray(workflow.hitTargets)) {
                workflow.hitTargets = workflow.hitTargets.filter(t => t !== target && t.id !== target.id);
            }
        }
    }

    if (immuneCount > 0 && targets.length === immuneCount) {
        workflow.aborted = true;
    }
}

/**
 * Applies custom ActiveEffects based on save result (Fail vs Success).
 */
async function handlePostSave(context) {
    const targetToken = getFirstTarget(context);
    if (!targetToken) return;

    const targetActor = getActorFromTarget(targetToken);
    if (!targetActor) return;

    if (isImmuneToFrightened(targetActor)) {
        return;
    }

    const failedSaves = context.failedSaves
        ? (context.failedSaves instanceof Set
            ? Array.from(context.failedSaves)
            : Array.isArray(context.failedSaves)
                ? context.failedSaves
                : Array.from(context.failedSaves.values?.() ?? []))
        : [];

    const isFailed = failedSaves.some(t => {
        const a = getActorFromTarget(t);
        const tId = t.id ?? t._id ?? t.document?.id;
        const targetTokenId = targetToken.id ?? targetToken._id ?? targetToken.document?.id;
        return (a && a.id === targetActor.id) || (tId && tId === targetTokenId);
    });

    // Duration: 1 minute (60 seconds, 10 rounds)
    const duration = {
        seconds: 60,
        rounds: 10
    };

    const origin = context.item?.uuid ?? context.workflow?.item?.uuid ?? null;
    const itemImg = context.item?.img ?? context.workflow?.item?.img ?? "icons/magic/holy/prayer-hands-glowing-yellow.webp";

    if (isFailed) {
        // Failed save: Frightened for 1 minute or until takes damage; speed becomes 0.
        const effectData = {
            name: "Abjure Enemy: Frightened",
            icon: itemImg,
            img: itemImg,
            origin: origin,
            duration: duration,
            statuses: ["frightened"],
            changes: [
                {
                    key: "system.attributes.movement.walk",
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: "0",
                    priority: 50
                },
                {
                    key: "system.attributes.movement.fly",
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: "0",
                    priority: 50
                },
                {
                    key: "system.attributes.movement.swim",
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: "0",
                    priority: 50
                },
                {
                    key: "system.attributes.movement.climb",
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: "0",
                    priority: 50
                },
                {
                    key: "system.attributes.movement.burrow",
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: "0",
                    priority: 50
                },
                {
                    key: "system.attributes.movement.all",
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: "0",
                    priority: 50
                }
            ],
            flags: {
                dae: {
                    specialDuration: ["isDamaged"],
                    stackable: "noneName"
                }
            }
        };

        await targetActor.createEmbeddedDocuments("ActiveEffect", [effectData]);
    } else {
        // Successful save: Speed is halved for 1 minute or until takes damage.
        const effectData = {
            name: "Abjure Enemy: Halved Speed",
            icon: itemImg,
            img: itemImg,
            origin: origin,
            duration: duration,
            changes: [
                {
                    key: "system.attributes.movement.walk",
                    mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
                    value: "0.5",
                    priority: 50
                },
                {
                    key: "system.attributes.movement.fly",
                    mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
                    value: "0.5",
                    priority: 50
                },
                {
                    key: "system.attributes.movement.swim",
                    mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
                    value: "0.5",
                    priority: 50
                },
                {
                    key: "system.attributes.movement.climb",
                    mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
                    value: "0.5",
                    priority: 50
                },
                {
                    key: "system.attributes.movement.burrow",
                    mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
                    value: "0.5",
                    priority: 50
                },
                {
                    key: "system.attributes.movement.all",
                    mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
                    value: "0.5",
                    priority: 50
                }
            ],
            flags: {
                dae: {
                    specialDuration: ["isDamaged"],
                    stackable: "noneName"
                }
            }
        };

        await targetActor.createEmbeddedDocuments("ActiveEffect", [effectData]);
    }
}
