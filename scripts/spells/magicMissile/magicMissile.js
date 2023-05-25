import { sdndConstants } from "../../constants.js";
import { gmFunctions } from "../../gm/gmFunctions.js";
import { items } from "../../items/items.js";
import { getSpellData } from "../spells.js";
export let magicMissile = {
    "castOrUse": _castOrUse,
    "itemMacro": _itemMacro
};

async function _castOrUse() {
    if (canvas.tokens.controlled.length != 1) {
        ui.notifications.notify(`Please select a single actor!`);
        return;
    }

    let targetActor = canvas.tokens.controlled[0]?.actor;
    if (!targetActor) {
        ui.notifications.notify(`Please select an actor!`);
        return;
    }

    let spellData = await getSpellData(sdndConstants.SPELLS.MAGIC_MISSILE);
    
    if (spellData.targets.length != 1) {
        ui.notifications.notify(`You must target a single creature you wish to attack!`);
        return;
    }

    var tempItem = targetActor.items.getName(sdndConstants.TEMP_ITEMS.MAGIC_DART);
    if (!tempItem) {
        let message = await spellData.item.use({
            createChatMessage: true
        });
        if (!message) {
            return;
        }
        let workflowId = message.getFlag("midi-qol", "workflowId");
        let workflow = await MidiQOL.Workflow.getWorkflow(workflowId);
        let itemLevel = workflow?.itemLevel;
        message.update({ flavor: `Missile 1 of ${2 + itemLevel}` });
        message.render();
        return;
    }

    if (tempItem.system.uses.value == 0) {
        await tempItem.delete();
        return;
    }
    let uses = tempItem.system.uses.value - 1;
    let maxUses = tempItem.system.uses.max + 1;

    let message = await tempItem.use({
        consumeUsage: true,
        consumeResource: true,
        consumeQuantity: true,
        needsConfiguration: false,
        createChatMessage: true
    });
    message.update({ flavor: `Missile ${maxUses - uses} of ${maxUses}` });
    await message.render();
}

async function _itemMacro({speaker, actor, token, character, item, args}) {
    if (!actor) {
        ui.notifications.notify('No current actor.');
        return;
    }
    if (!actor.items.getName(sdndConstants.SPELLS.MAGIC_MISSILE)) {
        ui.notifications.notify(`${actor.name} doesn't have ${sdndConstants.SPELLS.MAGIC_MISSILE}.`);
        return;
    }

    if (!args || args.length != 1) {
        ui.notifications.error(`item macro should contain: return await stroudDnD.spells.MagicMissile.itemMacro(speaker, actor, token, character, item, args);`);
    }

    // remove any existing
    await actor.items.filter(i => i.name.startsWith(sdndConstants.TEMP_ITEMS.MAGIC_DART) && i.data.type === "consumable").forEach(i => {
        i.delete();
    });

    let damageAmount = args[0].damageTotal;
    let numberOfTargets = args[0].targets.length;
    // we only need to create darts for those not rolled immediately
    let numberOfDarts = 3 + (args[0].spellLevel - 1) - numberOfTargets;

    if (numberOfDarts == 0) {
        return;
    }

    await createDarts(damageAmount, numberOfDarts);

    async function createDarts(damageAmount, numberOfDarts) {
        let darts = await items.getItemFromCompendium(sdndConstants.PACKS.COMPENDIUMS.ITEM.ITEMS, sdndConstants.TEMP_ITEMS.MAGIC_DART, false, null);
        darts.name = `${sdndConstants.TEMP_ITEMS.MAGIC_DART}`;
        darts.system.uses.value = darts.system.uses.max = numberOfDarts;
        darts.system.damage.parts[0][0] = damageAmount;
        actor.createEmbeddedDocuments('Item', [darts]);
    }

}