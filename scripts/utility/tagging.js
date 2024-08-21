import { dialog } from "../dialog/dialog.js";
import { sdndConstants } from "../constants.js";

export let tagging = {
    "tagDocuments": tagDocuments,
    "getTaggedDocuments": getTaggedDocuments,
    "listTags": listTags,
    "tagSelected": tagSelected,
    "doors": {
        "setState": async function _setDoorState(name, state) {
            await executeAction(canvas.scene.walls, name, async function (door) {
                door.update({ "ds": state });
            });
        },
        "tagSelected": async function _tagSelectedTiles(name) {
            await tagControlled(canvas.walls, sdndConstants.MODULE_ID, "tagName", name);
        },
        "toggle": toggleDoors
    },
    "lighting": {
        "toggle": async function _toggleLights(name) {
            await toggleHidden(canvas.scene.lights, name);
        },
        "tagSelected": async function _tagSelectedLights(name) {
            await tagControlled(canvas.lighting, sdndConstants.MODULE_ID, "tagName", name);
        }
    },
    "sfx": {
        "toggle": async function _toggleSfx(name) {
            await toggleHidden(canvas.scene.sounds, name);
        },
        "tagSelected": async function _tagSelectedSfx(name) {
            await tagControlled(canvas.sounds, sdndConstants.MODULE_ID, "tagName", name);
        }
    },
    "tiles": {
        "trigger": async function _triggerTiles(name) {
            await executeAction(canvas.scene.tiles, name, async function (doc) {
                console.log(doc._id);
                doc.trigger({ method: 'manual' });
            });
        },
        "tagSelected": async function _tagSelectedTiles(name) {
            await tagControlled(canvas.tiles, sdndConstants.MODULE_ID, "tagName", name);
        }
    }
}

async function tagDocuments(documents, scope, key, value) {
    await Promise.all(documents.map(async (d) => {
        d.setFlag(scope, key, value);
    }));
}

async function getTaggedDocuments(collection, scope, key, value) {
    return await collection.filter(i => i.getFlag(scope, key) == value);
}

function getUniqueTags(collection, scope, key) {
    let tags = collection.filter(i => i.getFlag(scope, key)).map(i => i.getFlag(scope, key)).sort();
    if (!tags || tags.length == 0) {
        return null;
    }
    let result = {};
    for (let i = 0; i < tags.length; i++) {
        if (!Object.hasOwn(result, tags[i])) {
            result[tags[i]] = 1;
            continue;
        }
        result[tags[i]]++;
    }
    return result;
}


async function tagControlled(collection, scope, key, value) {
    let controlledDocuments = collection?.controlled?.map(c => c.document);
    if (!controlledDocuments) {
        ui.notifications.error("Collection is empty or does not support the controlled attribute!");
        return;
    }
    tagDocuments(controlledDocuments, scope, key, value);
}

async function tagSelected() {
    if (!game.user.isGM) {
        ui.notifications.warn("Only a GM can use this!");
        return;
    }
    // determine what collections are popluated
    let objectType = "";
    let objectCount = 0;
    if (canvas.lighting.controlled.length > 0) {
        objectType = "Lights";
        objectCount = canvas.lighting.controlled.length;
    }
    else if (canvas.sounds.controlled.length > 0) {
        objectType = "Sounds";
        objectCount = canvas.sounds.controlled.length;
    }
    else if (canvas.tiles.controlled.length > 0) {
        objectType = "Tiles";
        objectCount = canvas.tiles.controlled.length;
    }
    else if (canvas.walls.controlled.length > 0) {
        objectType = "Doors";
        objectCount = canvas.walls.controlled.length;
    }
    if (objectType.length == 0) {
        ui.notifications.warn("No selected lighting, sounds, tiles, or walls.");
        return;
    }
    await dialog.textPrompt(`Tag select ${objectType} (${objectCount})`, `Tag ${objectType}`, async function(text) {
        switch (objectType) {
            case "Lights":
                tagging.lighting.tagSelected(text);
                break;
            case "Sounds":
                tagging.sfx.tagSelected(text);
                break;
            case "Tiles":
                tagging.tiles.tagSelected(text);
                break;
            case "Doors":
                tagging.doors.tagSelected(text);
                break;
        }
    });    
}

function listTags() {
    if (!canvas.scene) {
        ui.notifications.warn("No scene selected!");
        return;
    }
    let tags = {
        doorTags: (getUniqueTags(canvas.scene.walls, sdndConstants.MODULE_ID, "tagName")),
        lightTags: (getUniqueTags(canvas.scene.lights, sdndConstants.MODULE_ID, "tagName")),
        soundTags: (getUniqueTags(canvas.scene.sounds, sdndConstants.MODULE_ID, "tagName")),
        tileTags: (getUniqueTags(canvas.scene.tiles, sdndConstants.MODULE_ID, "tagName"))
    };
    let tagsHtml = `
<b>Tags in Scene: ${canvas.scene.name}:</b><br />
<ul>
<li><b>Doors</b><ul>${tagsToLI(tags.doorTags)}</ul></li>
<li><b>Lights</b><ul>${tagsToLI(tags.lightTags)}</ul></li>
<li><b>Sounds</b><ul>${tagsToLI(tags.soundTags)}</ul></li>
<li><b>Tiles</b><ul>${tagsToLI(tags.tileTags)}</ul></li>
</ul>`;  
    ChatMessage.create({
        content: tagsHtml,
        whisper: ChatMessage.getWhisperRecipients('GM'),
    });
}
function tagsToLI(tags) {
    return tags ? Object.entries(tags).map(i => `<li>${i[0]}: ${i[1]}</li>`).join('') : "None";
}
async function toggleHidden(collection, name) {
    await executeAction(collection, name, async function (doc) {
        doc.update({
            "hidden": !doc.hidden
        });
    });
}

async function toggleDoors(name) {
    await executeAction(canvas.scene.walls, name, async function (door) {
        let newState = "";
        switch (door.ds) {
            case CONST.WALL_DOOR_STATES.OPEN:
                newState = CONST.WALL_DOOR_STATES.CLOSED;
                break;
            case CONST.WALL_DOOR_STATES.CLOSED:
                newState = CONST.WALL_DOOR_STATES.OPEN;
                break;
            case CONST.WALL_DOOR_STATES.LOCKED:
                newState = CONST.WALL_DOOR_STATES.CLOSED;
                break;
        }
        door.update({ "ds": newState });
    });
}

async function executeAction(collection, name, action) {
    let documents = await getTaggedDocuments(collection, sdndConstants.MODULE_ID, "tagName", name);
    if (!documents || documents.length == 0) {
        console.log(`No documents found with tag [${name}].`);
        return;
    }
    await Promise.all(documents.map(async (d) => {
        action(d);
    }));
}
