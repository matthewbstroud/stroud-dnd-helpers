import { fireplace } from "./fireplace.js";
import { numbers } from "../Utility/numbers.js";
export let lighting = {
    "fireplace": fireplace,
    "lights": {
        "update": updateLights
    }
};



async function updateLights() {
    function _updateLights(search_color, search_animation, new_color, new_animation, min_activation, max_activation) {
        let targetLights = canvas.scene.lights
            .filter(l => l.config.color == search_color && l.config.animation.type == search_animation);

        targetLights.forEach(l => {
            l.update({
                "config.color": new_color,
                "config.animation.type": new_animation,
                "config.darkness.min": min_activation,
                "config.darkness.max": max_activation
            });
        });
        ui.notifications.notify(`Updated ${targetLights.length} lights.`);
    }

    let animationOptions = '<option value="">None</option>';
    for (let [k, v] of Object.entries(CONFIG.Canvas.lightAnimations)) {
        animationOptions += `<option value=${k}>${game.i18n.localize(v.label)}</option>`;
    }

    let lightsForm = `
    <b>Select Search Criteria:</b><br />
    <div style="display: flex; width: 100%; margin: 10px 0px 10px 0px">
        <label for="search_color" style="white-space: nowrap; margin: 4px 10px 0px 10px;">Color:</label>
        <input type="string" id="search_color" name="search_color" />
        <label for="search_animation" style="white-space: nowrap; margin: 4px 10px 0px 10px;">Animation:</label>
        <select name="search_animation" id="search_animation">
            ${animationOptions}
        </select>
    </div>
    <b>Set New Values:</b><br />
    <div style="display: flex; width: 100%; margin: 10px 0px 10px 0px">
        <label for="new_color" style="white-space: nowrap; margin: 4px 10px 0px 10px;">Color:</label>
        <input type="string" id="new_color" name="new_color" />
        <label for="new_animation" style="white-space: nowrap; margin: 4px 10px 0px 10px;">Animation:</label>
        <select name="new_animation" id="new_animation">
            ${animationOptions}
        </select>
    </div>
    <span>Darkness Activation Range</span><br />
    <div style="display: flex; width: 100%; margin: 10px 0px 10px 0px">
        <label for="min_activation" style="white-space: nowrap; margin: 4px 10px 0px 10px;">Min:</label>
        <input type="number" value="0" step="0.1" min="0" max="1" id="min_activation" name="min_activation" />
        <label for="max_activation" style="white-space: nowrap; margin: 4px 10px 0px 10px;">Max:</label>
        <input type="number" value="0" step="0.1" min="0" max="1" id="max_activation" name="max_activation" />
    </div>
    `;

    new Dialog({
        title: `Update Lights`,
        content: `
            <form>
                ${lightsForm}
            </form>
        `,
        buttons: {
            yes: {
                icon: "<i class='fas fa-check'></i>",
                label: `Update`,
                callback: (html) => {
                    let search_color = html.find('#search_color').val();
                    if (search_color.length == 0) {
                        search_color = null;
                    }
                    let search_animation = html.find('#search_animation').val();
                    if (search_animation.length == 0) {
                        search_animation = null;
                    }
                    let new_color = html.find('#new_color').val();
                    if (new_color.length == 0) {
                        new_color = null;
                    }
                    let new_animation = html.find('#new_animation').val();
                    if (new_animation.length == 0) {
                        new_animation = null;
                    }
                    let min_activation = numbers.toNumber(html.find('#min_activation').val());
                    let max_activation = numbers.toNumber(html.find('#max_activation').val());

                    _updateLights(search_color, search_animation, new_color, new_animation, min_activation, max_activation);
                }
            },
            no: {
                icon: "<i class='fas fa-times'></i>",
                label: `Cancel`
            },
        },
        default: "yes"
    }, { width: 500 }).render(true)
}
