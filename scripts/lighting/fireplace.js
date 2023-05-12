import { guid } from "../Utility/guid.js";
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
        createFireplace(guid.uuidv4(), fireplaceTile, lights[0], sound[0], toggleFireplaceMacro);
    }
};

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
        "img": "modules/stroud-dnd-helpers/images/icons/Fireplace_Icon.webp",
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
                "id": uuidv4()
            }],
            "files": []
        }
    });
}
