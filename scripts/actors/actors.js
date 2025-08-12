import { sdndConstants } from "../constants.js";
import { items } from "../items/items.js";
import { gmFunctions } from "../gm/gmFunctions.js";
import { sdndSettings } from "../settings.js";
import { folders } from "../folders/folders.js";
import { dialog } from "../dialog/dialog.js";
import { numbers } from "../utility/numbers.js";
import { mounts } from "../mounts/mounts.js";
import { versioning } from "../versioning.js";

const BUFF_NPC = "Buff NPC";
const DIE_MATCH = /(\d+)d(\d+)/g;
export let actors = {
    "ensureActor": ensureActor,
    "buffNpcsWithPrompt": foundry.utils.debounce(buffNpcsWithPrompt, 250),
    "buffNpcs": async function _buffNpcs(useMax, multiplier) {
        return buffActors("npc", useMax, multiplier)
    },
    "renderSheet": renderSheet,
    "setPrototypeTokenBarsVisibility": setPrototypeTokenBarsVisibility,
    "setTokenBarsVisibility": setTokenBarsVisibility,
    "replaceSpells": replaceSpells,
    "getActorsByFolderId": function _getActorsByFolderId(folderId) {
        return game.actors.filter(a => folders.childOfFolder(a, folderId));
    },
    "removeUnusedActors": removeUnusedActors,
    "setAnonymous": async function _setAnonymous(actors, anonymous) {
        const anonActive = game.modules.get("anonymous")?.active ?? false;
        for (let actor of actors) {
            if (anonActive) {
                await actor.setFlag("anonymous", "showName", !anonymous);
            }
        }
        const tokenDisplayMode = anonymous ? CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER : CONST.TOKEN_DISPLAY_MODES.HOVER;
        let updates = actors.filter(a => a.prototypeToken.displayName != tokenDisplayMode)
            .map(a => ({ "_id": a._id, "prototypeToken": { "displayName": tokenDisplayMode } }));
        if (!updates || updates.length == 0) {
            return;
        }
        console.log(`Updating ${updates.length} prototypes...`);
        await Actor.updateDocuments(updates);
    },
    "replaceInActors": async function _replaceInActors(searchPattern, replacement, previewOnly) {
        let updates = game.actors.filter(a => actorMatchesPattern(a, searchPattern)).map(a => {
            let change = {
                "_id": a._id
            };
            if (previewOnly) {
                change.name = a.name;
            }
            if (a?.img?.includes(searchPattern)) {
                change["img"] = a.img.replace(searchPattern, replacement);
            }
            if (a.prototypeToken?.texture?.src?.includes(searchPattern)) {
                change.prototypeToken = {
                    "texture": {
                        "src": a.prototypeToken.texture.src.replace(searchPattern, replacement)
                    }
                }
            }
            return change;
        });
        if (previewOnly || updates.length == 0) {
            return updates;
        }
        await Actor.updateDocuments(updates);
        return updates;
    },
    "removeEffect": async function _removeEffects(actorUuid, effectId) {
        if (!actorUuid || !effectId) {
            return;
        }
        await this.removeEffects(actorUuid, [effectId]);
    },
    "removeEffects": async function _removeEffects(actorUuid, effectIds) {
        if (!actorUuid || !effectIds || effectIds.length == 0) {
            return;
        }
        await gmFunctions.removeActorEffects(actorUuid, effectIds);
    }
}

function actorMatchesPattern(actor, searchPattern) {
    return actor.img?.includes(searchPattern) || actor.prototypeToken?.texture?.src?.includes(searchPattern);
}

async function removeUnusedActors(folderID) {
    let folderActors = actors.getActorsByFolderId(folderID);
    if (!folderActors || folderActors.length === 0) {
        return;
    }
    let orphaned = folderActors.filter(a => !game.scenes.find(s => s.tokens.find(t => t.actor?.id == a.id)));
    console.log(orphaned.map(o => o.name).join(","));
}

async function buffNpcsWithPrompt() {
    promptForBuff(buffActors);
}

async function setPrototypeTokenBarsVisibility(actors, tokenDisplayMode) {
    if (!actors || !tokenDisplayMode) {
        return;
    }
    let updates = actors.filter(a => a.prototypeToken.displayBars != tokenDisplayMode)
        .map(a => ({ "_id": a._id, "prototypeToken": { "displayBars": tokenDisplayMode } }));
    if (!updates || updates.length == 0) {
        return;
    }
    console.log(`Updating ${updates.length} prototypes...`);
    await Actor.updateDocuments(updates);
}

