import { backpacks } from './backpacks/backpacks.js';
import { scene } from './utility/scene.js';
import { createActorHeaderButton } from './actors/actors.js';
import { combat } from './combat.js';
import { actors } from './actors/actors.js';
import { harvesting } from './crafting/harvesting.js';
import { twilightDomain } from './spells/twilightDomain/twilightDomain.js';
import { identification } from './identification/identification.js';
import { tokens } from './tokens.js';

export let hooks = {
    "init": function _init() {
        Hooks.on("getCompendiumDirectoryEntryContext", (html, options) => {
            options.push({
                name: game.i18n.localize("sdnd.compendium.entry.context.exportThumbnails"),
                icon: '<i class="fa-solid fa-camera-retro"></i>',
                callback: async function (li) {
                    const fullyQualifiedPack = $(li).data("pack");
                    if (!fullyQualifiedPack) {
                        return;
                    }
                    const moduleId = fullyQualifiedPack.split('.').shift();
                    await scene.packModuleThumbnails(moduleId);
                },
                condition: li => {
                    if (!game.user?.isGM) {
                        return false;
                    }
                    const fullyQualifiedPack = $(li).data("pack");
                    if (!fullyQualifiedPack) {
                        return false;
                    }
                    const moduleId = fullyQualifiedPack.split('.').shift();
                    if (!moduleId) {
                        return;
                    }
                    if (moduleId.startsWith('sdnd-') || moduleId.startsWith('stroud-')) {
                        return true;
                    }
                    return false;
                },
            });
        });
        Hooks.on("getSceneDirectoryFolderContext", (html, options) => {
            options.push({
                name: game.i18n.localize("sdnd.scenes.folder.context.regenerateThumbs"),
                icon: '<i class="fas fa-sync"></i>',
                callback: async function (li) {
                    let folderID = $(li).closest("li").data("folderId");
                    if (!folderID) {
                        return;
                    }
                    let folder = await game.folders.get(folderID);
                    let thumbCount = await scene.regenerateThumbnails(folder);
                    if (thumbCount > 0) {
                        ui.notifications.notify(`Regenerated ${thumbCount} thumbnail image${(thumbCount > 0 ? 's' : '')}.`);
                    }
                },
                condition: li => {
                    if (!game.user?.isGM) {
                        return false;
                    }
                    let folderID = $(li).closest("li").data("folderId");
                    if (!folderID) {
                        return false;
                    }
                    let folder = game.folders.get(folderID);
                    if (!folder) {
                        return false;
                    }
                    let sceneCount = game.scenes.filter(s => s.folder?.id == folder.id)?.length ?? 0;
                    if (sceneCount == 0 && folder.children?.length == 0) {
                        return false;
                    }
                    if (sceneCount?.length > 10 || folder.children?.length > 10) {
                        return false;
                    }
                    return true;
                },
            });
            options.push({
                name: game.i18n.localize("sdnd.scenes.folder.context.removePlayerTokens"),
                icon: '<i class="fa-regular fa-chess-knight"></i>',
                callback: async function (li) {
                    let folderID = $(li).closest("li").data("folderId");
                    if (!folderID) {
                        return;
                    }
                    let folder = game.folders.get(folderID);
                    let scenes = await tokens.removePlayerTokensFromSceneFolder(folderID);
                    let content = (scenes.length == 0) ? `No scenes under ${folder.name} contain actor tokens...` :
                        `Removed Player Tokens from the following scenes:<br/>${scenes.map(s => s.name).sort().join("<br/>")}`;
                    await ChatMessage.create({
                        content: content,
                        whisper: ChatMessage.getWhisperRecipients('GM'),
                    });
                    ui.notifications.notify(`Removed player tokens from  ${scenes.length} scene${(scenes.length == 1 ? '' : 's')}.`);
                },
                condition: li => {
                    if (!game.user?.isGM) {
                        return false;
                    }
                    let folderID = $(li).closest("li").data("folderId");
                    if (!folderID) {
                        return false;
                    }
                    let folder = game.folders.get(folderID);
                    if (!folder) {
                        return false;
                    }
                    return true;
                },
            });
        });
        Hooks.on("getActorDirectoryFolderContext", (html, options) => {
            options.push({
                name: game.i18n.localize("sdnd.actor.folder.context.togglePlayer"),
                icon: '<i class="fa fa-star" aria-hidden="true"></i>',
                callback: async function (li) {
                    // let folderID = $(li).closest("li").data("folderId");
                    // if (!folderID){
                    // 	return;
                    // }
                    // let folder = await game.folders.get(folderID);
                    // let thumbCount = await scene.regenerateThumbnails(folder);
                    // if (thumbCount > 0) {
                    // 	ui.notifications.notify(`Regenerated ${thumbCount} thumbnail image${(thumbCount > 0 ? 's' : '')}.`);
                    // }
                },
                condition: li => {
                    if (!game.user?.isGM) {
                        return false;
                    }
                    let folderID = $(li).closest("li").data("folderId");
                    if (!folderID) {
                        return false;
                    }
                    let folder = game.folders.get(folderID);
                    if (!folder) {
                        return false;
                    }
                    // let sceneCount = game.scenes.filter(s => s.folder?.id == folder.id)?.length ?? 0;
                    // if (sceneCount == 0 && folder.children?.length == 0) {
                    // 	return false;
                    // }
                    // if (sceneCount?.length > 10 || folder.children?.length > 10){
                    // 	return false;
                    // }
                    return true;
                },
            });
        });
    },
    "ready": async function _ready() {
        if (game.user?.isGM) {
            Hooks.on('preCreateTile', onPreCreateTile);
            Hooks.on('getActorSheet5eHeaderButtons', createActorHeaderButton);
            if (game.modules.find(m => m.id === "backpack-manager")?.active ?? false) {
                Hooks.on('getItemSheet5eHeaderButtons', createItemHeaderButton);
                Hooks.on('updateActor', syncBackpackPermissions);
            }
            await combat.hooks.ready();
            let setting = game.settings.settings.get("stroud-dnd-helpers.CombatPlayList");
            let options = { "none": "(None)" };
            let playlists = game?.playlists?.contents ?? [];
            playlists.forEach(pl => {
                options[pl.id] = pl.name;
            });
            setting.choices = options;

        }
        Hooks.on('renderActorSheet5e', actors.renderSheet);
        await backpacks.hooks.ready();
        await harvesting.hooks.ready();
        await applyPatches();
    }
};

async function applyPatches() {
    if (!game.user?.isTheGM) {
        return;
    }
    await twilightDomain.applyPatches();
    await identification.applyPatches();
    // await mounts.applyPatches();
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