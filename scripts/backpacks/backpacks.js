import { sdndConstants } from "../constants.js";
import { gmFunctions } from "../gm/gmFunctions.js";
import { sdndSettings } from "../settings.js";
import { dialog } from "../dialog/dialog.js";
import { activeEffects } from "../../active_effects/activeEffects.js";

export let backpacks = {
    "checkWeight": checkWeight,
    "dropBackpack": dropBackpack,
    "dropHandler": dropHandler,
    "interact": interact,
    "pickupBackpack": pickupBackpack,
    "transferHandler": transferHandler
}
// track createItem, deleteItem
function transferHandler(source, sourceUpdates, target, targetUpdates, interactionId) {
    if ((!sourceUpdates) || (!source.getFlag("item-piles", "data.type") || source.getFlag(sdndConstants.MODULE_ID, "PickingUp"))) {
        return true;
    }
    let primaryBackpack = source.items.find(i => i.getFlag(sdndConstants.MODULE_ID, 'DroppedBy'));
    if (sourceUpdates.itemsToDelete.includes(primaryBackpack.id)){
        ui.notifications.warn("You cannot remove the primary backpack from the pile!");
        return false;
    }
    return true;
}

function dropHandler(source, target, itemData, position) {
    if (!source.getFlag("item-piles", "data.type")) {
        return true;
    }
    if (itemData.item.flags["stroud-dnd-helpers"]?.DroppedBy) {
        ui.notifications.warn("You cannot remove the primary backpack from the pile!");
        return false;
    }
    return true;
}

async function checkWeight(actor) {
    if (!actor) {
        return;
    }
    let encumbrance = actor.system?.attributes?.encumbrance;
    if (!encumbrance) {
        return;
    }
    let effect = null;
    if (encumbrance.pct >= 75) {
        effect = activeEffects.HeavilyEncumbered;
    }
    else if (encumbrance.pct >= 50) {
        console.log("encumbered");
        effect = activeEffects.Encumbered;
    }
    let currentEffects = actor.effects?.filter(e => e.name == activeEffects.Encumbered.name || e.name == activeEffects.HeavilyEncumbered.name);
    if (!effect) {
        if (currentEffects && currentEffects.length > 0) {
            gmFunctions.removeEffects(currentEffects.map(e => e.uuid));
        }
        return;
    }
    if (currentEffects?.find(e => e.name == effect.name)) {
        return; // already applied
    }
    if (currentEffects && currentEffects.length > 0) {
        gmFunctions.removeEffects(currentEffects.map(e => e.uuid));
    }
    gmFunctions.createEffects(actor.uuid, [effect]);
}

async function interact(pileUuid) {
    let choice = await dialog.createButtonDialog("Backpack",
        [
            {
                "label": "Open",
                "value": "open"
            },
            {
                "label": "Pick up",
                "value": "pickup"
            }
        ]
        , 'column');
    if (choice == "open") {
        return true;
    }
    else if (choice == "pickup") {
        pickupBackpack(pileUuid);
    }
    return false;
}

async function dropBackpack() {
    let controlledTokens = canvas.tokens.controlled;
    if (!controlledTokens || controlledTokens.length != 1) {
        ui.notifications.error("You must select a single token!");
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
            "displayName":foundry.CONST.TOKEN_DISPLAY_MODES.HOVER,
            "lockRotation": true, 
            "height": 0.5,
            "width": 0.5,
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
    checkWeight(actor);
}

async function pickupBackpack(pileUuid) {
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
    await pile.actor.setFlag(sdndConstants.MODULE_ID, "PickingUp", true);
    let transferred = await game.itempiles.API.transferItems(backpack.actor, actor, items);
    let transferredBackpack = transferred.find(i => i.item.flags[sdndConstants.MODULE_ID]?.DroppedBy)
    let backpackId = transferredBackpack.item._id;
    await actor.setFlag(sdndConstants.MODULE_ID, "PrimaryBackpack", backpackId);
    transferred = transferred.filter(t => t.item._id != backpackId).map(t => t.item._id);
    for (const id of transferred) {
        let item = actor.items.get(id);
        if (!item) {
            continue;
        }
        await item.update({ "system.container": backpackId });
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
        content: `Has picked up their ${newBackpack.name}.`,
        type: CONST.CHAT_MESSAGE_TYPES.EMOTE
    });
    checkWeight(actor);
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
