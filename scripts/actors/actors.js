import { sdndConstants } from "../constants.js";
import { items } from "../items/items.js";
import { gmFunctions } from "../gm/gmFunctions.js";
import { sdndSettings } from "../settings.js";
import { folders } from "../folders/folders.js";
import { dialog } from "../dialog/dialog.js";

export let actors = {
    "ensureActor": ensureActor
}

export function createItemHeaderButton(config, buttons) {
    if (!game.modules.find(m => m.id === "backpack-manager")?.active ?? false) {
        return;
    }
    debugger;
    if (config.object instanceof Item) {
        var item = config.object;
        if (item.type != "backpack") {
            return;
        }
        var containerActorUuid = item.getFlag("backpack-manager", "containerActorUuid");
        var actorID = containerActorUuid?.split('.')?.pop() ?? '';
        var containerActor = actorID ? game.actors.get(actorID) : null;
        var createNew = true;
        if (containerActorUuid && containerActor) {
            createNew = false;
        }
        var label = sdndSettings.HideTextOnActorSheet.getValue() ? '' : 'SDND';
        buttons.unshift({
            class: 'stroudDnD',
            icon: 'fa-solid fa-dungeon',
            label: label,
            onclick: () => createNew ? createBackpack(item) : transferBackpack(item)
        });
    }
}

export function createActorHeaderButton(config, buttons) {
    if (config.object instanceof Actor) {
        var overrideableItems = getOverrideableItemsFromActor(config.object);
        if (!overrideableItems || overrideableItems.length == 0) {
            return;
        }
        var label = sdndSettings.HideTextOnActorSheet.getValue() ? '' : 'SDND';
        buttons.unshift({
            class: 'stroudDnD',
            icon: 'fa-solid fa-dungeon',
            label: label,
            onclick: () => actorConfig(config.object)
        });
    }
}

export function syncBackpackPermissions(actor, updates, mode, updateUserId) {
    if (!game.modules.find(m => m.id === "backpack-manager")?.active ?? false) {
        return;
    }
    const playerFolder = sdndSettings.ActivePlayersFolder.getValue();
    if (!(actor.folder?.name === playerFolder && updates['ownership'])) {
        return;
    }
    var backPackIds = actor?.items
        .filter(i => i.type === "backpack" && i.flags["backpack-manager"]?.containerActorUuid)
        .map(i => i.getFlag("backpack-manager", "containerActorUuid").split('.')?.pop());
    for (let backpackId of backPackIds) {
        let backpack = game.actors.get(backpackId);
        if (!backpack) {
            continue;
        }
        var ownership = syncPermissions(backpack.ownership, updates['ownership']);
        backpack.update({ "ownership": ownership });
    }
}


// set current permission to defaults and overwrite with new permissions
function syncPermissions(oldPermissions, newPermissions) {
    let newOwnership = duplicate(newPermissions);
    newOwnership['default'] = CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE;
    var ownership = duplicate(oldPermissions);
    for (let owner in ownership) {
        ownership[owner] = CONST.DOCUMENT_OWNERSHIP_LEVELS.INHERIT;
    }
    for (let newOwner in newOwnership) {
        ownership[newOwner] = newOwnership[newOwner];
    }
    return ownership;
}

function getOverrideableItemsFromActor(actorDocument) {
    if (!(actorDocument.type === 'character' || actorDocument.type === 'npc')) {
        return [];
    }
    let sdndItems = [
        sdndConstants.FEATURES.TWILIGHT_SANCTUARY,
        sdndConstants.SPELLS.HUNTERS_MARK,
        sdndConstants.SPELLS.IDENTIFY,
        sdndConstants.SPELLS.MAGIC_MISSILE,
        sdndConstants.SPELLS.SPIRITUAL_WEAPON
    ];
    let overrideableItems = actorDocument.items.filter(i =>
        !i.flags['stroud-dnd-helpers']?.["importedItem"] && sdndItems.includes(i.name)
    ).sort(items.sortByName);
    if (!overrideableItems || overrideableItems.length === 0) {
        return [];
    }
    return overrideableItems;
}
async function actorConfig(actorDocument) {
    if (!(actorDocument.type === 'character' || actorDocument.type === 'npc')) {
        ui.notifications.info('This feature must be used on a character or npc!');
        return;
    }
    var overrideableItems = getOverrideableItemsFromActor(actorDocument);
    if (!overrideableItems || overrideableItems.length === 0) {
        ui.notifications.info(`${actorDocument.name} has no spells or features that can be modified by Stroud DND Helpers.`);
        return;
    }
    let overriddenItems = actorDocument.items.filter(i =>
        i.flags['stroud-dnd-helpers']?.["importedItem"]
    );
    promptForSpellOverrides(actorDocument, overrideableItems, overriddenItems);
}

