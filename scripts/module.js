import {chris as helpers} from './helperFunctions.js';
export let socket;
Hooks.once('init', async function() {

});
Hooks.once('socketlib.ready', async function() {
	socket = socketlib.registerModule('stroud-dnd-helpers');
});
Hooks.once('ready', async function() {
	console.log("Loaded Stroud's DnD Helpers");
});
globalThis['stroudDnD'] = {
	helpers
}