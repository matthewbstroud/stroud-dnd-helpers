import { sdndConstants } from "../constants.js";
import { BaneWeaponApp } from "./baneWeaponApp.js";
import { baneWeapon } from "./weapons/baneWeapon.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class WeaponMenuApp extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(item) {
        super({ id: `weapon-menu-${item.id}` });
        this.item = item;
    }

    static DEFAULT_OPTIONS = {
        tag: 'div',
        window: {
            title: 'Weapon Enhancements',
            icon: 'fas fa-sword',
            resizable: false,
            positioned: true
        },
        position: {
            width: 400,
            height: 'auto'
        },
        actions: {
            editBane: WeaponMenuApp._editBane,
            removeBane: WeaponMenuApp._removeBane,
            createBane: WeaponMenuApp._createBane
        },
        classes: ['weapon-menu-dialog']
    };

    static PARTS = {
        menu: {
            template: 'modules/stroud-dnd-helpers/templates/weapon-menu.hbs'
        }
    };

    get title() {
        return `${this.item.name} - Weapon Enhancements`;
    }

    async _prepareContext(options) {
        const baneData = this.item.getFlag(sdndConstants.MODULE_ID, "BaneWeaponData");
        const menuItems = [];

        if (baneData) {
            // Has bane data - show edit and remove options
            menuItems.push(
                {
                    id: 'editBane',
                    icon: 'fas fa-edit',
                    label: 'Edit Bane Weapon',
                    action: 'editBane'
                },
                {
                    id: 'removeBane',
                    icon: 'fas fa-trash',
                    label: 'Remove Bane Weapon',
                    action: 'removeBane'
                }
            );
        } else {
            // No bane data - show create option
            menuItems.push({
                id: 'createBane',
                icon: 'fas fa-plus',
                label: 'Create Bane Weapon',
                action: 'createBane'
            });
        }

        return {
            item: this.item,
            menuItems,
            baneData
        };
    }

    async _onRender(context, options) {
        super._onRender(context, options);
        
        // Apply theme styling based on Foundry's color scheme setting
        const colorScheme = game.settings.get("core", "colorScheme");
        const isDarkMode = colorScheme === "dark" || 
                          (colorScheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        // Add theme classes for CSS styling
        const menuContainer = this.element.querySelector('.weapon-menu-container');
        if (menuContainer) {
            // Remove existing theme classes
            menuContainer.classList.remove('theme-dark', 'theme-light');
            // Add appropriate theme class
            menuContainer.classList.add(isDarkMode ? 'theme-dark' : 'theme-light');
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
            
            const windowTitle = this.element.querySelector('.window-title');
            if (windowTitle) {
                windowTitle.style.setProperty('color', '#e0e0e0', 'important');
            }
            
            this.element.querySelectorAll('.header-button').forEach(button => {
                button.style.setProperty('color', '#e0e0e0', 'important');
                button.style.setProperty('background', 'transparent', 'important');
            });
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
                windowHeader.style.setProperty('background', 'linear-gradient(135deg, #f8f8f8, #e8e8e8)', 'important');
                windowHeader.style.setProperty('border-bottom', '1px solid #ddd', 'important');
                windowHeader.style.setProperty('color', '#333', 'important');
            }
            
            const windowTitle = this.element.querySelector('.window-title');
            if (windowTitle) {
                windowTitle.style.setProperty('color', '#333', 'important');
            }
            
            this.element.querySelectorAll('.header-button').forEach(button => {
                button.style.setProperty('color', '#333', 'important');
                button.style.setProperty('background', 'transparent', 'important');
            });
        }
    }

    static async _editBane(event, target) {
        const baneData = this.item.getFlag(sdndConstants.MODULE_ID, "BaneWeaponData");
        const baneApp = new BaneWeaponApp(this.item, { existingData: baneData });
        await baneApp.render(true);
        this.close();
    }

    static async _removeBane(event, target) {
        const baneData = this.item.getFlag(sdndConstants.MODULE_ID, "BaneWeaponData");
        
        const confirmed = await Dialog.confirm({
            title: "Remove Bane Weapon",
            content: `<p>Remove bane properties from <strong>${this.item.name}</strong>?</p>
                     <p><em>Current: ${baneData.DieCount}d${baneData.DieFaces} ${baneData.DamageType} vs ${baneData.CreatureType}</em></p>`,
            defaultYes: false
        });

        if (confirmed) {
            try {
                await baneWeapon.RemoveBaneWeapon(this.item.uuid);
                ui.notifications.info(`Removed bane properties from ${this.item.name}`);
            } catch (error) {
                console.error("Error removing bane weapon:", error);
                ui.notifications.error("Failed to remove bane weapon properties");
            }
        }
        
        this.close();
    }

    static async _createBane(event, target) {
        const baneApp = new BaneWeaponApp(this.item);
        await baneApp.render(true);
        this.close();
    }

    static async show(item) {
        const app = new WeaponMenuApp(item);
        return app.render(true);
    }
}
