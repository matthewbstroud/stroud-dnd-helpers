import { backpacks } from './backpacks/backpacks.js';
import { createActorHeaderButton, createItemHeaderButton } from './actors/actors.js';
import { createWeaponHeaderButton } from './items/items.js';
import { CompendiumHooks } from './hookHandlers/compendiumHandlers.js';
import { FolderHooks } from './hookHandlers/folderHandlers.js';
import { combat } from './combat.js';
import { actors } from './actors/actors.js';
import { harvesting } from './crafting/harvesting.js';
import { toolsHandler } from './hookHandlers/toolsHandler.js';
import { ringOfBlooming } from './items/trinkets/ringOfBlooming.js';
import { customFilters } from './customFilters.js';

export let hooks = {
    "init": async function _init() {
        await CompendiumHooks.init();
        await FolderHooks.init();
    },
    "ready": async function _ready() {
        if (game.user?.isGM) {
            Hooks.on('preCreateTile', onPreCreateTile);
            Hooks.on("getHeaderControlsApplicationV2", insertHeaderButtons);
            await combat.hooks.ready();
            await toolsHandler.Init();
            let setting = game.settings.settings.get("stroud-dnd-helpers.CombatPlayList");
            let options = { "none": "(None)" };
            let playlists = game?.playlists?.contents ?? [];
            playlists.forEach(pl => {
                options[pl.id] = pl.name;
            });
            setting.choices = options;

        }
        Hooks.on("dnd5e.filterItem", customFilters.filterUsableSpells);
        await backpacks.hooks.ready();
        await harvesting.hooks.ready();
        await ringOfBlooming.Ready();
        await applyPatches();
    }
};

function insertHeaderButtons(app, buttons) {
    if (app.document instanceof foundry.documents.BaseActor) {
        createActorHeaderButton(app, buttons);
        return;
    }
    if (app.document instanceof foundry.documents.BaseItem) {
        return createWeaponHeaderButton(app, buttons);
    }
}

async function applyPatches() {
    if (!game.user?.isTheGM) {
        return;
    }
    await combat.ensureAdhocActor();
    await removeCoreStatusId();
}

function onPreCreateTile(tileDoc, droppedData, modified, id) {
    if (droppedData.img && tileDoc?.updateSource) {
        tileDoc.updateSource({ "texture.src": droppedData.img });
    }
    return true;
}

async function removeCoreStatusId() {
    let validNames = Array.from(game.packs).filter(p => p.metadata.type == "Item" && p.metadata.packageName == "stroud-dnd-helpers").flatMap(p => p.index.filter(i => ['spell', 'feat', 'weapon', 'item'].includes(i.type)).map(i => i.name));
    let patchData = await game.actors.filter(a => a.items.filter(i => validNames.includes(i.name) && i.effects.filter(e => e.flags?.core?.statusId).length > 0)?.length > 0)
        .map(a => ({ "actor": a, "items": (a.items.filter(i => i.effects.filter(e => e.flags?.core?.statusId).length > 0)) }));
    if (patchData?.length == 0) {
        return;
    }
    let summary = [];
    for (let patch of patchData) {
        if (!patch.actor || !patch.items || patch.items.length == 0) {
            continue;
        }
        summary.push(`Patching ${patch.actor.name}...`);
        summary.push(await actors.replaceSpells(patch.actor, patch.items));
    }
    if (summary.length == 0) {
        return;
    }
    await ChatMessage.create({
        content: (summary.join("<br/>")),
        whisper: ChatMessage.getWhisperRecipients('GM'),
    });
}