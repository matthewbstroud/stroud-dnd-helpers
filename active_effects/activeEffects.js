
export let activeEffects = {
    "Encumbered": {
        "name": "Encumbered",
        "changes": [
            {
                "key": "system.attributes.ac.bonus",
                "mode": 2,
                "value": "-2",
                "priority": 20
            },
            {
                "key": "system.bonuses.All-Attacks",
                "mode": 2,
                "value": "-2",
                "priority": 20
            },
            {
                "key": "system.abilities.dex.bonuses.check",
                "mode": 2,
                "value": "-2",
                "priority": 20
            },
            {
                "key": "system.abilities.str.bonuses.save",
                "mode": 2,
                "value": "-2",
                "priority": 20
            },
            {
                "key": "system.abilities.str.bonuses.check",
                "mode": 2,
                "value": "-2",
                "priority": 20
            },
            {
                "key": "system.abilities.dex.bonuses.save",
                "mode": 2,
                "value": "-2",
                "priority": 20
            }
        ],
        "transfer": false,
        "icon": "modules/stroud-dnd-helpers/images/icons/encumbered.webp",
        "_id": "qs54l1H2h4ml5ADX",
        "disabled": false,
        "duration": {
            "startTime": 1720137727,
            "seconds": null,
            "combat": null,
            "rounds": null,
            "turns": null,
            "startRound": null,
            "startTurn": null
        },
        "description": "<p>You are considerably slower than usual.</p>",
        "origin": null,
        "statuses": [],
        "flags": {
            "dae": {
                "stackable": "noneName",
                "specialDuration": [],
                "disableIncapacitated": false,
                "showIcon": true,
                "macroRepeat": "none"
            },
            "ActiveAuras": {
                "isAura": false,
                "aura": "None",
                "nameOverride": "",
                "radius": "",
                "alignment": "",
                "type": "",
                "customCheck": "",
                "ignoreSelf": false,
                "height": false,
                "hidden": false,
                "displayTemp": false,
                "hostile": false,
                "onlyOnce": false,
                "wallsBlock": "system"
            }
        },
        "tint": null
    },
    "HeavilyEncumbered": {
        "name": "Heavily Encumbered",
        "changes": [
            {
                "key": "system.attributes.ac.bonus",
                "mode": 2,
                "value": "-4",
                "priority": 20
            },
            {
                "key": "flags.midi-qol.disadvantage.ability.check.dex",
                "mode": 0,
                "value": "1",
                "priority": 20
            },
            {
                "key": "flags.midi-qol.disadvantage.ability.save.dex",
                "mode": 0,
                "value": "1",
                "priority": 20
            },
            {
                "key": "flags.midi-qol.disadvantage.ability.check.str",
                "mode": 0,
                "value": "1",
                "priority": 20
            },
            {
                "key": "flags.midi-qol.disadvantage.ability.save.str",
                "mode": 0,
                "value": "1",
                "priority": 20
            },
            {
                "key": "flags.midi-qol.disadvantage.attack.all",
                "mode": 0,
                "value": "1",
                "priority": 20
            }
        ],
        "transfer": false,
        "icon": "modules/stroud-dnd-helpers/images/icons/heavily_encumbered.webp",
        "disabled": false,
        "duration": {
            "startTime": 1720137727,
            "seconds": null,
            "combat": null,
            "rounds": null,
            "turns": null,
            "startRound": null,
            "startTurn": null
        },
        "description": "<p>You can barely move and react as you are reaching the limits of your strength.</p>",
        "origin": null,
        "statuses": [],
        "flags": {
            "dae": {
                "stackable": "noneName",
                "specialDuration": [],
                "disableIncapacitated": false,
                "showIcon": true,
                "macroRepeat": "none"
            },
            "ActiveAuras": {
                "isAura": false,
                "aura": "None",
                "nameOverride": "",
                "radius": "",
                "alignment": "",
                "type": "",
                "customCheck": "",
                "ignoreSelf": false,
                "height": false,
                "hidden": false,
                "displayTemp": false,
                "hostile": false,
                "onlyOnce": false,
                "wallsBlock": "system"
            }
        },
        "tint": null,
        "_id": "kjS2q7JRwpdT53xk"
    }
}