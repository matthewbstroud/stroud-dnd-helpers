import { sdndConstants } from "../constants.js";
import { gmFunctions } from "../gm/gmFunctions.js";
import { sdndSettings } from "../settings.js";

export let backpacks = {
    "dropBackpack": dropBackpack,
    "pickupBackpack": pickupBackpack
}

async function dropBackpack() {
    let controlledTokens = canvas.tokens.controlled;
    if (!controlledTokens || controlledTokens.length != 1) {
        ui.error("You must select a single token!");
        return;
    }
    let controlledToken = controlledTokens[0];
    let actor = controlledToken.actor;
    if (!actor) {
        ui.notifications.warn("Selected token has no associated actor!");
        return;
    }
    let backpackId = actor.getFlag(sdndConstants.MODULE_ID, "PrimaryBackpack");
    if (!backpackId) {
        ui.notifications.warn("You have no primary backpack selected!");
        return;
    }
    let backpack = actor.items.get(backpackId);
    if (!backpack) {
        ui.notifications.error("The backpack marked as primary no longer exists on this actor!");
        actor.setFlag(sdndConstants.MODULE_ID, "PrimaryBackpack", null);
        return;
    }
    let backpackName = `${backpack.name} (${actor.name})`;
    let pileOptions = {
        "sceneId": `${canvas.scene.id}`,
        "tokenOverrides": {
            "name": backpackName,
            "texture": {
                "src": backpack.img
            }
        },
        "actorOverrides": {
            "name": backpackName
        },
        "position": {
            "x": controlledToken.x,
            "y": controlledToken.y
        },
        "createActor": true,
        "itemPileFlags": {
            "enabled": true,
            "type": "vault",
            "distance": 1,
            "macro": `Compendium.${sdndConstants.PACKS.COMPENDIUMS.MACRO.GM}.GMPickupBackpack`,
            "deleteWhenEmpty": true,
            "canStackItems": "yes",
            "canInspectItems": true,
            "displayItemTypes": false,
            "description": "",
            "overrideItemFilters": false,
            "overrideCurrencies": false,
            "overrideSecondaryCurrencies": false,
            "requiredItemProperties": [],
            "displayOne": false,
            "showItemName": false,
            "cols": 10,
            "rows": 5,
            "restrictVaultAccess": true,
            "vaultAccess": [
                {
                    "uuid": game.user.uuid,
                    "view": true,
                    "organize": false,
                    "items": {
                        "withdraw": true,
                        "deposit": true
                    },
                    "currencies": {
                        "withdraw": true,
                        "deposit": true
                    }
                }
            ]
        }
    }
    let result = await game.itempiles.API.createItemPile(pileOptions);
    let backpackToken = await fromUuid(result.tokenUuid);
    let items = actor.items.filter(i => i?.system?.container == backpack.id);
    items.unshift(backpack);
    let transferred = await game.itempiles.API.transferItems(controlledToken, backpackToken, items);
    if (transferred && transferred.length > 0) {
        let newBackpackID = transferred[0].item._id;
        let newBackpack = backpackToken?.actor?.items.get(newBackpackID);
        newBackpack.setFlag(sdndConstants.MODULE_ID, "DroppedBy", actor.uuid);
    }
    ChatMessage.create({
        speaker: { alias: actor.name },
        content: `Has dropped ${backpack.name} on the ground.`,
        type: CONST.CHAT_MESSAGE_TYPES.EMOTE
    });
}