async function setTokenBarsVisibility(scenes, tokenDisplayMode) {
    if (!scenes || !tokenDisplayMode) {
        return;
    }
    for (let scene of scenes) {
        let updates = await scene.tokens.filter(t => t.displayBars != tokenDisplayMode)
            .map(t => ({ "_id": t._id, "displayBars": tokenDisplayMode }));
        if (!updates || updates.length == 0) {
            continue;
        }
        console.log(`Updating ${updates.length} in ${scene.name}...`);
        await scene.updateEmbeddedDocuments(Token.name, updates);
    }
}

function anyDifferences(actor, hp, acBonus, hitBonus, dcBonus, damageBonus) {
    if (!actor) {
        return false;
    }
    if (actor.system?.attributes?.hp?.max != hp) {
        return true;
    }
    if (actor.system?.attributes?.ac?.calc == "flat") {
        return true;
    }
    let effect = actor.effects.find(e => e.name === BUFF_NPC);
    if (effect && (effect.changes[0].value != acBonus ||
        effect.changes[1].value != hitBonus ||
        effect.changes[2].value != dcBonus ||
        effect.changes[3].value != damageBonus)) {
        return true;
    }
    if (!effect && (acBonus != 0 || hitBonus != 0 || dcBonus != 0 || damageBonus != 0)) {
        return true;
    }
    return false;
}

async function getBuffEffect(hitBonus, acBonus, dcBonus, damageBonus) {
    let buffNpc = await items.getItemFromCompendium(
        sdndConstants.PACKS.COMPENDIUMS.ITEM.SPELLS,
        BUFF_NPC, true, null);
    if (!buffNpc) {
        buffNpc = game.items.find(i => i.name == BUFF_NPC);
    }
    if (!buffNpc) {
        throw new Error(`${BUFF_NPC} item not found in compendium.`);
    }
    let buffEffect = foundry.utils.duplicate(buffNpc.effects.find(e => e.name == BUFF_NPC));
    buffEffect.changes[0].value = buffEffect.changes[0].value.replace("sdnd.modifier", acBonus);
    buffEffect.changes[1].value = buffEffect.changes[1].value.replace("sdnd.modifier", hitBonus);
    buffEffect.changes[2].value = buffEffect.changes[2].value.replace("sdnd.modifier", dcBonus);
    buffEffect.changes[3].value = buffEffect.changes[2].value.replace("sdnd.modifier", damageBonus);
    return buffEffect;
}

async function applyBuff(actor, buff) {
    if (!actor || !buff) {
        return;
    }
    let existingEffect = actor.effects.find(e => e.name === buff.name);
    if (existingEffect) {
        await actor.updateEmbeddedDocuments(ActiveEffect.name, [
            {
                "_id": existingEffect._id,
                "changes": (buff.changes)
            }
        ]);
        return true;
    }
    await gmFunctions.createEffects(actor.uuid, [buff]);
    return true;
}

async function buffActors(actorType, useMax, multiplier, hitBonus, damageBonus, acBonus, dcBonus) {
    hitBonus ??= 0;
    damageBonus ??= 0;
    acBonus ??= 0;
    dcBonus ??= 0;

    await mounts.buffMounts(useMax, multiplier);
    let mod = Number.parseFloat(multiplier);
    if (!mod) {
        mod = 1;
    }
    let npcs = game.actors.filter(a => a.type === actorType);
    if (!npcs) {
        return;
    }
    const totalNpcs = npcs.length;
    for (let i = 0; i < npcs.length; i++) {
        SceneNavigation.displayProgressBar({label: `${BUFF_NPC}s: ${i+1} of ${npcs.length}`, pct: Math.floor((i / totalNpcs) * 100)});
        let npc = npcs[i];
        const hp = npc.system?.attributes?.hp;
        let actorUpdateRequired = false;
        const rollFormula = useMax ? hp.formula.replace("d", "*") : getAverageHpFormula(hp.formula);
        let maxHp = Math.floor(eval(rollFormula));
        if (isNaN(maxHp)) {
            maxHp = hp.max;
        }
        if (mod > 0) {
            maxHp = Math.floor(maxHp * mod);
        }
        if (!anyDifferences(npc, maxHp, acBonus, hitBonus, dcBonus, damageBonus)) {
            continue;
        }
        console.log(`Applying changes to ${npc.name}`);
        if (npc.system?.attributes?.hp?.max != maxHp) {
            console.log(`   Updating ${npc.name}: hp from ${hp.max} to ${maxHp}...`);
            actorUpdateRequired = true;
        }
        let acCalc = npc.system?.attributes?.ac?.calc ?? "flat";
        if (acCalc === "flat") {
            console.log(`   Updating ${npc.name}: ac type from ${acCalc} to natural...`);
            acCalc = "natural";
            actorUpdateRequired = true;
        }
        if (actorUpdateRequired) {
            await npc.update({
                "system": {
                    "attributes": {
                        "ac": {
                            "calc": acCalc
                        },
                        "hp": {
                            "max": maxHp,
                            "value": maxHp
                        }
                    }
                }
            });
        }
        if (acBonus === 0 && hitBonus === 0 && dcBonus == 0) {
            let effect = npc.effects?.find(e => e.name == BUFF_NPC);
            if (effect) {
                console.log(`   Removing ${BUFF_NPC} effect...`);
                await gmFunctions.removeActorEffects(npc.uuid, [effect.id]);
            }
        }
        else {
            let buff = await getBuffEffect(hitBonus, acBonus, dcBonus, damageBonus);
            await applyBuff(npc, buff);
            console.log(`   Applying ${BUFF_NPC} with acBonus=${acBonus}, hitBonus=${hitBonus}, damageBonus=${damageBonus}, spellDC=${dcBonus}`);
        }

    }
    SceneNavigation.displayProgressBar({label: `${BUFF_NPC}s: ${totalNpcs} of ${totalNpcs}`, pct: 100});
}

