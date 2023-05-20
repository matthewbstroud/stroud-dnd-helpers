import { numbers } from './utility/numbers.js';
import { sdndSettings } from './settings.js';
export let playlists = {
    "start": function _start(playListId, random) {
        let combatPlaylist = game.playlists.get(playListId);
        if (combatPlaylist) {
            if (combatPlaylist.playing) {
                return;
            }
            if (random){
                let songs = combatPlaylist.playbackOrder;
                let songIndex = numbers.getRandomInt(0, songs.length);
                combatPlaylist.playNext(songs[songIndex]);
            }
            combatPlaylist.playAll();
        }
    },
    "toggle": function _toggle(playlistId, random) {
        let combatPlaylist = game.playlists.get(playlistId);
        if (combatPlaylist) {
            if (combatPlaylist.playing) {
                combatPlaylist.stopAll();
                return;
            }
            if (random){
                let songs = combatPlaylist.playbackOrder;
                let songIndex = numbers.getRandomInt(0, songs.length);
                combatPlaylist.playNext(songs[songIndex]);
            }
            combatPlaylist.playAll();
        }
    }
};
export let music = {
    "combat": {
        "start": function _start(random){
            random = random ?? true;
            let combatPlaylistId = sdndSettings.CombatPlayList.getValue();
            if (!combatPlaylistId || combatPlaylistId == "none"){
                ui.notifications.notify('You must first select a combat playlist under settings.');
                return;
            }
            playlists.start(combatPlaylistId, random);
        },
        "toggle": function _toggle(random){
            random = random ?? true;
            let combatPlaylistId = sdndSettings.CombatPlayList.getValue();
            if (!combatPlaylistId || combatPlaylistId == "none"){
                ui.notifications.notify('You must first select a combat playlist under settings.');
                return;
            }
            playlists.toggle(combatPlaylistId, random);
        }
    }
}