async function pickupBackpack(pileUuid) {
    debugger;
    let pile = await fromUuid(pileUuid);
    if (!pile) {
        ui.notifications.error(`Couldn't find container with id ${pileUuid}`);
        return;
    }
    let backpack = pile.actor.items.filter(i => i.getFlag("stroud-dnd-helpers", "DroppedBy"));
    if (!backpack || backpack.length != 1) {
        ui.notifications.error("unexpected error resolving backpack!");
        return;
    }
    backpack = backpack[0];
    let actorUuId = backpack.getFlag(sdndConstants.MODULE_ID, "DroppedBy");
    let actor = await fromUuid(actorUuId);
    let items = backpack.actor.items;
    let transferred = await game.itempiles.API.transferItems(backpack.actor, actor, items);
    let backpackId = transferred[0].item._id;
    actor.setFlag(sdndConstants.MODULE_ID, "PrimaryBackpack", backpackId);
    for (let i=1; i < transferred.length; i++) {
        let item = actor.items.get(transferred[i].item._id);
        if (!item) {
            continue;
        }
        await item.update({"system.container": backpackId });
    }
    let pileActorId = pile.actor.id;
    await pile.delete();
    let pileActor = await game.actors.get(pileActorId);
    if (!pileActor) {
        return;
    }
    await pileActor.delete();
    let newBackpack = actor.items.get(backpackId);
    ChatMessage.create({
        speaker: { alias: actor.name },
        content: `Has picked up their ${ newBackpack.name }.`,
        type: CONST.CHAT_MESSAGE_TYPES.EMOTE
    });
}

export function createBackpackHeaderButton(config, buttons) {
    if (config.object instanceof Item) {
        var item = config.object;
        if (item.type != "container") {
            return;
        }
        var actor = item.parent;
        if (!actor instanceof dnd5e.documents.Actor5e) {
            return;
        }
        var primaryBackpackId = actor.getFlag(sdndConstants.MODULE_ID, "PrimaryBackpack");
        if (primaryBackpackId && actor.items.get(primaryBackpackId)) {
            buttons.unshift({
                class: 'stroudDnD',
                icon: 'fa-solid fa-star',
                label: label,
                onclick: () => {
                    ui.notifications.notify(`${item.name} is your primary container.`);
                }
            });
            return;
        }
        var label = sdndSettings.HideTextOnActorSheet.getValue() ? '' : 'SDND';
        buttons.unshift({
            class: 'stroudDnD',
            icon: 'fa-solid fa-dungeon',
            label: label,
            onclick: () => {
                actor.setFlag(sdndConstants.MODULE_ID, "PrimaryBackpack", item.id);
                ui.notifications.notify(`${item.name} is your primary container.`);
            }
        });
    }
}

/*
let options = {
    "sceneId": `${canvas.scene.id}`,
    "tokenOverrides": {
        "name": "Stone's Rucksack",
            "texture": {
                "src": "modules/stroud-dnd-helpers/images/icons/ruck_sack.webp"
            }
    },
    "actorOverrides": {
        "name": "Stone's Rucksack"
    },
    "position": {
        "x": canvas.tokens.controlled[0].x,
        "y": canvas.tokens.controlled[0].y,
        "rotation": canvas.tokens.controlled[0].rotation
    },
    "createActor": false,
    "itemPileFlags": defaults
}
let result = await game.itempiles.API.createItemPile(options)
let targetToken = await fromUuid(result.tokenUuid)

*/

var defaults = {
    "enabled": true,
    "type": "vault",
    "distance": 1,
    "macro": "ReturnFalse",
    "deleteWhenEmpty": true,
    "canStackItems": "yes",
    "canInspectItems": true,
    "displayItemTypes": false,
    "description": "",
    "overrideItemFilters": false,
    "overrideCurrencies": false,
    "overrideSecondaryCurrencies": false,
    "requiredItemProperties": [],
    "displayOne": false,
    "showItemName": false,
    "cols": 10,
    "rows": 5,
    "restrictVaultAccess": true,
    "vaultAccess": [
        {
            "uuid": "User.2o6fMFw0qQuhf5nV",
            "view": true,
            "organize": false,
            "items": {
                "withdraw": true,
                "deposit": true
            },
            "currencies": {
                "withdraw": true,
                "deposit": true
            }
        }
    ]
}