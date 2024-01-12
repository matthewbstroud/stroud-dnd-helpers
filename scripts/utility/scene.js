
export let scene = {
    "rewireMonksActiveTiles": _rewireMonksActiveTiles,
    "packAdventureThumbnails": _packAdventureThumbnails,
    "regenerateThumbnails": _regenerateThumbnails
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

async function _packAdventureThumbnails(moduleId){
    const thumbs_folder = 'images/thumbs';
    if (! await FilePicker.browse('data', `modules/${moduleId}/`).then(r => !r.dirs.includes(`modules/${moduleId}/${thumbs_folder}`))) { 
        await FilePicker.createDirectory('data', `modules/${moduleId}/${thumbs_folder}/`) 
    }
    for (const pack of game.packs.filter(p => p.metadata.packageName === moduleId & p.metadata.type === 'Adventure')) {
        for (const adventureIdx of pack.index.values()){
            let adventure = await pack.getDocument(adventureIdx._id);
            let scenes = Array.from(adventure.scenes);
            for (var scene of scenes) {
                let fileName = scene.thumb.split('/').pop();
                let moduleThumbPath = `modules/${moduleId}/${thumbs_folder}/${fileName}`;
                if (await srcExists(moduleThumbPath)){
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
            }
        }
    }
}

async function _regenerateThumbnails(folderID) {
    debugger;
    const folder = game.folders.get(folderID);
    if (!folder) {
        ui.notifications.error(`Cannot load folder: ${folderID}!`);
        return;
    }
    console.log(`Regenerating Thumbnails for Folder: ${folder.name}`);
    let folderScenes = game.scenes.filter(s => s.folder.id == folder.id);
    if (!folderScenes || folderScenes.length == 0){
        ui.notifications.error(`${folder.name} has no scenes!`);
        return;
    }
    let thumbCount = 0;
    for (const scene of folderScenes) {
        console.log(scene.background.src);
        const t = await scene.createThumbnail( { img: (scene.background.src || undefined) })
        if (t?.thumb) {
            thumbCount++;
            console.log(`Regenerated thumbnail for ${scene.name}`);
            await scene.update({ thumb: t.thumb });
        }
    }
    ui.notifications.notify(`Regenerated ${thumbCount} thumbnail image${(thumbCount > 0 ? 's' : '')}.`);
}