import { actors } from "../actors/actors.js";
import { scene } from "../utility/scene.js";
import { tokens } from "../tokens.js";
import { lighting } from "../lighting/lighting.js";

class FolderContextOption {
    constructor(handler, label, icon, folderCallback, folderCondition) {
        if (!(handler instanceof FolderHookHandler)) {
            throw "handler must be FolderHookHandler";
        }
        this.handler = handler;
        this.name = label;
        this.icon = icon;
        this.folderCallback = folderCallback;
        if (folderCallback && typeof folderCallback === 'function' && folderCallback.length !== 2) {
            throw "folderCallback should be (scene, li)";
        }
        this.folderCondition = folderCondition;
        if (folderCondition && typeof folderCondition === 'function' && folderCondition.length !== 2) {
            throw "folderCondition should be (scene, li)";
        }
    }
    updateOptions(app, options) {
        options.push({
            name: game.i18n.localize(this.name),
            icon: this.icon,
            callback: async (li) => {
                const folder = this.handler.resolveFolder(app, li);
                return await this.folderCallback(folder, li);
            },
            condition: (li) => {
                const folder = this.handler.resolveFolder(app, li);
                if (!folder) {
                    return false;
                }
                if (!this.folderCondition) {
                    return true;
                }
                return this.folderCondition(folder, li);
            }
        });
    }
}
class FolderHookHandler {
    constructor(handler) {
        this.handler = handler;
    }
    #contextOptions = [];

    AddContextOption(label, icon, folderCallback, folderCondition) {
        this.#contextOptions.push(new FolderContextOption(
            this,
            label,
            icon,
            folderCallback,
            folderCondition
        ));
    }
    resolveFolder(app, li) {
        let folderID = $(li).closest("li").data("folderId");
        if (!folderID) {
            return;
        }
        return game.folders.get(folderID);
    }
    async Init() {
        Hooks.on(this.handler, this.#configureOptions.bind(this))
    }
    async #configureOptions(app, options) {
        if (!game.user?.isGM) {
            return false;
        }
        for (let contextOption of this.#contextOptions) {
            contextOption.updateOptions(app, options);
        }
    }
}
class FolderEntryContextOption {
    constructor(handler, label, icon, folderEntryCallback, folderEntryCondition) {
        if (!(handler instanceof FolderEntryHookHandler)) {
            throw "handler must be FolderEntryHookHandler";
        }
        this.handler = handler;
        this.name = label;
        this.icon = icon;
        this.folderEntryCallback = folderEntryCallback;
        if (folderEntryCallback && typeof folderEntryCallback === 'function' && folderEntryCallback.length !== 2) {
            throw "folderEntryCallback should be (entry, li)";
        }
        this.folderEntryCondition = folderEntryCondition;
        if (folderEntryCondition && typeof folderEntryCondition === 'function' && folderEntryCondition.length !== 2) {
            throw "folderEntryCondition should be (entry, li)";
        }
    }
    updateOptions(app, options) {
        options.push({
            name: game.i18n.localize(this.name),
            icon: this.icon,
            callback: async (li) => {
                const folderEntry = this.handler.resolveFolderEntry(app, li);
                return await this.folderEntryCallback(folderEntry, li);
            },
            condition: (li) => {
                if (!this.folderEntryCondition) {
                    return true;
                }
                const folderEntry = this.handler.resolveFolderEntry(app, li);
                if (!folderEntry) {
                    return false;
                }
                return this.folderEntryCondition(folderEntry, li);
            }
        });
    }
}
class FolderEntryHookHandler {
    constructor(handler) {
        this.handler = handler;
    }
    #contextOptions = [];

    AddContextOption(label, icon, folderCallback, folderCondition) {
        this.#contextOptions.push(new FolderEntryContextOption(
            this,
            label,
            icon,
            folderCallback,
            folderCondition
        ));
    }
    #getManager() {
        if (this.handler === "getActorContextOptions") {
            return game.actors;
        } else if (this.handler === "getItemContextOptions") {
            return game.items;
        } else if (this.handler === "getSceneContextOptions") {
            return game.scenes;
        } else if (this.handler === "getJournalContextOptions") {
            return game.journal;
        }
        throw new Error(`Unknown handler: ${this.handler}`);
    }
    resolveFolderEntry(app, li) {
        let entryId = $(li).closest("li").data("entryId");
        if (!entryId) {
            return;
        }
        return this.#getManager().get(entryId);
    }
    async Init() {
        Hooks.on(this.handler, this.#configureOptions.bind(this))
    }
    async #configureOptions(app, options) {
        if (!game.user?.isGM) {
            return false;
        }
        for (let contextOption of this.#contextOptions) {
            contextOption.updateOptions(app, options);
        }
    }
}

