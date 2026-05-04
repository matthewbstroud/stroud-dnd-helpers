import { guid } from "../utility/guid.js";
import { sdndConstants } from "../constants.js";

const TOGGLE_FIREPLACE_MACRO_UUID = "Compendium.stroud-dnd-helpers.SDND-GM-Macros.Macro.fmvUKqibTHufoKNq";
export let fireplace = {
    "createFireplace": foundry.utils.debounce(_createFireplace, 250),
    "toggleFireplace": async function _toggleFireplace(fireplaceID) {
        let light = canvas.scene.lights.find(l => l.getFlag(sdndConstants.MODULE_ID, "fireplace") == fireplaceID);
        let sound = canvas.scene.sounds.find(l => l.getFlag(sdndConstants.MODULE_ID, "fireplace") == fireplaceID);
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
            await ChatMessage.create({ content: message });
        }
        else {
            ui.notifications.notify(`Fireplace ${fireplaceID} does not exist in this scene.`);
        }
    },
    "rewireFireplaces": foundry.utils.debounce(rewireFireplaces, 250),
    "rewireAllFireplaces": foundry.utils.debounce(rewireAllFireplaces, 250)
};

async function _createFireplace() {
    if (!game.user.isGM) {
        ui.notifications.error(`Can only be run by the gamemaster!`);
        return;
    }

    let toggleFireplaceMacro = await fromUuid(TOGGLE_FIREPLACE_MACRO_UUID);

    if (!toggleFireplaceMacro) {
        ui.notifications.error(`Stroud DnD Helpers fireplace toggle macro is missing!`);
        return;
    }

    let fireplaceTile = canvas?.tiles?.controlled[0];

    if (!fireplaceTile) {
        ui.notifications.notify(`No background tile selected`);
        return;
    }
    let tileBounds = getTileBounds(fireplaceTile);
    let lights = canvas.scene.lights.filter(l => l.x >= tileBounds.x.min && l.x <= tileBounds.x.max && l.y >= tileBounds.y.min && l.y <= tileBounds.y.max);
    if (lights.length != 1) {
        ui.notifications.notify(`Only a single light should exist in the space of this tile!`);
        return;
    }
    let sounds = canvas.scene.sounds.filter(l => l.x >= tileBounds.x.min && l.x <= tileBounds.x.max && l.y >= tileBounds.y.min && l.y <= tileBounds.y.max);
    if (sounds.length != 1) {
        ui.notifications.notify(`Only a single sound should exist in the space this tile!`);
        return;
    }
    createFireplace(guid.uuidv4(), fireplaceTile, lights[0], sounds[0], toggleFireplaceMacro);
}

async function rewireAllFireplaces() {
    for (let scene of game.scenes.contents) {
        await rewireFireplaces(scene);
    }
}

async function rewireFireplaces(scene) {

    if (!scene) {
        scene = canvas.scene;
    }
    let fireplaces = scene.tiles.filter(t => t.flags["monks-active-tiles"]?.actions?.find(a => a.data?.entity?.name == "toggleFireplace"));

    if (fireplaces.length == 0) {
        return;
    }
    console.log(`Scene ${scene.name}: found ${fireplaces.length} fireplaces to rewire.`);
    let toggleFireplaceMacro = await fromUuid(TOGGLE_FIREPLACE_MACRO_UUID);
    if (!toggleFireplaceMacro) {
        return;
    }
    let maxSort = Math.max(...scene.tiles.map(t => t.sort));
    for (let fireplace of fireplaces) {
        let actions = fireplace.getFlag("monks-active-tiles", "actions");
        let scriptAction = actions.find(a => a.data.entity.name == "toggleFireplace");
        if (!scriptAction) {
            continue;
        }
        scriptAction.data.entity.id = toggleFireplaceMacro.uuid;
        await fireplace.setFlag("monks-active-tiles", "actions", actions);
        const args = scriptAction.data.args.split(" ");
        const fireplaceGuid = args[0].replace(/"/g, '');
        await transposeFlags(scene, fireplaceGuid);
        if (fireplace.texture.src.endsWith('custom_icons/Fireplace_Icon.webp') || fireplace.sort < maxSort) {
            await fireplace.update({ "texture.src": 'modules/stroud-dnd-helpers/images/icons/Fireplace_Icon.webp', "sort": (maxSort)});
        }
    }
}

async function transposeFlags(scene, fireplaceGuid) {
    let light = scene.lights.find(l => l.getFlag("world", "fireplace") == fireplaceGuid);
    let sound = scene.sounds.find(s => s.getFlag("world", "fireplace") == fireplaceGuid);
    if (light) {
        await light.setFlag(sdndConstants.MODULE_ID, "fireplace", fireplaceGuid);
        await light.unsetFlag("world", "fireplace");
    }
    if (sound) {
        await sound.setFlag(sdndConstants.MODULE_ID, "fireplace", fireplaceGuid);
        await sound.unsetFlag("world", "fireplace");
    }
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
    light.setFlag(sdndConstants.MODULE_ID, "fireplace", fpName);
    sound.setFlag(sdndConstants.MODULE_ID, "fireplace", fpName);
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
