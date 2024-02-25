import { lightBringer } from "./weapons/lightBringer.js"
import { devoteesCenser } from "./weapons/devoteesCenser.js";

export let items = {
    'getItemFromCompendium': async function _getItemFromCompendium(key, name, ignoreNotFound, packFolderId) {
		const gamePack = game.packs.get(key);
		if (!gamePack) {
			ui.notifications.warn('Invalid compendium specified!');
			return false;
		}
		const packIndex = await gamePack.getIndex({fields: ['name', 'type', 'flags.cf.id']});
		const match = packIndex.find(item => item.name === name 
			&& (!packFolderId || (packFolderId && item.flags.cf?.id === packFolderId)));
		if (match) {
			return (await gamePack.getDocument(match._id))?.toObject();
		} else {
			if (!ignoreNotFound) ui.notifications.warn('Item not found in specified compendium! Check spelling?');
			return undefined;
		}
	},
    "weapons": {
        "lightBringer": lightBringer,
		"devoteesCenser": devoteesCenser
    },
    "sortByName": function _sortByName(item1, item2) {
        if (item1.name < item2.name){
            return -1;
        }
        else if (item1.name > item2.name){
            return 1;
        }
        return 0;
    }
}