export function getAverageHpFormula(formula) {
    let match = {}
    while (match = DIE_MATCH.exec(formula)) {
        let dieCount = Number.parseInt(match[1]);
        let dieType = Number.parseInt(match[2]);
        let dieAverage = (dieType + 1) / 2;
        const newDieFormula = `${dieCount} * ${dieAverage}`
        formula = formula.replace(match[0], newDieFormula);
    }
    return eval(formula);
}

export function createItemHeaderButton(config, buttons) {
    if (!game.modules.find(m => m.id === "backpack-manager")?.active ?? false) {
        return;
    }
    if (config.object instanceof Item) {
        var item = config.object;
        if (item.type != "backpack") {
            return;
        }
        var containerActorUuid = item.getFlag("backpack-manager", "containerActorUuid");
        var actorID = containerActorUuid?.split('.')?.pop() ?? '';
        var containerActor = actorID ? game.actors.get(actorID) : null;
        var createNew = true;
        if (containerActorUuid && containerActor) {
            createNew = false;
        }
        var label = sdndSettings.HideTextOnActorSheet.getValue() ? '' : 'SDND';
        buttons.unshift({
            class: 'stroudDnD',
            icon: 'fa-solid fa-dungeon',
            label: label,
            onclick: () => createNew ? createBackpack(item) : transferBackpack(item)
        });
    }
}

export function createActorHeaderButton(config, buttons) {
    if (config.object instanceof Actor) {
        var overrideableItems = getOverrideableItemsFromActor(config.object);
        if (!overrideableItems || overrideableItems.length == 0) {
            return;
        }
        var label = sdndSettings.HideTextOnActorSheet.getValue() ? '' : 'SDND';
        buttons.unshift({
            class: 'stroudDnD',
            icon: 'fa-solid fa-dungeon',
            label: label,
            onclick: () => actorConfig(config.object)
        });
    }
}

export function syncBackpackPermissions(actor, updates, mode, updateUserId) {
    if (!game.modules.find(m => m.id === "backpack-manager")?.active ?? false) {
        return;
    }
    const playerFolder = sdndSettings.ActivePlayersFolder.getValue();
    if (!(actor.folder?.name === playerFolder && updates['ownership'])) {
        return;
    }
    var backPackIds = actor?.items
        .filter(i => i.type === "backpack" && i.flags["backpack-manager"]?.containerActorUuid)
        .map(i => i.getFlag("backpack-manager", "containerActorUuid").split('.')?.pop());
    for (let backpackId of backPackIds) {
        let backpack = game.actors.get(backpackId);
        if (!backpack) {
            continue;
        }
        var ownership = syncPermissions(backpack.ownership, updates['ownership']);
        backpack.update({ "ownership": ownership });
    }
}


// set current permission to defaults and overwrite with new permissions
function syncPermissions(oldPermissions, newPermissions) {
    let newOwnership = duplicate(newPermissions);
    newOwnership['default'] = CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE;
    var ownership = duplicate(oldPermissions);
    for (let owner in ownership) {
        ownership[owner] = CONST.DOCUMENT_OWNERSHIP_LEVELS.INHERIT;
    }
    for (let newOwner in newOwnership) {
        ownership[newOwner] = newOwnership[newOwner];
    }
    return ownership;
}

