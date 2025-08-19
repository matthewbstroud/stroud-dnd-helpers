import { actors } from "../actors/actors.js";
import { items } from "../items/items.js";
import { scene } from "../utility/scene.js";
import { tokens } from "../tokens.js";

class FolderContextOption {
    constructor(handler, label, icon, folderCallback, folderCondition) {
        if (!(handler instanceof FolderHookHandler)) {
            throw "handler must be SceneHookHandler";
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

// <i class="fa-solid fa-magnifying-glass"></i>
export let FolderHooks = {
    "init": async function _init() {
        const handlers = [
            getActorDirectoryFolderContext,
            getSceneDirectoryFolderContext
        ];
        for (let handler of handlers) {
            handler.Init();
        }
    }
}