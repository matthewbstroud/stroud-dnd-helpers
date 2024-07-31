import { numbers } from './utility/numbers.js';
import { sdndSettings } from './settings.js';
import { sdndConstants } from './constants.js';


async function reset(playListId) {
    let playList = game.playlists.get(playListId);
    if (!playList){
        return;
    }
    for (let sound of playList.sounds.contents) {
        await sound.setFlag(sdndConstants.MODULE_ID, "played", false);
    }
    console.log(`Playlist '${playList.name}' has been reset.`);
}

function playNext(sound) {
    let playlistId = sound['playListId'];
    if (!playlistId){
        return;
    }
    let playlist = game.playlists.get(playlistId);
    if (playlist) {
        playlists.playNextSong(playlist);
    }
}

function stopNext(sound) {
    for (let e in sound.events.end) {
        let ce = sound.events.end[e];
        if (ce.fn.name == "playNext") {
            delete sound.events.end[e];
        }
    }
}

export let playlists = {
    "start": async function _start(playListId, random) {
        let playList = game.playlists.get(playListId);
        if (playList) {
            if (playList.playing) {
                return;
            }
            this.playNextSong(playList);
        }
    },
    "playNextSong": async function _playNextSong(playList){
        if ((playList.sounds?.contents.length ?? 0) == 0) {
            ui.notifications.warn(`Playlist ${playList.name} is empty.`);
            return;
        }
        let unplayedSongs = playList.sounds.filter(s => !(s.getFlag(sdndConstants.MODULE_ID, "played") ?? false));
        if (!unplayedSongs || unplayedSongs.length == 0) {
            await reset(playList.id);
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
            nextSong.sound["playListId"] = playList.id; 
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
        },
        "reset": async function _reset(){
            let combatPlaylistId = sdndSettings.CombatPlayList.getValue();
            if (!combatPlaylistId || combatPlaylistId == "none"){
                ui.notifications.notify('You must first select a combat playlist under settings.');
                return;
            }
            reset(combatPlaylistId);
        }
    }
}