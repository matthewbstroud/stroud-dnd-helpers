import { sdndConstants } from "../../constants.js";
import { getSpellData } from "../spells.js";
export let magicMissile = {
    "castOrUse": _castOrUse,
    "itemMacro": _itemMacro
};

async function _castOrUse() {
    if (canvas.tokens.controlled.length != 1) {
        ui.notifications.notify(`Please select a single actor!`);
        return;
    }

    let targetActor = canvas.tokens.controlled[0]?.actor;
    if (!targetActor) {
        ui.notifications.notify(`Please select an actor!`);
        return;
    }

    let spellData = await getSpellData(sdndConstants.SPELLS.MAGIC_MISSILE);
    
    if (spellData.targets.length != 1) {
        ui.notifications.notify(`You must target a single creature you wish to attack!`);
        return;
    }

    var tempItem = targetActor.items.getName(sdndConstants.TEMP_ITEMS.MAGIC_DART);
    if (!tempItem) {
        let message = await spellData.item.use({
            createChatMessage: true
        });
        if (!message) {
            return;
        }
        let workflowId = message.getFlag("midi-qol", "workflowId");
        let workflow = await MidiQOL.Workflow.getWorkflow(workflowId);
        let itemLevel = workflow?.itemLevel;
        message.update({ flavor: `Missile 1 of ${2 + itemLevel}` });
        message.render();
        return;
    }

    if (tempItem.system.uses.value == 0) {
        await tempItem.delete();
        return;
    }
    let uses = tempItem.system.uses.value - 1;
    let maxUses = tempItem.system.uses.max + 1;

    let message = await tempItem.roll({
        consumeUsage: true,
        consumeQuantity: true,
        configureDialog: false,
        createChatMessage: true
    });
    message.update({ flavor: `Missile ${maxUses - uses} of ${maxUses}` });
    await message.render();
}

async function _itemMacro({speaker, actor, token, character, item, args}) {
    if (!actor) {
        ui.notifications.notify('No current actor.');
        return;
    }
    if (!actor.items.getName(sdndConstants.SPELLS.MAGIC_MISSILE)) {
        ui.notifications.notify(`${actor.name} doesn't have ${sdndConstants.SPELLS.MAGIC_MISSILE}.`);
        return;
    }

    if (!args || args.length != 1) {
        ui.notifications.error(`item macro should contain: return await stroudDnD.spells.MagicMissile.itemMacro(speaker, actor, token, character, item, args);`);
    }

    // remove any existing
    await actor.items.filter(i => i.name.startsWith(sdndConstants.TEMP_ITEMS.MAGIC_DART) && i.data.type === "consumable").forEach(i => {
        i.delete();
    });

    let damageAmount = args[0].damageTotal;
    let numberOfTargets = args[0].targets.length;
    // we only need to create darts for those not rolled immediately
    let numberOfDarts = 3 + (args[0].spellLevel - 1) - numberOfTargets;

    if (numberOfDarts == 0) {
        return;
    }

    await createDarts(damageAmount, numberOfDarts);

    function createDarts(damageAmount, numberOfDarts) {
        let darts =
        {
            "name": `${sdndConstants.TEMP_ITEMS.MAGIC_DART}`,
            "type": "consumable",
            "img": "icons/magic/fire/projectile-meteor-salvo-light-blue.webp",
            "system": {
                "description": {
                    "value": "A magic dart that always reaches the target.",
                    "chat": "",
                    "unidentified": ""
                },
                "source": "",
                "quantity": 1,
                "weight": 0,
                "price": {
                    "value": 0,
                    "denomination": "gp"
                },
                "attunement": 0,
                "equipped": false,
                "rarity": "",
                "identified": true,
                "activation": {
                    "type": "action",
                    "cost": 0,
                    "condition": ""
                },
                "duration": {
                    "value": "",
                    "units": ""
                },
                "target": {
                    "value": null,
                    "width": null,
                    "units": "",
                    "type": ""
                },
                "range": {
                    "value": 120,
                    "long": null,
                    "units": "ft"
                },
                "uses": {
                    "value": numberOfDarts,
                    "max": numberOfDarts,
                    "per": "charges",
                    "recovery": "",
                    "autoDestroy": true
                },
                "consume": {
                    "type": "",
                    "target": "",
                    "amount": null
                },
                "ability": "",
                "actionType": "other",
                "attackBonus": "",
                "chatFlavor": "",
                "critical": {
                    "threshold": null,
                    "damage": ""
                },
                "damage": {
                    "parts": [
                        [
                            `${damageAmount}`,
                            "force"
                        ]
                    ],
                    "versatile": ""
                },
                "formula": "",
                "save": {
                    "ability": "",
                    "dc": null,
                    "scaling": "spell"
                },
                "consumableType": "trinket"
            },
            "effects": [],
            "flags": {
                "midi-qol": {
                    "effectActivation": false
                },
                "midiProperties": {
                    "nodam": false,
                    "fulldam": false,
                    "halfdam": false,
                    "autoFailFriendly": false,
                    "autoSaveFriendly": false,
                    "rollOther": false,
                    "critOther": false,
                    "offHandWeapon": false,
                    "magicdam": false,
                    "magiceffect": false,
                    "concentration": false,
                    "toggleEffect": false,
                    "ignoreTotalCover": false
                },
                "ddbimporter": {
                    "ignoreIcon": true,
                    "ignoreItemImport": true,
                    "retainResourceConsumption": false
                }
            },
            "_stats": {
                "systemId": "dnd5e",
                "systemVersion": "2.1.5",
                "coreVersion": "10.291",
                "createdTime": 1682287844745,
                "modifiedTime": 1682288561861,
                "lastModifiedBy": "6yhz13iFYYklKtgA"
            }
        }
        actor.createEmbeddedDocuments('Item', [darts]);
    }

}