async function ensureActor(actorName, packId, parentFolderName) {
    let actor = await game.actors.getName(actorName);
    if (!actor) {
        let pack = game.packs.get(packId);
        if (!pack) {
            ui.notifications.error(`Cannot find compendium ${packId}!`);
            return null;
        }
        let packActor = pack.index.getName(actorName);
        if (!packActor) {
            ui.notifications.error(`Cannot find actor ${actorName} compendium ${packId}!`);
            return null;
        }
        actor = await gmFunctions.importFromCompendium("Actor", packId, packActor._id, parentFolderName);
    }
    return actor;
}

async function overrideSpells(actor, spells) {
    for (let spell of spells) {
        let sndSpell = await getReplacementFromCompendium(spell);
        await actor.createEmbeddedDocuments('Item', [sndSpell]);
        await spell.delete();
    }
    ui.notifications.info(`Number of spells replaced: ${spells.length}.`);
}

async function getReplacementFromCompendium(spell) {
    let pack = "";
    switch (spell.type) {
        case "feat":
            pack = sdndConstants.PACKS.COMPENDIUMS.ITEM.FEATURES;
            break;
        case "spell":
            pack = sdndConstants.PACKS.COMPENDIUMS.ITEM.SPELLS;
            break;
        default:
            pack = sdndConstants.PACKS.COMPENDIUMS.ITEM.ITEMS;
    }
    return await items.getItemFromCompendium(pack, spell.name, false, null);
}

async function createBackpack(item) {
    if (!(item.type === 'backpack')) {
        ui.notifications.info('This feature must be used on an item of type backpack!');
        return;
    }
    var backpacksFolder = await folders.ensureFolder(sdndSettings.BackpacksFolder.getValue(), "Actor");
    let ownership = syncPermissions({}, item?.parent?.ownership);
    let backpack = await Actor.create({
        'name': `${item.name}`,
        'type': "npc",
        'img': item.img,
        'ownership': ownership,
        'folder': backpacksFolder.id
    });

    item.setFlag("backpack-manager", "containerActorUuid", backpack.uuid);
    ui.notifications.notify(`Managed backpack created for ${item.name}.`);
}

async function transferBackpack(item) {
    if (!(item.type === 'backpack')) {
        ui.notifications.info('This feature must be used on an item of type backpack!');
        return;
    }
    const playersFolderName = sdndSettings.ActivePlayersFolder.getValue();
    let currentOwner = item.parent;
    let players = canvas.scene.tokens
        .filter((token) => token.actor && token.actor?.id != currentOwner.id && token.actor?.folder?.name == playersFolderName)
        .map(t => t.actor).sort(items.sortByName);
    if (players.length == 0) {
        ui.notifications.notify('There are no player tokens in this scene.');
        return;
    }
    var targetPlayerId = await dialog.createButtonDialog(`Transfer ${item.name} to New Player`, players.map(p => ({ "label": p.name, "value": p.id })), 'column');
    if (!targetPlayerId) {
        return;
    }
    var targetPlayer = await game.actors.get(targetPlayerId);
    let itemData = duplicate(item);
    await currentOwner.deleteEmbeddedDocuments("Item", [item.id]);
    await targetPlayer.createEmbeddedDocuments("Item", [itemData]);
    var containerActorUuid = item.getFlag("backpack-manager", "containerActorUuid");
    var actorID = containerActorUuid?.split('.')?.pop() ?? '';
    var containerActor = actorID ? game.actors.get(actorID) : null;
    if (!containerActor) {
        return;
    }
    let ownership = syncPermissions(containerActor.ownership, targetPlayer.ownership);
    await containerActor.update({ "ownership": ownership });
    ui.notifications.notify(`${item.name} transferred to ${targetPlayer.name}.`);
}


async function promptForSpellOverrides(actor, overrideableItems, overriddenItems) {
    let options = overrideableItems.map(i => `<input type="checkbox" id="${i.id}" name="${i.id}" value="${i.id}">
        <label for="${i.id}">${i.name}</label><br>`
    ).join('');
    let form = `<h1>Override Spells/Features</h1>
    <form>
      ${options}
      <br/><br/>
    </form>
    `;
    new Dialog({
        title: `SDND Spell/Feature Overrides`,
        content: form,
        buttons: {
            yes: {
                icon: "<i class='fas fa-check'></i>",
                label: `Apply`,
                callback: (html) => {
                    let selectedSpells = [];
                    overrideableItems.forEach(element => {
                        if (html.find(`#${element.id}`).is(`:checked`)) {
                            selectedSpells.push(element);
                        }
                    });
                    if (selectedSpells.length == 0) {
                        ui.notifications.info("Nothing selected...");
                        return;
                    }
                    overrideSpells(actor, selectedSpells);
                }
            },
            no: {
                icon: "<i class='fas fa-times'></i>",
                label: `Cancel`
            },
        },
        default: "yes"
    }, { width: 500 }).render(true);
}

async function promptForTargetActor(item) {
    debugger;


}