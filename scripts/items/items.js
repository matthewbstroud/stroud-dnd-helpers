import { lightBringer } from "./weapons/lightBringer.js"
import { devoteesCenser } from "./weapons/devoteesCenser.js";
import { dialog } from "../dialog/dialog.js";
import { utility } from "../utility/utility.js";
import { baneWeapon } from "./weapons/baneWeapon.js";
import { BaneWeaponDialog } from "./weapons/baneWeaponDialog.js";
import { gmFunctions } from "../gm/gmFunctions.js";
import { sdndSettings } from "../settings.js";
import { sdndConstants } from "../constants.js";

export let items = {
	'getItemFromCompendium': async function _getItemFromCompendium(key, name, ignoreNotFound, packFolderId) {
		const gamePack = game.packs.get(key);
		if (!gamePack) {
			ui.notifications.warn('Invalid compendium specified!');
			return false;
		}
		const packIndex = await gamePack.getIndex({ fields: ['name', 'type', 'flags.cf.id'] });
		const match = packIndex.find(item => item.name === name
			&& (!packFolderId || (packFolderId && item.flags.cf?.id === packFolderId)));
		if (match) {
			return (await gamePack.getDocument(match._id))?.toObject();
		} else {
			if (!ignoreNotFound) ui.notifications.warn('Item not found in specified compendium! Check spelling?');
			return undefined;
		}
	},
	'getItemUuid': async function _getItemUuid(key, name) {
		const gamePack = game.packs.get(key);
		if (!gamePack) {
			ui.notifications.warn('Invalid compendium specified!');
			return false;
		}
		return gamePack.index?.find(i => i.name == name)?.uuid ?? game.items.getName(name)?.uuid;
	},
	"midiQol": {
		"addOnUseMacro": addMidiOnUseMacro,
		"removeOnUseMacro": removeMidiOnUseMacro,
		"addBonusDamageSave": addBonusDamageSave,
		"removeBonusDamageSave": removeBonusDamageSave
	},
	"weapons": {
		"baneWeapon": baneWeapon,
		"lightBringer": lightBringer,
		"devoteesCenser": devoteesCenser
	},
	"sortByName": function _sortByName(item1, item2) {
		if (item1.name < item2.name) {
			return -1;
		}
		else if (item1.name > item2.name) {
			return 1;
		}
		return 0;
	},
	"convertConsumableToLoot": convertConsumableToLoot,
	"normalizeSystemIdentifiers": normalizeSystemIdentifiers,
	"remapItemsFromCompendium": remapItemsFromCompendium
}

function identifierMismatched(item) {
	if (!item.system?.identifier || item.system.identifier.trim().length === 0) {
		return false;
	}
	if (!item._stats.compendiumSource || item._stats?.compendiumSource?.startsWith("Compendium.dnd5e")) {
		return false;
	}
	return item.system?.identifier !== utility.createIdentifierString(item.name);
}

async function normalizeSystemIdentifiers() {
	if (!game.user?.isGM) {
		console.log("gm only function!");
	}
	const gameItems = game.items.contents.filter(i => identifierMismatched(i));
	let actorItems = game.actors.contents
		.flatMap(a => a.items.contents)
		.filter(i => i && identifierMismatched(i));
	let sceneItems = game.scenes.contents
		.flatMap(s => s.tokens.contents
			.flatMap(t => t.actor?.items.contents))
		.filter(i => i && identifierMismatched(i));

	const fullCount = gameItems.length + actorItems.length + sceneItems.length;
	if (fullCount === 0) {
		ui.notifications.warn("No items require normalization...");
		return;
	}
	const confirmation = await dialog.confirmation("Normalize System Identifier", `This operation will normalize <b>${fullCount}</b> item${fullCount === 0 ? '' : 's'} in this world.  Each item will have the system identifier set to match the actual name of the item.<br/><br/>Continue?`);
	if (!confirmation || confirmation === "False") {
		return;
	}
	await normalizeGameItems(gameItems);
	actorItems = game.actors.contents
		.flatMap(a => a.items.contents)
		.filter(i => i && identifierMismatched(i));
	await normalizeActorItems(actorItems);
	sceneItems = game.scenes.contents
		.flatMap(s => s.tokens.contents
			.flatMap(t => t.actor?.items.contents))
		.filter(i => i && identifierMismatched(i));
	await normalizeSceneItems(sceneItems);
}

