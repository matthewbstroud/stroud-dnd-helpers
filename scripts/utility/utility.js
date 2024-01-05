import { scene } from "./scene.js";

export let utility = {
    "scene": scene,
    "getControlledActor": function _getControlledActor() {
        return canvas?.tokens?.controlled[0]?.actor
    },
    "dumpDependencies": async function _dumpDependencies() {
        var activemodules = await game.modules.map(m => ({ "id": m.id, "type": "module", "manifest": m.manifest, "comaptibility": { "mininum": m.version, "verified": m.version}}));
        console.log(JSON.stringify(activemodules, null, 2));
        return true;
    }
};