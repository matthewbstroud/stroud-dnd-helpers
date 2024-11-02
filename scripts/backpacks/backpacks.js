import { sdndConstants } from "../constants.js";
import { folders } from "../folders/folders.js";
import { gmFunctions } from "../gm/gmFunctions.js";
import { mounts } from "../mounts/mounts.js";
import { sdndSettings } from "../settings.js";
import { dialog } from "../dialog/dialog.js";
import { activeEffects } from "../../active_effects/activeEffects.js";
import { utility } from "../utility/utility.js";
import { tokens } from "../tokens.js";
import { lighting } from "../lighting/lighting.js";

const nonItems = [
    "race", "background", "class", "subclass", "spell", "feat"
];

let processEvents = true;

export let backpacks = {
    "dropBackpack": foundry.utils.debounce(dropBackpack, 250),
    "interact": interact,
    "pickupBackpack": foundry.utils.debounce(pickupBackpack, 250),
    "eventsEnabled": () => processEvents,
    "pauseEvents": function _pauseEvents() {
        processEvents = false;
    },
    "resumeEvents": function _resumeEvents() {
        processEvents = true;
    },
    "forceCheck": foundry.utils.debounce(forceCheck, 250),
    "findLost": function _findLost() {
        let controlledActor = utility.getControlledActor();
        if (!controlledActor) {
            ui.notifications.warn("No selected token!");
            return;
        }
        let scenes = game.scenes.filter(s => s.tokens.find(t => t.actor?.getFlag(sdndConstants.MODULE_ID, "DroppedBy") == controlledActor.uuid)).map(s => s.name);
        let message = scenes.length > 0 ? `${controlledActor.name} has lost items in ${scenes.join(", ")}.` : `${controlledActor.name} has no lost items.`;
        ChatMessage.create({
            content: message,
            whisper: ChatMessage.getWhisperRecipients('GM'),
        });
    },
    "removeOrphans": async function _removeOrphans() {
        var backpacksFolder = await folders.ensureFolder(sdndSettings.BackpacksFolder.getValue(), "Actor");
        let droppedItems = game.actors.filter(a => a.folder?.id == backpacksFolder.id);
        for (let droppedItem of droppedItems) {
            let scenes = game.scenes.filter(s => s.tokens.find(t => t.actor?.id == droppedItem.id));
            if (scenes.length == 0) {
                console.log(`${droppedItem.name} is an orphan and can be deleted.`);
                await Actor.deleteDocuments([droppedItem.id]);
            }
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
            Hooks.on('item-piles-preClickItemPile', ipPreClickItemPile);
            if (sdndSettings.UseSDnDEncumbrance.getValue()) {
                Hooks.on('item-piles-transferItems', dbTransferItemsHandler);
                Hooks.on('createItem', createItemHandler);
                Hooks.on('deleteItem', createItemHandler);
                Hooks.on('updateItem', updateItemHandler);
            }
        }
    }
}

let locks = {}

function ipPreClickItemPile(target, interactingToken) {
    return lighting.hooks.ipPreClickItemPile(target, interactingToken);
}

async function forceCheck() {
    let actorUuids = canvas.scene.tokens?.filter(t => t.actor?.folder?.name == sdndSettings.ActivePlayersFolder.getValue()).map(t => t.actor.uuid);
    for (const actorUuid of actorUuids) {
        await gmCheckActorWeight(actorUuid, true, "forceCheck");
    }
}

async function dropBackpack() {
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
    await lockActor(controlledToken.actor);
    lastCheck = (new Date()).getTime();
    await gmFunctions.dropBackpack(controlledToken.id, backpackId, game.user.uuid);
}

async function pickupBackpack(pileUuid) {
    await lockActor(controlledToken.actor);
    lastCheck = (new Date()).getTime();
    await gmFunctions.pickupBackpack(pileUuid, game.user.id);
}