async function bulkUpdateItems(operationName, items, scope, updateMethod) {
	if (!items || items.length === 0) {
		return;
	}
	console.log(`${operationName} ${items.length} ${scope} items.`);
	console.log(`------------------------------------------------------`);
	const totalCount = items.length;
	for (let i = 0; i < items.length; i++) {
		console.log(`${operationName} ${items[i].name} (${items[i]._id})...`);
		SceneNavigation.displayProgressBar({ label: `${operationName} '${items[i].name}' ${i + 1} of ${totalCount}`, pct: Math.floor((i / totalCount) * 100) });
		await updateMethod(items[i]);
	}
	SceneNavigation.displayProgressBar({ label: ``, pct: 100 });
}


async function normalizeGameItems(gameItems) {
	return await bulkUpdateItems("Normalize", gameItems, "Game", async (item) => {
		const newIdentifier = utility.createIdentifierString(item.name);
		console.log(`    system.identifier from ${item.system.identifier} to ${newIdentifier}.`);
		await item.update({ "system.identifier": newIdentifier });
	});
}

async function normalizeActorItems(actorItems) {
	return await bulkUpdateItems("Normalize", actorItems, "Actor", async (item) => {
		const newIdentifier = utility.createIdentifierString(item.name);
		console.log(`    system.identifier from ${item.system.identifier} to ${newIdentifier}.`);
		let parent = item.parent;
		await parent.updateEmbeddedDocuments("Item", [
			{
				"_id": item._id,
				"system.identifier": newIdentifier
			}
		])
	});
}

async function normalizeSceneItems(sceneItems) {
	return await bulkUpdateItems("Normalize", sceneItems, "Scene", async (item) => {
		const newIdentifier = utility.createIdentifierString(item.name);
		console.log(`    system.identifier from ${item.system.identifier} to ${newIdentifier}.`);
		let actor = item.parent;
		let token = actor.parent;
		let scene = token.parent;
		const updates = [
			{
				"_id": item._id,
				"system.identifier": newIdentifier
			}
		];
		if (token.actorLink) {
			await actor.updateEmbeddedDocuments("Item", updates);
		}
		else {
			const sceneUpdates = [
				{
					"_id": scene._id,
					"tokens": [
						{
							"_id": token._id,
							"actorData.items": updates
						}
					]
				}
			]
			await Scene.updateDocuments(sceneUpdates);
		}
	});
}

function itemCanBeRemapped(item, packItems) {
	const itemCompendiumSource = item._stats.compendiumSource ?? "";
	if (itemCompendiumSource.startsWith("Compendium.dnd5e")) {
		return false;  // do not remap 
	}
	const packItem = packItems.find(pi => pi.name === item.name);
	if (!packItem) {
		return false;
	}
	if (itemCompendiumSource !== packItem.uuid) {
		return true;
	}
	return false;
}

async function remapItemsFromCompendium(packName, dryRun) {
	dryRun ??= false;
	if (!game.user?.isGM) {
		console.log("gm only function!");
	}
	const pack = game.packs.get(packName);
	if (!pack) {
		ui.notifications.error(`${packName} does not exist!`);
		return;
	}
	const packItems = pack.index.contents;
	const gameItems = [];//game.items.contents.filter(i => itemCanBeRemapped(i, packItems));
	let actorItems = game.actors.contents
		.filter(a => a.type === "npc")
		.flatMap(a => a.items.contents)
		.filter(i => i && itemCanBeRemapped(i, packItems));
	let sceneItems = game.scenes.contents
		.flatMap(s => s.tokens.contents
			.flatMap(t => !(t.actorLink ?? false) && t.actor?.type === "npc" && t.actor?.items.contents))
		.filter(i => i && itemCanBeRemapped(i, packItems));

	const fullCount = gameItems.length + actorItems.length + sceneItems.length;
	if (fullCount === 0) {
		ui.notifications.warn("No items require remapping...");
		return;
	}
	const confirmation = await dialog.confirmation("Remap Items", `This operation will remap <b>${fullCount}</b> item${fullCount === 0 ? '' : 's'} in this world to compendium ${pack.metadata.label}.<br/><br/>Continue?`);
	if (!confirmation || confirmation === "False") {
		return;
	}
	await remapGameItems(gameItems, packItems, dryRun);
	actorItems = game.actors.contents
		.filter(a => a.type === "npc")
		.flatMap(a => a.items.contents)
		.filter(i => i && itemCanBeRemapped(i, packItems));
	await remapActorItems(actorItems, packItems, dryRun);
	sceneItems = game.scenes.contents
		.flatMap(s => s.tokens.contents
			.flatMap(t => !(t.actorLink ?? false) && t.actor?.type === "npc" && t.actor?.items.contents))
		.filter(i => i && itemCanBeRemapped(i, packItems));
	await remapSceneItems(sceneItems, packItems, dryRun);
}

