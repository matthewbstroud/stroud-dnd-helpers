import { sdndConstants } from "../constants.js";

export let tagging = {
    "tagDocuments": tagDocuments,
    "getTaggedDocuments": getTaggedDocuments,
    "doors": {
        "setState": async function _setDoorState(name, state) {
            await executeAction(canvas.scene.walls, name, async function (door) {
                door.update({ "ds": state });
            });
        },
        "tagSelected": async function _tagSelectedTiles(name) {
            await tagControlled(canvas.walls, sdndConstants.MODULE_ID, "tagName", name);
        }
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

async function tagControlled(collection, scope, key, value) {
    let controlledDocuments = collection?.controlled?.map(c => c.document);
    if (!controlledDocuments) {
        ui.notifications.error("Collection is empty or does not support the controlled attribute!");
        return;
    }
    tagDocuments(controlledDocuments, scope, key, value);
}

async function toggleHidden(collection, name) {
    await executeAction(collection, name, async function (doc) {
        doc.update({
            "hidden": !doc.hidden
        });
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
