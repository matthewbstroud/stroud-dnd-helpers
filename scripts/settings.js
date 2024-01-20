import { sdndConstants } from "./constants.js";

export let sdndSettings = {
	'registerSettings': function _registerSettings() {
		for (let key in this) {
			if (!this[key].config) {
				continue;
			}
			game.settings.register(sdndConstants.MODULE_ID, key, this[key].config);
		}
	},
	'ActivePlayersFolder': {
		'config' : {
			'name': 'Active Players Folder',
			'hint': 'This is used by the money macros to determine players that should receive a split.  Only players in this directory will be considered.  (Prevents NPCs or GM controlled player characters from receiving money.)',
			'scope': 'world',
			'config': true,
			'type': String,
			'default': 'Players'
		},
		'getValue': () => {
			let folder = getModuleSettingValue('ActivePlayersFolder');
			if (!folder || folder.length == 0) {
				folder = 'Players';
			}	
			return folder;
		} 
	},
	'AutoApplyAdhocDamage': {
		'config': {
			'name': 'Auto Apply Adhoc Damage',
			'hint': 'When true the damage card will automatically be applied.',
			'scope': 'world',
			'config': true,
			'type': Boolean,
			'default': false
		},
		'getValue': () =>  getModuleSettingValue('AutoApplyAdhocDamage')
	},
	'CombatPlayList': {
		'config': {
			'name': 'Select Your Combat Music Playlist',
			'hint': 'Used to auto-queue music on combat start.',
			'scope': 'world',
			'config': true,
			'type': String,
			'choices': function () {
				let options = { "none": "(None)" };
				let playlists = game?.playlists?.contents ?? [];
				playlists.forEach(pl => {
					options[pl.id] = pl.name;
				});
				return options;
			},
			'default': 'none'
		},
		'getValue': () =>  getModuleSettingValue('CombatPlayList')
	},
	'ExcludedFolders': {
		'config' : {
			'name': 'Excluded Folders',
			'hint': `Used in conjunction with the add to combat macro, this determines which tokens will be excluded.  If the token is in a folder with an excluded name, it will not be added to combat.`,
			'scope': 'world',
			'config': true,
			'type': String,
			'default': [sdndConstants.FOLDERS.ACTOR.LOOT, sdndConstants.FOLDERS.ACTOR.TRAPS].join(',')
		},
		'getValue': () => getModuleSettingValue('ExcludedFolders')
	},
	'HideTextOnActorSheet': {
		'config': {
			'name': 'Hide the SND Text on the actor sheet.',
			'hint': 'This is to save space.',
			'scope': 'world',
			'config': true,
			'type': Boolean,
			'default': false
		},
		'getValue': () =>  getModuleSettingValue('HideTextOnActorSheet')
	}
};

function getModuleSettingValue(settingName) {
	return game?.settings?.get(sdndConstants.MODULE_ID, settingName);
}
