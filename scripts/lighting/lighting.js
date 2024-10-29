import { fireplace } from "./fireplace.js";
import { numbers } from "../utility/numbers.js";
import { sdndConstants } from "../constants.js";
import { folders } from "../folders/folders.js";
import { sdndSettings } from "../settings.js";
import { gmFunctions } from "../gm/gmFunctions.js";

export let lighting = {
    "fireplace": fireplace,
    "lights": {
        "update": foundry.utils.debounce(updateLights, 250)
    },
    "consumables": {
        "createLightableObject": createLightableObject,
        "lightableItemMacro": sdndLightableItemMacro,
        "expendLightable": expendLightable
    },
    "hooks": {
        "ipPreDropItemDeterminedHandler": ipPreDropItemDeterminedHandler,
        "ipPreClickItemPile": ipPreClickItemPile,
    }
};

function ipPreClickItemPile(target, interactingActor) {
    let lightable = target?.actor?.items?.find(i => i.getFlag(sdndConstants.MODULE_ID, "lightable"));
    if (!lightable) {
        return true;
    }

    // if a player didn't click
    if (!interactingActor) {
        let gmTarget = game.user.targets.first();
        let droppedActorUuid = target.actor?.getFlag(sdndConstants.MODULE_ID, "DroppedBy");
        interactingActor = gmTarget?.actor ?? fromUuidSync(droppedActorUuid);
    }
    dbGmPickup(target.uuid, interactingActor.uuid, game.user.id);
    return false;
}

let dbGmPickup = foundry.utils.debounce(pickup, 250);
async function pickup(targetUuid, actorUuid, userId) {
    await gmFunctions.pickupLightable(targetUuid, actorUuid, userId);
}


function ipPreDropItemDeterminedHandler(source, target, itemData, position) {
    let item = fromUuidSync(itemData.uuid);
    if (!item) {
        return false;
    }
    if (!item.getFlag(sdndConstants.MODULE_ID, "lightable")) {
        return true;
    }

    if (item.effects?.length == 0) {
        return true;
    }
    let effect = item.effects.contents[0];
    if (effect.disabled) {
        return true;
    }

    if (source instanceof dnd5e.documents.Actor5e) {
        let sceneTokens = source.getActiveTokens();
        if (sceneTokens.length == 0) {
            return true;
        }
        gmFunctions.dropLightable(sceneTokens[0].id, item.id, game.user.id);
        return false;
    }
    return true;
}

export async function gmDropLightable(tokenId, itemId) {
    let controlledToken = canvas.tokens.get(tokenId);
    let actor = controlledToken.actor;
    if (!actor) {
        ui.notifications.warn("Selected token has no associated actor!");
        return;
    }
    let item = actor.items.get(itemId);
    let originalEffect = item.effects.contents[0];
    var backpacksFolder = await folders.ensureFolder(sdndSettings.BackpacksFolder.getValue(), "Actor");
    let pileOptions = {
        "sceneId": `${canvas.scene.id}`,
        "tokenOverrides": {
            "name": item.name,
            "displayName": foundry.CONST.TOKEN_DISPLAY_MODES.HOVER,
            "disposition": foundry.CONST.TOKEN_DISPOSITIONS.NEUTRAL,
            "lockRotation": true,
            "height": 0.5,
            "width": 0.5,
            "texture": {
                "src": item.img
            }
        },
        "actorOverrides": {
            "name": item.name,
            'folder': backpacksFolder.id,
            "flags": {
                [sdndConstants.MODULE_ID]: {
                    "DroppedBy": (actor.uuid),
                    "DroppedUserId": (game.user.id)
                }
            },
            "ownership": actor.ownership
        },
        "position": {
            "x": controlledToken.x,
            "y": controlledToken.y
        },
        "createActor": true,
        "itemPileFlags": {
            "enabled": true,
            "type": game.itempiles.pile_types.PILE,
            "distance": 5,
            "deleteWhenEmpty": true,
            "canStackItems": "yes",
            "canInspectItems": true,
            "displayItemTypes": false,
            "description": "",
            "overrideItemFilters": false,
            "overrideCurrencies": false,
            "overrideSecondaryCurrencies": false,
            "requiredItemProperties": [],
            "displayOne": false,
            "showItemName": false,
            "cols": 1,
            "rows": 1,
        }
    }
    try {
        let result = await game.itempiles.API.createItemPile(pileOptions);
        let lightableToken = await fromUuid(result.tokenUuid);
        let transferred = await game.itempiles.API.transferItems(controlledToken, lightableToken, [item]);
        if (transferred && transferred.length > 0) {
            let newLightableID = transferred.find(t => t.item.flags[(sdndConstants.MODULE_ID)]?.lightable)?.item?._id;
            let newLightable = lightableToken?.actor?.items.get(newLightableID);
            let newEffect = foundry.utils.duplicate(newLightable.effects.contents[0]);
            newEffect.disabled = originalEffect.disabled;
            if (!newEffect.disabled) {
                newEffect.duration.seconds = originalEffect.duration.remaining;
            }
            await newLightable.updateEmbeddedDocuments(ActiveEffect.name, [newEffect]);
            await newLightable.update({ "system.equipped": true });
        }
    }
    catch (exception) {
        ui.notifications.error(exception.message);
    }
    return false;
}

