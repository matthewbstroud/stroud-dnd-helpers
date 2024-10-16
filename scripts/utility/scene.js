
export let scene = {
    "rewireMonksActiveTiles": foundry.utils.debounce(_rewireMonksActiveTiles, 250),
    "packModuleThumbnails": _packModuleThumbnails,
    "regenerateThumbnails": _regenerateThumbnails,
    "replaceInScenes": async function _replaceInScenes(searchPattern, replacement, previewOnly) {
        let updates = [];
        for (let scene of game.scenes) {
            let sceneUpdates = { "_id": scene._id };
            if (scene.background?.src?.includes(searchPattern)) {
                sceneUpdates.background = {
                    "src": (scene.background.src.replace(searchPattern, replacement))
                };
            }
            if (scene.foreground?.src?.includes(searchPattern)) {
                sceneUpdates.foreground = {
                    "src": (scene.foreground.src.replace(searchPattern, replacement))
                };
            }
            let tokenUpdates = replaceInTokens(scene, searchPattern, replacement);
            if (tokenUpdates && tokenUpdates.length > 0) {
                sceneUpdates.tokens = tokenUpdates
            }
            let tileUpdates = replaceInTiles(scene, searchPattern, replacement);
            if (tileUpdates && tileUpdates.length > 0) {
                sceneUpdates.tiles = tileUpdates;
            }
            let soundUpdates = replaceInSounds(scene, searchPattern, replacement);
            if (soundUpdates && soundUpdates.length > 0) {
                sceneUpdates.sounds = soundUpdates;
            }
            if (Object.keys(sceneUpdates).length == 1) {
                continue;
            }
            if (previewOnly) {
                sceneUpdates.name = scene.name;
            }
            updates.push(sceneUpdates);
        }
        if (previewOnly || updates.length == 0) {
            return updates;
        }
        await Scene.updateDocuments(updates);
        return updates;
    }
};

let exportCounters = {
    skipped: 0,
    exported: 0
};

function replaceInTokens(scene, searchPattern, replacement) {
    let updates = [];
    for (let token of scene.tokens) {
        if (!token.texture?.src?.includes(searchPattern)) {
            continue;
        }
        updates.push({
            "_id": token._id,
            "texture": {
                "src": (token.texture.src.replace(searchPattern, replacement))
            }
        });
    }
    return updates;
}

function replaceInTiles(scene, searchPattern, replacement) {
    let updates = [];
    for (let tile of scene.tiles) {
        let tileChanges = {
            "_id": tile._id
        };
        if (tile.flags["monks-active-tiles"]?.actions?.length > 0) {
            try {
                let monksFlags = JSON.stringify(tile.flags["monks-active-tiles"]);
                if (monksFlags.includes(searchPattern)) {
                    monksFlags = monksFlags.replaceAll(searchPattern, replacement);
                    tileChanges.flags = {
                        "monks-active-tiles": (JSON.parse(monksFlags))
                    };
                }
            }
            catch (ex) {
                console.log(`Failed to process monks tile ${tile._id} in scene ${scene.name}!`);
            }
        }
        if (tile.texture?.src?.includes(searchPattern)) {
            tileChanges.texture = {
                "src": (tile.texture.src.replace(searchPattern, replacement))
            };
        }
        if (tileChanges.flags || tileChanges.texture) {
            updates.push(tileChanges);
        }
    }
    return updates;
}

function replaceInSounds(scene, searchPattern, replacement) {
    return scene?.sounds?.filter(s => s.path?.includes(searchPattern)).map(r => ({
        "_id": r._id,
        "path": r.path.replace(searchPattern, replacement)
    }));
}

