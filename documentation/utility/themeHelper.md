# ThemeHelper Utility

A reusable utility class for applying consistent theme detection and styling across HandlebarsApplicationMixin applications and standard Foundry Dialogs in Foundry VTT modules.

## Overview

The `ThemeHelper` class provides a centralized way to handle light/dark theme detection and application, ensuring consistent theming across all dialogs, applications, and standard Foundry UI elements in your module.

## Features

- **Automatic Theme Detection**: Detects theme from Foundry settings and system preferences
- **CSS Class Management**: Applies theme classes to containers for CSS targeting
- **Comprehensive Styling**: Handles window content, headers, titles, and buttons
- **Standard Dialog Support**: Works with both ApplicationV2 and legacy Dialog elements
- **Flexible Configuration**: Customizable options for different application needs
- **CSS Custom Properties**: Provides theme-specific CSS variable values

## Basic Usage

### HandlebarsApplicationMixin Applications

```javascript
import { ThemeHelper } from "../utility/themeHelper.js";

class MyApp extends HandlebarsApplicationMixin(ApplicationV2) {
    async _onRender(context, options) {
        super._onRender(context, options);
        
        // Apply theme to container and all window elements
        ThemeHelper.applyTheme(this.element, '.my-app-container');
    }
}
```

### Standard Foundry Dialogs

```javascript
import { ThemeHelper } from "../utility/themeHelper.js";

// For standard Dialog instances
new Dialog({
    title: "My Dialog",
    content: "<p>Dialog content here</p>",
    buttons: {
        yes: {
            label: "Yes",
            callback: () => {}
        },
        no: {
            label: "No", 
            callback: () => {}
        }
    },
    render: (html) => {
        // Apply theme to the dialog
        const dialogElement = html.closest('.window-app');
        ThemeHelper.applyDialogTheme(dialogElement);
    }
});
```

### Custom Configuration

```javascript
async _onRender(context, options) {
    super._onRender(context, options);
    
    // Apply theme with specific options
    ThemeHelper.applyTheme(this.element, '.my-app-container', {
        includeHeader: true,   // Style window header
        includeTitle: false,   // Don't style window title
        includeButtons: true   // Style header buttons
    });
}
```

### Multiple Containers

```javascript
async _onRender(context, options) {
    super._onRender(context, options);
    
    // Apply theme classes to multiple containers
    ThemeHelper.applyThemeClasses(this.element, [
        '.main-container',
        '.sidebar-container',
        '.footer-container'
    ]);
    
    // Apply window styling
    ThemeHelper.applyThemeStyles(this.element);
}
```

## API Reference

### Static Methods

#### `isDarkMode(): boolean`
Detects if dark mode is currently active based on Foundry settings and system preferences.

```javascript
const darkMode = ThemeHelper.isDarkMode();
if (darkMode) {
    // Handle dark mode specific logic
}
```

#### `applyThemeClasses(element, containerSelectors)`
Applies theme CSS classes (`theme-dark` or `theme-light`) to specified containers.

**Parameters:**
- `element` (Element): The application root element
- `containerSelectors` (string|string[]): CSS selector(s) for containers

```javascript
// Single container
ThemeHelper.applyThemeClasses(this.element, '.my-container');

// Multiple containers
ThemeHelper.applyThemeClasses(this.element, ['.container1', '.container2']);
```

#### `applyThemeStyles(element, options)`
Applies comprehensive theme styling to window elements.

**Parameters:**
- `element` (Element): The application root element
- `options` (Object): Configuration options
  - `includeHeader` (boolean): Style window header (default: true)
  - `includeTitle` (boolean): Style window title (default: true)
  - `includeButtons` (boolean): Style header buttons (default: true)

```javascript
ThemeHelper.applyThemeStyles(this.element, {
    includeHeader: true,
    includeTitle: false,
    includeButtons: true
});
```

#### `applyTheme(element, containerSelectors, styleOptions)`
Complete theme application combining class and style application.

**Parameters:**
- `element` (Element): The application root element
- `containerSelectors` (string|string[]): CSS selector(s) for containers
- `styleOptions` (Object): Options for style application

```javascript
ThemeHelper.applyTheme(this.element, '.my-container', {
    includeHeader: true,
    includeTitle: true,
    includeButtons: true
});
```

#### `applyDialogTheme(element, options)`
Apply theme styling to standard Foundry Dialog elements.

**Parameters:**
- `element` (Element): The dialog element (usually the .window-app element)
- `options` (Object): Configuration options
  - `includeHeader` (boolean): Style window header (default: true)
  - `includeTitle` (boolean): Style window title (default: true)
  - `includeContent` (boolean): Style window content (default: true)
  - `includeButtons` (boolean): Style dialog buttons (default: true)

```javascript
// Apply theme to a standard Dialog
const dialogElement = html.closest('.window-app');
ThemeHelper.applyDialogTheme(dialogElement);

// Apply theme with specific options
ThemeHelper.applyDialogTheme(dialogElement, {
    includeHeader: true,
    includeTitle: true,
    includeContent: true,
    includeButtons: true
});
```

#### `getThemeProperties(isDark): Object`
Returns theme-specific CSS custom property values.