export async function gmPickupLightable(pile, actor) {
    let pileActorId = pile.actor.id;
    let pileId = pile.id;
    let items = game.itempiles.API.getActorItems(pile.actor);
    let lightable = items.find(i => i.getFlag(sdndConstants.MODULE_ID, "lightable"));
    let effect = lightable.effects.contents[0];
    let transferred = await game.itempiles.API.transferItems(pile.actor, actor, [lightable]);
    let transferredLightable = transferred.find(i => i.item.flags[sdndConstants.MODULE_ID]?.lightable);
    let newLightableId = transferredLightable.item._id;
    let newLightable = actor.items.get(newLightableId);
    let newEffect = foundry.utils.duplicate(newLightable.effects.contents[0]);
    newEffect.disabled = effect.disabled;
    if (!newEffect.disabled) {
        newEffect.duration.seconds = effect.duration.remaining;
    }
    await newLightable.updateEmbeddedDocuments(ActiveEffect.name, [newEffect]);
    await newLightable.update({ "system.equipped": true });
    let pileActor = game.actors.get(pileActorId);
    if (pileActor) {
        await pileActor.delete();
    }
    let pileToken = game.canvas.scene.tokens.get(pileId);
    if (pileToken) {
        await pileToken.delete();
    }
}

function createLightableObject(unlitItemUuid, litItemUuid, expendedItemUuid) {
    let unlitItem = fromUuidSync(unlitItemUuid);
    unlitItem.setFlag(sdndConstants.MODULE_ID, "lightable.litUuid", litItemUuid);
    let litItem = fromUuidSync(litItemUuid)
    litItem.setFlag(sdndConstants.MODULE_ID, "lightable.expendedUuid", expendedItemUuid);
}

async function sdndLightableItemMacro({ speaker, actor, token, character, item, args }) {
    let litItemUuid = item.getFlag(sdndConstants.MODULE_ID, "lightable.litUuid");
    if (!litItemUuid || !actor) {
        return;
    }
    let litItem = await fromUuid(litItemUuid);
    await actor.createEmbeddedDocuments(Item.name, [litItem]);
}

async function expendLightable(actor, item, effect, force) {
    force ??= false;
    if (!force && effect?.duration?.remaining > 0 && !effect?.disabled) {
        return true;
    }
    if (!item) {
        return false;
    }
    let expendedUuid = item.getFlag(sdndConstants.MODULE_ID, "lightable.expendedUuid");
    if (!expendedUuid) {
        return false;
    }
    let expendedItem = await fromUuid(expendedUuid);
    if (!expendedItem) {
        console.log(`${expendedUuid} does not exist!`);
        return false;
    }
    await item.delete();
    var isItemPile = actor.getFlag("item-piles", "data.type");
    if (isItemPile) {
        let actorId = actor.id;
        let tokenIds = actor.getActiveTokens().map(t => t.id);
        await gmFunctions.deleteTokens(tokenIds);
        await gmFunctions.deleteActor(actorId);
        return false;
    }
    await createExpended(actor, expendedItem);
    return true;
}

async function createExpended(actor, expendedItem) {
    let existingReward = actor.items.find(i => i.getFlag(sdndConstants.MODULE_ID, "source") == expendedItem.uuid);
    if (existingReward) {
        let change = {
            "_id": existingReward._id,
            "system": {
                "quantity": (existingReward.system.quantity + 1)
            }
        }
        await actor.updateEmbeddedDocuments(Item.name, [change]);
    }
    else {
        let documents = await actor.createEmbeddedDocuments(Item.name, [expendedItem]);
        for (let document of documents) {
            await document.setFlag(sdndConstants.MODULE_ID, "source", expendedItem.uuid);
        }
    }
}

