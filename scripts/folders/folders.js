import { gmFunctions } from "../gm/gmFunctions.js";

export let folders = {
    "Actor": {
        "TempActors": {
            "name": "SND Temporary Actors",
            "type": "Actor",
            "folders": [],
            "ensureFolder": async () => ensureFolder(this.name, this.type, null)
        }
    },
    "ensureFolder": ensureFolder,

};

async function createFolder(folderName, folderType, parentID) {
    return await Folder.create({ "name": folderName, "type": folderType, "parent": parentID });
}

async function ensureFolder(folderName, folderType, parentID) {
    let folder = await game.folders.find(f => f.name == folderName && f.folder?.id == parentID);

    if (!folder) {
        folder = await createFolder(folderName, folderType, parentID);
    }

    return folder;
}