import { sdndConstants } from "../../constants.js";
import { scene } from "../../utility/scene.js";
import { tagging } from "../../utility/tagging.js";
import { gmFunctions } from "../../gm/gmFunctions.js";
import { numbers } from "../../utility/numbers.js";

const BLOOM_VACANT_SIZE = 0.5;

export class MagicBloom {
    static async #createLight(tokenCenter, templateScene) {
        let vacant = await game.MonksActiveTiles?.findVacantSpot(tokenCenter, { width: BLOOM_VACANT_SIZE, height: BLOOM_VACANT_SIZE }, game.canvas.scene, [], tokenCenter, true) ?? tokenCenter;
        const lights = await tagging.lighting.getTagged("magic_bloom", templateScene);
        if (!lights || lights.length === 0) {
            console.error(`Template light not found`);
            ui.notifications.error(`Template light not found`);
            return null;
        }
        const templateLight = foundry.utils.duplicate(lights[0]);
        templateLight.x = vacant.x;
        templateLight.y = vacant.y;
        const results = await canvas.scene.createEmbeddedDocuments("AmbientLight", [templateLight]);
        return results[0];
    }
    static async #createTile(light, templateScene, spellLevel) {
        const tiles = await tagging.tiles.getTagged("magic_bloom", templateScene);
        if (!tiles || tiles.length === 0) {
            console.error(`Template tile not found`);
            ui.notifications.error(`Template tile not found`);
            return null;
        }
        const templateTile = foundry.utils.duplicate(tiles[0]);
        templateTile.sort = Math.max(0, ...canvas.scene.tiles.map(t => t.sort)) + 1;
        templateTile.width = Math.floor(canvas.grid.size / 3);
        templateTile.height = Math.floor(canvas.grid.size / 3);
        templateTile.x = light.x - (templateTile.width / 2);
        templateTile.y = light.y - (templateTile.height / 2);
        let ambientLightActions = templateTile.flags["monks-active-tiles"].actions.filter(a => a.data?.entity?.name?.startsWith("AmbientLight:"));
        ambientLightActions.forEach(a => {
            a.data.entity.id = light.uuid;
            a.data.entity.name = `AmbientLight: ${light.id}`;
        });
        let hurtHeal = templateTile.flags["monks-active-tiles"].actions.find(a => a.action === "hurtheal")
        if (hurtHeal) {
            hurtHeal.data.value = `+[[4d4 + ${spellLevel}]]{Bloom Heal}`
        }
        return await canvas.scene.createEmbeddedDocuments("Tile", [templateTile]);
    }
    static async create(tokenDocument, spellLevel = 1) {
        const tokenCenter = {
            x: tokenDocument.x + (tokenDocument.width * canvas.grid.size) / 2,
            y: tokenDocument.y + (tokenDocument.height * canvas.grid.size) / 2
        };

        try {
            // get template scene
            const templateScene = await scene.referenceSceneFromCompendium(sdndConstants.PACKS.COMPENDIUMS.SCENES.SCENES, "TemplateObjects");
            if (!templateScene) {
                console.error(`Template scene not found`);
                ui.notifications.error(`Template scene not found`);
                return null;
            }
            const createdLight = await this.#createLight(tokenCenter, templateScene);
            const createdTile = await this.#createTile(createdLight, templateScene, spellLevel);
            return {
                tile: createdTile,
                light: createdLight,
                token: tokenDocument
            };

        } catch (error) {
            console.error("Error creating tile and light with active tiles:", error);
            ui.notifications.error("Failed to create active tile and ambient light. Check console for details.");
        }
    }
}

