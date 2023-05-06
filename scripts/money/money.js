import { gmFunctions } from "../gm/gmFunctions.js";
import { numbers } from "../Utility/numbers.js";

const MONEY_MODE = {
    "GIVE": "Give",
    "TAKE": "Take"
};

export let money = {
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
        _promptForAmount(MONEY_MODE.GIVE, sharees.map(s => s.uuid), gmFunctions.giveCurrency);
    }
};

export let moneyInternal = {
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
        let sharedAmount = this.getShareAmount(splitCP);
        sharees.forEach(actor => {
            let actorCurrency = actor.system.currency;
            let actorCurrentCP = (actorCurrency.pp * 1000) + (actorCurrency.gp * 100) + (actorCurrency.ep * 50) + (actorCurrency.sp * 10) + actorCurrency.cp;
            let actorNewTotal = actorCurrentCP + splitCP;
            this.updateActorCurrency(actor, actorNewTotal);
            strOutput += `${actor.name} received: ${sharedAmount}<br />`;
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


/*
async function _takeMoney() {
    let allActorsInScene = canvas.scene.tokens.filter((token) => token.actor && token.actor.folder.name == "Players").map(t => t.actor);
    let controlledActors = canvas.tokens.controlled.filter((token) => token.actor && token.actor.data.type == 'character').map(t => t.actor);

    if ((!allActorsInScene || allActorsInScene.length == 0) && (!controlledActors || controlledActors.length == 0)) {
        ui.notifications.notify('There are no player characters in this scene.');
        return;
    }

    let permissionCheck = false;

    if (game.user.isGM == true || game.user.isTrusted == true) { permissionCheck = true; }

    if (!permissionCheck) {
        ui.notifications.notify('You do not have permission to run this macro.');
        return;
    }

    function updateActorCurrency(targetActor, newTotalCP) {
        var newAmounts = reduceCurrency(newTotalCP);
        targetActor.update(
            {
                "system.currency.pp": newAmounts.pp,
                "system.currency.gp": newAmounts.gp,
                "system.currency.ep": newAmounts.ep,
                "system.currency.sp": newAmounts.sp,
                "system.currency.cp": newAmounts.cp
            });
    }

    function getTotalCopper(actor) {
        let targetCurrency = actor.system.currency;
        return (targetCurrency.pp * 1000) + (targetCurrency.gp * 100) + (targetCurrency.ep * 50) + (targetCurrency.sp * 10) + targetCurrency.cp;
    }

    function reduceCurrency(copper) {
        let newPP = Math.floor(copper / 1000);
        copper -= newPP * 1000;
        let newGP = Math.floor(copper / 100);
        copper -= newGP * 100;
        let newEP = Math.floor(copper / 50);
        copper -= newEP * 50;
        let newSP = Math.floor(copper / 10);
        copper -= newSP * 10;
        return ({ pp: newPP, gp: newGP, ep: newEP, sp: newSP, cp: copper });
    }

    function removeCurrency(totalPP, totalGP, totalEP, totalSP, totalCP) {
        let totalToRemove = (totalPP * 1000) + (totalGP * 100) + (totalEP * 50) + (totalSP * 10) + totalCP;
        let targetActors = controlledActors;
        if (!targetActors || targetActors.length === 0) {
            // if no controlled actors take a distributed amount from the 
            // player characters in the scene
            targetActors = allActorsInScene;
            totalToRemove = Math.floor(totalToRemove / targetActors.length);
            if (totalToRemove <= 0) {
                ui.notifications.notify(`Shared take amount is zero.`);
                return;
            }
        }

        let actorsAndCash = targetActors.map(a => ({ actor: a, totalCopper: getTotalCopper(a) }));

        // validated each character has enough money
        actorsAndCash.forEach(t => {
            if (t.totalCopper < totalToRemove) {
                ChatMessage.create({ content: `${t.actor.name} doesn't have enough money!` });
                return;
            }
        });

        let amountsTaken = reduceCurrency(totalToRemove);
        let strOutput = "";
        // remove the money
        actorsAndCash.forEach(t => {
            updateActorCurrency(t.actor, (t.totalCopper - totalToRemove))
            strOutput += "<b>Money taken from  " + t.actor.name + "</b>:<br />";
            if (amountsTaken.pp > 0) { strOutput += "<span style='color:#90A2B6'>" + amountsTaken.pp + "pp</span>"; if (amountsTaken.gp > 0 || amountsTaken.ep > 0 || amountsTaken.sp > 0 || amountsTaken.cp > 0) { strOutput += ", "; } }
            if (amountsTaken.gp > 0) { strOutput += "<span style='color:#B08C34'>" + amountsTaken.gp + "gp</span>"; if (amountsTaken.ep > 0 || amountsTaken.sp > 0 || amountsTaken.cp > 0) { strOutput += ", "; } }
            if (amountsTaken.ep > 0) { strOutput += "<span style='color:#617480'>" + amountsTaken.ep + "ep</span>"; if (amountsTaken.sp > 0 || amountsTaken.cp > 0) { strOutput += ", "; } }
            if (amountsTaken.sp > 0) { strOutput += "<span style='color:#717773'>" + amountsTaken.sp + "sp</span>"; if (amountsTaken.cp > 0) { strOutput += ", "; } }
            if (amountsTaken.cp > 0) { strOutput += "<span style='color:#9D5934'>" + amountsTaken.cp + "cp</span>"; }
            strOutput += "<br />";
        });

        ChatMessage.create({ content: strOutput });
    }


}
*/
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