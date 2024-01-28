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

import { hooks } from './hooks.js';
//CONFIG.debug.hooks = true;

export let socket;

Hooks.once('init', async function() {
	hooks.init();
});

Hooks.once('socketlib.ready', async function() {
	socket = socketlib.registerModule(sdndConstants.MODULE_ID);
	gmFunctions.registerFunctions(socket);
});
Hooks.once('ready', async function() {
	sdndSettings.registerSettings();
	if (game.user?.isGM) {
		Hooks.on('getActorSheet5eHeaderButtons', createActorHeaderButton);
	}
	console.log("Loaded Stroud's DnD Helpers");
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