class RingOfBlooming {
    constructor() {
        this.ringOfBloomingId = "ring_of_blooming";
    }
    findRing(actor) {
        const ring = actor.items.find(i => i.getFlag(sdndConstants.MODULE_ID, "id") === this.ringOfBloomingId);
        return this.#ringEquippedAndAttuned(ring) ? ring : null;
    }
    #ringEquippedAndAttuned(ring) {
        if (!ring) {
            return false;
        }
        if (ring.system?.equipped && ring?.system?.attuned) {
            return true;
        }
        console.log("Ring of Blooming is not equipped and attuned.");
        return false;
    }
    #getUses(ring) {
        const uses = ring.system?.uses;
        if (!uses) return 0;
        return uses.max - uses.spent;
    }

    async #markLastSpellSlot(actor, spellSlot) {
        await actor.setFlag(sdndConstants.MODULE_ID, "lastSpellSlot", spellSlot);
    }
    #getLastSpellSlot(actor) {
        return actor.getFlag(sdndConstants.MODULE_ID, "lastSpellSlot");
    }
    async #refundLastSpellSlot(token, actor) {
        const lastSpellSlot = this.#getLastSpellSlot(actor);
        if (!lastSpellSlot) {
            ui.notifications.warn("No last spell slot found to refund.");
            return;
        }
        const currentSpellSlots = actor.system.spells[lastSpellSlot]?.value ?? 0;
        await actor.unsetFlag(sdndConstants.MODULE_ID, "lastSpellSlot");
        await this.#refundSpellSlot(token, actor, lastSpellSlot, currentSpellSlots, true);
    }
    async #refundSpellSlot(token, actor, spellSlot, currentValue, forced = false) {
        await actor.update({
            "system.spells": {
                [spellSlot]: {
                    "value": (currentValue + 1)
                }
            }
        });
        let content = `<p>A fragment of light shoots from the Ring of Blooming, and a delicate red flower sprouts from the ground where it lands.  The flower glows with a soft red light, clearly of a magical nature.</p>`;
        if (forced) {
            content += `<p>The blooming effect has dissipated for the day and will not return until the next dawn.</p>`;
        }
        await ChatMessage.create({
            flavor: "Ring of Blooming",
            content: content,
            type: CONST.CHAT_MESSAGE_TYPES.OOC
        });
        const spellLevel = numbers.toNumber(spellSlot.replace("spell", ""));
        await gmFunctions.createBloom(token.document.uuid, spellLevel);
    }
    /**
   * Fires after a spell or item has been used
   * @param {Item5e} item - The item/spell that was used
   * @param {object} config - Configuration options for the usage
   * @param {object} options - Additional options
   */
    async #onSpellCast(activity, usageConfig, results) {
        const item = activity.item;
        // Check if the item is a spell and it consumes a spell slot
        if (item.type !== "spell" || !(usageConfig.consume?.spellSlot ?? false)) {
            return;
        }
        const spellSlot = usageConfig.spell?.slot;
        if (!spellSlot) {
            console.log("No spell slot found, unable to continue...");
            return;
        }
        const spellLevel = numbers.toNumber(spellSlot.replace("spell", ""));
        if (spellLevel > 4) {
            return;
        }
        // find the ring of blooming on the actor
        const ringOfBlooming = this.findRing(activity.actor);
        if (!ringOfBlooming) return;
        this.#markLastSpellSlot(activity.actor, spellSlot);
        // check if the ring has uses left
        const usesRemaining = this.#getUses(ringOfBlooming);
        if (usesRemaining === 0) {
            return;
        }
        const roll = await new Roll('1d10').evaluate();
        const refundSpell = roll.total === 10;
        await roll.toMessage({
            speaker: { alias: 'Ring of Blooming' },
            flavor: refundSpell ? 'Spell Slot Refunded!' : 'Spell Slot Consumed...'
        });
        if (!refundSpell) return;
        const currentSpellSlots = results.updates?.actor?.system?.spells[spellSlot]?.value ?? 0;
        await this.#refundSpellSlot(usageConfig?.workflow?.token, activity.actor, spellSlot, currentSpellSlots);
    }

    async Ready() {
        Hooks.on("dnd5e.postUseActivity", this.#onSpellCast.bind(this));
    }
    async itemMacro({ speaker, actor, token, character, item, args }) {
        const macroPass = args[0].workflow?.macroPass;
        if (macroPass === "preItemRoll") {
            // Handle pre-item roll logic
            const ringOfBlooming = this.findRing(actor);
            if (!ringOfBlooming) {
                ui.notifications.warn("Ring of Blooming is not equipped and attuned.");
                return false;
            }
            const lastSpellSlot = this.#getLastSpellSlot(actor);
            if (!lastSpellSlot) {
                ui.notifications.warn("No last spell slot found to refund.");
                return false;
            }
            return true;
        }
        else if (!macroPass || macroPass !== "postActiveEffects") {
            return;
        }
        this.#refundLastSpellSlot(token, actor);
    }
}

export const ringOfBlooming = new RingOfBlooming();
