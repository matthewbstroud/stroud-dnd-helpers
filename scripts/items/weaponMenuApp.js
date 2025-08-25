import { sdndConstants } from "../constants.js";
import { BaneWeaponApp } from "./baneWeaponApp.js";
import { baneWeapon } from "./weapons/baneWeapon.js";
import { ThemeHelper } from "../utility/themeHelper.js";

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
        
        // Apply theme using helper utility
        ThemeHelper.applyTheme(this.element, '.weapon-menu-container', {
            includeHeader: true,
            includeTitle: true,
            includeButtons: true
        });
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