**Parameters:**
- `isDark` (boolean, optional): Dark mode flag (auto-detected if not provided)

**Returns:** Object with CSS custom property values

```javascript
const themeProps = ThemeHelper.getThemeProperties();
// Returns: { '--bg-primary': '#ffffff', '--text-primary': '#333', ... }

// Or specify theme explicitly
const darkProps = ThemeHelper.getThemeProperties(true);
// Returns: { '--bg-primary': '#2a2a2a', '--text-primary': '#e0e0e0', ... }
```

## CSS Integration

The ThemeHelper applies theme classes that work with CSS selectors in your templates:

```css
/* Light theme (default) */
.my-container {
    --bg-primary: #ffffff;
    --text-primary: #333;
}

/* Dark theme override */
.theme-dark .my-container {
    --bg-primary: #2a2a2a;
    --text-primary: #e0e0e0;
}

/* Explicit light theme override */
.theme-light .my-container {
    --bg-primary: #ffffff;
    --text-primary: #333;
}
```

## Dialog Styling

The ThemeHelper automatically styles these standard Dialog elements:

- **Dialog Container** (`.window-app`): Background, border, shadow, theme classes
- **Window Header** (`.window-header`): Background gradient, border, color
- **Window Title** (`.window-title`, `.window-header h4`): Text color
- **Window Content** (`.window-content`): Background, removes background images
- **Dialog Content** (`.dialog-content`): Background, text color, paragraph styling
- **Dialog Buttons** (`.dialog-button`): Background, text color, borders with special styling for `.yes`, `.no`, `.bright` classes
- **Dialog Buttons Container** (`.dialog-buttons`): Background, border styling

### Button Types

The `applyDialogTheme` method provides special styling for common dialog button classes:

- **`.yes` or `.bright`**: Primary action buttons (blue styling)
- **`.no`**: Secondary action buttons (gray styling)
- **Default**: Standard buttons with neutral styling

## Window Styling

The ThemeHelper automatically styles these window elements:

- **Window Content** (`.window-content`): Background, color, removes background images
- **Window Header** (`.window-header`): Background gradient, border, color
- **Window Title** (`.window-title`): Text color
- **Header Buttons** (`.header-button`): Text color, transparent background

## Theme Colors

### Light Theme
- Background Primary: `#ffffff`
- Background Secondary: `#f8f8f8`
- Text Primary: `#333`
- Text Secondary: `#444`
- Border Primary: `#ccc`
- Accent Primary: `#4a90d9`

### Dark Theme
- Background Primary: `#2a2a2a`
- Background Secondary: `#353535`
- Text Primary: `#e0e0e0`
- Text Secondary: `#d0d0d0`
- Border Primary: `#555`
- Accent Primary: `#5a9fd9`

## Example Implementation

```javascript
import { ThemeHelper } from "../utility/themeHelper.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class MyDialogApp extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options = {}) {
        super({ id: 'my-dialog-app' });
    }

    static DEFAULT_OPTIONS = {
        tag: 'form',
        window: {
            title: 'My Dialog',
            icon: 'fas fa-cog',
            resizable: false,
            positioned: true
        },
        classes: ['my-dialog-app']
    };

    static PARTS = {
        form: {
            template: 'modules/my-module/templates/my-dialog.hbs'
        }
    };

    async _onRender(context, options) {
        super._onRender(context, options);
        
        // Apply theme with full window styling
        ThemeHelper.applyTheme(this.element, '.my-dialog-container');
        
        // Additional app-specific initialization...
    }
}
```

## Example Implementation

```javascript
import { ThemeHelper } from "../utility/themeHelper.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class MyDialogApp extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options = {}) {
        super({ id: 'my-dialog-app' });
    }

    static DEFAULT_OPTIONS = {
        tag: 'form',
        window: {
            title: 'My Dialog',
            icon: 'fas fa-cog',
            resizable: false,
            positioned: true
        },
        classes: ['my-dialog-app']
    };

    static PARTS = {
        form: {
            template: 'modules/my-module/templates/my-dialog.hbs'
        }
    };

    async _onRender(context, options) {
        super._onRender(context, options);
        
        // Apply theme with full window styling
        ThemeHelper.applyTheme(this.element, '.my-dialog-container');
        
        // Additional app-specific initialization...
    }
}

// Example of using ThemeHelper with standard Foundry Dialog
export function showRemovalConfirmation(itemName, currentBane) {
    return new Promise((resolve) => {
        new Dialog({
            title: "Remove Bane Weapon",
            content: `
                <div class="dialog-content">
                    <p>Remove bane properties from <strong>${itemName}</strong>?</p>
                    <p><em>Current: ${currentBane}</em></p>
                </div>
            `,
            buttons: {
                yes: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Yes",
                    callback: () => resolve(true)
                },
                no: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "No",
                    callback: () => resolve(false)
                }
            },
            default: "no",
            render: (html) => {
                // Apply theme to the dialog
                const dialogElement = html.closest('.window-app');
                ThemeHelper.applyDialogTheme(dialogElement);
            }
        }).render(true);
    });
}
```

This creates a consistent, maintainable theming system that can be easily applied to any new HandlebarsApplicationMixin application or standard Dialog in your module.
