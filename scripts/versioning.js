import { numbers } from "./utility/numbers.js";

const CURRENT_DND_VERSION = 4;
export let versioning = {
    "isLegacyVersion": function _isLegacyVersion() {
        return numbers.toNumber(dnd5e.version[0]) < CURRENT_DND_VERSION;
    },
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