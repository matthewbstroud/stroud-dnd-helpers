import { sdndConstants } from "../constants.js";
import { gmFunctions } from "../gm/gmFunctions.js";
import { sdndSettings } from "../settings.js";
import { dialog } from "../dialog/dialog.js";
import { activeEffects } from "../../active_effects/activeEffects.js";
import { utility } from "../utility/utility.js";
import { socket } from "../module.js";

const nonItems = [
    "race","background","class","subclass","spell","feat"
];

let inProgress = {};

export let backpacks = {
    "dropBackpack": async function _dropBackpack() {
        let controlledToken = utility.getControlledToken();
        if (!controlledToken?.actor?.ownership[game.user.id] == foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
            ui.notifications.warn("You can only drop backpacks for characters you own!");
            return;
        }
        gmFunctions.dropBackpack(controlledToken.id, game.user.uuid);
    },
    "interact": interact,
    "pickupBackpack": async function _pickupBackpack(pileUuid) {
        gmFunctions.pickupBackpack(pileUuid);
    },
    "hooks": {
        "ready": async function _ready() {
            if (!(game.modules.find(m => m.id === "item-piles")?.active ?? false)) {
                return;
            }
            Hooks.on('getItemSheet5eHeaderButtons', createBackpackHeaderButton);
            Hooks.on('item-piles-preTransferItems', ipPreTransferItemsHandler);
            Hooks.on('item-piles-preRightClickItem', ipPreRightClickHandler);
            Hooks.on('item-piles-preDropItemDetermined', ipPreDropItemDeterminedHandler);
            Hooks.on('item-piles-deleteItemPile', ipPreDeleteItemPileHandler);
            if (sdndSettings.UseSDnDEncumbrance.getValue()) {
                Hooks.on('item-piles-transferItems', ipTransferItemsHandler);
                Hooks.on('createItem', createItemHandler);
                Hooks.on('deleteItem', createItemHandler);
                Hooks.on('updateItem', updateItemHandler);
            }
        }
    }
}

function ipPreDeleteItemPileHandler(pileToken) {
    if ((!game.user?.isGM) && source.items.find(i => i.getFlag(sdndConstants.MODULE_ID, 'DroppedBy'))) {
        ui.notifications.warn("It would be a very bad idea to delete your primary pack!");
        return false;
    }
    return true;
}

async function createItemHandler(item, options, id) {
    await checkItemParentWeight(item);
}

async function deleteItemHandler(item, options, id) {
    await checkItemParentWeight(item);
}

async function updateItemHandler(item, changes, options, id) {
    await checkItemParentWeight(item);
}

async function ipPreRightClickHandler(item, menu, pile, triggeringActor) {
    if (item.getFlag(sdndConstants.MODULE_ID, "DroppedBy")) {
        menu.length = 0;
    }
}

async function ipTransferItemsHandler(source, target, itemDeltas, userId, interactionId) {
    let sourceActor = (source?.actor) ?? source;
    let targetActor = (target?.actor) ?? target;
    if (!sourceActor.getFlag("item-piles", "data.type")) {
        gmFunctions.checkActorWeight(sourceActor.uuid);
    }
    if (!targetActor.getFlag("item-piles", "data.type")) {
        gmFunctions.checkActorWeight(targetActor.uuid);
    }
}

// track createItem, deleteItem
async function ipPreTransferItemsHandler(source, sourceUpdates, target, targetUpdates, interactionId) {
    if ((!sourceUpdates) || (!source.getFlag("item-piles", "data.type") || source.getFlag(sdndConstants.MODULE_ID, "PickingUp"))) {
        return true;
    }
    let primaryBackpack = source.items.find(i => i.getFlag(sdndConstants.MODULE_ID, 'DroppedBy'));
    if (sourceUpdates.itemsToDelete.includes(primaryBackpack.id)) {
        ui.notifications.warn("You cannot remove the primary backpack from the pile!");
        return false;
    }
    return true;
}

function ipPreDropItemDeterminedHandler(source, target, itemData, position) {
    if (!source?.getFlag("item-piles", "data.type")) {
        return true;
    }
    if (itemData.item.flags["stroud-dnd-helpers"]?.DroppedBy) {
        ui.notifications.warn("You cannot remove the primary backpack from the pile!");
        return false;
    }
    return true;
}

async function checkItemParentWeight(item) {
    if (!sdndSettings.UseSDnDEncumbrance.getValue()){
        return;
    }
    let actor = item.parent;
    if (!actor instanceof dnd5e.documents.Actor5e) {
        return;
    }
    if (actor.getFlag("item-piles", "data.type") || actor.type != "character") {
        return;
    }
    if ((item?.system?.weight ?? 0) == 0) {
        return;
    }
    await gmFunctions.checkActorWeight(actor.uuid);
}

