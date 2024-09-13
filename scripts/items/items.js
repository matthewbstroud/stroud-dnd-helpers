import { lightBringer } from "./weapons/lightBringer.js"
import { devoteesCenser } from "./weapons/devoteesCenser.js";
import { baneWeapon } from "./weapons/baneWeapon.js";

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
		"baneWeapon": baneWeapon,
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
    },
	"convertConsumableToLoot": convertConsumableToLoot
}



const itemResource = 
{
	"name": "Resource",
	"type": "loot",
	"img": "systems/dnd5e/icons/svg/items/loot.svg",
	"system": {
	  "description": {
		"value": "",
		"chat": ""
	  },
	  "source": {},
	  "identified": true,
	  "unidentified": {
		"description": ""
	  },
	  "container": null,
	  "quantity": 1,
	  "weight": 0,
	  "price": {
		"value": 0,
		"denomination": "gp"
	  },
	  "rarity": "",
	  "properties": [],
	  "type": {
		"value": "resource",
		"subtype": ""
	  }
	},
	"effects": [],
	"folder": null,
	"flags": {
	  "exportSource": {
		"system": "dnd5e",
		"coreVersion": "11.315",
		"systemVersion": "3.1.2"
	  }
	},
	"_stats": {
	  "systemId": "dnd5e",
	  "systemVersion": "3.1.2",
	  "coreVersion": "11.315",
	  "createdTime": 1723338340157,
	  "modifiedTime": 1723338366662,
	  "lastModifiedBy": "6yhz13iFYYklKtgA"
	}
  }

  async function convertConsumableToLoot(itemID) {
	let item = await game.items.get(itemID);
	if (!item || item.type != "consumable") {
		return;
	}
	let newItem = JSON.parse(JSON.stringify(itemResource));
	if (!newItem) {
		return;
	}
	newItem.name = item.name;
	newItem.img = item.img;
	newItem.folder = item.folder;
	newItem.system.rarity = item.system.rarity;
	newItem.system.weight = item.system.weight;
	newItem.system.price.value = item.system.price.value;
	newItem.system.price.denomination = item.system.price.denomination;
	await Item.create(newItem);
	await Item.deleteDocuments([item.id]);
  }