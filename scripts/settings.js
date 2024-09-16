import { sdndConstants } from "./constants.js";
import { folders } from "./folders/folders.js";

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
	'PoisonDCModifier': {
		'config': {
			'name': 'Poison DC Modifier',
			'hint': 'Adjusts the base DC of all poisons.',
			'scope': 'world',
			'config': true,
			'type': Number,
			'default': 0
		},
		'getValue': () =>  getModuleSettingValue('PoisonDCModifier')
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
		'getValue': function _getValue() {
			let folders = getModuleSettingValue('ExcludedFolders');	
			if (folders && folders.length > 0) {
				folders += ",";
			}
			return folders + sdndSettings.BackpacksFolder.getValue();
		} 
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
	},
	'BackpacksFolder': {
		'config' : {
			'name': 'Backpacks Folder',
			'hint': 'Used in conjunction with Backpacks Manager, this is where your backpacks should be created.',
			'scope': 'world',
			'config': true,
			'type': String,
			'default': 'Managed Backpacks'
		},
		'getValue': () => {
			let folder = getModuleSettingValue('BackpacksFolder');
			if (!folder || folder.length == 0) {
				folder = 'Managed Backpacks';
			}				
			return folder;
		} 
	},
	'UseSDnDEncumbrance': {
		'config': {
			'name': 'Use Stroud DnD Helpers encumbrance rules.',
			'hint': `At 50% max carried weight you will have: (
-2 to AC, Attacks, Initiative, and Strength/Dexterity checks and saves.)  
At 75% max carried weight you will have: (-4 to AC and Disadvantage on Attack rolls, initiative, strength and dexterity check/saves.)`,
			'scope': 'world',
			'config': true,
			'type': Boolean,
			'default': false,
			'requiresReload': true
		},
		'getValue': () =>  getModuleSettingValue('UseSDnDEncumbrance')
	},
	'OnDamageEvents': {
		'config': {
			'name': 'Active on character damage support.',
			'hint': `Allows certain automations to work.  (Example the berserker axe.)`,
			'scope': 'world',
			'config': true,
			'type': Boolean,
			'default': false,
			'requiresReload': true
		},
		'getValue': () =>  getModuleSettingValue('OnDamageEvents')
	}
};

function getModuleSettingValue(settingName) {
	return game?.settings?.get(sdndConstants.MODULE_ID, settingName);
}
