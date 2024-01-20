import { scene } from './utility/scene.js';

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
    }
};