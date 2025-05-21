import { items } from "../../items/items.js";
import { sdndConstants } from "../../constants.js";
import { versioning } from "../../versioning.js";

export let portent = {
    "rollPortentDice": foundry.utils.debounce(rollPortentDice, 250),
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
    let portentDie = await items.getItemFromCompendium(sdndConstants.PACKS.COMPENDIUMS.ITEM.ITEMS, getPortentDieName(), false, null);
    portentDie.name = `Portent Die (${diceRoll.total})`;
    assignDamageAndChatFlavor(portentDie, diceRoll.total);
    await actor.createEmbeddedDocuments('Item', [portentDie]);
    return diceRoll.total;
}

function getPortentDieName() {
    return versioning.dndVersioned(
        () => getPortentDieNameV4(),
        () => getPortentDieNameV3()
    );
}

function getPortentDieNameV3() {
    return sdndConstants.TEMP_ITEMS.PORTENT_DIE_LEGACY;
}
function getPortentDieNameV4() {
    return sdndConstants.TEMP_ITEMS.PORTENT_DIE;   
}


function assignDamageAndChatFlavor(die, face) {
    versioning.dndVersioned(
        () => assignDamageAndChatFlavorV4(die, face), 
        () => assignDamageAndChatFlavorV3(die, face)
    );
}

function assignDamageAndChatFlavorV3(die, face) {
    die.system.damage.parts[0] = `${face}`;
    die.system.chatFlavor = `The die flashes ${face} and disappears...`;
}

function assignDamageAndChatFlavorV4(die, face) {
    let damageActivity = Object.values(die.system.activities).find(a => a.type == "damage");
    damageActivity.damage.parts[0].bonus = face;
    damageActivity.description.chatFlavor = `The die flashes ${face} and disappears...`;
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
    
    await ChatMessage.create({
        speaker: { alias: actor.name },
        content: `Summons two mystical dice, each die has the same value on every face. The values are ${dice1} and ${dice2}.`,
        type: CONST.CHAT_MESSAGE_TYPES.EMOTE
    });
}