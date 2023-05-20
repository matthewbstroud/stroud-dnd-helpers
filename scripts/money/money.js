import { numbers } from "../utility/numbers.js";
import { dialog } from "../dialog/dialog.js";
const MONEY_MODE = {
    "GIVE": "Give",
    "TAKE": "Take",
    "EQUALIZE": "Equalize"
};

export let money = {
    "manageMoney": async function _manageMoney() {
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        let buttons = [];
        for (let property in MONEY_MODE) {
            buttons.push({ "label": MONEY_MODE[property], "value": MONEY_MODE[property] });
        }
        let moneyMode = await dialog.createButtonDialog("Manage Money", buttons);
        switch (moneyMode) {
            case MONEY_MODE.GIVE:
                return this.giveMoney();
            case MONEY_MODE.TAKE:
                return this.takeMoney();
            case MONEY_MODE.EQUALIZE:
                return moneyInternal.equalizeCurrency();
        }
    },
    /* Give a specified money to a single player or divide between all players. */
    "giveMoney": async function _giveMoney() {
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        let sharees = canvas.scene.tokens.filter((token) => token.actor && token.actor.folder.name == "Players").map(t => t.actor);
        if (sharees.length == 0) {
            ui.notifications.notify('There are no character tokens in this scene.');
            return;
        }

        let controlledActors = canvas.tokens.controlled.filter((token) => token.actor && token.actor.type == 'character').map(t => t.actor);
        if (controlledActors.length > 0) {
            sharees = controlledActors;
        }
        _promptForAmount(MONEY_MODE.GIVE, sharees.map(s => s.uuid), moneyInternal.giveCurrency);
    },
    /* Take a specified money from a single player or all players. */
    "takeMoney": async function _takeMoney() {
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        let sharees = canvas.scene.tokens.filter((token) => token.actor && token.actor.folder.name == "Players").map(t => t.actor);
        if (sharees.length == 0) {
            ui.notifications.notify('There are no character tokens in this scene.');
            return;
        }

        let controlledActors = canvas.tokens.controlled.filter((token) => token.actor && token.actor.type == 'character').map(t => t.actor);
        if (controlledActors.length > 0) {
            sharees = controlledActors;
        }
        _promptForAmount(MONEY_MODE.TAKE, sharees.map(s => s.uuid), moneyInternal.takeCurrency);
    }
};

