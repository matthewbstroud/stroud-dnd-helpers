import { sdndConstants } from "../constants.js";
import { baneWeapon } from "./weapons/baneWeapon.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class BaneWeaponApp extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(item, options = {}) {
        super({ id: `bane-weapon-${item.id}` });
        this.item = item;
        this.existingData = options.existingData || null;
        this.isEdit = !!this.existingData;
    }

    static DEFAULT_OPTIONS = {
        tag: 'form',
        form: {
            handler: BaneWeaponApp._handleFormSubmission,
            submitOnChange: false,
            closeOnSubmit: true
        },
        window: {
            title: 'Bane Weapon Configuration',
            icon: 'fas fa-sword',
            resizable: false,
            positioned: true
        },
        position: {
            width: 500,
            height: 'auto'
        },
        actions: {
            selectAllCreatures: BaneWeaponApp._selectAllCreatures,
            selectNoneCreatures: BaneWeaponApp._selectNoneCreatures,
            submit: BaneWeaponApp._submit,
            cancel: BaneWeaponApp._cancel
        },
        classes: ['bane-weapon-dialog']
    };

    static PARTS = {
        form: {
            template: 'modules/stroud-dnd-helpers/templates/bane-weapon-dialog.hbs',
            scrollable: ['']
        }
    };

    get title() {
        return `${this.isEdit ? 'Edit' : 'Create'} Bane Weapon: ${this.item.name}`;
    }

    async _prepareContext(options) {
        // Get creature types from D&D 5e system
        const creatureTypes = Object.entries(CONFIG.DND5E.creatureTypes).map(([key, config]) => ({
            value: key,
            label: config.label || key,
            selected: this.existingData ? this.existingData.CreatureType.split(",").includes(key) : false
        }));

        // Get damage types with icons from constants
        const damageTypes = sdndConstants.BUTTON_LISTS.DAMAGE_5E
            .filter(dt => !['healing'].includes(dt.value))
            .map(dt => ({
                value: dt.value,
                label: dt.label, // This includes the emoji icons
                selected: this.existingData ? this.existingData.DamageType === dt.value : dt.value === 'slashing'
            }));

        // Die types
        const diceTypes = [4, 6, 8, 10, 12, 20].map(die => ({
            value: die,
            label: `d${die}`,
            selected: this.existingData ? this.existingData.DieFaces === die : die === 6
        }));

        return {
            item: this.item,
            isEdit: this.isEdit,
            hasExistingBane: this.isEdit,
            existingBaneData: this.existingData,
            creatureTypes,
            damageTypes,
            diceTypes,
            defaultDieCount: this.existingData?.DieCount || 1,
            defaultDieType: this.existingData?.DieFaces || 6,
            defaultDamageType: this.existingData?.DamageType || 'slashing',
            defaultDuration: this.existingData?.Duration || 0,
            showDuration: true
        };
    }

    async _onRender(context, options) {
        super._onRender(context, options);
        
        // Update creature count
        this._updateCreatureCount();
        
        // Apply theme styling based on Foundry's color scheme setting
        const colorScheme = game.settings.get("core", "colorScheme");
        const isDarkMode = colorScheme === "dark" || 
                          (colorScheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        // Add theme classes for CSS styling
        const formContainer = this.element.querySelector('.bane-weapon-form-container');
        if (formContainer) {
            // Remove existing theme classes
            formContainer.classList.remove('theme-dark', 'theme-light');
            // Add appropriate theme class
            formContainer.classList.add(isDarkMode ? 'theme-dark' : 'theme-light');
        }
        
        if (isDarkMode) {
            // Apply dark mode styling to override Foundry's background image
            const windowContent = this.element.querySelector('.window-content');
            if (windowContent) {
                windowContent.style.setProperty('background-image', 'none', 'important');
                windowContent.style.setProperty('background-color', '#2a2a2a', 'important');
                windowContent.style.setProperty('color', '#e0e0e0', 'important');
            }
            
            const windowHeader = this.element.querySelector('.window-header');
            if (windowHeader) {
                windowHeader.style.setProperty('background', 'linear-gradient(135deg, #2d2d2d, #1a1a1a)', 'important');
                windowHeader.style.setProperty('border-bottom', '1px solid #555', 'important');
                windowHeader.style.setProperty('color', '#e0e0e0', 'important');
            }
        } else {
            // Apply light mode styling to ensure clean light theme
            const windowContent = this.element.querySelector('.window-content');
            if (windowContent) {
                windowContent.style.setProperty('background-image', 'none', 'important');
                windowContent.style.setProperty('background-color', '#ffffff', 'important');
                windowContent.style.setProperty('color', '#333', 'important');
            }
            
            const windowHeader = this.element.querySelector('.window-header');
            if (windowHeader) {
                // windowHeader.style.setProperty('background', 'linear-gradient(135deg, #f8f8f8, #e8e8e8)', 'important');
                // windowHeader.style.setProperty('border-bottom', '1px solid #ddd', 'important');
                // windowHeader.style.setProperty('color', '#333', 'important');
            }
        }

        // Add event listeners for creature type checkboxes
        this.element.addEventListener('change', (event) => {
            if (event.target.name === 'creatureTypes') {
                this._updateCreatureCount();
            }
        });
    }

    _updateCreatureCount() {
        const checkboxes = this.element.querySelectorAll('input[name="creatureTypes"]:checked');
        const countElement = this.element.querySelector('.selected-creatures-count');
        if (countElement) {
            const count = checkboxes.length;
            countElement.textContent = `${count} creature type${count !== 1 ? 's' : ''} selected`;
        }
    }

    static async _selectAllCreatures(event, target) {
        const checkboxes = this.element.querySelectorAll('input[name="creatureTypes"]');
        checkboxes.forEach(checkbox => checkbox.checked = true);
        this._updateCreatureCount();
    }

    static async _selectNoneCreatures(event, target) {
        const checkboxes = this.element.querySelectorAll('input[name="creatureTypes"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);
        this._updateCreatureCount();
    }

    static async _submit(event, target) {
        const form = this.element.querySelector('form');
        if (form) {
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(submitEvent);
        }
    }

    static async _cancel(event, target) {
        this.close();
    }

    static async _handleFormSubmission(event, form, formData) {
        event.preventDefault();
        
        try {
            // Get selected creature types
            const selectedCreatures = Array.from(this.element.querySelectorAll('input[name="creatureTypes"]:checked'))
                .map(cb => cb.value);
            
            if (selectedCreatures.length === 0) {
                ui.notifications.warn("Please select at least one creature type");
                return false;
            }

            const creatureTypeString = selectedCreatures.join(",");
            const dieCount = parseInt(formData.object.dieCount) || 1;
            const dieFaces = parseInt(formData.object.dieType) || 6;
            const damageType = formData.object.damageType || 'slashing';
            const duration = parseInt(formData.object.duration) || 0;

            // Create or update the bane weapon
            await baneWeapon.CreateBaneWeapon(
                this.item.uuid,
                creatureTypeString,
                dieFaces,
                dieCount,
                damageType,
                duration
            );

            const actionText = this.isEdit ? 'updated' : 'created';
            ui.notifications.info(`Bane weapon ${actionText} for ${this.item.name}`);
            
            return true; // Allow form to close
        } catch (error) {
            console.error("Error creating/updating bane weapon:", error);
            ui.notifications.error("Failed to create/update bane weapon");
            return false; // Prevent form from closing
        }
    }

    static async show(item, options = {}) {
        const app = new BaneWeaponApp(item, options);
        return app.render(true);
    }
}
