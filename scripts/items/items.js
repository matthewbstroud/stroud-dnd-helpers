import { lightBringer } from "./weapons/lightBringer.js"
import { devoteesCenser } from "./weapons/devoteesCenser.js";
import { dialog } from "../dialog/dialog.js";
import { utility } from "../utility/utility.js";
import { baneWeapon } from "./weapons/baneWeapon.js";
import { WeaponMenuApp } from "./weaponMenuApp.js";
import { gmFunctions } from "../gm/gmFunctions.js";
import { sdndSettings } from "../settings.js";

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
			onclick: () => WeaponMenuApp.show(item)
		});
	}
}

