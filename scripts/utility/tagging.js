import { dialog } from "../dialog/dialog.js";
import { sdndConstants } from "../constants.js";
import { morphToken } from "../tokens.js";

export let tagging = {
    "tagDocuments": tagDocuments,
    "getTaggedDocuments": getTaggedDocuments,
    "listTags": foundry.utils.debounce(listTags, 250),
    "tagSelected": foundry.utils.debounce(tagSelected, 250),
    "doors": {
        "getTagged": async function _getTaggedDoors(name) {
            return await getTaggedDocuments(canvas.scene.walls, sdndConstants.MODULE_ID, "tagName", name);
        },
        "setState": setDoorState,
        "tagSelected": async function _tagSelectedTiles(name) {
            await tagControlled(canvas.walls, sdndConstants.MODULE_ID, "tagName", name);
        },
        "toggle": toggleDoors
    },
    "lighting": {
        "getTagged": async function _getTaggedLights(name) {
            return await getTaggedDocuments(canvas.scene.lights, sdndConstants.MODULE_ID, "tagName", name);
        },
        "toggle": toggleLights,
        "tagSelected": async function _tagSelectedLights(name) {
            await tagControlled(canvas.lighting, sdndConstants.MODULE_ID, "tagName", name);
        }
    },
    "sfx": {
        "getTagged": async function _getTaggedSfx(name) {
            return await getTaggedDocuments(canvas.scene.sounds, sdndConstants.MODULE_ID, "tagName", name);
        },
        "toggle": toggleSfx,
        "tagSelected": async function _tagSelectedSfx(name) {
            await tagControlled(canvas.sounds, sdndConstants.MODULE_ID, "tagName", name);
        }
    },
    "tiles": {
        "getTagged": async function _getTaggedTiles(name) {
            return await getTaggedDocuments(canvas.scene.tiles, sdndConstants.MODULE_ID, "tagName", name);
        },
        "toggle": toggleTiles,
        "toggleEnabled": toggleEnabledTiles,
        "trigger": triggerTiles,
        "tagSelected": async function _tagSelectedTiles(name) {
            await tagControlled(canvas.tiles, sdndConstants.MODULE_ID, "tagName", name);
        }
    },
    "tokens": {
        "getTagged": async function _getTaggedTokens(name) {
            return await getTaggedDocuments(canvas.scene.tokens, sdndConstants.MODULE_ID, "tagName", name);
        },
        "morph": morphTokens,
        "toggle": toggleTokens,
        "tagSelected": async function _tagSelectedTokens(name) {
            await tagControlled(canvas.tokens, sdndConstants.MODULE_ID, "tagName", name);
        }
    },
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

async function toggleLights(name, hidden) {
    await toggleHidden(canvas.scene.lights, name, hidden);
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
    else if (canvas.tokens.controlled.length > 0) {
        objectType = "Tokens";
        objectCount = canvas.tokens.controlled.length;
    }
    if (objectType.length == 0) {
        ui.notifications.warn("No selected lighting, sounds, tiles, or walls.");
        return;
    }
    await dialog.textPrompt(`Tag select ${objectType} (${objectCount})`, `Tag ${objectType}`, async function (text) {
        switch (objectType) {
            case "Lights":
                await tagging.lighting.tagSelected(text);
                break;
            case "Sounds":
                await tagging.sfx.tagSelected(text);
                break;
            case "Tiles":
                await tagging.tiles.tagSelected(text);
                break;
            case "Doors":
                await tagging.doors.tagSelected(text);
                break;
            case "Tokens":
                await tagging.tokens.tagSelected(text);
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
        tileTags: (getUniqueTags(canvas.scene.tiles, sdndConstants.MODULE_ID, "tagName")),
        tokenTags: (getUniqueTags(canvas.scene.tokens, sdndConstants.MODULE_ID, "tagName"))
    };
    let tagsHtml = `
<b>Tags in Scene: ${canvas.scene.name}:</b><br />
<ul>
<li><b>Doors</b><ul>${tagsToLI(tags.doorTags)}</ul></li>
<li><b>Lights</b><ul>${tagsToLI(tags.lightTags)}</ul></li>
<li><b>Sounds</b><ul>${tagsToLI(tags.soundTags)}</ul></li>
<li><b>Tiles</b><ul>${tagsToLI(tags.tileTags)}</ul></li>
<li><b>Tokens</b><ul>${tagsToLI(tags.tokenTags)}</ul></li>
</ul>`;
    ChatMessage.create({
        content: tagsHtml,
        whisper: ChatMessage.getWhisperRecipients('GM'),
    });
}
function tagsToLI(tags) {
    return tags ? Object.entries(tags).map(i => `<li>${i[0]}: ${i[1]}</li>`).join('') : "None";
}
async function toggleHidden(collection, name, hidden) {
    await executeAction(collection, name, async function (doc) {
        doc.update({
            "hidden": hidden ?? !doc.hidden
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

async function setDoorState(name, state) {
    await executeAction(canvas.scene.walls, name, async function (door) {
        door.update({ "ds": state });
    });
}

async function toggleEnabledTiles(name) {
    await executeAction(canvas.scene.tiles, name, async function (doc) {
        let enabled = !doc.getFlag("monks-active-tiles", "active");
        console.log(`Setting ${doc._id} to ${enabled ? 'enabled' : 'disabled'}`);
        doc.setFlag("monks-active-tiles", "active", enabled);
    });
}

async function triggerTiles(name) {
    await executeAction(canvas.scene.tiles, name, async function (doc) {
        console.log(doc._id);
        doc.trigger({ method: 'manual' });
    });
}

async function toggleTiles(name, hidden) {
    await toggleHidden(canvas.scene.tiles, name, hidden);
}

async function toggleSfx(name, hidden) {
    await toggleHidden(canvas.scene.sounds, name, hidden);
}

async function toggleTokens(name, hidden) {
    await toggleHidden(canvas.scene.tokens, name, hidden);
}

async function morphTokens(name) {
    await executeAction(canvas.scene.tokens, name, async function (token) {
        if (token instanceof dnd5e.documents.TokenDocument5e) {
            token = canvas.tokens.get(token.id);
        }
        if (!token) {
            return;
        }
        await morphToken(token);
    });
}

async function executeAction(collection, name, action) {
    let documents = await getTaggedDocuments(collection, sdndConstants.MODULE_ID, "tagName", name);
    if (!documents || documents.length == 0) {
        console.log(`No documents found with tag [${name}].`);
        return;
    }
    await Promise.all(documents.map(async (d) => {
        await action(d);
    }));
}
