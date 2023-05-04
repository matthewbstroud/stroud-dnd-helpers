import { gmFunctions } from "./gm/gmFunctions.js";

export let tokens = {
    "dismissTokens": async function _dismissTokens(tokenIds /* array of tokenIds */) {
        gmFunctions.dismissTokens(tokenIds);
    },
    "deleteTokens": async function _dismissTokens(tokenIds /* array of tokenIds */) {
        gmFunctions.deleteTokens(tokenIds);
    }
};