export let moneyInternal = {
    "equalizeCurrency": async function _equalizeCurrency() {
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        let sharees = canvas.scene.tokens.filter((token) => token.actor && token.actor.folder.name == "Players").map(t => t.actor);
        if (sharees.length == 0) {
            ui.notifications.notify('There are no character tokens in this scene.');
            return;
        }

        let controlledActors = canvas.tokens.controlled.filter((token) => token.actor && token.actor.type == 'character').map(t => t.actor);
        if (controlledActors.length > 0) {
            sharees = controlledActors;
        }
        if (!sharees) {
            return;
        }
        let actorCount = sharees.length;
        let currentCash = sharees.map(a => a.system.currency);

        let totalCP = 0;

        currentCash.forEach(currency => {
            totalCP += currency.pp * 1000;
            totalCP += currency.gp * 100;
            totalCP += currency.ep * 50;
            totalCP += currency.sp * 10;
            totalCP += currency.cp;
        });

        let splitCP = Math.floor(totalCP / actorCount);


        let splitPP = Math.floor(splitCP / 1000);
        splitCP -= splitPP * 1000;
        let splitGP = Math.floor(splitCP / 100);
        splitCP -= splitGP * 100;
        let splitEP = Math.floor(splitCP / 50);
        splitCP -= splitEP * 50;
        let splitSP = Math.floor(splitCP / 10);
        splitCP -= splitSP * 10;

        sharees.forEach(actor => {
            actor.update(
                {
                    "system.currency.pp": splitPP,
                    "system.currency.gp": splitGP,
                    "system.currency.ep": splitEP,
                    "system.currency.sp": splitSP,
                    "system.currency.cp": splitCP
                });
        });

        let message = `Each character now has PP: ${splitPP} GP:${splitGP} EP:${splitEP} SP:${splitSP} CP:${splitCP}`;

        ChatMessage.create({
            content: message,
            type: CONST.CHAT_MESSAGE_TYPES.OOC
        });
    },
    "getShareAmount": function getShareAmount(sharedCopper) {
        let splitPP = Math.floor(sharedCopper / 1000);
        sharedCopper -= splitPP * 1000;
        let splitGP = Math.floor(sharedCopper / 100);
        sharedCopper -= splitGP * 100;
        let splitEP = Math.floor(sharedCopper / 50);
        sharedCopper -= splitEP * 50;
        let splitSP = Math.floor(sharedCopper / 10);
        sharedCopper -= splitSP * 10;
        let strShareAmount = "";
        if (splitPP > 0) { strShareAmount += "<span style='color:#90A2B6'>" + splitPP + "pp</span>"; if (splitGP > 0 || splitEP > 0 || splitSP > 0 || sharedCopper > 0) { strShareAmount += ", "; } }
        if (splitGP > 0) { strShareAmount += "<span style='color:#B08C34'>" + splitGP + "gp</span>"; if (splitEP > 0 || splitSP > 0 || sharedCopper > 0) { strShareAmount += ", "; } }
        if (splitEP > 0) { strShareAmount += "<span style='color:#617480'>" + splitEP + "ep</span>"; if (splitSP > 0 || sharedCopper > 0) { strShareAmount += ", "; } }
        if (splitSP > 0) { strShareAmount += "<span style='color:#717773'>" + splitSP + "sp</span>"; if (sharedCopper > 0) { strShareAmount += ", "; } }
        if (sharedCopper > 0) { strShareAmount += "<span style='color:#9D5934'>" + sharedCopper + "cp</span>"; }
        return strShareAmount;
    },
    "getTotalCopper": function _getTotalCopper(actor) {
        let targetCurrency = actor.system.currency;
        return (targetCurrency.pp * 1000) + (targetCurrency.gp * 100) + (targetCurrency.ep * 50) + (targetCurrency.sp * 10) + targetCurrency.cp;
    },
    "giveCurrency": async function _giveCurrency(actorUuids, totalPP, totalGP, totalEP, totalSP, totalCP) {
        let sharees = actorUuids.map(uuid => fromUuidSync(uuid));
        let actorCount = sharees.length;
        let totalToShare = (totalPP * 1000) + (totalGP * 100) + (totalEP * 50) + (totalSP * 10) + totalCP
        let splitCP = Math.floor(totalToShare / actorCount);
        if (splitCP === 0) {
            ui.notifications.notify(`Cannot split ${totalToShare} copper between ${actorCount} people.`);
            return;
        }

        let strOutput = `<b>Cha-ching!</b><br />`;
        let sharedAmount = moneyInternal.getShareAmount(splitCP);
        sharees.forEach(actor => {
            let actorCurrency = actor.system.currency;
            let actorCurrentCP = (actorCurrency.pp * 1000) + (actorCurrency.gp * 100) + (actorCurrency.ep * 50) + (actorCurrency.sp * 10) + actorCurrency.cp;
            let actorNewTotal = actorCurrentCP + splitCP;
            moneyInternal.updateActorCurrency(actor, actorNewTotal);
            strOutput += `${actor.name} received: ${sharedAmount}<br />`;
        });

        ChatMessage.create({ content: strOutput });
    },
    "reduceCurrency": function _reduceCurrency(copper) {
        let newPP = Math.floor(copper / 1000);
        copper -= newPP * 1000;
        let newGP = Math.floor(copper / 100);
        copper -= newGP * 100;
        let newEP = Math.floor(copper / 50);
        copper -= newEP * 50;
        let newSP = Math.floor(copper / 10);
        copper -= newSP * 10;
        return ({ pp: newPP, gp: newGP, ep: newEP, sp: newSP, cp: copper });
    },
    "takeCurrency": async function _takeCurrency(actorUuids, totalPP, totalGP, totalEP, totalSP, totalCP) {
        let targetActors = actorUuids.map(uuid => fromUuidSync(uuid));
        if (!targetActors || targetActors.length == 0) {
            return;
        }
        let actorCount = targetActors.length;
        let totalToRemove = (totalPP * 1000) + (totalGP * 100) + (totalEP * 50) + (totalSP * 10) + totalCP;
        let splitCP = Math.floor(totalToRemove / actorCount);
        if (splitCP === 0) {
            ui.notifications.notify(`Cannot take ${totalToShare} copper evenly between ${actorCount} people.`);
            return;
        }
        let actorsAndCash = targetActors.map(a => ({ actor: a, totalCopper: moneyInternal.getTotalCopper(a) }));
        // validated each character has enough money
        let poorMan = actorsAndCash.find(a => a.totalCopper < splitCP);
        if (poorMan) {
            ChatMessage.create({ content: `${poorMan.actor.name} doesn't have enough money!` });
            return;
        }
        let strOutput = "";
        // remove the money
        actorsAndCash.forEach(t => {
            moneyInternal.updateActorCurrency(t.actor, (t.totalCopper - splitCP));
            let amountTaken = moneyInternal.reduceCurrency(splitCP)
            strOutput += "<b>Money taken from  " + t.actor.name + "</b>:<br />";
            if (amountTaken.pp > 0) { strOutput += "<span style='color:#90A2B6'>" + amountTaken.pp + "pp</span>"; if (amountTaken.gp > 0 || amountTaken.ep > 0 || amountTaken.sp > 0 || amountTaken.cp > 0) { strOutput += ", "; } }
            if (amountTaken.gp > 0) { strOutput += "<span style='color:#B08C34'>" + amountTaken.gp + "gp</span>"; if (amountTaken.ep > 0 || amountTaken.sp > 0 || amountTaken.cp > 0) { strOutput += ", "; } }
            if (amountTaken.ep > 0) { strOutput += "<span style='color:#617480'>" + amountTaken.ep + "ep</span>"; if (amountTaken.sp > 0 || amountTaken.cp > 0) { strOutput += ", "; } }
            if (amountTaken.sp > 0) { strOutput += "<span style='color:#717773'>" + amountTaken.sp + "sp</span>"; if (amountTaken.cp > 0) { strOutput += ", "; } }
            if (amountTaken.cp > 0) { strOutput += "<span style='color:#9D5934'>" + amountTaken.cp + "cp</span>"; }
            strOutput += "<br />";
        });

        ChatMessage.create({ content: strOutput });
    },
    "updateActorCurrency": function updateActorCurrency(targetActor, newTotalCP) {
        let newPP = Math.floor(newTotalCP / 1000);
        newTotalCP -= newPP * 1000;
        let newGP = Math.floor(newTotalCP / 100);
        newTotalCP -= newGP * 100;
        let newEP = Math.floor(newTotalCP / 50);
        newTotalCP -= newEP * 50;
        let newSP = Math.floor(newTotalCP / 10);
        newTotalCP -= newSP * 10;

        targetActor.update(
            {
                "system.currency.pp": newPP,
                "system.currency.gp": newGP,
                "system.currency.ep": newEP,
                "system.currency.sp": newSP,
                "system.currency.cp": newTotalCP
            });
    }
}

