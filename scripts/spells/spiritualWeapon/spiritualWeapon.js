import { actors } from "../../actors/actors.js";
import { gmFunctions } from "../../gm/gmFunctions.js";
import { sdndConstants } from "../../constants.js";
import { folders } from "../../folders/folders.js";

export let spiritualWeapon = {
    "castOrUse": _castOrUse,
    "itemMacro": _itemMacro,
    "removeWeapon": async function _removeWeapon(actorUuid) {
        let actor = await gmFunctions.getTokenOrActor(actorUuid);
        let weaponToken = canvas.scene.tokens.getName(`Spiritual Weapon of ${actor.name}`);
        if (!weaponToken){
            return;
        }
        gmFunctions.deleteTokens([weaponToken.id]);
    }
};

async function _castOrUse() {
    if (canvas.tokens.controlled.length != 1) {
        ui.notifications.notify(`Please select a single actor!`);
        return;
    }
    let targetActor = canvas.tokens.controlled[0]?.actor;
    let weaponActor = null;

    if (!targetActor || (targetActor.type == "npc" && !targetActor.name.includes(sdndConstants.SPELLS.SPIRITUAL_WEAPON))) {
        ui.notifications.notify(`Please select a player!`);
        return;
    }
    else if (targetActor.name.includes(sdndConstants.SPELLS.SPIRITUAL_WEAPON)) {
        weaponActor = targetActor;
    }
    if (!weaponActor) {
        const summonType = sdndConstants.SPELLS.SPIRITUAL_WEAPON;
        let weaponName = `${summonType} of ${targetActor.name}`;
        let weaponToken = canvas.scene.tokens.getName(weaponName);
        if (weaponToken) {
            weaponActor = weaponToken.actor;
        }
    }

    if (weaponActor) {
        let attack = weaponActor.items.getName("Attack");
        if (attack) {
            attack.use();
            return;
        }
        return;
    }

    let spiritualWeaponSpell = targetActor?.items.getName(sdndConstants.SPELLS.SPIRITUAL_WEAPON);
    if (!spiritualWeaponSpell) {
        ui.notifications.notify(`${targetActor.name} doesn't know ${sdndConstants.SPELLS.SPIRITUAL_WEAPON}!`);
        return;
    }

    spiritualWeaponSpell.use();
}


async function _itemMacro({speaker, actor, token, character, item, args}) {
    let crosshairConfig = {
        icon: `${sdndConstants.ANIMATIONS.SPELLS.SPRITUAL_WEAPON}`,
        label: "Place Weapon"
    };
    await actors.ensureActor("Spiritual Weapon (SDND)", sdndConstants.PACKS.COMPENDIUMS.ACTOR.TEMP, sdndConstants.FOLDERS.ACTOR.TEMP);
    let crosshairData = await warpgate.crosshairs.show(crosshairConfig);
    gmFunctions.spawnSpiritualWeapon(game.user.id, args[0].actor._id, args[0].tokenId, args[0].spellLevel, crosshairData.x, crosshairData.y);
}


export async function spawnSpirtualWeapon(userID, actorID, tokenID, level, x, y) {
    let gameMaster = game.users.getName("Gamemaster");
    let user = game.users.get(userID);
    const actorD = game.actors.get(actorID);
    const tokenD = canvas.tokens.get(tokenID);
    let summonType = "Spiritual Weapon (SDND)";
    const summonerDc = actorD.system.attributes.spelldc;
    const summonerAttack = summonerDc - 8;
    const summonerMod = getProperty(tokenD.actor, `system.abilities.${getProperty(tokenD.actor, 'system.attributes.spellcasting')}.mod`);
    let damageScale = '';

    if ((level - 3) > 0) {
        damageScale = `+ ${Math.floor((level - 2) / 2)}d8[upcast]`;
    }

    let updates = {
        token: {
            'alpha': 0,
            'name': `Spiritual Weapon of ${actorD.name}`,
            'img': `${sdndConstants.ANIMATIONS.SPELLS.SPRITUAL_WEAPON}`,
            'lightColor': '#0000FF'
        },
        actor: {
            'name': `Spiritual Weapon of ${actorD.name}`,
            'permissions': {
                default: 0,
                [`${gameMaster.id}`]: 3,
                [`${userID}`]: 3
            }
        },
        embedded: {
            Item: {
                "Attack": {
                    'system.attackBonus': `- @mod - @prof + ${summonerAttack}`,
                    'system.damage.parts': [[`1d8 ${damageScale} + ${summonerMod}`, 'force']],
                    'flags.autoanimations.animName': 'Mace',
                    'flags.autoanimations.color': 'blue'
                }
            }
        }
    }

    async function myEffectFunction(template, update) {
        new Sequence()
            .effect()
            .file(sdndConstants.ANIMATIONS.SPELLS.BLESS)
            .atLocation(template)
            .center()
            .scale(1.5)
            .belowTokens()
            .play()
    }

    async function postEffects(template, token) {
        //bring in our minion
        new Sequence()
            .animation()
            .on(token)
            .fadeIn(500)
            .play()
    }

    const callbacks = {
        pre: async (template, update) => {
            myEffectFunction(template, update);
            await warpgate.wait(1750);
        },
        post: async (template, token) => {
            postEffects(template, token);
            await warpgate.wait(500);
        }
    };

    const options = { controllingActor: actorD };
    warpgate.spawnAt({ x, y }, summonType, updates, callbacks, options);
}