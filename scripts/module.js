import { calendar } from './calendar/calendar.js';
import { createActorHeaderButton } from './actors/actors.js';
import { chat } from './chat/chat.js';
import { combat } from './combat.js';
import { gmFunctions } from './gm/gmFunctions.js';
import { features } from './spells/features.js';
import { identification } from './identification/identification.js';
import { items } from './items/items.js';
import { journal } from './journal/journal.js';
import { keybinds } from './keyboard/keybinds.js';
import { lighting } from './lighting/lighting.js';
import { money } from './money/money.js';
import { music } from './playlists.js';
import { sdndConstants } from './constants.js';
import { sdndSettings } from './settings.js';
import { spells } from './spells/spells.js';
import { tokens } from './tokens.js';
import { macros } from './macros/macros.js';
import { utility } from './utility/utility.js';
import { scene } from './utility/scene.js';
//CONFIG.debug.hooks = true;

export let socket;

Hooks.once('init', async function() {
	
});

Hooks.once('socketlib.ready', async function() {
	socket = socketlib.registerModule(sdndConstants.MODULE_ID);
	gmFunctions.registerFunctions(socket);
});
Hooks.once('ready', async function() {
	sdndSettings.registerSettings();
	macros.initFolders();
	if (game.user?.isGM) {
		Hooks.on('getActorSheet5eHeaderButtons', createActorHeaderButton);
	}
	console.log("Loaded Stroud's DnD Helpers");
	
});

Hooks.on("getCompendiumDirectoryEntryContext", (html, options) => {
	options.push({
	  name: game.i18n.localize("sdnd.compendium.entry.context.exportThumbnails"),
	  icon: '<i class="fa-solid fa-camera-retro"></i>',
	  callback: async function(li) {
		debugger;
		const fullyQualifiedPack = $(li).data("pack");
		if (!fullyQualifiedPack){
			return;
		}
		const moduleId = fullyQualifiedPack.split('.').shift();
		await scene.packModuleThumbnails(moduleId);
	  },
	  condition: li => {
		debugger;
		const fullyQualifiedPack = $(li).data("pack");
		if (!fullyQualifiedPack){
			return false;
		}
		const moduleId = fullyQualifiedPack.split('.').shift();
		if (!moduleId){
			return;
		}
		if (moduleId.startsWith('sdnd-') || moduleId.startsWith('stroud-')){
			return true;
		}
		return false;
	  },
	});
  });
Hooks.on("getSceneDirectoryFolderContext", (html, options) => {
	options.push({
	  name: game.i18n.localize("sdnd.scenes.folder.context.regenerateThumbs"),
	  icon: '<i class="fas fa-sync"></i>',
	  callback: async function(li) {
		let folderID = $(li).closest("li").data("folderId");
		if (!folderID){
			return;
		}
		let folder = await game.folders.get(folderID);
		let thumbCount = await scene.regenerateThumbnails(folder);
		if (thumbCount > 0) {
			ui.notifications.notify(`Regenerated ${thumbCount} thumbnail image${(thumbCount > 0 ? 's' : '')}.`);
		}
	  },
	  condition: li => {
		let folderID = $(li).closest("li").data("folderId");
		if (!folderID) {
			return false;
		}
		let folder = game.folders.get(folderID);
		if (!folder) {
			return false;
		}
		let sceneCount = game.scenes.filter(s => s.folder?.id == folder.id)?.length ?? 0;
		if (sceneCount == 0 && folder.children?.length == 0) {
			return false;
		}
		if (sceneCount?.length > 10 || folder.children?.length > 10){
			return false;
		}
		return true;
	  },
	});
  });

globalThis['stroudDnD'] = {
	calendar,
	chat,
	combat,
	features,
	identification,
	items,
	journal,
	keybinds,
	lighting,
	macros,
	money,
	music,
	spells,
	tokens,
	utility
}