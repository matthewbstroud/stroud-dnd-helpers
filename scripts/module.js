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

Hooks.on("getSceneDirectoryFolderContext", (html, options) => {
	options.push({
	  name: game.i18n.localize("sdnd.scenes.folder.context.regenerateThumbs"),
	  icon: '<i class="fas fa-sync"></i>',
	  callback: async function(li) {
		let folderID = $(li).closest("li").data("folderId");
		if (!folderID){
			return;
		}
		scene.regenerateThumbnails(folderID);
	  },
	  condition: li => {
		let folderID = $(li).closest("li").data("folderId");
		if (!folderID) {
			return false;
		}
		// get scene count
		let sceneCount = game.scenes.filter(s => s.folder?.id == folderID)?.length ?? 0;
		if (sceneCount > 0){
			return true;
		}
		return false;
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