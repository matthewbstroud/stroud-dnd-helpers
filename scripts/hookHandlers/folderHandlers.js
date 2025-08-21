import { actors } from "../actors/actors.js";
import { scene } from "../utility/scene.js";
import { tokens } from "../tokens.js";

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
        if (this.handler === "getActorDirectoryEntryContext") {
            return game.actors;
        } else if (this.handler === "getItemDirectoryEntryContext") {
            return game.items;
        } else if (this.handler === "getSceneDirectoryEntryContext") {
            return game.scenes;
        } else if (this.handler === "getJournalDirectoryEntryContext") {
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

const getSceneDirectoryFolderContext = new FolderHookHandler("getSceneDirectoryFolderContext");
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
    }
);
getSceneDirectoryFolderContext.AddContextOption(
    "sdnd.scenes.folder.context.findActors",
    '<i class="fa-solid fa-magnifying-glass"></i>',
    async (folder, li) => {
        let scenes = await scene.getScenesByFolderId(folder.id);
        await scene.getActorsInScenes(scenes);
    }
);

const getActorDirectoryFolderContext = new FolderHookHandler("getActorDirectoryFolderContext");
getActorDirectoryFolderContext.AddContextOption(
    "sdnd.actor.folder.context.removeUnused",
    '<i class="fa-regular fa-broom"></i>',
    async (folder, li) => {
        const actorIds = actors.getActorsByFolderId(folder.id).map(a => a._id);
        await actors.removeUnusedActors(actorIds, folder.name);
    },
    (folder, li) => {
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
        const actorCount = actors.getActorsByFolderId(folder.id).length;
        return actorCount > 0;
    }
);

const getActorDirectoryEntryContext = new FolderEntryHookHandler("getActorDirectoryEntryContext");
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

const getSceneDirectoryEntryContext = new FolderEntryHookHandler("getSceneDirectoryEntryContext");
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