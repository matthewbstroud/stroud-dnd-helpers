import { sdndConstants } from "../../constants.js";
import { dialog } from "../../dialog/dialog.js";

const SUNSWORD_INTENSITIES = [
    { label: "10", value: 1 },
    { label: "15", value: 2 },
    { label: "20", value: 3 },
    { label: "25", value: 4 },
    { label: "30", value: 5 }
];
class Sunsword {
    constructor(item) {
        if (!(item instanceof Item)) {
            throw "item must be Item";
        }
        this.item = item;
        this.intensity = this.item.getFlag(sdndConstants.MODULE_ID, "intensity") ?? 1;
    }
    async setIntensity(intensity) {
        if (intensity < 1 || intensity > 5) {
            throw "intensity must be between 1 and 5";
        }
        this.intensity = intensity;
        await this.item.setFlag(sdndConstants.MODULE_ID, "intensity", intensity);
        await this.#adjustEffect();
    }
    async #adjustEffect() {
        let effect = this.item.effects.find(e => e.origin === this.item.uuid);
        if (!effect) {
            console.warn("Sunsword: No effect found on item");
            return;
        }
        let changes = foundry.utils.duplicate(effect.changes);
        let brightLightChange = changes.find(c => c.key == "ATL.light.bright");
        let dimLightChange = changes.find(c => c.key == "ATL.light.dim");
        if (!brightLightChange || !dimLightChange) {
            console.warn("Sunsword: Effect has unexpected number of ATL changes");
            return;
        }
        const brightLightRange = 5 + (this.intensity * 5);
        const dimLightRange = brightLightRange * 2;
        brightLightChange.value = brightLightRange;
        dimLightChange.value = dimLightRange;
        await effect.update({ changes });
    }

}

export let sunsword = {
    "AdjustIntensity": _adjustIntensity
};

async function _adjustIntensity({ speaker, actor, token, character, item, args }) {
    const itemId = item.getFlag(sdndConstants.MODULE_ID, "id");
    if (itemId !== "sunsword") {
        return;
    } 
    let activity = args[0]?.workflow?.activity;
    if (activity?.identifier !== "adjust-intensity") { 
        return; 
    }
    let sunswordInstance = new Sunsword(item);
    const currentIntensity = sunswordInstance.intensity;
    const currentIntensityLabel = SUNSWORD_INTENSITIES.find(i => i.value === currentIntensity)?.label ?? "Unknown";
    let newIntensity = await dialog.createButtonDialog(`Set Bright light range (Current: ${currentIntensityLabel})`, getAdjacentButtons(currentIntensity), 'column');
    if (newIntensity === null || newIntensity === currentIntensity) {
        return;
    }
    await sunswordInstance.setIntensity(newIntensity);
}

function getAdjacentButtons(currentIntensity) {
    const currentIndex = SUNSWORD_INTENSITIES.findIndex(i => i.value === currentIntensity);
    const buttons = [];
    if (currentIndex > 0) {
        buttons.push({
            label: "Decrease",
            value: SUNSWORD_INTENSITIES[currentIndex - 1].value
        });
    }
    if (currentIndex < SUNSWORD_INTENSITIES.length - 1) {
        buttons.push({
            label: "Increase",
            value: SUNSWORD_INTENSITIES[currentIndex + 1].value
        });
    }
    return buttons;
}
