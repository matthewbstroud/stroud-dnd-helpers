import { guid } from "../utility/guid.js";
import { sdndConstants } from "../constants.js";

export let fireplace = {
    "createFireplace": async function _createFireplace() {
        if (!game.user.isGM) {
            ui.notifications.error(`Can only be run by the gamemaster!`);
            return;
        }

        let toggleFireplaceMacro = game.macros.getName("toggleFireplace");
        if (!toggleFireplaceMacro) {
            ui.notifications.error(`toggleFireplace macro not loaded`);
            return;
        }

        let fireplaceTile = canvas?.tiles?.controlled[0];

        if (!fireplaceTile) {
            ui.notifications.notify(`No background tile selected`);
            return;
        }
        let tileBounds = getTileBounds(fireplaceTile);
        let lights = canvas.scene.lights.filter(l => l.data.x >= tileBounds.x.min && l.data.x <= tileBounds.x.max && l.data.y >= tileBounds.y.min && l.data.y <= tileBounds.y.max);
        if (lights.length != 1) {
            ui.notifications.notify(`Only a single light should exist in the space of this tile!`);
            return;
        }
        let sounds = canvas.scene.sounds.filter(l => l.data.x >= tileBounds.x.min && l.data.x <= tileBounds.x.max && l.data.y >= tileBounds.y.min && l.data.y <= tileBounds.y.max);
        if (sounds.length != 1) {
            ui.notifications.notify(`Only a single sound should exist in the space this tile!`);
            return;
        }
        createFireplace(guid.uuidv4(), fireplaceTile, lights[0], sounds[0], toggleFireplaceMacro);
    },
    "toggleFireplace": async function _toggleFireplace(fireplaceID) {
        let light = canvas.scene.lights.find(l => l.getFlag("world", "fireplace") == fireplaceID);
        let sound = canvas.scene.sounds.find(l => l.getFlag("world", "fireplace") == fireplaceID);
        if (light && sound) {
            let newState = !light.hidden;
            await light.update({ hidden: newState });
            await sound.update({ hidden: newState });
            var message = "";
            if (newState) {
                message = "The fire goes out.";
            }
            else {
                message = "The fire bursts to life.";
            }
            ChatMessage.create({ content: message });
        }
        else {
            ui.notifications.notify(`Fireplace ${fireplaceID} does not exist in this scene.`);
        }
    },
    "rewireFireplaces": async function _rewireFireplaces() {
        let fireplaces = await canvas.scene.tiles.filter(t => t.flags["monks-active-tiles"]?.actions.find(a => a.data.entity.name == "toggleFireplace"));
        let toggleFireplaceMacro = await ensureMacro("toggleFireplace", sdndConstants.PACKS.COMPENDIUMS.MACRO.GM, "Behind the Scenes");
        if (!toggleFireplaceMacro) {
            return;
        }
        for (let fireplace of fireplaces) {
            let actions = fireplace.getFlag("monks-active-tiles", "actions");
            let scriptAction = actions.find(a => a.data.entity.name == "toggleFireplace");
            if (!scriptAction) {
                continue;
            }
            scriptAction.data.entity.id = toggleFireplaceMacro.uuid;
            fireplace.setFlag("monks-active-tiles", "actions", actions);
        }
    }
};

async function ensureMacro(macroName, packId, parentFolderName) {
    let macro = await game.macros.getName(macroName);
    if (!macro) {
        let pack = game.packs.get(packId);
        if (!pack) {
            ui.notifications.error(`Cannot find compendium ${packId}!`);
            return null;
        }
        let packMacro = pack.index.getName(macroName);
        if (!packMacro) {
            ui.notifications.error(`Cannot find macro ${macroName} compendium ${packId}!`);
            return null;
        }
        let parentFolder = game.folders.getName(parentFolderName);
        macro = await game.macros.importFromCompendium(pack, packMacro._id, { "folder": parentFolder?.id });
    }
    return macro;
}

function getTileBounds(targetTile) {
    return {
        x: {
            min: targetTile.x,
            max: targetTile.x + targetTile.width
        },
        y: {
            min: targetTile.y,
            max: targetTile.y + targetTile.height
        }
    };
}

function createFireplace(fpName, tile, light, sound, macro) {
    light.setFlag("world", "fireplace", fpName);
    sound.setFlag("world", "fireplace", fpName);
    tile.document.update({
        "texture": {
            "src": "modules/stroud-dnd-helpers/images/icons/Fireplace_Icon.webp"
        },
        "hidden": true,
        "locked": true,
        "flags.monks-active-tiles": {
            "active": true,
            "record": false,
            "restriction": "all",
            "controlled": "gm",
            "trigger": "dblclick",
            "allowpaused": true,
            "usealpha": false,
            "pointer": false,
            "pertoken": false,
            "minrequired": 0,
            "chance": 100,
            "fileindex": 0,
            "actions": [{
                "action": "runmacro",
                "data": {
                    "entity": {
                        "id": macro.uuid,
                        "name": macro.name
                    },
                    "args": `"${fpName}"`,
                    "runasgm": "gm"
                },
                "id": fpName
            }],
            "files": []
        }
    });
}