export async function lockActor(actor) {
    await actor.setFlag(sdndConstants.MODULE_ID, "isLocked", true);
}
async function releaseActor(actor) {
    await actor.setFlag(sdndConstants.MODULE_ID, "isLocked", false);
}
function isLocked(actor) {
    return actor.getFlag(sdndConstants.MODULE_ID, "isLocked") ?? false;
}

function ipPreDeleteItemPileHandler(pileToken) {
    if ((!game.user?.isGM) && pileToken?.actor?.items.find(i => i.getFlag(sdndConstants.MODULE_ID, 'DroppedBy'))) {
        ui.notifications.warn("It would be a very bad idea to delete your primary pack!");
        return false;
    }
    return true;
}

function itemHandler(item, scope, action) {
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
    let dt = actor.getFlag("item-piles", "data.type");
    if (dt || actor.type != "character") {
        return;
    }
    if ((item?.system?.weight ?? 0) == 0) {
        return;
    }
    if (isLocked(actor)) {
        return;
    }
    action(item, scope);
}

function createItemHandler(item, options, id) {
    itemHandler(item, 'createItemHandler', dbCheckItemParentWeight);
}

function deleteItemHandler(item, options, id) {
    itemHandler(item, 'deleteItemHandler', dbCheckItemParentWeight);
}

function updateItemHandler(item, changes, options, id) {
    itemHandler(item, 'updateItemHandler', dbCheckItemParentWeight);
}

function ipPreRightClickHandler(item, menu, pile, triggeringActor) {
    let lockedItemID = pile?.getFlag(sdndConstants.MODULE_ID, "lockedItem");
    if (item._id == lockedItemID) {
        menu.length = 0;
    }
}
let lastCheck = ((new Date()).getTime());
let dbCheckWeight = foundry.utils.debounce(checkWeight, 500);
async function checkWeight(actorUuid, scope) {
    let current = (new Date()).getTime();
    if (lastCheck) {
        let diff = current - lastCheck;
        console.log(`checkWeight diff = ${diff}`);
        if (diff < 2000) {
            return;
        }
    }
    lastCheck = current;
    await gmFunctions.checkActorWeight(actorUuid, scope);
}
let lastTransfer = (new Date()).getTime();
let dbTransferItemsHandler = foundry.utils.debounce(ipTransferItemsHandler, 500);
function ipTransferItemsHandler(source, target, itemDeltas, userId, interactionId) {
    if (!processEvents) {
        return;
    }
    let current = (new Date()).getTime();
    if (lastTransfer) {
        let diff = current - lastTransfer;
        console.log(`ipTransferItemsHandler diff = ${diff}`);
        if (diff < 2000) {
            return;
        }
    }
    lastTransfer = current;
    let sourceActor = (source?.actor) ?? source;
    let targetActor = (target?.actor) ?? target;
    if (!isLocked(sourceActor) && !sourceActor.getFlag("item-piles", "data.type")) {
        dbCheckWeight(sourceActor.uuid, 'ipTransferItemsHandler');
    }
    if (!isLocked(sourceActor) && !targetActor.getFlag("item-piles", "data.type")) {
        dbCheckWeight(targetActor.uuid, 'ipTransferItemsHandler');
    }
}

function ipPreTransferItemsHandler(source, sourceUpdates, target, targetUpdates, interactionId) {
    if ((!sourceUpdates) || (!source.getFlag("item-piles", "data.type") || source.getFlag(sdndConstants.MODULE_ID, "PickingUp"))) {
        return true;
    }
    let lockedItemID = source?.getFlag(sdndConstants.MODULE_ID, "lockedItem");
    if (sourceUpdates.itemsToDelete.includes(lockedItemID)) {
        ui.notifications.warn("You cannot remove the primary container from the pile!");
        return false;
    }
    return true;
}