function getOverrideableItemsFromActor(actorDocument) {
    if (!(actorDocument.type === 'character' || actorDocument.type === 'npc')) {
        return [];
    }
    let sdndItems = [
        sdndConstants.FEATURES.TWILIGHT_SANCTUARY,
        sdndConstants.SPELLS.HUNTERS_MARK,
        sdndConstants.SPELLS.IDENTIFY
    ];
    let overrideableItems = actorDocument.items.filter(i =>
        !i.flags['stroud-dnd-helpers']?.["importedItem"] && sdndItems.includes(i.name)
    ).sort(items.sortByName);
    if (!overrideableItems || overrideableItems.length === 0) {
        return [];
    }
    return overrideableItems;
}
async function actorConfig(actorDocument) {
    if (!(actorDocument.type === 'character' || actorDocument.type === 'npc')) {
        ui.notifications.info('This feature must be used on a character or npc!');
        return;
    }
    var overrideableItems = getOverrideableItemsFromActor(actorDocument);
    if (!overrideableItems || overrideableItems.length === 0) {
        ui.notifications.info(`${actorDocument.name} has no spells or features that can be modified by Stroud DND Helpers.`);
        return;
    }
    let overriddenItems = actorDocument.items.filter(i =>
        i.flags['stroud-dnd-helpers']?.["importedItem"]
    );
    promptForSpellOverrides(actorDocument, overrideableItems, overriddenItems);
}

async function ensureActor(actorName, packId, parentFolderName) {
    let actor = game.actors.getName(actorName);
    if (!actor) {
        let pack = game.packs.get(packId);
        if (!pack) {
            ui.notifications.error(`Cannot find compendium ${packId}!`);
            return null;
        }
        let packActor = pack.index.getName(actorName);
        if (!packActor) {
            ui.notifications.error(`Cannot find actor ${actorName} compendium ${packId}!`);
            return null;
        }
        actor = await gmFunctions.importFromCompendium("Actor", packId, packActor._id, parentFolderName);
    }
    return actor;
}

async function overrideSpells(actor, spells) {
    for (let spell of spells) {
        let sndSpell = await getReplacementFromCompendium(spell);
        await actor.createEmbeddedDocuments('Item', [sndSpell]);
        await spell.delete();
    }
    ui.notifications.info(`Number of spells replaced: ${spells.length}.`);
}

async function replaceSpells(actor, spells) {
    let summary = [];
    for (let spell of spells) {
        let sndSpell = await getReplacementFromCompendium(spell);
        if (!sndSpell) {
            continue;
        }
        await actor.createEmbeddedDocuments('Item', [sndSpell]);
        await spell.delete();
        summary.push(`  Patched ${sndSpell.name}`);
    }
    return summary.join("<br/>");
}

async function getReplacementFromCompendium(spell) {
    let pack = "";
    switch (spell.type) {
        case "feat":
            pack = sdndConstants.PACKS.COMPENDIUMS.ITEM.FEATURES;
            break;
        case "spell":
            pack = sdndConstants.PACKS.COMPENDIUMS.ITEM.SPELLS;
            break;
        default:
            pack = sdndConstants.PACKS.COMPENDIUMS.ITEM.ITEMS;
    }
    return await items.getItemFromCompendium(pack, spell.name, false, null);
}

async function createBackpack(item) {
    if (!(item.type === 'backpack')) {
        ui.notifications.info('This feature must be used on an item of type backpack!');
        return;
    }
    var backpacksFolder = await folders.ensureFolder(sdndSettings.BackpacksFolder.getValue(), "Actor");
    let ownership = syncPermissions({}, item?.parent?.ownership);
    let backpack = await Actor.create({
        'name': `${item.name}`,
        'type': "npc",
        'img': item.img,
        'ownership': ownership,
        'folder': backpacksFolder.id
    });

    item.setFlag("backpack-manager", "containerActorUuid", backpack.uuid);
    ui.notifications.notify(`Managed backpack created for ${item.name}.`);
}