async function suppressWeightChecks(actor, newVal) {
    await actor?.setFlag(sdndConstants.MODULE_ID, "SuppressWeightChecks", newVal);
}

async function isWeightCheckSuppressed(actor) {
    return await actor?.getFlag(sdndConstants.MODULE_ID, "SuppressWeightChecks");
}

export async function gmCheckActorWeight(actorUuid) {
    if (!sdndSettings.UseSDnDEncumbrance.getValue()){
        return;
    }
    if (inProgress[actorUuid]) {
        return;
    }
    inProgress[actorUuid] = true;
    let actor = actorUuid;

    if (!(actor instanceof dnd5e.documents.Actor5e)) {
        actor = await fromUuid(actorUuid);
    }
    if (!actor) {
        return;
    }
    let suppressed = await isWeightCheckSuppressed(actor);
    if (suppressed) {
        return;
    }
    suppressWeightChecks(actor, true);
    console.log("checking actor weight");
    try {
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
    catch (ex) {
        ui.notifications.error(ex.message);
    }
    finally {
        suppressWeightChecks(actor, false);
        inProgress[actorUuid] = false;
    }

}

async function interact(pileUuid) {
    let pile = await fromUuid(pileUuid);
    if (!(pile.actor.ownership[game.user.id] == foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)) {
        ui.notifications.warn("This is not your pack!");
        return false;
    }
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
        gmFunctions.pickupBackpack(pileUuid);
    }
    return false;
}

export async function gmDropBackpack(tokenId, userUuid) {
    let controlledToken = canvas.tokens.get(tokenId);
    let actor = controlledToken.actor;
    if (!actor) {
        ui.notifications.warn("Selected token has no associated actor!");
        return;
    }
    await suppressWeightChecks(actor, true);
    let backpackId = await actor.getFlag(sdndConstants.MODULE_ID, "PrimaryBackpack");
    if (!backpackId) {
        let containers = actor.items.filter(i => i.type == "container");
        if ((!containers) || containers.length != 1) {
            ui.notifications.warn("You have no primary backpack selected!");
            return;
        }
        backpackId = containers[0].id;
        await actor.setFlag(sdndConstants.MODULE_ID, backpackId);
    }
    if (actor.getFlag(sdndConstants.MODULE_ID, "LastDroppedBackpack") == backpackId) {
        console.log("The primary backpack is already on the ground...");
        socket.executeForEveryone("notify", "info", `${actor.name} has tried to drop his pack, but it is already on the ground...`);
        return;
    }
    let backpack = actor.items.get(backpackId);
    if (!backpack) {
        ui.notifications.error("The backpack marked as primary no longer exists on this actor!");
        await actor.setFlag(sdndConstants.MODULE_ID, "PrimaryBackpack", null);
        return;
    }
    let backpackName = `${backpack.name} (${actor.name})`;
    let pileOptions = {
        "sceneId": `${canvas.scene.id}`,
        "tokenOverrides": {
            "name": backpackName,
            "displayName": foundry.CONST.TOKEN_DISPLAY_MODES.HOVER,
            "lockRotation": true,
            "height": 0.5,
            "width": 0.5,
            "texture": {
                "src": backpack.img
            }
        },
        "actorOverrides": {
            "name": backpackName,
            "ownership": {
                [userUuid.split(".").pop()]: foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
            }
        },
        "position": {
            "x": controlledToken.x,
            "y": controlledToken.y
        },
        "createActor": true,
        "itemPileFlags": {
            "enabled": true,
            "type": "vault",
            "distance": 5,
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
                    "uuid": userUuid,
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
    await actor.setFlag(sdndConstants.MODULE_ID, "LastDroppedBackpack", backpack.id);
    await suppressWeightChecks(actor, false);
    await gmCheckActorWeight(actor);
    ChatMessage.create({
        speaker: { alias: actor.name },
        content: `Has dropped ${backpack.name} on the ground.`,
        type: CONST.CHAT_MESSAGE_TYPES.EMOTE
    });
}

export async function gmPickupBackpack(pileUuid) {
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
    await actor.setFlag(sdndConstants.MODULE_ID, "PickingUp", true);
    await suppressWeightChecks(actor, true);
    let items = backpack.actor.items;
    await pile.actor.setFlag(sdndConstants.MODULE_ID, "PickingUp", true);
    let transferred = await game.itempiles.API.transferItems(backpack.actor, actor, items);
    await actor.setFlag(sdndConstants.MODULE_ID, "PickingUp", false);
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
    await suppressWeightChecks(actor, false);
    await gmCheckActorWeight(actor);
    ChatMessage.create({
        speaker: { alias: actor.name },
        content: `Has picked up their ${newBackpack.name}.`,
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
