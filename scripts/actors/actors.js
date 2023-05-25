import { sdndConstants } from "../constants.js";
import { items } from "../items/items.js";
import { gmFunctions } from "../gm/gmFunctions.js";
export let actors = {
    "ensureActor": ensureActor
}

export function createActorHeaderButton(config, buttons) {
    if (config.object instanceof Actor) {
        buttons.unshift({
            class: 'stroudDnD',
            icon: 'fa-solid fa-dungeon',
            label: 'SDND',
            onclick: () => actorConfig(config.object)
        });
    }
}
async function actorConfig(actorDocument) {
    if (!(actorDocument.type === 'character' || actorDocument.type === 'npc')) {
        ui.notifications.info('This feature must be used on a character or npc!');
        return;
    }
    let sdndItems = [
        sdndConstants.FEATURES.TWILIGHT_SANCTUARY,
        sdndConstants.SPELLS.HUNTERS_MARK,
        sdndConstants.SPELLS.MAGIC_MISSILE,
        sdndConstants.SPELLS.SPIRITUAL_WEAPON
    ];
    let overrideableItems = actorDocument.items.filter(i =>
        !i.flags['stroud-dnd-helpers']?.["importedItem"] && sdndItems.includes(i.name)
    ).sort(items.sortByName);
    if (!overrideableItems || overrideableItems.length === 0) {
        ui.notifications.info(`${actorDocument.name} has no spells or features that can be modified by Stroud DND Helpers.`);
        return;
    }
    let overriddenItems = actorDocument.items.filter(i =>
        i.flags['stroud-dnd-helpers']?.["importedItem"]
    );
    promptForSpellOverrides(actorDocument, overrideableItems, overriddenItems);
}

async function ensureActor(actorName, packId, parentFolderName) {
    let actor = await game.actors.getName(actorName);
    if (!actor) {
        let pack = game.packs.get(packId);
        if (!pack) {
            ui.notifications.error(`Cannot find compendium ${packId}!`);
            return null;
        }
        let packActor = pack.index.getName(actorName);
        if (!packActor) {
            ui.notifications.error(`Cannot find actor ${actorName} compendium ${packId}!`);
            return null;
        }
        actor = await gmFunctions.importFromCompendium("Actor", packId, packActor._id, parentFolderName);
    }
    return actor;
}

async function overrideSpells(actor, spells) {
    for (let spell of spells) {
        let sndSpell = await getReplacementFromCompendium(spell);
        await actor.createEmbeddedDocuments('Item', [sndSpell]);
        await spell.delete();
    }
    ui.notifications.info(`Number of spells replaced: ${spells.length}.`);
}

async function getReplacementFromCompendium(spell){
    let pack = "";
    switch (spell.type) {
        case "feat":
            pack = sdndConstants.PACKS.COMPENDIUMS.ITEM.FEATURES;
            break;
        case "spell":
            pack = sdndConstants.PACKS.COMPENDIUMS.ITEM.SPELLS;
            break;
        default:
            pack = sdndConstants.PACKS.COMPENDIUMS.ITEM.ITEMS;
    }
    return await items.getItemFromCompendium(pack, spell.name, false, null);
}

async function promptForSpellOverrides(actor, overrideableItems, overriddenItems) {
    let options = overrideableItems.map(i => `<input type="checkbox" id="${i.id}" name="${i.id}" value="${i.id}">
        <label for="${i.id}">${i.name}</label><br>`
    ).join('');
    let form = `<h1>Override Spells/Features</h1>
    <form>
      ${options}
      <br/><br/>
    </form>
    `;
    new Dialog({
        title: `SDND Spell/Feature Overrides`,
        content: form,
        buttons: {
            yes: {
                icon: "<i class='fas fa-check'></i>",
                label: `Apply`,
                callback: (html) => {
                    let selectedSpells = [];
                    overrideableItems.forEach(element => {
                        if (html.find(`#${element.id}`).is(`:checked`)){
                            selectedSpells.push(element);
                        }
                    });
                    if (selectedSpells.length == 0) {
                        ui.notifications.info("Nothing selected...");
                        return;
                    }
                    overrideSpells(actor, selectedSpells);
                }
            },
            no: {
                icon: "<i class='fas fa-times'></i>",
                label: `Cancel`
            },
        },
        default: "yes"
    }, { width: 500 }).render(true);
}
