import { calendar } from './calendar/calendar.js';
import { chat } from './chat/chat.js';
import { combat } from './combat.js';
import { crafting } from './crafting/crafting.js';
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
import { backpacks } from './backpacks/backpacks.js';
import { tagging } from './utility/tagging.js';
import { actors } from './actors/actors.js';
import { plants } from './plants/plants.js';
import { mounts } from './mounts/mounts.js';
import { rollSkillCheckImp } from './tokens.js';
import { customFilters } from './customFilters.js';
// CONFIG.debug.hooks = true;

export let socket;

Hooks.once('init', async function () {
	await hooks.init();
	await customFilters.prepareSpellListFilters();
});

Hooks.once('socketlib.ready', async function () {
	socket = socketlib.registerModule(sdndConstants.MODULE_ID);
	gmFunctions.registerFunctions(socket);
	socket.register('rollSkillCheckImp', rollSkillCheckImp);
});
Hooks.once('ready', async function () {
	sdndSettings.registerSettings();
	await hooks.ready()
	console.log("Loaded Stroud's DnD Helpers");
});


globalThis['stroudDnD'] = {
	actors,
	backpacks,
	calendar,
	chat,
	combat,
	crafting,
	features,
	identification,
	items,
	journal,
	keybinds,
	lighting,
	macros,
	money,
	mounts,
	music,
	plants,
	spells,
	tagging,
	tokens,
	utility
}