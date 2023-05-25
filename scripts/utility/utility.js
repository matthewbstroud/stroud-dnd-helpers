import { scene } from "./scene.js";

export let utility = {
    "scene": scene,
    "getControlledActor": function _getControlledActor() {
        return canvas?.tokens?.controlled[0]?.actor
    }
};