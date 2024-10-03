import { scene } from "./scene.js";
import { sdndConstants } from "../constants.js";
const migrationPacks = [
    `${sdndConstants.MODULE_ID}.SDND-Features`,
    `${sdndConstants.MODULE_ID}.SDND-Items`,
    `${sdndConstants.MODULE_ID}.SDND-Spells`,
    `${sdndConstants.MODULE_ID}.SDND-Summons`,
    `${sdndConstants.MODULE_ID}.SDND-Scenes`
];

export let utility = {
    "scene": scene,
    "getControlledActor": function _getControlledActor() {
        return canvas?.tokens?.controlled[0]?.actor
    },
    "getControlledToken": function _getControlledToken() {
        let controlledTokens = canvas.tokens.controlled;
        if ((!controlledTokens) || controlledTokens.length != 1) {
            ui.notifications.error("You must select a single token!");
            return;
        }
        return controlledTokens[0];
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
            let activemodules = await game.modules.map(m => ({ "id": m.id, "type": "module", "manifest": m.manifest, "comaptibility": { "mininum": m.version, "verified": m.version } }));
            console.log(JSON.stringify(activemodules, null, 2));
        }
        return true;
    },
    "forceDnd5eMigration": async function _forceDnd5eMigration() {
        for (const packID of migrationPacks) {
            let pack = await game.packs.get(packID);
            await dnd5e.migrations.migrateCompendium(pack);
        }
        console.log(`${sdndConstants.MODULE_ID} compendium migration complete...`);
    }
};