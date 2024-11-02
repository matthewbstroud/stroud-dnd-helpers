import { numbers } from "../utility/numbers.js";

export let dialog = {
    "confirmation": async function _confirmation(title, content) {
        let selected = await buttonDialog(
            {
                "buttons": [
                    {
                        "label": "Yes",
                        "value": "True"
                    },
                    {
                        "label": "No",
                        "value": "False"
                    }
                ],
                "title": title,
                "content": content
            },
            'row'
        );
        return selected;
    },
    "createButtonDialog": async function _createButtonDialog(title, buttons, direction) {
        if (!direction) {
            direction = "column";
        }
        let selected = await buttonDialog(
            {
                buttons,
                title
            },
            direction
        );
        return selected;
    },
    "createNumberDialog": async function _createNumberDialog(title, description, label, buttonText, unit, defaultValue, callback) {
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
                        if (callback instanceof Function) {
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
        }, { width: 500 }).render(true);
    },
    "textPrompt": textPrompt,
    "sortByLabel": function _sortByName(item1, item2) {
		if (item1.label < item2.label) {
			return -1;
		}
		else if (item1.label > item2.label) {
			return 1;
		}
		return 0;
	}
};

async function textPrompt(title, buttonLabel, callback) {
    new Dialog({
        title: title,
        content: `
        <form>
            <input id="sdndTextPrompt" type="text" autofocus />
        </form>
    `,
        buttons: {
            yes: {
                icon: "<i class='fas fa-check'></i>",
                label: buttonLabel,
                callback: (html) => {
                    callback(html.find("#sdndTextPrompt").val());
                }
            },
            no: {
                icon: "<i class='fas fa-times'></i>",
                label: `Cancel`
            },
        },
        default: "yes"
    }).render(true)
}

function getNumberFormHtml(description, propertyName, label, defaultValue) {
    return `
    <b>${description}</b><br />
    <div style="display: flex; width: 100%; margin: 10px 0px 10px 0px">
        <label for="${propertyName}" style="white-space: nowrap; margin: 4px 10px 0px 10px;">${label}:</label>
        <input type="number" value="${defaultValue}" id="${propertyName}" name="${propertyName}" />
    </div>
    `;
}

// this originally came from warpgate
async function buttonDialog(data, direction) {
    return await new Promise(async (resolve) => {
        /** @type Object<string, object> */
        let buttons = {},
            dialog;

        data.buttons.forEach((button) => {
            buttons[button.label] = {
                label: button.label,
                callback: () => resolve(button.value),
            };
        });

        dialog = new Dialog(
            {
                title: data.title ?? "",
                content: data.content ?? "",
                buttons,
                close: () => resolve(false),
            },
            {
                /*width: '100%',*/
                height: "100%",
                ...data.options,
            }
        );

        await dialog._render(true);
        dialog.element.find(".dialog-buttons").css({
            "flex-direction": direction,
        });
    });
}