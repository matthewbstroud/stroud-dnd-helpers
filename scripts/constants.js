/**
 * Contains any constants for the application
 */
const MODULE_ID = 'stroud-dnd-helpers';
export const sdndConstants = {
    "MODULE_ID": MODULE_ID,
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
        ]
    },
    "PACKS": {
        "COMPENDIUMS": {
            "MACRO": {
                "GM": `${MODULE_ID}.SDND-GM-Macros`,
                "SHARED": `${MODULE_ID}.SDND-Shared-Macros`,
                "SPELLS": `${MODULE_ID}.SDND-Spells`
            }
        }
    }
}