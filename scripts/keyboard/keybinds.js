import { gmFunctions } from "../gm/gmFunctions.js";
import { socket } from "../module.js";

async function setCommonKeybinds() {
    if (game.user?.isGM){
        game.keybindings.set("core", "pause", [
            {
                key: "KeyP",
                modifiers: []
            }
        ]);

    }
    game.keybindings.set("dnd5e", "skipDialogAdvantage", [
        {
            key: "ShiftLeft",
            modifiers: []
        },
        {
            key: "ShiftRight",
            modifiers: []
        }
    ]);
    game.keybindings.set("dnd5e", "skipDialogNormal", [
        {
            key: "AltLeft",
            modifiers: []
        }
    ]);
    game.keybindings.set("dnd5e", "skipDialogDisadvantage", [
        {
            key: "ControlLeft",
            modifiers: []
        },
        {
            key: "ControlRight",
            modifiers: []
        }
    ]);
    game.keybindings.set("midi-qol", "Versatile", [
        {
            key: "V",
            modifiers: []
        }
    ]);
    game.keybindings.set("sequencer", "play-tool-hotkey-control", [
    ]);
    game.keybindings.set("sequencer", "play-tool-hotkey-shift", [
    ]);
    game.keybindings.set("sequencer", "select-tool-hotkey-control", [
    ]);
    game.keybindings.set("sequencer", "select-tool-hotkey-alt", [
    ]);
    game.keybindings.set("sequencer", "select-tool-hotkey-delete", [
    ]);
    ui.notifications.notify(`Keybinds set to server common settings.`);
}

export let keybinds = {
    "pushKeybindsToPlayers": async function pushKeybindsToPlayers(){
        if (!game?.user?.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        await socket.executeForEveryone("pushKeybindsToPlayers");
    },
    "setCommonKeybinds": setCommonKeybinds
};


