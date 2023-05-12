import { sdndConstants } from "../constants.js";

export let macros = {
    "loadFromCompendium": async function _loadFromCompendiums(compendiumName, macroName, folder){
        let compendium = await game.packs.get(compendiumName);
        if (!compendium) {
            ui.notifications.error(`Failed to load ${compendiumName}!`);
            return;
        }
        let macroID = await compendium.index.find(m => m.name == macroName)?._id;
        if (!macroID) {
            ui.notifications.error(`Cannot find ${macroName} in ${compendiumName}!`);
            return;
        }
        
    }
};

const macroCompendium = game.packs.get("world.my-macros");
macroID = macroCompendium.index.find(t => t.name === "Echo Swap")._id;
macroCompendium.getDocument(macroID).then(m => m.execute());