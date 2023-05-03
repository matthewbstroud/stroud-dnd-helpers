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
	'FunnyTestSetting': {
		'config': {
			'name': 'Stroud is Awesome',
			'hint': 'You should probably answer yes.',
			'scope': 'world',
			'config': true,
			'type': Boolean,
			'default': true
		},
		'getValue': () =>  getModuleSettingValue('FunnyTestSetting')
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
	}
};

function getModuleSettingValue(settingName) {
	return game?.settings?.get(sdndConstants.MODULE_ID, settingName);
}