async function _promptForAmount(moneyMode, actorUuids, callback) {
    let title = `${moneyMode} Currency`;
    let label = moneyMode;
    const currencyTotals = `
<b>Currency Totals:</b><br />
<div style="display: flex; width: 100%; margin: 10px 0px 10px 0px">
    <label for="pp" style="white-space: nowrap; margin: 4px 10px 0px 10px;">PP:</label>
    <input type="number" id="pp" name="pp" />
    <label for="pp" style="white-space: nowrap; margin: 4px 10px 0px 10px;">GP:</label>
    <input type="number" id="gp" name="gp" />
    <label for="pp" style="white-space: nowrap; margin: 4px 10px 0px 10px;">EP:</label>
    <input type="number" id="ep" name="ep" />
    <label for="pp" style="white-space: nowrap; margin: 4px 10px 0px 10px;">SP:</label>
    <input type="number" id="sp" name="sp"/ >
    <label for="pp" style="white-space: nowrap; margin: 4px 10px 0px 10px;">CP:</label>
    <input type="number" id="cp" name="cp"/ >
</div>
`;

    new Dialog({
        title: title,
        content: `
        <form>
            ${currencyTotals}
        </form>
    `,
        buttons: {
            yes: {
                icon: "<i class='fas fa-check'></i>",
                label: label,
                callback: (html) => {
                    let totalPP = numbers.toNumber(html.find('#pp').val());
                    let totalGP = numbers.toNumber(html.find('#gp').val());
                    let totalEP = numbers.toNumber(html.find('#ep').val());
                    let totalSP = numbers.toNumber(html.find('#sp').val());
                    let totalCP = numbers.toNumber(html.find('#cp').val());
                    callback(actorUuids, Number(totalPP), Number(totalGP), Number(totalEP), Number(totalSP), Number(totalCP));
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