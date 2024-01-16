import { scene } from "./scene.js";

export let utility = {
    "scene": scene,
    "getControlledActor": function _getControlledActor() {
        return canvas?.tokens?.controlled[0]?.actor
    },
    "dumpDependencies": async function _dumpDependencies(readMeFormat = false) {
        if (readMeFormat) {
            let readMeRequiredModules = `
# Required Modules  
| Module | Verified Version |  
| --- | --- |
`;
            readMeRequiredModules += await game.modules.map(m => `| ${m.title} | ${m.version} |`).join('\r\n');
            console.log(readMeRequiredModules);
        }
        else {
            let activemodules = await game.modules.map(m => ({ "id": m.id, "type": "module", "manifest": m.manifest, "comaptibility": { "mininum": m.version, "verified": m.version}}));
            console.log(JSON.stringify(activemodules, null, 2));
        }
        return true;
    }
};