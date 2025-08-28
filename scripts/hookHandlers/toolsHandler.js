import { sdndSettings } from "../settings.js";
import { sdndConstants } from "../constants.js";
import { actors } from "../actors/actors.js";

class ToolsHandler {
    constructor(handlers) {
        this.#handlers = handlers;
    }
    #handlers = [];
    async Init() {
        if (!sdndSettings.ToolsHandling.getValue()) {
            return;
        }
        for (let handler of this.#handlers) {
            await handler?.Hooks?.ready();
        }
    }
}

class ThievesTools {
    static Hooks = {
        ready: async () => {
            Hooks.on("dnd5e.preRollToolV2", ThievesTools.#ensureTools);
            Hooks.on("dnd5e.rollToolCheckV2", ThievesTools.#processFailure);
        }
    }
    static #GLOVES_OF_THIEVERY_EFFECT = "gloves_of_thievery_effect";
    static #ensureTools(config, dialog, message) {
        const thievesTools = config?.subject?.items?.filter(i => i.system?.identifier === "thieves-tools");
        if (!thievesTools || thievesTools.length === 0) {
            ui.notifications.warn("You need thieves' tools to use this feature.");
            return false;
        }
        return true;
    }
    static async #processFailure(rolls, data) {
        const { tool, subject } = data;
        if (tool !== "thief") {
            return;
        }
        await ThievesTools.#removeGlovesOfThieveryEffect(subject);
        await ThievesTools.#destroyThievesToolsOnFumble(subject, rolls);
    }
    static async #destroyThievesToolsOnFumble(actor, rolls) {
        const roll = rolls[0];
        if (!roll.isFumble) {
            return;
        }
        const thievesTools = actor.items.find(i => i.system?.identifier === "thieves-tools");
        if (!thievesTools) {
            return;
        }
        if (thievesTools.system?.quantity == 1) {
            await thievesTools.delete();
        }
        else {
            await thievesTools.update({ "system": { "quantity": (thievesTools.system?.quantity - 1) } });
        }
        await ChatMessage.create({
            content: "Your thieves' tools have been destroyed!",
            speaker: ChatMessage.getSpeaker({ actor })
        });
    }
    static async #removeGlovesOfThieveryEffect(actor) {
        const effect = actor?.effects?.find(e => e.getFlag(sdndConstants.MODULE_ID, "id") === this.#GLOVES_OF_THIEVERY_EFFECT);
        if (!effect) return;
        // Your custom handling for thieves' tools
        await actors.removeEffect(actor.uuid, effect.id);
    }
}


export const toolsHandler = new ToolsHandler([ThievesTools]);