async function transferBackpack(item) {
    if (!(item.type === 'backpack')) {
        ui.notifications.info('This feature must be used on an item of type backpack!');
        return;
    }
    const playersFolderName = sdndSettings.ActivePlayersFolder.getValue();
    let currentOwner = item.parent;
    let players = canvas.scene.tokens
        .filter((token) => token.actor && token.actor?.id != currentOwner.id && token.actor?.folder?.name == playersFolderName)
        .map(t => t.actor).sort(items.sortByName);
    if (players.length == 0) {
        ui.notifications.notify('There are no player tokens in this scene.');
        return;
    }
    var targetPlayerId = await dialog.createButtonDialog(`Transfer ${item.name} to New Player`, players.map(p => ({ "label": p.name, "value": p.id })), 'column');
    if (!targetPlayerId) {
        return;
    }
    var targetPlayer = await game.actors.get(targetPlayerId);
    let itemData = duplicate(item);
    await currentOwner.deleteEmbeddedDocuments("Item", [item.id]);
    await targetPlayer.createEmbeddedDocuments("Item", [itemData]);
    var containerActorUuid = item.getFlag("backpack-manager", "containerActorUuid");
    var actorID = containerActorUuid?.split('.')?.pop() ?? '';
    var containerActor = actorID ? game.actors.get(actorID) : null;
    if (!containerActor) {
        return;
    }
    let ownership = syncPermissions(containerActor.ownership, targetPlayer.ownership);
    await containerActor.update({ "ownership": ownership });
    ui.notifications.notify(`${item.name} transferred to ${targetPlayer.name}.`);
}


async function promptForSpellOverrides(actor, overrideableItems, overriddenItems) {
    let options = overrideableItems.map(i => `<input type="checkbox" id="${i.id}" name="${i.id}" value="${i.id}">
        <label for="${i.id}">${i.name}</label><br>`
    ).join('');
    let form = `<h1>Override Spells/Features</h1>
    <form>
      ${options}
      <br/><br/>
    </form>
    `;
    new Dialog({
        title: `SDND Spell/Feature Overrides`,
        content: form,
        buttons: {
            yes: {
                icon: "<i class='fas fa-check'></i>",
                label: `Apply`,
                callback: (html) => {
                    let selectedSpells = [];
                    overrideableItems.forEach(element => {
                        if (html.find(`#${element.id}`).is(`:checked`)) {
                            selectedSpells.push(element);
                        }
                    });
                    if (selectedSpells.length == 0) {
                        ui.notifications.info("Nothing selected...");
                        return;
                    }
                    overrideSpells(actor, selectedSpells);
                }
            },
            no: {
                icon: "<i class='fas fa-times'></i>",
                label: `Cancel`
            },
        },
        default: "yes"
    }, { width: 500 }).render(true);
}

function renderSheet(sheet, form, data) {
    let actor = data?.actor;
    if (actor?.type != "character") {
        return;
    }
    let filterEnabled = actor.getFlag(sdndConstants.MODULE_ID, "filterSpellsByUsable");
    $("div.tab.spells").find("ul.filter-list").append(`<li><button type="button" class="filter-item ${filterEnabled ? 'active' : ''}" data-filter="usable" id="usableFilter">Usable</button></li>`);
    $("#usableFilter").click(toggleFilter);
    $("div.tab.spells button[data-action='clear']").click(clearFilters);
    if (filterEnabled) {
        applyUsableFilter(actor, filterEnabled);
    }
}

const allowPrepModes = ['innate', 'atwill'];

function applyUsableFilter(actor, enabled) {
    if (!enabled) {
        $("section.spells-list li.item").removeAttr("hidden", "hidden");
        return;
    }
    let usableSpellIds = actor.items
        .filter(
            i => i.type == "spell" && (i.system.level == 0 || i.system.preparation?.prepared || allowPrepModes.includes(i.system.preparation?.mode) ||
                (i.system.properties.has("ritual") && actor.classes?.wizard))
        ).map(i => `li[data-item-id='${i._id}']`)
        ?.join(", ") ?? "";
    $("section.spells-list li.item").attr("hidden", "hidden");
    $(usableSpellIds).removeAttr("hidden");
}

function toggleFilter(event) {
    const actorId = $("div.sheet.actor.character")?.attr("id")?.split("-")?.pop();
    if (!actorId || actorId.length == 0) {
        ui.notifications.error("Failed to determine sheet's actor id!");
        return;
    }
    let actor = game.actors.get(actorId);
    let button = $(event.target);
    if (!button) {
        ui.notifications.error("Couldn't find the usable filter button!");
        return;
    }
    button.toggleClass("active");
    let active = button.hasClass("active");
    actor.setFlag(sdndConstants.MODULE_ID, "filterSpellsByUsable", active);
    applyUsableFilter(actor, active);
}

