import { gmFunctions, tokenOrActor } from "../../gm/gmFunctions.js";


export let huntersMark = {
    "itemMacro": async function _itemMacro(speaker, actor, token, character, item, args) {
        // onUse macro
        if (args[0].hitTargets.length === 0) return;
        if (args[0].tag === "OnUse") {
            const targetUuid = args[0].hitTargets[0].uuid;
            const tokenOrActor = await fromUuid(args[0].actorUuid);
            const caster = tokenOrActor.actor ? tokenOrActor.actor : tokenOrActor;

            if (!caster || !targetUuid) {
                ui.notifications.warn("Hunter's Mark: no token/target selected");
                console.error("Hunter's Mark: no token/target selected");
                return;
            }

            const effectData = {
                "label": args[0].item.name,
                "icon": args[0].item.img,
                "changes": [
                    {
                        "key": "flags.midi-qol.huntersMark",
                        "mode": CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                        "value": targetUuid,
                        "priority": 20
                    },
                    {
                        "key": "flags.dnd5e.DamageBonusMacro",
                        "mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        "value": `ItemMacro.${args[0].item.name}`,
                        "priority": 20
                    }
                ],
                "transfer": false,
                "disabled": false,
                "duration": {
                    "startTime": null,
                    "seconds": 3600,
                    "combat": null,
                    "rounds": null,
                    "turns": null,
                    "startRound": null,
                    "startTurn": null
                },
                "origin": args[0].itemUuid,
                "tint": null,
                "flags": {
                    "dae": {
                        "selfTarget": false,
                        "selfTargetAlways": true,
                        "stackable": "none",
                        "durationExpression": "",
                        "macroRepeat": "none",
                        "specialDuration": []
                    },
                    "core": {
                        "statusId": ""
                    }
                }
            };

            effectData.duration.startTime = game.time.worldTime;
            await caster.createEmbeddedDocuments("ActiveEffect", [effectData]);
        } else if (args[0].tag === "DamageBonus") {
            // only weapon attacks
            if (!["mwak", "rwak"].includes(args[0].item.data.actionType)) return {};
            const targetUuid = args[0].hitTargets[0].uuid;
            // only on the marked target
            let currentTargetUuid = args[0].actor?.document?.getFlag("midi-qol", "huntersMark") ?? args[0]?.actor.getFlag("midi-qol", "huntersMark");
            if (targetUuid !== currentTargetUuid) return {};
            const damageType = args[0].item.system.damage.parts[0][1];
            const diceMult = args[0].isCritical ? 2 : 1;
            return { damageRoll: `${diceMult}d6[${damageType}]`, flavor: "Hunters Mark Damage" };
        }
    },
    "moveMark": async function _moveMark(originID, oldTargetUuid, newTargetUuid) {
        debugger;
        let markedTarget = await tokenOrActor(oldTargetUuid);
        let priorEffect = markedTarget?.effects?.find(e => e.label == "Marked" && e.origin == originID);
        if (priorEffect) {
            await gmFunctions.removeEffects([priorEffect.uuid]);
        }
        let effectData = {
            "label": "Marked",
            "changes": [
                {
                    "key": "StatusEffectLabel",
                    "value": "Marked",
                    "mode": 0,
                    "priority": 20
                }
            ],
            "duration": {
                "seconds": 3600,
                "startTime": null,
                "combat": null,
                "rounds": null,
                "turns": null,
                "startRound": 0,
                "startTurn": 0
            },
            "tint": null,
            "transfer": false,
            "disabled": false,
            "flags": {
                "dae": {
                    "transfer": false,
                    "stackable": "none",
                    "selfTarget": false,
                    "selfTargetAlways": false,
                    "durationExpression": "",
                    "macroRepeat": "none",
                    "specialDuration": []
                },
                "ddbimporter": {
                    "disabled": false
                },
                "midi-qol": {
                    "forceCEOff": true,
                    "castData": {
                        "baseLevel": 1,
                        "castLevel": 1,
                        "itemUuid": `${originID}`
                    }
                },
                "dfreds-convenient-effects": {
                    "description": "Marked by a skilled Hunter"
                },
                "core": {
                    "statusId": ""
                },
                "ActiveAuras": {
                    "isAura": false,
                    "aura": "None",
                    "radius": "undefined",
                    "alignment": "",
                    "type": "",
                    "ignoreSelf": false,
                    "height": false,
                    "hidden": false,
                    "displayTemp": false,
                    "hostile": false,
                    "onlyOnce": false
                },
                "times-up": {
                    "isPassive": false
                }
            },
            "icon": "icons/weapons/bows/shortbow-recurve-yellow.webp",
            "origin": `${originID}`
        };
        let target = await fromUuid(newTargetUuid);
        if (!target) {
            ui.notifications.error(`Target doesn't exist!`);
            return;
        }
        await gmFunctions.createEffects(newTargetUuid, [effectData]);
    },
    "removeMarks": async function _removeMarks(caster) {
        var huntersMarkItem = caster.items.getName("Hunter's Mark");
        if (!huntersMarkItem) {
            return;
        }
        let uuids = canvas.scene.tokens
            .filter(t => t.id != caster.id)
            .map(t => t.actor.effects.contents)
            .reduce((l, r) => l.concat(r)).filter(e => e.data.origin == huntersMarkItem.uuid && e.data.label == "Marked")
            .map(e => e.uuid);
        gmFunctions.removeEffects(uuids);
    }
};