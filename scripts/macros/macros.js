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
        if (!game.user.isGM) {
            return;
        }
        for (let folder of macroFolders) {
            await ensureFolder(folder, "Macro", null);
        }
    },
    "loadFromCompendium": async function _loadFromCompendiums(compendiumName, macroName, tofolder) {
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
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
    },
    "organize": organizeMacros
};

async function organizeMacros() {
    if (!game.user.isGM) {
        ui.notifications.notify(`Can only be run by the gamemaster!`);
        return;
    }

    var playersFolder = game.folders.getName(sdndConstants.FOLDERS.PLAYER_MACROS);

    if (!playersFolder) {
        playersFolder = await Folder.create({ "name": sdndConstants.FOLDERS.PLAYER_MACROS, "type": "Macro" });
    }


    let actorMacros = game.macros.filter(m => !m.folder);
    for (var i = 0; i < actorMacros.length; i++) {
        if (actorMacros[i].ownership > 0) {
            continue;
        }
        let newPermissions = removeInvalidPermissions(actorMacros[i]);
        if (Object.keys(newPermissions).length == 1) {
            // remove macro
            console.log(`Delete ${actorMacros[i].name}`);
            await actorMacros[i].delete();
            continue;
        }

        let user = actorMacros[i].author;
        if (!user) {
            continue;
        }
        console.log(user.name);
        let playerFolder = playersFolder.getSubfolders().find(f => f.name == user.name);
        if (!playerFolder) {
            playerFolder = await Folder.create({ "name": user.name, "type": "Macro", "parent": playersFolder.id });
        }
        if (!playerFolder) {
            ui.notifications.notify(`Cannot create folder for user ${user.name}.`);
            continue;
        }
        await actorMacros[i].update({ "folder": playerFolder.id });
    }

    function removeInvalidPermissions(macro) {
        let newPermissionData = deepCopy(macro.ownership);
        for (let [k, v] of Object.entries(newPermissionData)) {
            if (k === "default") {
                continue;
            }
            if (!game.users.get(k)) {
                // remove permission for user not in game
                console.log(k);
                delete newPermissionData[k];
            }
        }
        return newPermissionData;
    }

    function deepCopy(data) {
        return JSON.parse(JSON.stringify(data));
    }
}

async function ensureFolder(folderDef, folderType, parentID) {
    let folder = await game.folders.find(f => f.name == folderDef.label && f.folder?.id == parentID);

    if (!folder) {
        folder = await Folder.create({ "name": folderDef.label, "type": folderType, "parent": parentID });
    }
    if (!folderDef.folders) {
        return folder;
    }
    for (let subFolder of folderDef.folders) {
        await ensureFolder(subFolder, folderType, folder.id);
    }
    return folder;
}
