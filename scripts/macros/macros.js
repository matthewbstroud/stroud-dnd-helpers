import { sdndConstants } from "../constants.js";

const macroFolders = [
    {
        "label": "SDND GM Macros",
        "folders": [
            {
                "label": "Behind the Scenes",
                "macros": [
                    {
                        "name": "",
                        "pack": sdndConstants.PACKS.COMPENDIUMS.MACRO.GM
                    }
                ]
            },
            {
                "label": "Identification"
            },
            {
                "label": "Lights"
            },
            {
                "label": "Money"
            },
            {
                "label": "Tokens"
            },
            {
                "label": "Utility"
            }
        ]
    }
];

export let macros = {
    "initFolders": async function _initFolders() {
        for (let folder of macroFolders) {
            await ensureFolder(folder, "Macro", null);
        }
    },
    "loadFromCompendium": async function _loadFromCompendiums(compendiumName, macroName, folder) {
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

async function ensureFolder(folderDef, folderType, parentID) {
    let folder = await game.folders.find(f => f.name == folderDef.label && f.folder?.id == parentID);

    if (!folder) {
        folder = await Folder.create({ "name": folderDef.label, "type": folderType, "parent": parentID });
    }
    if (!folderDef.folders){
        return folder;
    }
    for (let subFolder of folderDef.folders) {
        await ensureFolder(subFolder, folderType, folder.id);
    }
    return folder;
}
