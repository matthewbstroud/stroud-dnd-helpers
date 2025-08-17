import { actors } from "../actors/actors.js";
import { items } from "../items/items.js";
import { scene } from "../utility/scene.js";

class CompendiumContextOption {
    constructor(handler, label, icon, supportedCompendiumTypes, compendiumCallback, compendiumCondition) {
        if (!(handler instanceof CompendiumHookHandler)) {
            throw "handler must be CompendiumHookHandler";
        }
        this.handler = handler;
        this.name = label;
        this.icon = icon;
        this.supportedCompendiumTypes = supportedCompendiumTypes;
        this.compendiumCallback = compendiumCallback;
        if (compendiumCallback && typeof compendiumCallback === 'function' && compendiumCallback.length !== 2) {
            throw "compendiumCallback should be (compendium, li)";
        }
        this.compendiumCondition = compendiumCondition;
        if (compendiumCondition && typeof compendiumCondition === 'function' && compendiumCondition.length !== 2) {
            throw "compendiumCondition should be (compendium, li)";
        }
    }
    #aggregateCondition(compendium, li, compendiumCondition) {
        if (!this.#baseCondition(compendium)) {
            return false;
        }
        if (compendiumCondition && !compendiumCondition(compendium, li)) {
            return false;
        }
        return true;
    }
    #baseCondition(compendium) {
        if (this.supportedCompendiumTypes.length == 0) {
            return true;
        }
        return this.supportedCompendiumTypes.includes(compendium.metadata?.type);
    }
    updateOptions(app, options) {
        options.push({
            name: game.i18n.localize(this.name),
            icon: this.icon,
            callback: async (li) => {
                const compendium = this.handler.resolveCompendium(app, li);
                return await this.compendiumCallback(compendium, li);
            },
            condition: (li) => {
                const compendium = this.handler.resolveCompendium(app, li);
                return this.#aggregateCondition(compendium, li, this.compendiumCondition)
            }
        });
    }
}
class CompendiumHookHandler {
    constructor(handler) {
        this.handler = handler;
    }
    #contextOptions = [];

    AddContextOption(label, icon, supportedTypes, compendiumCallback, compendiumCondition) {
        this.#contextOptions.push(new CompendiumContextOption(
            this,
            label,
            icon,
            supportedTypes,
            compendiumCallback,
            compendiumCondition
        ));
    }
    #CompendiumType() { return foundry.documents?.collections?.Compendium ?? Compendium; }
    #CompendiumDirectoryType() { return foundry.documents?.collections?.CompendiumDirectory ?? CompendiumDirectory; }
    resolveCompendium(app, li) {
        if (app instanceof this.#CompendiumType()) {
            return app.collection;
        }
        if (app instanceof this.#CompendiumDirectoryType()) {
            const fullyQualifiedPack = $(li).data("pack")
            return game.packs.get(fullyQualifiedPack);
        }
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

const getCompendiumDirectoryEntryContext = new CompendiumHookHandler("getCompendiumDirectoryEntryContext");
getCompendiumDirectoryEntryContext.AddContextOption(
    "sdnd.compendium.entry.context.exportThumbnails",
    '<i class="fa-solid fa-camera-retro"></i>',
    [],
    async (compendium, li) => {
        const moduleId = compendium.metadata.packageName;
        await scene.packModuleThumbnails(moduleId);
    },
    (compendium, li) => {
        if (!compendium.metadata.type == "module") {
            return false;
        }
        const packageName = compendium.metadata.packageName;
        if (packageName.startsWith('sdnd-') || packageName.startsWith('stroud-')) {
            return true;
        }
    }
);
getCompendiumDirectoryEntryContext.AddContextOption(
    "sdnd.compendium.entry.context.removeUnusedActors",
    '<i class="fa-regular fa-broom"></i>',
    ['Actor'],
    async (compendium, li) => {
        const actorIds = Array.from(compendium.index?.values() ?? []).map(v => v._id);
        await actors.removeUnusedActors(actorIds, compendium.metadata.label);
    }
);

const getCompendiumEntryContext = new CompendiumHookHandler("getCompendiumEntryContext");
getCompendiumEntryContext.AddContextOption(
    "sdnd.compendium.entry.context.removeUnusedActors",
    '<i class="fa-regular fa-broom"></i>',
    ['Adventure'],
    async (compendium, li) => {
        const documentId = li.data("document-id");
        if (!documentId) {
            return false;
        }

        const entryUuid = compendium.index.get(documentId)?.uuid;
        if (!entryUuid) {
            return false;
        }
        const entry = await fromUuid(entryUuid);
        if (!entry) {
            return false;
        }

        const actorIds = Array.from(entry.actors?.values() ?? []).map(a => a._id);
        if (!actorIds || actorIds.length === 0) {
            ui.notifications.warn(`No actors exist in adventure '${entry.name}!`);
            return;
        }
        await actors.removeUnusedActors(actorIds, `adventure '${entry.name}'`);
    }
);
getCompendiumEntryContext.AddContextOption(
    "sdnd.compendium.entry.context.normalizeSystemIdentifier",
    '<i class="fa-solid fa-wrench"></i>',
    ['Adventure'],
    async (compendium, li) => {
        const documentId = li.data("document-id");
        if (!documentId) {
            return false;
        }

        const entryUuid = compendium.index.get(documentId)?.uuid;
        if (!entryUuid) {
            return false;
        }
        const entry = await fromUuid(entryUuid);
        if (!entry) {
            return false;
        }

        const itemIds = Array.from(entry.items?.values() ?? []).map(i => i._id);
        await items.normalizeSystemIdentifiers(itemIds, entry.uuid);
    }
);

export let CompendiumHooks = {
    "init": async function _init() {
        const handlers = [
            getCompendiumDirectoryEntryContext,
            getCompendiumEntryContext
        ];
        for (let handler of handlers) {
            handler.Init();
        }
    }
}