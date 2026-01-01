import { actors } from "../actors/actors.js";
import { sdndConstants } from "../constants.js";
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

// const getCompendiumDirectoryEntryContext = new CompendiumHookHandler("getFolderContextOptions");
// getCompendiumDirectoryEntryContext.AddContextOption(
//     "sdnd.compendium.entry.context.exportThumbnails",
//     '<i class="fa-solid fa-camera-retro"></i>',
//     [],
//     async (compendium, li) => {
//         const moduleId = compendium.metadata.packageName;
//         await scene.packModuleThumbnails(moduleId);
//     },
//     (compendium, li) => {
//         var folder = fromUuidSync(li.parentElement.dataset["uuid"]);
//         if (folder.type === "Compendium") {
//             return false;
//         }
//         if (!compendium.metadata.type == "module") {
//             return false;
//         }
//         const packageName = compendium.metadata.packageName;
//         if (packageName.startsWith('sdnd-') || packageName.startsWith('stroud-')) {
//             return true;
//         }
//     }
// );
// getCompendiumDirectoryEntryContext.AddContextOption(
//     "sdnd.compendium.entry.context.removeUnusedActors",
//     '<i class="fa-regular fa-broom"></i>',
//     ['Actor'],
//     async (compendium, li) => {
//         const actorIds = Array.from(compendium.index?.values() ?? []).map(v => v._id);
//         await actors.removeUnusedActors(actorIds, compendium.metadata.label);
//     }
// );

const getCompendiumEntryContext = new CompendiumHookHandler("getCompendiumContextOptions");
getCompendiumEntryContext.AddContextOption(
    "sdnd.compendium.entry.context.removeUnusedActors",
    '<i class="fa-regular fa-broom"></i>',
    ['Adventure'],
    async (compendium, li) => {
        const actorIds = await getActorIdsFromAdventureCompendium(compendium);
        if (actorIds.length === 0) {
            ui.notifications.warn(`No actors exist in adventure '${compendium.metadata.label}!`);
            return;
        }
        await actors.removeUnusedActors(actorIds, `adventure '${compendium.metadata.label}'`);
    }
);
// getCompendiumEntryContext.AddContextOption(
//     "sdnd.compendium.entry.context.normalizeSystemIdentifier",
//     '<i class="fa-solid fa-wrench"></i>',
//     ['Adventure'],
//     async (compendium, li) => {
//         const itemIds = await getItemIdsFromAdventureCompendium(compendium);
//         if (itemIds.length === 0) {
//             ui.notifications.warn(`No items exist in adventure '${compendium.metadata.label}'!`);
//             return;
//         }
//         await items.normalizeSystemIdentifiers(itemIds, entry.uuid);
//     }
// );
const actorIdCache = new Map();
/**
 * Get distinct list of all actor IDs across all adventures in a compendium
 * @param {CompendiumCollection} compendium - The adventure compendium to get actors from
 * @returns {Promise<string[]>} Array of distinct actor IDs from all adventures
 */
async function getActorIdsFromAdventureCompendium(compendium) {
    if (compendium.metadata?.type !== 'Adventure') {
        console.warn('Compendium is not an Adventure type');
        return [];
    }
    const cacheKey = `${compendium.metadata.id}_actorIdCache`;
    const cachedIds = actorIdCache.get(cacheKey);
    if (Array.isArray(cachedIds)) {
        console.log('Using cached actor IDs from adventure compendium');
        return cachedIds;
    }

    const actorIds = new Set();
    const indexArray = Array.from(compendium.index);
    const totalAdventures = indexArray.length;
    const progress = ui.notifications.info("Scanning Adventures for Actors...", {progress: true, permanent: false});
    
    // Iterate over all adventures in the compendium index
    for (let i = 0; i < indexArray.length; i++) {
        const indexEntry = indexArray[i];
        progress.update({pct: i / totalAdventures, message: `Scanning Adventures for Actors: ${i + 1} of ${totalAdventures}`});
        try {
            const adventure = await fromUuid(indexEntry.uuid);
            if (adventure) {
                const adventureActorIds = Array.from(adventure.actors?.values() ?? []).map(a => a._id);
                adventureActorIds.forEach(id => actorIds.add(id));
                console.log(`Adventure "${adventure.name}" contains ${adventureActorIds.length} actors`);
            }
        } catch (error) {
            console.error(`Failed to load adventure ${indexEntry.name}:`, error);
        }
    }
    
    progress.update({pct: 1.0, message: `Scanning Adventures for Actors: ${totalAdventures} of ${totalAdventures} complete`});
    
    const actorIdsArray = Array.from(actorIds);
    actorIdCache.set(cacheKey, actorIdsArray);
    return actorIdsArray;
}

const itemIdCache = new Map();
/**
 * Get distinct list of all item IDs across all adventures in a compendium
 * @param {CompendiumCollection} compendium - The adventure compendium to get actors from
 * @returns {Promise<string[]>} Array of distinct actor IDs from all adventures
 */
async function getItemIdsFromAdventureCompendium(compendium) {
    if (compendium.metadata?.type !== 'Adventure') {
        console.warn('Compendium is not an Adventure type');
        return [];
    }
    const cacheKey = `${compendium.metadata.id}_itemIdCache`;
    const cachedIds = itemIdCache.get(cacheKey);
    if (Array.isArray(cachedIds)) {
        console.log('Using cached item IDs from adventure compendium');
        return cachedIds;
    }

    const itemIds = new Set();
    const indexArray = Array.from(compendium.index);
    const totalAdventures = indexArray.length;
    const progress = ui.notifications.info("Scanning Adventures for Items...", {progress: true, permanent: false});
    
    // Iterate over all adventures in the compendium index
    for (let i = 0; i < indexArray.length; i++) {
        const indexEntry = indexArray[i];
        progress.update({pct: i / totalAdventures, message: `Scanning Adventures for Items: ${i + 1} of ${totalAdventures}`});
        try {
            const adventure = await fromUuid(indexEntry.uuid);
            if (adventure) {
                const adventureItemIds = Array.from(adventure.items?.values() ?? []).map(a => a._id);
                adventureItemIds.forEach(id => itemIds.add(id));
                console.log(`Adventure "${adventure.name}" contains ${adventureItemIds.length} items`);
            }
        } catch (error) {
            console.error(`Failed to load adventure ${indexEntry.name}:`, error);
        }
    }
    
    progress.update({pct: 1.0, message: `Scanning Adventures for Items: ${totalAdventures} of ${totalAdventures} complete`});
    
    const itemIdsArray = Array.from(itemIds);
    itemIdCache.set(cacheKey, itemIdsArray);
    return itemIdsArray;
}

export let CompendiumHooks = {
    "init": async function _init() {
        const handlers = [
            // getCompendiumDirectoryEntryContext,
            getCompendiumEntryContext
        ];
        for (let handler of handlers) {
            await handler.Init();
        }
    },
    getActorIdsFromAdventureCompendium
}