function ipPreDropItemDeterminedHandler(source, target, itemData, position) {
    if (!lighting.hooks.ipPreDropItemDeterminedHandler(source, target, itemData, position)) {
        return false
    }
    let lockedItemID = source?.getFlag(sdndConstants.MODULE_ID, "lockedItem");
    if (itemData?.item._id == lockedItemID) {
        ui.notifications.warn("You cannot remove the primary container from the pile!");
        return false;
    }
    if (source instanceof dnd5e.documents.Actor5e) {
        let sceneTokens = canvas.scene.tokens.filter(t => t.actor?.id == source.id);
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

let dbCheckItemParentWeight = foundry.utils.debounce(checkItemParentWeight, 500);
function checkItemParentWeight(item, scope) {
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
    if (actor.getFlag("item-piles", "data.type") || actor?.type != "character") {
        return;
    }
    if ((item?.system?.weight ?? 0) == 0) {
        return;
    }
    dbCheckWeight(actor.uuid, scope);
}

export async function gmCheckActorWeight(actorUuid, force, scope) {
    lastCheck = (new Date()).getTime();
    force ??= false;
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
    if (isLocked(actor) && !force) {
        return;
    }
    await lockActor(actor);
    console.log(`(${scope}) checking ${actor.name} weight force = ${force}`);
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
            effect = activeEffects.Encumbered;
        }
        let currentEffects = actor.effects?.filter(e => e.name == activeEffects.Encumbered.name || e.name == activeEffects.HeavilyEncumbered.name);
        if (!effect) {
            if (currentEffects && currentEffects.length > 0) {
                await gmFunctions.removeEffects(currentEffects.map(e => e.uuid));
            }
            return;
        }
        console.log(`${actor.name} is ${effect.name}`);
        effect.origin = actor.uuid;
        let existingEffect = currentEffects?.find(e => e.name == effect.name);
        if (existingEffect) {
            let effectsToRemove = currentEffects.filter(e => e.uuid != existingEffect.uuid);
            if (effectsToRemove.length > 0) {
                await gmFunctions.removeEffects(effectsToRemove.map(e => e.uuid));
            }
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
        await releaseActor(actor);
    }
}

async function interact(pileUuid, token, userId) {
    let pile = await fromUuid(pileUuid);
    if (!pile.actor) {
        return game.user.isGM ? true : false;;
    }
    let user = game.users.get(userId);

    if (!pile.actor.isOwner) {
        ui.notifications.warn(`This does not belong to you!`);
        return false;
    }

    let actorUuid = pile.actor.getFlag(sdndConstants.MODULE_ID, "DroppedBy");
    if (!actorUuid || actorUuid.length == 0) {
        actorUuid = pile.actor.items.find(i => i.getFlag(sdndConstants.MODULE_ID, "DroppedBy"))
            ?.getFlag(sdndConstants.MODULE_ID, "DroppedBy");
    }
    if (!actorUuid || actorUuid.length == 0) {
        ui.notifications.warn(`Cannot determine the owner of this pile!`);
        return false;
    }
    if (pile.uuid == token.document?.uuid) {
        let userTokens = game.user.character?.getActiveTokens();
        if (userTokens && userTokens.length > 0) {
            token = userTokens[0];
        } else {
            let ownerActor = await fromUuid(actorUuid);
            let actorTokens = ownerActor?.getActiveTokens();
            if (actorTokens > 1) {
                ui.notifications.error(`More than one token exists in the scene for ${ownerActor.name}!`);
                return false;
            }
            token = actorTokens[0];
        }
    }
    if (!user.isGM) {
        const distance = tokens.getDistance(pile, token);
        const maxDistance = 10;

        if (distance > maxDistance) {
            ui.notifications.warn(`${token.name} must be within ${maxDistance} feet to interact with ${pile.name}.`);
            return false;
        }
    }

    let isMount = pile.actor?.getFlag(sdndConstants.MODULE_ID, "IsMount") ?? false;
    if (isMount && pile?.actor?.system?.attributes?.hp?.value <= 0) {
        return true;
    }
    let buttons = [
        {
            "label": "Open",
            "value": "open"
        }
    ];
    let actualOwner = (user.isGM || token.actor.uuid == actorUuid);
    let pileActor = game.actors.get(pile.actor.id);
    const currentOwners = Object.keys(pileActor.ownership);
    let grantUsersButtons = game.users.filter(u => !currentOwners.includes(u.id) && u.active && u.id != game.user.id && !u.isGM)
        .map(u => ({ "label": u.name, "value": u.id })).sort(dialog.sortByLabel);
    if (actualOwner) {
        buttons.push({
            "label": (isMount ? "Mount" : "Pick up"),
            "value": "pickup"
        });
        if (grantUsersButtons.length > 0) {
            buttons.push({
                "label": "Grant Permission",
                "value": "grant"
            });
        }
    }
    let choice = await dialog.createButtonDialog(pile.actor.name, buttons, 'column');
    if (choice == "open") {
        return true;
    }
    else if (choice == "grant") {
        let grantee = await dialog.createButtonDialog('Grant Access', grantUsersButtons, 'column');
        if (!grantee) {
            return false;
        }
        let granteeUser = grantUsersButtons.find(b => b.value == grantee);
        grantAcces(pileActor, grantee, granteeUser.label);
        return false;
    }
    else if (choice == "pickup") {
        lastCheck = (new Date()).getTime();
        await gmFunctions.pickupBackpack(pileUuid, game.user.id);
    }
    return false;
}

async function grantAcces(pileActor, userId, userName) {
    await pileActor.update({ "ownership": { [userId]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER } });
    await ChatMessage.create({
        speaker: { alias: game.user.name },
        content: `${userName} has been granted access to ${pileActor.name}.`,
        style: CONST.CHAT_MESSAGE_STYLES.EMOTE
    });
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

export async function gmDropBackpack(tokenId, backpackId, userUuid, isMount) {
    isMount ??= false;
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
    backpacks.pauseEvents();
    await backpack.setFlag(sdndConstants.MODULE_ID, "fromBackPackId", backpack.uuid);
    let primaryBackpackId = actor.getFlag(sdndConstants.MODULE_ID, "PrimaryBackpack");
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
            "img": backpack.img,
            "flags": {
                [sdndConstants.MODULE_ID]: {
                    "lockedItem": backpack.id,
                    "IsMount": isMount,
                    "DroppedBy": (actor.uuid),
                    "IsPrimary": (backpack.id == primaryBackpackId),
                    "DroppedUserId": (game.user.id)
                }
            },
            "system": {
                "abilities": {
                    "str": {
                        "value": (Math.ceil((backpack?.system?.capacity?.value ?? 70) / 15))
                    }
                }
            },
            "ownership": actor.ownership
        },
        "position": {
            "x": controlledToken.x,
            "y": controlledToken.y
        },
        "createActor": true,
        "itemPileFlags": {
            "enabled": true,
            "type": "vault",
            "distance": 10,
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
    let isMountDead = false;
    if (isMount) {
        let mountData = backpack.getFlag(sdndConstants.MODULE_ID, "MountData");
        pileOptions.actorOverrides.flags[sdndConstants.MODULE_ID].MountData = mountData;
        pileOptions.actorOverrides.system.attributes = {
            "ac": mountData.ac,
            "hp": mountData.hp
        };
        pileOptions.tokenOverrides.displayBars = CONST.TOKEN_DISPLAY_MODES.OWNER;
        if (mountData.hp.value <= 0) {
            isMountDead = true;
            pileOptions.actorOverrides.img = 'modules/stroud-dnd-helpers/images/icons/dead_mount.webp';
            pileOptions.tokenOverrides.texture.src = 'modules/stroud-dnd-helpers/images/icons/dead_mount.webp'
        }
    }
    try {
        await lockActor(actor);
        let result = await game.itempiles.API.createItemPile(pileOptions);
        let backpackToken = await fromUuid(result.tokenUuid);
        let transferred = await game.itempiles.API.transferItems(controlledToken, backpackToken, [backpack]);
        if (transferred && transferred.length > 0) {
            let newBackpackID = transferred.find(t => t.item.flags[(sdndConstants.MODULE_ID)]?.fromBackPackId == backpack.uuid)?.item?._id;
            let newBackpack = backpackToken?.actor?.items.get(newBackpackID);
            await newBackpack.setFlag(sdndConstants.MODULE_ID, "DroppedBy", actor.uuid);
            await backpackToken?.actor?.setFlag(sdndConstants.MODULE_ID, "lockedItem", newBackpackID);
        }
    }
    catch (exception) {
        ui.notifications.error(exception.message);
    }
    finally {
        await releaseActor(actor);
        backpacks.resumeEvents();
    }
    await gmCheckActorWeight(actor, true, 'gmDropBackpack');
    if (isMountDead) {
        return;
    }
    let message = isMount ? `Has dismounted ${backpack.name}.` :
        `Has dropped ${backpack.name} on the ground.`;
    await ChatMessage.create({
        speaker: { alias: actor.name },
        content: message,
        style: CONST.CHAT_MESSAGE_STYLES.EMOTE
    });
}

export async function gmPickupBackpack(pileUuid) {
    let pile = await fromUuid(pileUuid);
    if (!pile) {
        ui.notifications.error(`Couldn't find container with id ${pileUuid}`);
        return;
    }
    const isMount = pile.actor?.getFlag(sdndConstants.MODULE_ID, "IsMount") ?? false;
    let lockedItemID = pile?.actor?.getFlag(sdndConstants.MODULE_ID, "lockedItem") ??
        pile?.actor?.items.find(i => i.getFlag(sdndConstants.MODULE_ID, "DroppedBy"))?.id;
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
    if (isMount) {
        let mountData = mounts.getMountData(backpack);
        mountData.hp = pile.actor?.system.attributes.hp;
        await mounts.setMountData(backpack, mountData);
        await mounts.changeHealth(pile.actor.uuid, (mountData.hp.value / mountData.hp.max));
    }
    let actor = await fromUuid(actorUuId);
    try {
        lockActor(actor);
        backpacks.pauseEvents();
        let items = game.itempiles.API.getActorItems(backpack.actor).filter(i => i.system?.container != backpack.id);
        let isPrimary = pile?.actor?.getFlag(sdndConstants.MODULE_ID, "IsPrimary");
        await pile.actor.setFlag(sdndConstants.MODULE_ID, "PickingUp", true);
        let transferred = await game.itempiles.API.transferItems(backpack.actor, actor, items);
        await actor.setFlag(sdndConstants.MODULE_ID, "PickingUp", false);
        let transferredBackpack = transferred.find(i => i.item.flags[sdndConstants.MODULE_ID]?.DroppedBy)
        let backpackId = transferredBackpack.item._id;
        if (isPrimary) {
            await actor.setFlag(sdndConstants.MODULE_ID, "PrimaryBackpack", backpackId);
        }
        let orphans = transferred.filter(t => t.item._id != backpackId && t.item.system?.container != backpackId).map(t => t.item._id);
        for (const id of orphans) {
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
        await Actor.deleteDocuments([pileActorId]);
        let newBackpack = actor.items.get(backpackId);
        await newBackpack.update({ "system.equipped": true });
        let message = isMount ? `Has mounted ${newBackpack.name}.` : `Has picked up ${newBackpack.name}.`

        await ChatMessage.create({
            speaker: { alias: actor.name },
            content: message,
            style: CONST.CHAT_MESSAGE_STYLES.EMOTE
        });
    }
    catch (exception) {
        ui.notifications.error(exception.message);
    }
    finally {
        await releaseActor(actor);
        backpacks.resumeEvents();
        await gmCheckActorWeight(actor, true, 'gmPickupBackpack');
    }
}

export function createBackpackHeaderButton(config, buttons) {
    if (config.object instanceof Item) {
        let item = config.object;
        if (item.type != "container" || mounts.isMount(item)) {
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
