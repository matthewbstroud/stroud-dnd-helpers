/**
 * Contains any constants for the application
 */
const MODULE_ID = 'stroud-dnd-helpers';
export const sdndConstants = {
    "MODULE_ID": MODULE_ID,
    "ANIMATIONS": {
        "SPELLS": {
            "BLESS": 'modules/JB2A_DnD5e/Library/1st_Level/Bless/Bless_01_Regular_Yellow_Intro_400x400.webm',
            "SPRITUAL_WEAPON": `modules/JB2A_DnD5e/Library/2nd_Level/Spiritual_Weapon/SpiritualWeapon_Mace01_01_Spectral_Blue_200x200.webm`
        }
    },
    "BUTTON_LISTS": {
        "DAMAGE_5E": [
            {
                "label": "🧪 Acid",
                "value": "acid"
            },
            {
                "label": "🔨 Bludgeoning",
                "value": "bludgeoning"
            },
            {
                "label": "❄️ Cold",
                "value": "cold"
            },
            {
                "label": "🔥 Fire",
                "value": "fire"
            },
            {
                "label": "🛡 Force",
                "value": "force"
            },
            {
                "label": "⚡ Lightning",
                "value": "lightning"
            },
            {
                "label": "☠️ Necrotic",
                "value": "necrotic"
            },
            {
                "label": "🏹 Piercing",
                "value": "piercing"
            },
            {
                "label": "🤮 Poison",
                "value": "poison"
            },
            {
                "label": "😱 Psychic",
                "value": "psychic"
            },
            {
                "label": "☀ Radiant",
                "value": "radiant"
            },
            {
                "label": "⚔ Slashing",
                "value": "slashing"
            },
            {
                "label": "🌩 Thunder",
                "value": "thunder"
            }
        ],
        "DICE_TYPES": [
            {
                "label": "d4",
                "value": "4"
            },
            {
                "label": "d6",
                "value": "6"
            },
            {
                "label": "d8",
                "value": "8"
            },
            {
                "label": "d10",
                "value": "10"
            },
            {
                "label": "d12",
                "value": "12"
            },
            {
                "label": "d20",
                "value": "20"
            },
            {
                "label": "d100",
                "value": "100"
            }
        ],
        "ADHOC_DAMAGE_TYPE": [
            {
                "label": "Allow Saves",
                "value": "Damage"
            },
            {
                "label": "No Saves",
                "value": "Unavoidable Damage"
            }
        ]
    },
    "FEATURES": {
        "TWILIGHT_SANCTUARY": "Channel Divinity: Twilight Sanctuary"
    },
    "FOLDERS": {
        "ACTOR": {
            "LOOT": "Loot",
            "TEMP": "SDND Temp Actors",
            "TRAPS": "Traps"
        },
        "MACROS": {
            "GM_MACROS": "SDND GM Macros",
            "BTS": "Behind the Scenes"
        },
        "PLAYER_MACROS": "Player Macros"
    },
    "PACKS": {
        "COMPENDIUMS": {
            "ACTOR": {
                "TEMP": `${MODULE_ID}.SDND-Summons`
            },
            "ITEM": {
                "FEATURES": `${MODULE_ID}.SDND-Features`,
                "ITEMS": `${MODULE_ID}.SDND-Items`,
                "SPELLS": `${MODULE_ID}.SDND-Spells`
            },
            "MACRO": {
                "GM": `${MODULE_ID}.SDND-GM-Macros`,
                "SHARED": `${MODULE_ID}.SDND-Shared-Macros`,
                "SPELLS": `${MODULE_ID}.SDND-Spells`
            }
        }
    },
    "SPELLS": {
        "HUNTERS_MARK": "Hunter's Mark",
        "IDENTIFY": "Identify",
        "SPIRITUAL_WEAPON": "Spiritual Weapon"
    },
    "TEMP_ITEMS":{
        "MAGIC_DART": "Magic Dart",
        "PORTENT_DIE": "Portent Die",
        "PORTENT_DIE_LEGACY": "Portent Die (Legacy)"
    }
}