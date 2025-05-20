import { numbers } from "./utility/numbers.js";

const CURRENT_DND_VERSION = 4;
export let versioning = {
    "dndVersionedAsync": async function _dndVersioned(currentFunction, legacyFunction) {
        const dndMajorVersion = numbers.toNumber(dnd5e.version[0]);
        if (dndMajorVersion < CURRENT_DND_VERSION) {
            return await legacyFunction();
        }
        return await currentFunction();
    },
    "dndVersioned": function _dndVersioned(currentFunction, legacyFunction) {
        const dndMajorVersion = numbers.toNumber(dnd5e.version[0]);
        if (dndMajorVersion < CURRENT_DND_VERSION) {
            return legacyFunction();
        }
        return currentFunction();
    }
};