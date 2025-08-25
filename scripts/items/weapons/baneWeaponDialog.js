import { sdndConstants } from "../../constants.js";

/**
 * FormApplication for creating Bane Weapons
 */
export class BaneWeaponDialog extends FormApplication {
    constructor(item, options = {}) {
        super({}, options);
        this.item = item;
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "bane-weapon-dialog",
            title: "Create Bane Weapon",
            template: "modules/stroud-dnd-helpers/templates/bane-weapon-dialog.hbs",
            width: 400,
            height: "auto",
            classes: ["stroud-dnd-helpers", "bane-weapon-dialog"],
            resizable: true,
            closeOnSubmit: true
        });
    }

    getData() {
        const data = super.getData();
        
        // Check if item already has bane weapon data
        const existingBaneData = this.item.getFlag(sdndConstants.MODULE_ID, "BaneWeaponData");
        
        // Get creature types from dnd5e.config.creatureTypes
        const creatureTypes = dnd5e?.config?.creatureTypes || CONFIG.DND5E?.creatureTypes || {
            aberration: { label: "Aberration" },
            beast: { label: "Beast" }, 
            celestial: { label: "Celestial" },
            construct: { label: "Construct" },
            dragon: { label: "Dragon" },
            elemental: { label: "Elemental" },
            fey: { label: "Fey" },
            fiend: { label: "Fiend" },
            giant: { label: "Giant" },
            humanoid: { label: "Humanoid" },
            monstrosity: { label: "Monstrosity" },
            ooze: { label: "Ooze" },
            plant: { label: "Plant" },
            undead: { label: "Undead" }
        };

        const damageTypes = sdndConstants.BUTTON_LISTS.DAMAGE_5E.map(dt => ({
            value: dt.value,
            label: dt.label
        }));

        const diceTypes = sdndConstants.BUTTON_LISTS.DICE_TYPES.map(dt => ({
            value: dt.value,
            label: dt.label
        }));

        // Set defaults from existing data or use defaults
        const selectedCreatureTypes = existingBaneData?.CreatureType?.split(",") || [];
        
        return {
            ...data,
            item: this.item,
            hasExistingBane: !!existingBaneData,
            existingBaneData: existingBaneData,
            creatureTypes: Object.entries(creatureTypes).map(([key, config]) => ({
                value: key,
                label: config.label,
                selected: selectedCreatureTypes.includes(key)
            })),
            damageTypes: damageTypes,
            diceTypes: diceTypes,
            defaultDamageType: existingBaneData?.DamageType || "force",
            defaultDieType: existingBaneData?.DieFaces?.toString() || "6",
            defaultDieCount: existingBaneData?.DieCount || 1,
            defaultDuration: existingBaneData?.Duration || 0
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
        
        // Handle creature type checkboxes
        html.find('input[name="creatureTypes"]').change(this._onCreatureTypeChange.bind(this));
        
        // Handle select all/none buttons
        html.find('.select-all-creatures').click(this._onSelectAllCreatures.bind(this));
        html.find('.select-none-creatures').click(this._onSelectNoneCreatures.bind(this));
        
        // Handle form submission
        html.find('button[type="submit"]').click(this._onSubmit.bind(this));
        
        // Update initial count
        this._updateSelectedCreaturesDisplay();
    }

    _onCreatureTypeChange(event) {
        // Update the display of selected creature types
        this._updateSelectedCreaturesDisplay();
    }

    _onSelectAllCreatures(event) {
        event.preventDefault();
        const checkboxes = this.element.find('input[name="creatureTypes"]');
        checkboxes.prop('checked', true);
        this._updateSelectedCreaturesDisplay();
    }

    _onSelectNoneCreatures(event) {
        event.preventDefault();
        const checkboxes = this.element.find('input[name="creatureTypes"]');
        checkboxes.prop('checked', false);
        this._updateSelectedCreaturesDisplay();
    }

    _updateSelectedCreaturesDisplay() {
        const selected = this.element.find('input[name="creatureTypes"]:checked');
        const count = selected.length;
        const display = this.element.find('.selected-creatures-count');
        display.text(`${count} creature type${count !== 1 ? 's' : ''} selected`);
    }

    async _onSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(this.element.find('form')[0]);
        const selectedCreatureTypes = [];
        
        // Collect selected creature types
        for (const [key, value] of formData.entries()) {
            if (key === 'creatureTypes') {
                selectedCreatureTypes.push(value);
            }
        }

        if (selectedCreatureTypes.length === 0) {
            ui.notifications.warn("Please select at least one creature type.");
            return;
        }

        const dieCount = parseInt(formData.get('dieCount')) || 1;
        const dieType = formData.get('dieType') || '6';
        const damageType = formData.get('damageType') || 'force';
        const duration = parseInt(formData.get('duration')) || 0;

        if (dieCount < 1 || dieCount > 10) {
            ui.notifications.warn("Die count must be between 1 and 10.");
            return;
        }

        // Call the CreateBaneWeapon function
        try {
            const { baneWeapon } = globalThis.stroudDnD.items.weapons;
            await baneWeapon.CreateBaneWeapon(
                this.item.uuid,
                selectedCreatureTypes.join(","),
                parseInt(dieType),
                dieCount,
                damageType,
                duration
            );

            ui.notifications.info(`Bane weapon created: ${this.item.name} now deals extra ${dieCount}d${dieType} ${damageType} damage to ${selectedCreatureTypes.join(", ")}.`);
            this.close();
        } catch (error) {
            console.error("Error creating bane weapon:", error);
            ui.notifications.error("Failed to create bane weapon. Check console for details.");
        }
    }
}