async function _rewireMonksActiveTiles() {
    if (!game.user.isGM) {
        ui.notifications.notify(`Can only be run by the gamemaster!`);
        return;
    }
    let tileCount = 0;
    await canvas.scene.tiles.filter(t => t.flags["monks-active-tiles"]?.actions.length > 0).forEach(tile => {
        var tileData = JSON.stringify(tile.flags['monks-active-tiles']);
        tileData = tileData.replace(/Scene\.\w+/g, canvas.scene.uuid);
        tileCount++;
        tile.update({
            'flags.monks-active-tiles': JSON.parse(tileData)
        });
    });
    ui.notifications.notify(`Processed tile count was ${tileCount}.`);
}

async function _packModuleThumbnails(moduleId) {
    exportCounters.exported = 0;
    exportCounters.skipped = 0;

    const thumbs_folder = 'images/thumbs';
    if (! await FilePicker.browse('data', `modules/${moduleId}/`).then(r => !r.dirs.includes(`modules/${moduleId}/${thumbs_folder}`))) {
        await FilePicker.createDirectory('data', `modules/${moduleId}/${thumbs_folder}/`)
    }
    for (const pack of game.packs.filter(p => p.metadata.packageName === moduleId && (p.metadata.type === 'Adventure' || p.metadata.type === 'Scene'))) {
        switch (pack.metadata.type) {
            case 'Adventure':
                await packAdventureCompendiumThumbnails(pack, moduleId, thumbs_folder);
                break;
            case 'Scene':
                await packSceneCompendiumThumbnails(pack, moduleId, thumbs_folder);
                break;
            default:
                console.log(`Compendiums of type ${pack.metadata.type} are not supported. Skipping.`);
        }
        ui.notifications.notify(`Thumbnails Exported: ${exportCounters.exported}  Skipped: ${exportCounters.skipped}`);
    }
}

async function packAdventureCompendiumThumbnails(adventurePack, moduleId, thumbs_folder) {
    for (const adventureIdx of adventurePack.index.values()) {
        let adventure = await adventurePack.getDocument(adventureIdx._id);
        let scenes = Array.from(adventure.scenes);
        await packSceneThumbnails(scenes, moduleId, thumbs_folder);
    }
}

async function packSceneCompendiumThumbnails(scenePack, moduleId, thumbs_folder) {
    let scenes = scenePack.index.values();
    await packSceneThumbnails(scenes, moduleId, thumbs_folder);
}

async function packSceneThumbnails(scenes, moduleId, thumbs_folder) {
    for (const scene of scenes) {
        let fileName = scene.thumb.split('/').pop();
        let moduleThumbPath = `modules/${moduleId}/${thumbs_folder}/${fileName}`;
        if (await srcExists(moduleThumbPath)) {
            exportCounters.skipped++
            continue;
        }
        let thumbExists = await srcExists(scene.thumb);
        if (!thumbExists) {
            console.log(`${scene.thumb} no longer exists! ${scene.name} will need to be updated!`);
            continue;
        }
        let blob = await fetch(scene.thumb).then(r => r.blob())
        let { path } = await FilePicker.upload(
            "data",
            `modules/${moduleId}/${thumbs_folder}/`,
            new File([blob], fileName, { type: blob.type }),
            {},
            { notify: false }
        );
        exportCounters.exported++;
    }
}

async function _regenerateThumbnails(folder) {
    let thumbCount = 0;
    if (!folder) {
        return thumbCount;
    }
    let subFolders = await folder.getSubfolders();
    if (subFolders && subFolders?.length > 0) {
        for (const subFolder of subFolders) {
            thumbCount += await _regenerateThumbnails(subFolder);
        }
    }
    let folderScenes = game.scenes.filter(s => s.folder?.id == folder.id);
    if (folderScenes && folderScenes.length > 0) {
        console.log(`Regenerating Thumbnails for Folder: ${folder.name}`);
        for (const scene of folderScenes) {
            console.log(scene.background.src);
            const t = await scene.createThumbnail({ img: (scene.background.src || undefined) })
            if (t?.thumb) {
                thumbCount++;
                console.log(`Regenerated thumbnail for ${scene.name}`);
                await scene.update({ thumb: t.thumb });
            }
        }
    }
    return thumbCount;
}