async function getUniqueConfigsFromScene() {
    let configs = canvas.scene.lights.map(l => JSON.stringify({
        "type": l.config.animation.type ?? "none",
        "color": l.config.color ? l.config.color.toString() : "#000000",
        "bright": l.config.bright,
        "dim": l.config.dim,
        "alpha": l.config.alpha,
        "darkness": {
            "min": l.config.darkness.min,
            "max": l.config.darkness.max
        },
        "count": canvas.scene.lights.filter(l2 => l2.config.animation.type == l.config.animation.type &&
            l2.config.color?.toString() == l.config.color?.toString() &&
            l2.config.bright == l.config.bright &&
            l2.config.dim == l.config.dim &&
            l2.config.alpha == l.config.alpha &&
            l2.config.darkness.min == l.config.darkness.min &&
            l2.config.darkness.max == l.config.darkness.max)?.length ?? 0
    }));
    let uniqueConfigs = new Set(configs);

    return Array.from(uniqueConfigs).sort().map(c => JSON.parse(c)).map(o => ({ "key": `${o.type}:${o.color}:${o.bright}:${o.dim}:${o.alpha}:${o.darkness.min}:${o.darkness.max}`, "value": o }));
}

function generateConfigOptionsTable(uniqueConfigs) {
    let configOptions = uniqueConfigs.map(c => `
    <tr>
        <td style="text-align:left"><input type="radio" id="${c.key}" name="configOption" value="${c.key}"></td>
        <td style="text-align:left">${c.value.type == "none" ? "None" : game.i18n.localize(CONFIG.Canvas.lightAnimations[c.value.type].label)}</td>
        <td style='text-align:right'>${c.value.bright}</td>
        <td style='text-align:right'>${c.value.dim}</td>
        <td style="text-align:left;padding-left:10px">${c.value.color}&nbsp;<img width="15" height="15" style="background-color:${c.value.color}"></td>
        <td style='text-align:right'>${c.value.alpha}</td>
        <td style='text-align:right'>${c.value.darkness.min}</td>
        <td style='text-align:right'>${c.value.darkness.max}</td>
        <td style='text-align:right'>${c.value.count}</td>
    </tr> `).join("");
    return `
        <table style="border-spacing:10px">
          <tr>
            <th style="text-align:left">Selection</th>
            <th style="text-align:left">Animation Type</th>
            <th style="text-align:right">Bright</th>
            <th style="text-align:right">Dim</th>
            <th style="text-align:left;padding-left:10px">Color</th>
            <th style="text-align:right">Intensity</th>
            <th style="text-align:right">Min Darkness</th>
            <th style="text-align:right">Max Darkness</th>
            <th style="text-align:right">Count</th>
          </tr>
          ${configOptions}
        </table>  
    `;
}

