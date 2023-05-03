import { sdndSettings } from "./settings.js";
import { playlists } from "./playlists.js";

export let combat = {
    "startFilteredCombat": async function _startFilteredCombat() {
        function shouldRelease(token) {
            if (token.inCombat){
                return true;
            }
            if (token.actor.folder.name == "Traps") {
                return true;
            }
            if (token.actor.folder.name == "Loot") {
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