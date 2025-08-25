/**
 * Theme Helper Utility for HandlebarsApplicationMixin applications
 * Provides consistent theme detection and application across all dialogs
 */
export class ThemeHelper {
    
    /**
     * Detect the current theme based on Foundry settings and system preferences
     * @returns {boolean} true if dark mode, false if light mode
     */
    static isDarkMode() {
        const colorScheme = game.settings.get("core", "colorScheme");
        return colorScheme === "dark" || 
               (colorScheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    /**
     * Apply theme classes to specified container elements
     * @param {Element} element - The application element
     * @param {string|string[]} containerSelectors - CSS selector(s) for containers to apply theme classes
     */
    static applyThemeClasses(element, containerSelectors) {
        const isDark = this.isDarkMode();
        const themeClass = isDark ? 'theme-dark' : 'theme-light';
        const removeClass = isDark ? 'theme-light' : 'theme-dark';
        
        // Handle single selector or array of selectors
        const selectors = Array.isArray(containerSelectors) ? containerSelectors : [containerSelectors];
        
        selectors.forEach(selector => {
            const container = element.querySelector(selector);
            if (container) {
                container.classList.remove(removeClass);
                container.classList.add(themeClass);
            }
        });
    }

    /**
     * Apply comprehensive theme styling to window elements
     * @param {Element} element - The application element
     * @param {Object} options - Configuration options
     * @param {boolean} options.includeHeader - Whether to style the window header (default: true)
     * @param {boolean} options.includeTitle - Whether to style the window title (default: true)
     * @param {boolean} options.includeButtons - Whether to style header buttons (default: true)
     */
    static applyThemeStyles(element, options = {}) {
        const {
            includeHeader = true,
            includeTitle = true,
            includeButtons = true
        } = options;

        const isDark = this.isDarkMode();
        
        // Apply window content styling
        const windowContent = element.querySelector('.window-content');
        if (windowContent) {
            this._applyContentStyles(windowContent, isDark);
        }

        // Apply header styling
        if (includeHeader) {
            const windowHeader = element.querySelector('.window-header');
            if (windowHeader) {
                this._applyHeaderStyles(windowHeader, isDark);
            }
        }

        // Apply title styling
        if (includeTitle) {
            const windowTitle = element.querySelector('.window-title');
            if (windowTitle) {
                this._applyTitleStyles(windowTitle, isDark);
            }
        }

        // Apply button styling
        if (includeButtons) {
            element.querySelectorAll('.header-button').forEach(button => {
                this._applyButtonStyles(button, isDark);
            });
        }
    }

    /**
     * Complete theme application - combines class and style application
     * @param {Element} element - The application element
     * @param {string|string[]} containerSelectors - CSS selector(s) for containers to apply theme classes
     * @param {Object} styleOptions - Options for style application
     */
    static applyTheme(element, containerSelectors, styleOptions = {}) {
        this.applyThemeClasses(element, containerSelectors);
        this.applyThemeStyles(element, styleOptions);
    }

    // Private methods for applying specific styles

    static _applyContentStyles(windowContent, isDark) {
        if (isDark) {
            windowContent.style.setProperty('background-image', 'none', 'important');
            windowContent.style.setProperty('background-color', '#2a2a2a', 'important');
            windowContent.style.setProperty('color', '#e0e0e0', 'important');
        } else {
            windowContent.style.setProperty('background-image', 'none', 'important');
            windowContent.style.setProperty('background-color', '#ffffff', 'important');
            windowContent.style.setProperty('color', '#333', 'important');
        }
    }

    static _applyHeaderStyles(windowHeader, isDark) {
        if (isDark) {
            windowHeader.style.setProperty('background', 'linear-gradient(135deg, #2d2d2d, #1a1a1a)', 'important');
            windowHeader.style.setProperty('border-bottom', '1px solid #555', 'important');
            windowHeader.style.setProperty('color', '#e0e0e0', 'important');
        } else {
            windowHeader.style.setProperty('background', 'linear-gradient(135deg, #f8f8f8, #e8e8e8)', 'important');
            windowHeader.style.setProperty('border-bottom', '1px solid #ddd', 'important');
            windowHeader.style.setProperty('color', '#333', 'important');
        }
    }

    static _applyTitleStyles(windowTitle, isDark) {
        const color = isDark ? '#e0e0e0' : '#333';
        windowTitle.style.setProperty('color', color, 'important');
    }

    static _applyButtonStyles(button, isDark) {
        const color = isDark ? '#e0e0e0' : '#333';
        button.style.setProperty('color', color, 'important');
        button.style.setProperty('background', 'transparent', 'important');
    }

    /**
     * Get theme-specific CSS custom properties
     * @param {boolean} isDark - Whether dark mode is active (optional, will auto-detect if not provided)
     * @returns {Object} Object containing CSS custom property values
     */
    static getThemeProperties(isDark = null) {
        if (isDark === null) {
            isDark = this.isDarkMode();
        }

        if (isDark) {
            return {
                '--bg-primary': '#2a2a2a',
                '--bg-secondary': '#353535',
                '--bg-tertiary': '#404040',
                '--text-primary': '#e0e0e0',
                '--text-secondary': '#d0d0d0',
                '--text-muted': '#b0b0b0',
                '--border-primary': '#555',
                '--border-secondary': '#666',
                '--accent-primary': '#5a9fd9',
                '--accent-primary-hover': '#4a8fc9'
            };
        } else {
            return {
                '--bg-primary': '#ffffff',
                '--bg-secondary': '#f8f8f8',
                '--bg-tertiary': '#fafafa',
                '--text-primary': '#333',
                '--text-secondary': '#444',
                '--text-muted': '#666',
                '--border-primary': '#ccc',
                '--border-secondary': '#ddd',
                '--accent-primary': '#4a90d9',
                '--accent-primary-hover': '#357abd'
            };
        }
    }
}