async function remapGameItems(gameItems, packItems, dryRun) {
	return await bulkUpdateItems("Remap", gameItems, "Game", async (item) => {
		const packItem = packItems.find(pi => pi.name === item.name);
		if (!packItem) {
			return;
		}
		const compendiumUuid = packItem.uuid;
		console.log(`    _stats.compendiumSource from ${item._stats.compendiumSource} to ${compendiumUuid}.`);
		if (dryRun) {
			return;
		}
		await item.update({ "_stats.compendiumSource": compendiumUuid });
	});
}

async function remapActorItems(actorItems, packItems, dryRun) {
	return await bulkUpdateItems("Remap", actorItems, "Actor", async (item) => {
		const packItem = packItems.find(pi => pi.name === item.name);
		if (!packItem) {
			return;
		}
		const compendiumUuid = packItem.uuid;
		let parent = item.parent;
		console.log(`    Actor ${parent.name} type = ${parent.type}`);
		console.log(`       _stats.compendiumSource from ${item._stats.compendiumSource} to ${compendiumUuid}.`);
		if (dryRun) {
			return;
		}
		await parent.updateEmbeddedDocuments("Item", [
			{
				"_id": item._id,
				"_stats.compendiumSource": compendiumUuid
			}
		])
	});
}

async function remapSceneItems(sceneItems, packItems, dryRun) {
	return await bulkUpdateItems("Remap", sceneItems, "Scene", async (item) => {
		const packItem = packItems.find(pi => pi.name === item.name);
		if (!packItem) {
			return;
		}
		const compendiumUuid = packItem.uuid;
		let actor = item.parent;
		let token = actor.parent;
		let scene = token.parent;
		console.log(`    Actor ${actor.name} type = ${actor.type}`);
		console.log(`        _stats.compendiumSource from ${item._stats.compendiumSource} to ${compendiumUuid}.`);
		if (dryRun) {
			return;
		}
		const updates = [
			{
				"_id": item._id,
				"_stats.compendiumSource": compendiumUuid
			}
		];
		if (token.actorLink) {
			await actor.updateEmbeddedDocuments("Item", updates);
		}
		else {
			const sceneUpdates = [
				{
					"_id": scene._id,
					"tokens": [
						{
							"_id": token._id,
							"actorData.items": updates
						}
					]
				}
			]
			await Scene.updateDocuments(sceneUpdates);
		}
	});
}


async function addMidiOnUseMacro(item, triggerName, script) {
	let onUseMacro = await item.getFlag("midi-qol", "onUseMacroName") ?? "";
	const macroName = `[${triggerName}]${script}`;
	if (onUseMacro.includes(macroName)) {
		return;
	}
	let macroItems = onUseMacro.split(",");
	macroItems.unshift(macroName);
	await item.setFlag("midi-qol", "onUseMacroName", macroItems.join(","));
}

async function removeMidiOnUseMacro(item, triggerName, script) {
	let onUseMacro = await item.getFlag("midi-qol", "onUseMacroName") ?? "";
	const macroName = `[${triggerName}]${script}`;
	if (!onUseMacro.includes(macroName)) {
		return;
	}
	let macros = onUseMacro.split(",");
	let newMacros = macros.filter(i => i != macroName).join(',');
	await gmFunctions.setFlag(item.uuid, "midi-qol", "onUseMacroName", newMacros);
}

async function addBonusDamageSave(item, ability, dc, halfOnSave) {
	await item.update({
		"flags": {
			"midiProperties": {
				"saveDamage": 'fulldam',
				"bonusSaveDamage": `${(halfOnSave ? 'half' : 'no')}dam`
			}
		},
		"system": {
			"save": {
				"ability": ability,
				"dc": dc,
				"scaling": 'flat'
			}
		}
	});
}

function removeBonusDamageSave(item, priorData) {
	item.update({
		"flags": {
			"midiProperties": (priorData.midiProperties)
		},
		"system": {
			"save": {
				"ability": priorData?.save?.ability,
				"dc": priorData?.save?.dc,
				"scaling": priorData?.save?.scaling
			}
		}
	});
}