function clearFilters(event) {
    const actorId = $("div.sheet.actor.character")?.attr("id")?.split("-")?.pop();
    $("#usableFilter").removeClass("active");
    game.actors.get(actorId)?.setFlag(sdndConstants.MODULE_ID, "filterSpellsByUsable", false);
    applyUsableFilter(false);
}

async function promptForBuff(callback) {
    let title = `Buff NPCs`;
    let label = 'Save';
    // ensure that the inputs in diaglogHtml align with each other
    const dialogHtml = `
<style>
/* Tooltip container */
.tooltip {
    position: relative;
    display: inline-block;
}

/* Tooltip text */
.tooltip .tooltiptext {
    visibility: hidden;
    width: 200px;
    background-color: black;
    color: #fff;
    text-align: center;
    padding: 5px 0;
    margin-left: 10px;
    border-radius: 6px;
    position: absolute;
    z-index: 1;
}

.tooltip:hover .tooltiptext {
    visibility: visible;
}

/* Grid layout for form */
.form-grid {
    display: grid;
    grid-template-columns: 120px 60px 40px;
    gap: 10px;
    align-items: center;
    width: 100%;
    padding: 10px;
}

.form-label {
    text-align: right;
    white-space: nowrap;
}

.form-input {
    width: 100%;
}

.form-tooltip {
    justify-self: start;
}
</style>    

<div class="form-grid">
    <label for="buffUseMax" class="form-label">Use Max:</label>
    <select name="buffUseMax" id="buffUseMax" class="form-input">
        <option value="True" selected>Yes</option>
        <option value="False">No</option>
    </select>
    <div class="tooltip form-tooltip">
        <i class="fa-solid fa-circle-info"></i>
        <span class="tooltiptext">No will use the average HP as the starting number.</span>
    </div>

    <label for="buffMultiplier" class="form-label">Multiplier:</label>
    <input type="number" id="buffMultiplier" name="buffMultiplier" value="1.0" min="0.1" class="form-input" />
    <div class="tooltip form-tooltip">
        <i class="fa-solid fa-circle-info"></i>
        <span class="tooltiptext">1.5 would increase by 50%<br/>0.5 would decrease by 50%</span>
    </div>

    <label for="buffHitBonus" class="form-label">Hit Bonus:</label>
    <input type="number" id="buffHitBonus" name="buffHitBonus" value="0" class="form-input" />
    <div class="tooltip form-tooltip">
        <i class="fa-solid fa-circle-info"></i>
        <span class="tooltiptext">Bonus to hit.</span>
    </div>

    <label for="buffDamageBonus" class="form-label">Damage Bonus:</label>
    <input type="number" id="buffDamageBonus" name="buffDamageBonus" value="0" class="form-input" />
    <div class="tooltip form-tooltip">
        <i class="fa-solid fa-circle-info"></i>
        <span class="tooltiptext">Bonus to damage.</span>
    </div>

    <label for="buffAcBonus" class="form-label">Armor Bonus:</label>
    <input type="number" id="buffAcBonus" name="buffAcBonus" value="0" class="form-input" />
    <div class="tooltip form-tooltip">
        <i class="fa-solid fa-circle-info"></i>
        <span class="tooltiptext">Bonus to armor class.</span>
    </div>

    <label for="buffDcBonus" class="form-label">DC Bonus:</label>
    <input type="number" id="buffDcBonus" name="buffDcBonus" value="0" class="form-input" />
    <div class="tooltip form-tooltip">
        <i class="fa-solid fa-circle-info"></i>
        <span class="tooltiptext">Bonus to spell DC.</span>
    </div>
</div>
`;

    new Dialog({
        title: title,
        content: `
        <form>
            ${dialogHtml}
        </form>
    `,
        buttons: {
            yes: {
                icon: "<i class='fas fa-check'></i>",
                label: label,
                callback: (html) => {
                    let useMax = html.find('#buffUseMax').val() == "True";
                    let buffMultiplier = numbers.toNumber(html.find('#buffMultiplier').val());
                    let hitBonus = numbers.toNumber(html.find('#buffHitBonus').val());
                    let damageBonus = numbers.toNumber(html.find('#buffDamageBonus').val());
                    let acBonus = numbers.toNumber(html.find('#buffAcBonus').val());
                    let dcBonus = numbers.toNumber(html.find('#buffDcBonus').val());
                    callback("npc", useMax, buffMultiplier, hitBonus, damageBonus, acBonus, dcBonus);
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