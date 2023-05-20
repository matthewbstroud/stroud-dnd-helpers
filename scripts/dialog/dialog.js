import { numbers } from "../utility/numbers.js";

export let dialog = {
    "createButtonDialog": async function _createButtonDialog(title, buttons, direction) {
        if (!direction) {
            direction = "column";
        }
        let selected = await warpgate.buttonDialog(
            {
                buttons,
                title
            },
            direction
        );
        return selected;
    },
    "createNumberDialog": async function _createNumberDialog(title, description, label, buttonText, unit, defaultValue, callback){
        let selectedNumber = numbers.toNumber(defaultValue);
        let propertyName = `${unit.toLowerCase()}_value`;
        new Dialog({
            title: `${title}`,
            content: `
                <form>
                    ${getNumberFormHtml(description, propertyName, label, defaultValue)}
                </form>
            `,
            buttons: {
                yes: {
                    icon: "<i class='fas fa-check'></i>",
                    label: `${buttonText}`,
                    callback: (html) => {
                        selectedNumber = numbers.toNumber(html.find(`#${propertyName}`).val());
                        if (callback instanceof Function){
                            callback(selectedNumber);
                        }
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
};


function getNumberFormHtml(description, propertyName, label, defaultValue){
    return `
    <b>${description}</b><br />
    <div style="display: flex; width: 100%; margin: 10px 0px 10px 0px">
        <label for="${propertyName}" style="white-space: nowrap; margin: 4px 10px 0px 10px;">${label}:</label>
        <input type="number" value="${defaultValue}" id="${propertyName}" name="${propertyName}" />
    </div>
    `;
} 