const itemResource =
{
	"name": "Resource",
	"type": "loot",
	"img": "systems/dnd5e/icons/svg/items/loot.svg",
	"system": {
		"description": {
			"value": "",
			"chat": ""
		},
		"source": {},
		"identified": true,
		"unidentified": {
			"description": ""
		},
		"container": null,
		"quantity": 1,
		"weight": 0,
		"price": {
			"value": 0,
			"denomination": "gp"
		},
		"rarity": "",
		"properties": [],
		"type": {
			"value": "resource",
			"subtype": ""
		}
	},
	"effects": [],
	"folder": null,
	"flags": {
		"exportSource": {
			"system": "dnd5e",
			"coreVersion": "11.315",
			"systemVersion": "3.1.2"
		}
	},
	"_stats": {
		"systemId": "dnd5e",
		"systemVersion": "3.1.2",
		"coreVersion": "11.315",
		"createdTime": 1723338340157,
		"modifiedTime": 1723338366662,
		"lastModifiedBy": "6yhz13iFYYklKtgA"
	}
}

async function convertConsumableToLoot(itemID) {
	let item = await game.items.get(itemID);
	if (!item || item.type != "consumable") {
		return;
	}
	let newItem = JSON.parse(JSON.stringify(itemResource));
	if (!newItem) {
		return;
	}
	newItem.name = item.name;
	newItem.img = item.img;
	newItem.folder = item.folder;
	newItem.system.rarity = item.system.rarity;
	newItem.system.weight = item.system.weight;
	newItem.system.price.value = item.system.price.value;
	newItem.system.price.denomination = item.system.price.denomination;
	await Item.create(newItem);
	await Item.deleteDocuments([item.id]);
}

/**
 * Creates a header button for weapon items to access bane weapon creation
 * @param {Object} config - The item sheet configuration
 * @param {Array} buttons - The array of header buttons
 */
export function createWeaponHeaderButton(config, buttons) {
	if (config.object instanceof Item) {
		const item = config.object;

		// Only show for weapon items
		if (item.type !== "weapon") {
			return;
		}

		// Only show for GM
		if (!game.user.isGM) return;

		// Check if it's a melee or ranged weapon with attack activity
		const actionType = item.system?.actionType;
		if (!["mwak", "rwak"].includes(actionType)) {
			return;
		}

		const label = sdndSettings.HideTextOnActorSheet.getValue() ? '' : 'SDND';

		buttons.unshift({
			class: 'stroudDnD-menu',
			icon: 'fa-solid fa-dungeon',
			label: label,
			onclick: () => showWeaponMenu(item)
		});
	}
}

/**
 * Shows a dropdown menu with weapon enhancement options
 * @param {Item} item - The weapon item
 */
