import { sdndConstants } from './constants.js';
import { sdndSettings } from './settings.js';
import { combat } from './combat.js';
import { music } from './playlists.js';
export let socket;
Hooks.once('init', async function() {
});

Hooks.once('socketlib.ready', async function() {
	socket = socketlib.registerModule(sdndConstants.MODULE_ID);
});
Hooks.once('ready', async function() {
	sdndSettings.registerSettings();
	console.log("Loaded Stroud's DnD Helpers");
});
globalThis['stroudDnD'] = {
	combat,
	music
}