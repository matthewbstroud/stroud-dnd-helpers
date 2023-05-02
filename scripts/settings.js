let moduleName = 'stroud-dnd-helpers';

function getPlaylists() {
	let options = { "none": "(None)" };

	let playlists = game?.playlists?.contents ?? [];
	playlists.forEach(pl => {
		options[pl.id] = pl.name;
	});
	return options;
}
export function registerSettings() {
	game.settings.register(moduleName, 'Do you think Stroud is awesome?', {
		'name': 'Stroud is Awesome',
		'hint': 'You should probably answer yes.',
		'scope': 'world',
		'config': true,
		'type': Boolean,
		'default': true
	});
	
	game.settings.register(moduleName, 'combatPlayList', {
		name: 'Select Your Combat Playlist',
		'scope': 'world',
		config: true,
		type: String,
		choices: getPlaylists(),
		'default': 'none'
	  });
	  
}

export let settings = {
	"CombatPlaylist": {
		"getValue": function() { return game?.settings?.get(moduleName, "combatPlayList") ?? "none"; }
	}
};