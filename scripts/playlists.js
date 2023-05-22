import { numbers } from './utility/numbers.js';
import { sdndSettings } from './settings.js';
export let playlists = {
    "start": async function _start(playListId, random) {
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
    "toggle": async function _toggle(playlistId, random) {
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
    },
    "stop": async function _stop(playlistId){
        let combatPlaylist = game.playlists.get(playlistId);
        combatPlaylist.stopAll();
    }
};
export let music = {
    "combat": {
        "start": async function _start(random){
            random = random ?? true;
            let combatPlaylistId = sdndSettings.CombatPlayList.getValue();
            if (!combatPlaylistId || combatPlaylistId == "none"){
                ui.notifications.notify('You must first select a combat playlist under settings.');
                return;
            }
            playlists.start(combatPlaylistId, random);
        },
        "toggle": async function _toggle(random){
            random = random ?? true;
            let combatPlaylistId = sdndSettings.CombatPlayList.getValue();
            if (!combatPlaylistId || combatPlaylistId == "none"){
                ui.notifications.notify('You must first select a combat playlist under settings.');
                return;
            }
            playlists.toggle(combatPlaylistId, random);
        },
        "stop": async function _stop(){
            let combatPlaylistId = sdndSettings.CombatPlayList.getValue();
            if (!combatPlaylistId || combatPlaylistId == "none"){
                ui.notifications.notify('You must first select a combat playlist under settings.');
                return;
            }
            playlists.stop(combatPlaylistId);
        }
    }
}