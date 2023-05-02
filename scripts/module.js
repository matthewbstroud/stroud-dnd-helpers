import { registerSettings } from './settings.js';
import { chris as helpers } from './helperFunctions.js';
import { combat } from './combat.js';
import { music } from './playlists.js';
export let socket;
Hooks.once('init', async function() {
});

Hooks.once('socketlib.ready', async function() {
	socket = socketlib.registerModule('stroud-dnd-helpers');
});
Hooks.once('ready', async function() {
	registerSettings();
	console.log("Loaded Stroud's DnD Helpers");
});
globalThis['stroudDnD'] = {
	combat,
	helpers,
	music
}