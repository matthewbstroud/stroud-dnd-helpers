import { dialog } from "./dialog/dialog.js";
import { playlists } from "./playlists.js";
import { ranged } from "./weapons/ranged.js";
import { sdndConstants } from "./constants.js";
import { sdndSettings } from "./settings.js";
import { tokens } from "./tokens.js";

export let combat = {
    "applyAdhocDamage": applyAdhocDamage,
    "startFilteredCombat": async function _startFilteredCombat() {
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        tokens.releaseInvalidTokens(false);
        await canvas.tokens.toggleCombat();
        await game.combat.rollNPC();

        var combatPlaylistId = sdndSettings.CombatPlayList.getValue();
        if (!combatPlaylistId || combatPlaylistId == "none") {
            return;
        }
        Hooks.once("deleteCombat", async function () {
            playlists.stop(combatPlaylistId);
            SimpleCalendar?.api.startClock();
        });
        playlists.start(combatPlaylistId, true);
    },
    "weapons": {
        "ranged": ranged
    }
};

// apply adhoc damage to selected tokens
async function applyAdhocDamage() {
    if (!game.user.isGM) {
        ui.notifications.notify(`Can only be run by the gamemaster!`);
        return;
    }
    let adHocDamage = {
        getDamageType: async function _getDamageType() {
            return await dialog.createButtonDialog("Select Damage Type", sdndConstants.BUTTON_LISTS.DAMAGE_5E, 'column');
        },
        getDamageDice: async function _getDamageDice() {
            let diceButtons = ['d4', 'd6', 'd8', 'd10', 'd20', 'd100'];
            return await dialog.createButtonDialog("Select Damage Dice", diceButtons.map(v => ({ label: v, value: v })), 'column');
        },
        getDiceCount: async function _getDiceCount() {
            let numberButtons = [];
            for (let i = 1; i <= 20; i++) {
                numberButtons.push({ label: `${i}`, value: i });
            }
            return await dialog.createButtonDialog("How Many Dice?", numberButtons, 'row');
        },
        getSortedNames: function _getSortedNames(targets) {
            let sortedNames = targets.map(t => t.name).sort();
            let targetNames = sortedNames.slice(0, sortedNames.length - 1).join(`, `);
            if (sortedNames.length > 1) {
                targetNames += ` and ${sortedNames[sortedNames.length - 1]} have`;
            }
            else {
                targetNames = `${sortedNames[0]} has`;
            }
            return targetNames;
        }
    };

    // release tokens that shouldn't take damage
    tokens.releaseInvalidTokens(true);
    // get the tokens remaining
    let targets = canvas.tokens.controlled;
    if (!targets || targets.length == 0) {
        ui.notifications.notify(`No valid tokens selected!`);
        return;
    }

    let damageType = await adHocDamage.getDamageType();
    if (!damageType) {
        return;
    }
    let damageDice = await adHocDamage.getDamageDice();
    if (!damageDice) {
        return;
    }
    let diceCount = await adHocDamage.getDiceCount();
    if (!diceCount) {
        return;
    }
    const damageRoll = await new Roll(`${diceCount}${damageDice}[${damageType}]`).evaluate({ async: true })
    damageRoll.toMessage({ flavor: `${adHocDamage.getSortedNames(targets)} been struck with ${CONFIG.DND5E.damageTypes[damageType]} damage!` });
    let autoApplyAdhocDamage = sdndSettings.AutoApplyAdhocDamage.getValue();
    await MidiQOL.applyTokenDamage([{ type: `${damageType}`, damage: damageRoll.total }], damageRoll.total, new Set(targets), null, new Set(), { forceApply: autoApplyAdhocDamage });
}