async function updateLights() {
    let gameMajorVersion = numbers.toNumber(game.version.split(".").shift());
    function _updateLights(search_options, new_animation, new_color, bright, dim, alpha, min_activation, max_activation) {
        if (search_options?.color == "#000000") {
            search_options.color = null;
        }
        else if (gameMajorVersion >= 12) {
            search_options.color = Color.from(search_options.color);
        }
        if (search_options.type == "none") {
            search_options.type = null;
        }
        if (new_color == "#000000") {
            new_color = null;
        }
        else if (gameMajorVersion >= 12) {
            new_color = Color.from(new_color);
        }
        if (new_animation == "none") {
            new_animation = null;
        }
        let targetLights = canvas.scene.lights
            .filter(l =>
                l.config.animation.type == search_options.type &&
                l.config.color?.toString() == search_options.color?.toString() &&
                l.config.bright == search_options.bright &&
                l.config.dim == search_options.dim &&
                l.config.alpha == search_options.alpha &&
                l.config.darkness.min == search_options.darkness.min &&
                l.config.darkness.max == search_options.darkness.max);

        targetLights.forEach(l => {
            l.update({
                "config.color": new_color,
                "config.bright": bright,
                "config.dim": dim,
                "config.alpha": alpha,
                "config.animation.type": new_animation,
                "config.darkness.min": min_activation,
                "config.darkness.max": max_activation
            });
        });
        ui.notifications.notify(`Updated ${targetLights.length} lights.`);
    }

    let animationOptions = '<option value="none">None</option>';
    for (let [k, v] of Object.entries(CONFIG.Canvas.lightAnimations)) {
        animationOptions += `<option value=${k}>${game.i18n.localize(v.label)}</option>`;
    }

    let uniqueConfigs = await getUniqueConfigsFromScene();
    let configOptionsHtml = generateConfigOptionsTable(uniqueConfigs);

    let lightsForm = `
    <script type="text/javascript">
    $(function() {
        console.log( "ready!" );
        $("#new_color").on("focusout", function(){
            $("#pick_color").val($(this).val());
        });
        $("#pick_color").on("change", function(){
            $("#new_color").val($(this).val());
        });
        $("input[type='radio']").on("click", function(){
            let props = $(this).val().split(':');
            $("#new_animation").val(props[0]);
            $("#new_color").val(props[1]);
            $("#pick_color").val(props[1]);
            $("#bright").val(props[2]);
            $("#dim").val(props[3]);
            $("#alpha").val(props[4]);
            $("#min_activation").val(props[5]);
            $("#max_activation").val(props[6]);
            console.log($(this).val());
        });
    });
    </script>
    <b>The following represent the <i>unique</i> light configurations in this scene.<br/><br/>You can select one and then alter all lights that share these settings.</b><br/>
    ${configOptionsHtml}
    <b>Set New Values:</b><br />
    <span>Animation Type</span><br />
    <div style="display: flex; width: 100%; margin: 10px 0px 10px 0px">
        <label for="new_animation" style="white-space: nowrap; margin: 4px 10px 0px 10px;">Animation:</label>
        <select name="new_animation" id="new_animation">
            ${animationOptions}
        </select>
    </div>
    <span>Distances</span><br />
    <div style="display: flex; width: 100%; margin: 10px 0px 10px 0px">
        <label for="bright" style="white-space: nowrap; margin: 4px 10px 0px 10px;">Bright:</label>
        <input type="number" value="0" min="0" id="bright" name="bright" />
        <label for="dim" style="white-space: nowrap; margin: 4px 10px 0px 10px;">Dim:</label>
        <input type="number" value="0" min="0" id="dim" name="dim" />
    </div>
    <span>Color Settings</span><br />
    <div style="display: flex; width: 100%; margin: 10px 0px 10px 0px">
        <label for="new_color" style="white-space: nowrap; margin: 4px 10px 0px 10px;">Color:</label>
        <input type="string" id="new_color" name="new_color" />
        <input type="color" id="pick_color"/>
        <label for="alpha" style="white-space: nowrap; margin: 4px 10px 0px 10px;">Intensity:</label>
        <input type="number" value="0" step="0.1" min="0" max="1" id="alpha" name="alpha" />
    </div>
    <span>Darkness Activation Range</span><br />
    <div style="display: flex; width: 100%; margin: 10px 0px 10px 0px">
        <label for="min_activation" style="white-space: nowrap; margin: 4px 10px 0px 10px;">Min:</label>
        <input type="number" value="0" step="0.1" min="0" max="1" id="min_activation" name="min_activation" />
        <label for="max_activation" style="white-space: nowrap; margin: 4px 10px 0px 10px;">Max:</label>
        <input type="number" value="0" step="0.1" min="0" max="1" id="max_activation" name="max_activation" />
    </div>
    `;

    new Dialog({
        title: `Update Lights`,
        content: `
            <form>
                ${lightsForm}
            </form>
        `,
        buttons: {
            yes: {
                icon: "<i class='fas fa-check'></i>",
                label: `Update`,
                callback: (html) => {
                    let selected_config = html.find("input[name='configOption']:checked").val();
                    if (!selected_config || selected_config == "") {
                        ui.notifications.warn("No config selected.  Nothing to update!");
                        return;
                    }
                    let new_color = html.find('#new_color').val();
                    if (new_color.length == 0) {
                        new_color = null;
                    }
                    let new_animation = html.find('#new_animation').val();
                    if (new_animation.length == 0) {
                        new_animation = null;
                    }
                    let bright = numbers.toNumber(html.find('#bright').val());
                    let dim = numbers.toNumber(html.find('#dim').val());
                    let alpha = numbers.toNumber(html.find('#alpha').val());
                    let min_activation = numbers.toNumber(html.find('#min_activation').val());
                    let max_activation = numbers.toNumber(html.find('#max_activation').val());

                    _updateLights(uniqueConfigs.find(c => c.key == selected_config)?.value, new_animation, new_color, bright, dim, alpha, min_activation, max_activation);
                }
            },
            no: {
                icon: "<i class='fas fa-times'></i>",
                label: `Cancel`
            },
        },
        default: "yes"
    }, { width: 800 }).render(true)
}