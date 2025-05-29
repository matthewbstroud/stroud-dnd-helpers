import { gmFunctions } from "../gm/gmFunctions.js";

const tempActors = {
    "name": "SND Temporary Actors",
    "type": "Actor",
    "folders": [],
    "ensureFolder": async function _ensureFolder(parentID) {
        return await folders.ensureFolder(this.name, this.type, parentID);
    }
};

export let folders = {
    "Actor": {
        "TempActors": tempActors
    },
    "ensureFolder": ensureFolder,
    "childOfFolder": childOfFolder
};


async function createFolder(folderName, folderType, parentID) {
    return await Folder.create({ "name": folderName, "type": folderType, "parent": parentID });
}

async function ensureFolder(folderName, folderType, parentID) {
    let folder = game.folders.find(f => f.name == folderName && f.folder?.id == parentID);

    if (!folder) {
        folder = await createFolder(folderName, folderType, parentID);
    }

    return folder;
}

function childOfFolder(doc, folderId) {
    let folderSet = getFolders(doc.folder);
    return folderSet.has(folderId);
}

function getFolders(folder, set) {
    if (!set) {
        set = new Set();
    }
    if (!folder) {
        return set;
    }
    set.add(folder.id);
    if (!folder.folder) {
        return set;
    }
    return getFolders(folder.folder, set);
}