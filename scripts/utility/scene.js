
export let scene = {
    "rewireMonksActiveTiles": _rewireMonksActiveTiles,
    "packModuleThumbnails": _packModuleThumbnails,
    "regenerateThumbnails": _regenerateThumbnails
};

let exportCounters = {
    skipped: 0,
    exported: 0
};

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

async function _packModuleThumbnails(moduleId){
    exportCounters.exported = 0;
    exportCounters.skipped = 0;

    const thumbs_folder = 'images/thumbs';
    if (! await FilePicker.browse('data', `modules/${moduleId}/`).then(r => !r.dirs.includes(`modules/${moduleId}/${thumbs_folder}`))) { 
        await FilePicker.createDirectory('data', `modules/${moduleId}/${thumbs_folder}/`) 
    }
    for (const pack of game.packs.filter(p => p.metadata.packageName === moduleId && (p.metadata.type === 'Adventure' || p.metadata.type === 'Scene'))) {
        switch (pack.metadata.type)  {
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

async function packSceneCompendiumThumbnails(scenePack, moduleId, thumbs_folder){
    let scenes = scenePack.index.values();
    await packSceneThumbnails(scenes, moduleId, thumbs_folder);
}

async function packSceneThumbnails(scenes, moduleId, thumbs_folder){
    for (const scene of scenes){
        let fileName = scene.thumb.split('/').pop();
        let moduleThumbPath = `modules/${moduleId}/${thumbs_folder}/${fileName}`;
        if (await srcExists(moduleThumbPath)) {
            exportCounters.skipped++
            continue;
        }
        let blob = await fetch(scene.thumb).then(r => r.blob())
        let {path} = await FilePicker.upload(
            "data", 
            `modules/${moduleId}/${thumbs_folder}/`, 
            new File([blob], fileName, {type: blob.type}), 
            {}, 
            {notify:false}
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
        for (const subFolder of subFolders){
            thumbCount += await _regenerateThumbnails(subFolder);
        }
    }
    let folderScenes = game.scenes.filter(s => s.folder?.id == folder.id);
    if (folderScenes && folderScenes.length > 0) {
        console.log(`Regenerating Thumbnails for Folder: ${folder.name}`);
        for (const scene of folderScenes) {
            console.log(scene.background.src);
            const t = await scene.createThumbnail( { img: (scene.background.src || undefined) })
            if (t?.thumb) {
                thumbCount++;
                console.log(`Regenerated thumbnail for ${scene.name}`);
                await scene.update({ thumb: t.thumb });
            }
        }
    }
    return thumbCount;
}