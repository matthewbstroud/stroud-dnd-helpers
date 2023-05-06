import { gmFunctions } from "../gm/gmFunctions.js";

export let identification = {
    "createUnidentifiedItem": _createUnidentifiedItem,
    "IdentifyItem": _idenfityItemGM,
    "ItemMacro": _itemMacro
};

async function _itemMacro(speaker, actor, token, character, item, args){
    if (!args || args.length == 0) {
        console.log("identifyTargetItem: no arguments. cannot proceed.");
        return;
    }
    
    let targets = args[0].targets;
    
    if (!targets || targets.length == 0) {
        console.log("identifyTargetItem: no targets selected. cannot proceed.");
        return;
    }
    
    let targetActor = targets[0]?.actor;
    
    if (!targetActor || targetActor.type == "npc") {
        console.log(`identifyTargetItem: This only works on players!`);
        return;
    }
    _selectUnidentifiedItem(actor.name, targetActor)
}

async function _createUnidentifiedItem() {
    let items = Object.values(ui.windows).filter(w => (w.object instanceof Item));

    if (!items || items.length == 0 || items.length > 1) {
        ui.notifications.notify(`Must only have one item sheet open!`);
        return;
    }

    let item = items[0].object;

    function createUnidentifiedItem(item, name, description) {
        let newItem = {
            "name": `${name}`,
            "type": item.type,
            "img": item.img,

            "system": {
                "description": {
                    "value": description,
                    "chat": "",
                    "unidentified": "Wondrous item"
                },
                "quantity": 1,
                "weight": item.system.weight,
                "attunement": 0,
                "equipped": false,
                "identified": false
            },
            "folder": item.folder,
            "flags": {
                "world": {
                    "identified_id": item.id
                }
            }
        };
        Item.create(newItem);
    }

    let formFields = `
<b>Source Item: ${item.name}</b><br />
<div style="display: block; width: 100%; margin: 10px 0px 10px 0px">
<label for="name">Name:</label>
<input id="name" name="description" value="${item.name}"/><br/>
<label for="description">Description:</label>
<textarea id="description" name="description" rows="10" cols="50">${item.system.description.value}</textarea>
</div>
`;

    new Dialog({
        title: `Create Unidentified Item`,
        content: `
        <form>
            ${formFields}
        </form>
    `,
        buttons: {
            yes: {
                icon: "<i class='fas fa-check'></i>",
                label: `Create`,
                callback: (html) => {
                    let name = html.find('#name').val();
                    let desc = html.find('#description').val();
                    createUnidentifiedItem(item, name, desc);
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

export async function identifyItem(alias, targetUuid, itemID) {
    let target = await gmFunctions.getTokenOrActor(targetUuid);
    let placeHolderItem = await target.items.get(itemID);
    if (!placeHolderItem) {
        ui.notifications.notify(`Item no longer exists in player inventory!`);
        return;
    }
    let actualItemID = await placeHolderItem.getFlag("world", "identified_id");
    if (!actualItemID) {
        ui.notifications.notify(`Item doesn't specify a parent!`);
        return;
    }
    let actualItem = await game.items.get(actualItemID);
    if (!actualItem) {
        return;
    }
    let actualItemData = actualItem.toObject();
    actualItemData.system.identified = true;
    actualItemData.system.quantity = placeHolderItem.system.quantity;
    let message = `Item has been identified as <b>${actualItem.name}</b>.`;
    await target.createEmbeddedDocuments("Item", [actualItemData]);
    await placeHolderItem.delete();
    ChatMessage.create({ speaker: { alias: alias }, content: message });
}

async function _idenfityItemGM() {
    debugger;
    if (!game.user.isGM){
        ui.notifications.notify(`Can only be run by the gamemaster!`);
        return;
    }
    if (canvas.tokens.controlled.length != 1) {
        ui.notifications.notify(`Please select a single actor!`);
        return;
    }
    let targetActor = canvas.tokens.controlled[0]?.actor;
    if (!targetActor || targetActor.type == "npc") {
        ui.notifications.notify(`Please select a player!`);
        return;
    }
    
    _selectUnidentifiedItem("Gamemaster", targetActor);
}

async function _selectUnidentifiedItem(casterAlias, targetActor){
    let unidentifiedItems = targetActor?.items?.filter(i => i.getFlag("world", "identified_id"));
    
    if (!unidentifiedItems || unidentifiedItems.length == 0) {
        ui.notifications.notify(`${targetActor.name} has no unidentified items.`);
        return;
    }
    
    let itemOptions = '';
    unidentifiedItems.forEach(i => {
        itemOptions += `<option value="${i.id}">${i.name}</option>`;
    });
    
    let unidentifiedItemsForm = `
    <div style="display: block; width: 100%; margin: 10px 0px 10px 0px">
    <label for="name">Select Item:</label>
    <select name="item_to_identify" id="item_to_identify">
            ${itemOptions}
    </select>
    </div>
    `;
    
    new Dialog({
        title: `Identify Item`,
        content: `
            <form>
                ${unidentifiedItemsForm}
            </form>
        `,
        buttons: {
            yes: {
                icon: "<i class='fas fa-check'></i>",
                label: `Identify`,
                callback: (html) => {
                    let id = html.find('#item_to_identify').val();
                    gmFunctions.identifyItem(casterAlias, targetActor.uuid, id);
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