const getSceneDirectoryFolderContext = new FolderHookHandler("getFolderContextOptions");
getSceneDirectoryFolderContext.AddContextOption(
    "sdnd.scenes.folder.context.regenerateThumbs",
    '<i class="fas fa-sync"></i>',
    async (folder, li) => {
        let thumbCount = await scene.regenerateThumbnails(folder);
        if (thumbCount > 0) {
            ui.notifications.notify(`Regenerated ${thumbCount} thumbnail image${(thumbCount > 0 ? 's' : '')}.`);
        }
    },
    (folder, li) => {
        if (folder?.type !== "Scene") {
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
    }
);
getSceneDirectoryFolderContext.AddContextOption(
    "sdnd.scenes.folder.context.removePlayerTokens",
    '<i class="fa-regular fa-chess-knight"></i>',
    async (folder, li) => {
        let scenes = await tokens.removePlayerTokensFromSceneFolder(folder.id);
        let content = (scenes.length == 0) ? `No scenes under ${folder.name} contain actor tokens...` :
            `Removed Player Tokens from the following scenes:<br/>${scenes.map(s => s.name).sort().join("<br/>")}`;
        await ChatMessage.create({
            content: content,
            whisper: ChatMessage.getWhisperRecipients('GM'),
        });
        ui.notifications.notify(`Removed player tokens from  ${scenes.length} scene${(scenes.length == 1 ? '' : 's')}.`);
    },
    (folder, li) => {
        return folder?.type === "Scene";
    }
);
getSceneDirectoryFolderContext.AddContextOption(
    "sdnd.scenes.folder.context.findActors",
    '<i class="fa-solid fa-magnifying-glass"></i>',
    async (folder, li) => {
        let scenes = await scene.getScenesByFolderId(folder.id);
        await scene.getActorsInScenes(scenes);
    },
    (folder, li) => {
        return folder?.type === "Scene" ;
    }
);
getSceneDirectoryFolderContext.AddContextOption(
    "sdnd.scenes.folder.context.resetFogOfWar",
    '<i class="fa-solid fa-cloud"></i>',
    async (folder, li) => {
        let scenes = await scene.getScenesByFolderId(folder.id);
        let sceneIds = scenes.map(s => s.id).filter(id => !!id);
        if (sceneIds.length == 0) {
            ui.notifications.notify(`No scenes found under ${folder.name}.`);
            return;
        }
        let resetCount = 0;
        for (let sceneId of sceneIds) {
            await lighting.resetFogOfWar(sceneId);
            resetCount++;
        }
        ui.notifications.notify(`Reset fog of war for ${resetCount} scene${(resetCount == 1 ? '' : 's')}.`);
    },
    (folder, li) => {
        return folder?.type === "Scene";
    }
);
getSceneDirectoryFolderContext.AddContextOption(
    "sdnd.scenes.folder.context.resetDoors",
    '<i class="fa-solid fa-door-open"></i>',
    async (folder, li) => {
        let scenes = await scene.getScenesByFolderId(folder.id);
        if (!scenes || scenes.length == 0) {
            ui.notifications.notify(`No scenes found under ${folder.name}.`);
            return;
        }
        let resetDoorCount = 0;
        for (let sceneDoc of scenes) {
            resetDoorCount += await scene.resetDoors(sceneDoc);
        }
        ui.notifications.notify(`Reset ${resetDoorCount} door${(resetDoorCount == 1 ? '' : 's')} across ${scenes.length} scene${(scenes.length == 1 ? '' : 's')}.`);
    },
    (folder, li) => {
        return folder?.type === "Scene";
    }
);

const getActorDirectoryFolderContext = new FolderHookHandler("getFolderContextOptions");
getActorDirectoryFolderContext.AddContextOption(
    "sdnd.actor.folder.context.removeUnused",
    '<i class="fa-regular fa-broom"></i>',
    async (folder, li) => {
        const actorIds = actors.getActorsByFolderId(folder.id).map(a => a._id);
        await actors.removeUnusedActors(actorIds, folder.name);
    },
    (folder, li) => {
        if (folder?.type !== "Actor") {
            return false;
        }
        const actorCount = actors.getActorsByFolderId(folder.id).length;
        return actorCount > 0;
    }
);
getActorDirectoryFolderContext.AddContextOption(
    "sdnd.actor.folder.context.findInScenes",
    '<i class="fa-solid fa-magnifying-glass"></i>',
    async (folder, li) => {
        const actorIds = actors.getActorsByFolderId(folder.id).map(a => a._id);
        actors.findInScenes(actorIds);
    },
    (folder, li) => {
        if (folder?.type !== "Actor") {
            return false;
        }
        const actorCount = actors.getActorsByFolderId(folder.id).length;
        return actorCount > 0;
    }
);

const getActorDirectoryEntryContext = new FolderEntryHookHandler("getActorContextOptions");
getActorDirectoryEntryContext.AddContextOption(
    "sdnd.actor.folder.context.findInScenes",
    '<i class="fa-solid fa-magnifying-glass"></i>',
     async (actor, li) => {
        if (!actor) {
            return;
        }
        actors.findInScenes([actor._id]);
    }
);

const getSceneDirectoryEntryContext = new FolderEntryHookHandler("getSceneContextOptions");
getSceneDirectoryEntryContext.AddContextOption(
    "sdnd.actor.folder.context.findInScenes",
    '<i class="fa-solid fa-magnifying-glass"></i>',
     async (entry, li) => {
        if (!entry) {
            return;
        }
        await scene.getActorsInScenes([entry]);
    }
);
getSceneDirectoryEntryContext.AddContextOption(
    "sdnd.scenes.entry.context.setDoorDefaults",
    '<i class="fa-solid fa-door-closed"></i>',
    async (entry, li) => {
        if (!entry) {
            return;
        }
        await scene.setDoorDefaults(entry);
    }
);

// <i class="fa-solid fa-magnifying-glass"></i>
export let FolderHooks = {
    "init": async function _init() {
        const handlers = [
            getActorDirectoryFolderContext,
            getActorDirectoryEntryContext,
            getSceneDirectoryFolderContext,
            getSceneDirectoryEntryContext
        ];
        for (let handler of handlers) {
            handler.Init();
        }
    }
}