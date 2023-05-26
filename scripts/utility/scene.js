
export let scene = {
    "rewireMonksActiveTiles": _rewireMonksActiveTiles
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