function showWeaponMenu(item) {
	const baneData = item.getFlag(sdndConstants.MODULE_ID, "BaneWeaponData");

	let menuItems = [];

	if (baneData) {
		// Weapon has bane data - show edit and remove options
		menuItems.push({
			label: "Edit Bane Weapon",
			icon: "fas fa-edit",
			action: () => openBaneWeaponDialog(item, null)
		});

		menuItems.push({
			label: "Remove Bane Weapon",
			icon: "fas fa-trash",
			action: () => showRemoveBaneDialog(item, baneData)
		});
	} else {
		// No bane data - show create option
		menuItems.push({
			label: "Create Bane Weapon",
			icon: "fas fa-plus",
			action: () => openBaneWeaponDialog(item, null)
		});
	}

	// Future enhancement options can be added here
	// menuItems.push({
	//     label: "Add Enchantment",
	//     icon: "fas fa-magic",
	//     action: () => openEnchantmentDialog(item)
	// });

	// Create dialog with menu options
	new Dialog({
		title: `${item.name} - Weapon Enhancements`,
		content: `
            <div class="weapon-menu">
                <h3>Available Options:</h3>
                <div class="menu-items">
                    ${menuItems.map(item => `
                        <button type="button" class="menu-item" data-action="${menuItems.indexOf(item)}">
                            <i class="${item.icon}"></i>
                            ${item.label}
                        </button>
                    `).join('')}
                </div>
            </div>
            <style>
                .weapon-menu {
                    --bg-primary: #ffffff;
                    --bg-secondary: #f8f8f8;
                    --bg-hover: #e8e8e8;
                    --text-primary: #333;
                    --text-secondary: #666;
                    --border-primary: #ccc;
                    --border-hover: #999;
                }
                
                /* Dark mode color scheme */
                @media (prefers-color-scheme: dark) {
                    .weapon-menu {
                        --bg-primary: #2a2a2a;
                        --bg-secondary: #404040;
                        --bg-hover: #4a4a4a;
                        --text-primary: #e0e0e0;
                        --text-secondary: #b0b0b0;
                        --border-primary: #555;
                        --border-hover: #777;
                    }
                }
                
                /* Support Foundry's explicit theme classes */
                .theme-dark .weapon-menu,
                [data-theme="dark"] .weapon-menu {
                    --bg-primary: #2a2a2a;
                    --bg-secondary: #404040;
                    --bg-hover: #4a4a4a;
                    --text-primary: #e0e0e0;
                    --text-secondary: #b0b0b0;
                    --border-primary: #555;
                    --border-hover: #777;
                }
                
                .weapon-menu h3 {
                    color: var(--text-primary);
                    margin-top: 0;
                    margin-bottom: 10px;
                }
                
                .weapon-menu .menu-items {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-top: 10px;
                }
                
                .weapon-menu .menu-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 16px;
                    border: 1px solid var(--border-primary);
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    cursor: pointer;
                    border-radius: 6px;
                    text-align: left;
                    width: 100%;
                    transition: all 0.2s ease;
                    font-size: 14px;
                    font-weight: 500;
                }
                
                .weapon-menu .menu-item:hover {
                    background: var(--bg-hover);
                    border-color: var(--border-hover);
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                
                .weapon-menu .menu-item i {
                    width: 16px;
                    text-align: center;
                    color: var(--text-secondary);
                }
                
                .weapon-menu .menu-item:hover i {
                    color: var(--text-primary);
                }
                
                /* Dark mode specific enhancements */
                @media (prefers-color-scheme: dark) {
                    .weapon-menu .menu-item:hover {
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                    }
                }
                
                .theme-dark .weapon-menu .menu-item:hover,
                [data-theme="dark"] .weapon-menu .menu-item:hover {
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                }
            </style>
        `,
		buttons: {},
		classes: ["weapon-menu-dialog"],
		render: (html) => {
			const dialogApp = html.closest('.app.dialog')[0];
			dialogApp?.classList.add("weapon-menu-dialog");

			// Apply dark mode styling based on Foundry's color scheme setting
			const colorScheme = game.settings.get("core", "colorScheme");
			const isDarkMode = colorScheme === "dark" || 
							  (colorScheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
			
			if (isDarkMode) {
				// Apply dark mode styling to override Foundry's background image
				const windowContent = html.find('.window-content')[0];
				if (windowContent) {
					windowContent.style.setProperty('background-image', 'none', 'important');
					windowContent.style.setProperty('background-color', '#2a2a2a', 'important');
					windowContent.style.setProperty('color', '#e0e0e0', 'important');
				}
				
				const windowHeader = html.find('.window-header')[0];
				if (windowHeader) {
					windowHeader.style.setProperty('background', 'linear-gradient(135deg, #2d2d2d, #1a1a1a)', 'important');
					windowHeader.style.setProperty('border-bottom', '1px solid #555', 'important');
					windowHeader.style.setProperty('color', '#e0e0e0', 'important');
				}
				
				const windowTitle = html.find('.window-title')[0];
				if (windowTitle) {
					windowTitle.style.setProperty('color', '#e0e0e0', 'important');
				}
				
				html.find('.header-button').each((i, button) => {
					if (button) {
						button.style.setProperty('color', '#e0e0e0', 'important');
						button.style.setProperty('background', 'transparent', 'important');
					}
				});
			}

			html.find('.menu-item').click((event) => {
				const actionIndex = parseInt(event.currentTarget.dataset.action);
				const menuItem = menuItems[actionIndex];
				if (menuItem && menuItem.action) {
					menuItem.action();
				}
				// Close the dialog
				html.closest('.app').find('.header-button.close').click();
			});
		}
	}).render(true);
}

/**
 * Shows the remove bane weapon confirmation dialog
 * @param {Item} item - The weapon item
 * @param {Object} baneData - The bane weapon data
 */
function showRemoveBaneDialog(item, baneData) {
	Dialog.confirm({
		title: "Remove Bane Weapon",
		content: `<p>Remove bane properties from <strong>${item.name}</strong>?</p>
                 <p><em>Current: ${baneData.DieCount}d${baneData.DieFaces} ${baneData.DamageType} vs ${baneData.CreatureType}</em></p>`,
		yes: async () => {
			try {
				await globalThis.stroudDnD.items.weapons.baneWeapon.RemoveBaneWeapon(item.uuid);
				ui.notifications.info(`Bane properties removed from ${item.name}.`);
				item.sheet.render(); // Refresh the sheet to update button
			} catch (error) {
				console.error("Error removing bane weapon:", error);
				ui.notifications.error("Failed to remove bane properties.");
			}
		},
		no: () => { },
		defaultYes: false
	});
}

/**
 * Opens the bane weapon creation/editing dialog
 * @param {Item} item - The weapon item
 * @param {Event} event - The click event (unused in menu context)
 */
function openBaneWeaponDialog(item, event) {
	const dialog = new BaneWeaponDialog(item);
	dialog.render(true);
}