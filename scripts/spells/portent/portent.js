import { items } from "../../items/items.js";
import { sdndConstants } from "../../constants.js";
export let portent = {
    "rollPortentDice": rollPortentDice,
    "syncPortentDice": syncPortentDice
};

async function syncPortentDice({speaker, actor, token, character, item, args}) {
    if (!actor.flags?.ddbimporter) {
        return;
    }
    
    let actorResources = actor.flags?.ddbimporter?.resources;
    
    let diceResource = "";
    if (actorResources.primary = "Portent") {
        diceResource = "primary";  
    }
    else if (actorResources.secondary = "Portent") {
        diceResource = "secondary";  
    }
    else if (actorResources.tertiary = "Portent") {
        diceResource = "tertiary";  
    }
    
    if (diceResource == "") {
        return;
    }
    let portent = actor.items.getName("Portent");
    let currentUses = parseInt(portent.system.uses.value) - 1;
    if (currentUses < 0) {
        return;
    }
    portent.update({ "system.uses.value": currentUses});
    actor.update({ [`system.resources.${diceResource}.value`]: currentUses });
}

async function createPortentDice(actor) {
    let diceRoll = await new Roll('1d20').evaluate();
    let portentDie = await items.getItemFromCompendium(sdndConstants.PACKS.COMPENDIUMS.ITEM.ITEMS, sdndConstants.TEMP_ITEMS.PORTENT_DIE, false, null);
    portentDie.name = `Portent Die (${diceRoll.total})`;
    portentDie.system.damage.parts[0] = `${diceRoll.total}`;
    portentDie.system.chatFlavor = `The die flashes ${diceRoll.total} and disappears...`;
    actor.createEmbeddedDocuments('Item', [portentDie]);
    return diceRoll.total;
}

async function rollPortentDice(){
    if (canvas.tokens.controlled.length != 1) {
        ui.notifications.notify(`Please select a single actor!`);
        return;
    }

    let actor = canvas.tokens.controlled[0]?.actor;
    if (!actor) {
        ui.notifications.notify(`Please select an actor!`);
        return;
    }

    if (!actor.items.find(i => i.name.startsWith("Portent") && i.type === "feat")) {
        ui.notifications.notify(`${actor.name} doesn't have the Portent ability.`);
        return;
    }
    
    let existingDice = actor.items.filter(i => i.name.startsWith("Portent") && i.type === "consumable");
    let portent = actor.items.find((i) => i.name == "Portent" && i.type == "feat");
    let currentUses = parseInt(portent.system.uses.value);
    if (existingDice.length > 0 || currentUses < 2) {
        ui.notifications.notify(`You have already rolled portent dice today.`);
        return;
    }
    
    let dice1 = await createPortentDice(actor);
    let dice2 = await createPortentDice(actor);
    
    ChatMessage.create({
        speaker: { alias: actor.name },
        content: `Summons two mystical dice, each die has the same value on every face. The values are ${dice1} and ${dice2}.`,
        type: CONST.CHAT_MESSAGE_TYPES.EMOTE
    });
}