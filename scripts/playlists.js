import { numbers } from './utility/numbers.js';
import { sdndSettings } from './settings.js';
import { sdndConstants } from './constants.js';


function playNext(event) {
    let combatPlaylistId = sdndSettings.CombatPlayList.getValue();
    let combatPlaylist = game.playlists.get(combatPlaylistId);
    if (combatPlaylist) {
        playlists.playNextSong(combatPlaylist);
    }
}

function stopNext(event) {
    for (let e in event.events.end) {
        let ce = event.events.end[e];
        if (ce.fn.name == "playNext") {
            delete event.events.end[e];
        }
    }
}

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
    "playNextSong": async function _playNextSong(playList){
        let unplayedSongs = playList.sounds.filter(s => !(s.getFlag(sdndConstants.MODULE_ID, "played") ?? false));
        if (!unplayedSongs || unplayedSongs.length == 0) {
            // clear the flag
            for (let sound of playList.sounds.contents) {
                await sound.setFlag("stroud-dnd-helpers", "played", false);
            }
            unplayedSongs = playList.sounds.filter(s => !(s.getFlag(sdndConstants.MODULE_ID, "played") ?? false));
            if (!unplayedSongs) {
                ui.notifications.error(`Playlist ${playList.name} is either empty or cannot be reset.`);
                return;
            }
        }

        let songIndex = unplayedSongs.length == 1 ? 0 : numbers.getRandomInt(0, unplayedSongs.length - 1);
        let nextSong = unplayedSongs[songIndex];
        await nextSong.setFlag(sdndConstants.MODULE_ID, "played", true);
        await playList.playSound(nextSong);
        if (nextSong.sound) {
            nextSong.sound.on("end", playNext, { once: true});
            nextSong.sound.on("stop", stopNext, { once: true});
        }
    },
    "toggle": async function _toggle(playlistId, random) {
        let combatPlaylist = game.playlists.get(playlistId);
        if (combatPlaylist) {
            if (combatPlaylist.playing) {
                combatPlaylist.stopAll();
                return;
            }
            this.playNextSong(combatPlaylist);
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