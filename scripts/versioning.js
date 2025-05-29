import { numbers } from "./utility/numbers.js";

const CURRENT_DND_VERSION = 4;
let legacyTestMode = false;

export let versioning = {
    "isLegacyVersion": function _isLegacyVersion() {
        return legacyTestMode || numbers.toNumber(dnd5e.version[0]) < CURRENT_DND_VERSION;
    },
    "dndVersionedAsync": async function _dndVersioned(currentFunction, legacyFunction) {
        if (this.isLegacyVersion()) {
            return await legacyFunction();
        }
        return await currentFunction();
    },
    "dndVersioned": function _dndVersioned(currentFunction, legacyFunction) {
        if (this.isLegacyVersion()) {
            return legacyFunction();
        }
        return currentFunction();
    },
    "setTestMode": function _setTestMode(enabled) {
        legacyTestMode = enabled;
        console.log(`Legacy Test Mode is now ${enabled ? "enabled" : "disabled"}...`);
    }
};