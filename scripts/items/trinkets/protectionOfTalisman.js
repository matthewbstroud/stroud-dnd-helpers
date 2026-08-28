import { sdndConstants } from "../../constants.js";
import { dialog } from "../../dialog/dialog.js";
import { gmFunctions } from "../../gm/gmFunctions.js";

const IDENTIFIER = "eldritch-invocations-protection-of-the-talisman";

class ProtectionOfTalisman {
    #registered = false;

    init() {
        if (this.#registered) {
            return;
        }
        libWrapper.register(
            sdndConstants.MODULE_ID,
            "CONFIG.Actor.documentClass.prototype.rollSavingThrow",
            async function (wrapped, config = {}, dialogConfig = {}, message = {}) {
                const rolls = await wrapped(config, dialogConfig, message);
                return protectionOfTalisman.process(this, rolls);
            },
            "MIXED"
        );
        this.#registered = true;
    }

    async process(actor, rolls) {
        if (!actor || !Array.isArray(rolls) || rolls.length === 0) {
            return rolls;
        }

        const talisman = actor.items.find(item => item.system?.identifier === IDENTIFIER);
        if (!talisman || await this.#getUsesRemaining(actor, talisman) <= 0) {
            return rolls;
        }

        const protectedRolls = [];
        for (const roll of rolls) {
            protectedRolls.push(await this.#offerBonus(actor, talisman, roll));
        }
        return protectedRolls;
    }

    async #getUsesRemaining(actor, item) {
        const uses = item.system?.uses;
        if (!uses?.max) {
            return 0;
        }
        const maximum = await new Roll(String(uses.max), actor.getRollData()).evaluate({ allowInteractive: false });
        return maximum.total - Number(uses.spent ?? 0);
    }

    async #offerBonus(actor, talisman, roll) {
        const target = Number(roll.options?.target);
        const hasTarget = Number.isFinite(target);
        if (hasTarget && !roll.isFailure) {
            return roll;
        }

        const choice = await dialog.createButtonDialog(
            "Protection of the Talisman",
            [
                { label: "Use Protection", value: true },
                { label: "Decline", value: false }
            ],
            "row"
        );
        if (!choice) {
            return roll;
        }

        const spent = await gmFunctions.spendItemUse(actor.uuid, talisman.id);
        if (!spent) {
            ui.notifications.warn("Protection of the Talisman has no uses remaining.");
            return roll;
        }

        const bonusRoll = await new Roll("1d4", {}, { flavor: "Protection of the Talisman" }).evaluate();
        const bonusTerms = [
            ...roll.terms,
            new foundry.dice.terms.OperatorTerm({ operator: "+" }),
            ...bonusRoll.terms
        ];
        const amended = roll.constructor.fromTerms(bonusTerms, foundry.utils.deepClone(roll.options));

        if (roll.parent) {
            await roll.parent.update({ rolls: [amended] });
        }

        const targetText = hasTarget ? ` against DC ${target}` : "";
        await ChatMessage.create({
            content: `<p>${actor.name} uses Protection of the Talisman${targetText}: +${bonusRoll.total}.</p>`,
            speaker: ChatMessage.getSpeaker({ actor })
        });
        return amended;
    }
}

export const protectionOfTalisman = new ProtectionOfTalisman();