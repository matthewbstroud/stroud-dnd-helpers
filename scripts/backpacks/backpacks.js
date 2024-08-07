import { sdndConstants } from "../constants.js";
import { folders } from "../folders/folders.js";
import { gmFunctions } from "../gm/gmFunctions.js";
import { sdndSettings } from "../settings.js";
import { dialog } from "../dialog/dialog.js";
import { activeEffects } from "../../active_effects/activeEffects.js";
import { utility } from "../utility/utility.js";

const nonItems = [
    "race", "background", "class", "subclass", "spell", "feat"
];

let processEvents = true;

export let backpacks = {
    "dropBackpack": async function _dropBackpack() {
        let controlledToken = utility.getControlledToken();
        if (!controlledToken?.actor) {
            return;
        }
        else if (controlledToken.actor.getFlag(sdndConstants.MODULE_ID, "DroppedBy")) {
            return;
        }
        if (!controlledToken?.actor?.ownership[game.user.id] == foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
            ui.notifications.warn("You can only drop backpacks for characters you own!");
            return;
        }
        let backpackId = await getPrimaryPackId(controlledToken.id);
        if (!backpackId) {
            return;
        }
        gmFunctions.dropBackpack(controlledToken.id, backpackId, game.user.uuid);
    },
    "interact": interact,
    "pickupBackpack": async function _pickupBackpack(pileUuid) {
        gmFunctions.pickupBackpack(pileUuid);
    },
    "eventsEnabled": () => processEvents,
    "pauseEvents": async function _pauseEvents() {
        processEvents = false;
    },
    "resumeEvents": async function _resumeEvents() {
        processEvents = true;
    },
    "forceCheck": async function _forceCheck() {
        let actorUuids = canvas.scene.tokens?.filter(t => t.actor?.folder?.name == sdndSettings.ActivePlayersFolder.getValue()).map(t => t.actor.uuid);
        for (const actorUuid of actorUuids) {
            gmCheckActorWeight(actorUuid, true);
        }
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

let locks = {}

function lockActor(actorId) {
    locks[actorId] = true;
}
function releaseActor(actorId) {
    locks[actorId] = false;
}
function isLocked(actorId) {
    return locks[actorId];
}

function ipPreDeleteItemPileHandler(pileToken) {
    if ((!game.user?.isGM) && source.items.find(i => i.getFlag(sdndConstants.MODULE_ID, 'DroppedBy'))) {
        ui.notifications.warn("It would be a very bad idea to delete your primary pack!");
        return false;
    }
    return true;
}

async function itemHandler(item, action) {
    if (!sdndSettings.UseSDnDEncumbrance.getValue()) {
        return;
    }
    if (!processEvents) {
        return;
    }
    let actor = item?.parent;
    if (!actor || !actor instanceof dnd5e.documents.Actor5e) {
        return;
    }
    let dt = await actor.getFlag("item-piles", "data.type");
    if (dt || actor.type != "character") {
        return;
    }
    if ((item?.system?.weight ?? 0) == 0) {
        return;
    }
    if (isLocked(actor.id)) {
        return;
    }
    await action(item);
}

async function createItemHandler(item, options, id) {
    await itemHandler(item, checkItemParentWeight);
}

async function deleteItemHandler(item, options, id) {
    await itemHandler(item, checkItemParentWeight);
}

async function updateItemHandler(item, changes, options, id) {
    await itemHandler(item, checkItemParentWeight);
}

async function ipPreRightClickHandler(item, menu, pile, triggeringActor) {
    let lockedItemID = source?.getFlag(sdndConstants.MODULE_ID, "lockedItem");
    if (item._id == lockedItemID) {
        menu.length = 0;
    }
}

async function ipTransferItemsHandler(source, target, itemDeltas, userId, interactionId) {
    if (!processEvents) {
        return;
    }
    let sourceActor = (source?.actor) ?? source;
    let targetActor = (target?.actor) ?? target;
    if (!sourceActor.getFlag("item-piles", "data.type")) {
        gmFunctions.checkActorWeight(sourceActor.uuid);
    }
    if (!targetActor.getFlag("item-piles", "data.type")) {
        gmFunctions.checkActorWeight(targetActor.uuid);
    }
}

async function ipPreTransferItemsHandler(source, sourceUpdates, target, targetUpdates, interactionId) {
    if ((!sourceUpdates) || (!source.getFlag("item-piles", "data.type") || source.getFlag(sdndConstants.MODULE_ID, "PickingUp"))) {
        return true;
    }
    let lockedItemID = await source?.getFlag(sdndConstants.MODULE_ID, "lockedItem");
    if (sourceUpdates.itemsToDelete.includes(lockedItemID)) {
        ui.notifications.warn("You cannot remove the primary container from the pile!");
        return false;
    }
    return true;
}

function ipPreDropItemDeterminedHandler(source, target, itemData, position) {
    let lockedItemID = source?.getFlag(sdndConstants.MODULE_ID, "lockedItem");
    if (itemData?.item._id == lockedItemID) {
        ui.notifications.warn("You cannot remove the primary container from the pile!");
        return false;
    }
    if (source instanceof dnd5e.documents.Actor5e) {
        let sceneTokens = canvas.scene.tokens.filter(t => t.actor.id == source.id);
        let backpackId = source.getFlag(sdndConstants.MODULE_ID, "PrimaryBackpack");
        if (itemData.item._id == backpackId) {
            if (sceneTokens && sceneTokens.length == 1) {
                gmFunctions.dropBackpack(sceneTokens[0]._id, itemData.item._id, game.user.uuid);
                return false;
            }
        }
        if (itemData.item.type == "container") {
            if (sceneTokens && sceneTokens.length == 1) {
                gmFunctions.dropBackpack(sceneTokens[0]._id, itemData.item._id, game.user.uuid);
                return false;
            }
        }
    }
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
    if (!sdndSettings.UseSDnDEncumbrance.getValue()) {
        return;
    }
    let actor = item?.parent;
    if (!actor || !actor instanceof dnd5e.documents.Actor5e) {
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

export async function gmCheckActorWeight(actorUuid, force) {
    if (!sdndSettings.UseSDnDEncumbrance.getValue()) {
        return;
    }
    let actor = actorUuid;

    if (!(actor instanceof dnd5e.documents.Actor5e)) {
        actor = await fromUuid(actorUuid);
    }
    if (!actor) {
        return;
    }
    if (isLocked(actor.id)) {
        return;
    }
    lockActor(actor.id);
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
                await gmFunctions.removeEffects(currentEffects.map(e => e.uuid));
            }
            return;
        }
        effect.origin = actor.uuid;
        if (currentEffects?.find(e => e.name == effect.name)) {
            return; // already applied
        }
        if (currentEffects && currentEffects.length > 0) {
            await gmFunctions.removeEffects(currentEffects.map(e => e.uuid));
        }
        await gmFunctions.createEffects(actor.uuid, [effect]);
    }
    catch (ex) {
        ui.notifications.error(ex.message);
    }
    finally {
        await new Promise(r => setTimeout(r, 2000)).then(
            function () { releaseActor(actor.id);},
            function (err) { console.log(err.message); }
        );
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

async function getPrimaryPackId(tokenId) {
    let controlledToken = canvas.tokens.get(tokenId);
    let actor = controlledToken.actor;
    if (!actor) {
        ui.notifications.warn("Selected token has no associated actor!");
        return;
    }
    let backpackId = await actor.getFlag(sdndConstants.MODULE_ID, "PrimaryBackpack");
    if (!backpackId) {
        let containers = actor.items.filter(i => i.type == "container");
        if ((!containers) || containers.length != 1) {
            ui.notifications.warn("You must first designate a primary backpack!");
            return;
        }
        backpackId = containers[0].id;
        await actor.setFlag(sdndConstants.MODULE_ID, "PrimaryBackpack", backpackId);
    }
    return backpackId;
}

export async function gmDropBackpack(tokenId, backpackId, userUuid) {
    let controlledToken = canvas.tokens.get(tokenId);
    let actor = controlledToken.actor;
    if (!actor) {
        ui.notifications.warn("Selected token has no associated actor!");
        return;
    }

    let backpack = actor.items.get(backpackId);
    if (!backpack) {
        return;
    }
    var backpacksFolder = await folders.ensureFolder(sdndSettings.BackpacksFolder.getValue(), "Actor");
    let backpackName = `${backpack.name} (${actor.name})`;
    let pileOptions = {
        "sceneId": `${canvas.scene.id}`,
        "tokenOverrides": {
            "name": backpackName,
            "displayName": foundry.CONST.TOKEN_DISPLAY_MODES.HOVER,
            "disposition": foundry.CONST.TOKEN_DISPOSITIONS.NEUTRAL,
            "lockRotation": true,
            "height": 0.5,
            "width": 0.5,
            "texture": {
                "src": backpack.img
            }
        },
        "actorOverrides": {
            "name": backpackName,
            'folder': backpacksFolder.id,
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
    try {
        let result = await game.itempiles.API.createItemPile(pileOptions);
        let backpackToken = await fromUuid(result.tokenUuid);
        let items = actor.items.filter(i => i?.system?.container == backpack.id);
        items.unshift(backpack);
        let transferred = await game.itempiles.API.transferItems(controlledToken, backpackToken, items);
        if (transferred && transferred.length > 0) {
            let newBackpackID = transferred[0].item._id;
            let newBackpack = backpackToken?.actor?.items.get(newBackpackID);
            newBackpack.setFlag(sdndConstants.MODULE_ID, "DroppedBy", actor.uuid);
            backpackToken?.actor?.setFlag(sdndConstants.MODULE_ID, "lockedItem", newBackpackID);
            backpackToken?.actor?.setFlag(sdndConstants.MODULE_ID, "DroppedBy", actor.uuid);
            let primaryBackpackId = actor.getFlag(sdndConstants.MODULE_ID, "PrimaryBackpack");
            if (backpack.id == primaryBackpackId) {
                backpackToken?.actor?.setFlag(sdndConstants.MODULE_ID, "IsPrimary", true);
            }
        }
    }
    catch (exception) {
        ui.notifications.error(exception.message);
    }

    await gmCheckActorWeight(actor, true);
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

    let lockedItemID = pile?.actor?.getFlag(sdndConstants.MODULE_ID, "lockedItem");
    let backpack = pile.actor.items.get(lockedItemID);
    if (!backpack) {
        ui.notifications.error("unexpected error resolving backpack!");
        return;
    }
    let actorUuId = pile?.actor?.getFlag(sdndConstants.MODULE_ID, "DroppedBy");
    if (!actorUuId) {
        ui.notifications.error("Cannot determine who dropped this container!");
        return;
    }
    
    let actor = await fromUuid(actorUuId);
    try {
        let items = game.itempiles.API.getActorItems(backpack.actor);
        let isPrimary = pile?.actor?.getFlag(sdndConstants.MODULE_ID, "IsPrimary");
        await pile.actor.setFlag(sdndConstants.MODULE_ID, "PickingUp", true);
        let transferred = await game.itempiles.API.transferItems(backpack.actor, actor, items);
        await actor.setFlag(sdndConstants.MODULE_ID, "PickingUp", false);
        let transferredBackpack = transferred.find(i => i.item.flags[sdndConstants.MODULE_ID]?.DroppedBy)
        let backpackId = transferredBackpack.item._id;
        if (isPrimary) {
            await actor.setFlag(sdndConstants.MODULE_ID, "PrimaryBackpack", backpackId);
        }
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
        await gmCheckActorWeight(actor, true);
        ChatMessage.create({
            speaker: { alias: actor.name },
            content: `Has picked up their ${newBackpack.name}.`,
            type: CONST.CHAT_MESSAGE_TYPES.EMOTE
        });
    }
    catch (exception) {
        ui.notifications.error(exception.message);
    }
}

export function createBackpackHeaderButton(config, buttons) {
    if (config.object instanceof Item) {
        let item = config.object;
        if (item.type != "container") {
            return;
        }
        let actor = item?.parent;
        if (!actor || !actor instanceof dnd5e.documents.Actor5e) {
            return;
        }
        let label = game.i18n.localize("sdnd.primary");
        let primaryBackpackId = actor.getFlag(sdndConstants.MODULE_ID, "PrimaryBackpack");
        let icon = 'fa-light fa-star';
        if (primaryBackpackId && item.id == primaryBackpackId) {
            icon = 'fa-solid fa-star';
        }
        buttons.unshift({
            class: 'stroudDnD',
            icon: icon,
            label: label,
            onclick: () => {
                let primaryBackpackId = actor.getFlag(sdndConstants.MODULE_ID, "PrimaryBackpack");
                if (primaryBackpackId && item.id == primaryBackpackId) {
                    actor.unsetFlag(sdndConstants.MODULE_ID, "PrimaryBackpack");
                    ui.notifications.notify(`${item.name} is no longer your primary container.`);
                    $('a.header-button.control.stroudDnD').find('i.fa-solid.fa-star').removeClass("fa-solid").addClass("fa-light");
                }
                else {
                    actor.setFlag(sdndConstants.MODULE_ID, "PrimaryBackpack", item.id);
                    ui.notifications.notify(`${item.name} is your primary container.`);
                    $('a.header-button.control.stroudDnD').find('i.fa-light.fa-star').removeClass("fa-light").addClass("fa-solid");
                }
            }
        });
    }
}
