import { sdndSettings } from "./settings.js";
import { playlists } from "./playlists.js";

export let combat = {
    "startFilteredCombat": async function _startFilteredCombat() {
        if (!game.user.isGM) {
            ui.notifications.notify(`Can only be run by the gamemaster!`);
            return;
        }
        function shouldRelease(token) {
            const excludedFolders = ["Traps","Loot","Summons"];
            if (token.inCombat){
                return true;
            }
            var folderName = token?.actor?.folder?.name ?? "root";
            if (excludedFolders.includes(folderName)){
                return true;
            }
            if (token.actor.effects.filter(e => e.label == "Dead").length > 0) {
                return true;
            }
            
            return false;
        }
        
        let tokensToRelease = canvas.tokens.controlled.filter(t => shouldRelease(t));
        tokensToRelease.forEach(t => {
            t.release();
        });
        
        await canvas.tokens.toggleCombat();
        await game.combat.rollNPC();
        
        var compatPlaylistId = sdndSettings.CombatPlayList.getValue();
        if (!compatPlaylistId || compatPlaylistId == "none"){
            return;
        }
        playlists.start(compatPlaylistId, true);
    }
};