import { gmFunctions } from "../gm/gmFunctions.js";

export let calendar = {
    "startClock": async function _startClock(){
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        gmFunctions.startClock();
    }
}