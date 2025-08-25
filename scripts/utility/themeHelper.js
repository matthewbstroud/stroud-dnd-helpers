/**
 * Theme Helper Utility for HandlebarsApplicationMixin applications and standard Foundry Dialogs
 * Provides consistent theme detection and application across all dialog types
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
            element.querySelectorAll('.dialog-button').forEach(button => {
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

    /**
     * Apply theme styling to standard Foundry Dialog elements
     * This method is designed for standard Dialog HTML structure with classes like:
     * .window-app, .window-header, .window-title, .window-content, .dialog-content, .dialog-buttons, .dialog-button
     * @param {Element} element - The dialog element (usually the .window-app element)
     * @param {Object} options - Configuration options
     * @param {boolean} options.includeHeader - Whether to style the window header (default: true)
     * @param {boolean} options.includeTitle - Whether to style the window title (default: true)
     * @param {boolean} options.includeContent - Whether to style the window content (default: true)
     * @param {boolean} options.includeButtons - Whether to style dialog buttons (default: true)
     */
    static applyDialogTheme(element, options = {}) {
        const {
            includeHeader = true,
            includeTitle = true,
            includeContent = true,
            includeButtons = true
        } = options;

        const isDark = this.isDarkMode();
        
        // Apply general dialog container styling
        this._applyDialogContainerStyles(element, isDark);

        // Apply header styling
        if (includeHeader) {
            const windowHeader = element.querySelector('.window-header');
            if (windowHeader) {
                this._applyHeaderStyles(windowHeader, isDark);
            }
        }

        // Apply title styling
        if (includeTitle) {
            const windowTitle = element.querySelector('.window-title, .window-header h4');
            if (windowTitle) {
                this._applyTitleStyles(windowTitle, isDark);
            }
        }

        // Apply content styling
        if (includeContent) {
            const windowContent = element.querySelector('.window-content');
            if (windowContent) {
                this._applyContentStyles(windowContent, isDark);
            }

            const dialogContent = element.querySelector('.dialog-content');
            if (dialogContent) {
                this._applyDialogContentStyles(dialogContent, isDark);
            }
        }

        // Apply button styling
        if (includeButtons) {
            // Header buttons (close button)
            element.querySelectorAll('.header-button').forEach(button => {
                this._applyButtonStyles(button, isDark);
            });

            // Dialog buttons (Yes/No, etc.)
            element.querySelectorAll('.dialog-button').forEach(button => {
                this._applyDialogButtonStyles(button, isDark);
            });

            // Style dialog buttons container
            const dialogButtons = element.querySelector('.dialog-buttons');
            if (dialogButtons) {
                this._applyDialogButtonsContainerStyles(dialogButtons, isDark);
            }
        }
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
        if (!isDark) {
            return;
        }
        button.style.setProperty('background', '#404040', 'important');
    }

    static _applyDialogContainerStyles(element, isDark) {
        // Apply theme class to the dialog container
        const themeClass = isDark ? 'theme-dark' : 'theme-light';
        const removeClass = isDark ? 'theme-light' : 'theme-dark';
        
        element.classList.remove(removeClass);
        element.classList.add(themeClass);

        // Apply basic container styling
        if (isDark) {
            element.style.setProperty('background-color', '#2a2a2a', 'important');
            element.style.setProperty('border', '1px solid #555', 'important');
            element.style.setProperty('box-shadow', '0 4px 20px rgba(0, 0, 0, 0.5)', 'important');
        } else {
            element.style.setProperty('background-color', '#ffffff', 'important');
            element.style.setProperty('border', '1px solid #ddd', 'important');
            element.style.setProperty('box-shadow', '0 4px 20px rgba(0, 0, 0, 0.15)', 'important');
        }
    }

    static _applyDialogContentStyles(dialogContent, isDark) {
        if (isDark) {
            dialogContent.style.setProperty('background-color', '#2a2a2a', 'important');
            dialogContent.style.setProperty('color', '#e0e0e0', 'important');
        } else {
            dialogContent.style.setProperty('background-color', '#ffffff', 'important');
            dialogContent.style.setProperty('color', '#333', 'important');
        }
        
        // Style any paragraphs and text elements within
        dialogContent.querySelectorAll('p').forEach(p => {
            const color = isDark ? '#e0e0e0' : '#333';
            p.style.setProperty('color', color, 'important');
        });

        dialogContent.querySelectorAll('strong, em').forEach(elem => {
            const color = isDark ? '#f0f0f0' : '#222';
            elem.style.setProperty('color', color, 'important');
        });
    }

    static _applyDialogButtonStyles(button, isDark) {
        if (isDark) {
            // Default button styling for dark mode
            button.style.setProperty('background', '#404040', 'important');
            button.style.setProperty('color', '#e0e0e0', 'important');
            button.style.setProperty('border', '1px solid #666', 'important');
            
            // Special styling for specific button types
            if (button.classList.contains('yes') || button.classList.contains('bright')) {
                button.style.setProperty('background', '#5a9fd9', 'important');
                button.style.setProperty('color', '#ffffff', 'important');
                button.style.setProperty('border', '1px solid #4a8fc9', 'important');
            }
            
            if (button.classList.contains('no')) {
                button.style.setProperty('background', '#7c8591', 'important');
                button.style.setProperty('color', '#ffffff', 'important');
                button.style.setProperty('border', '1px solid #6c7582', 'important');
            }
        } else {
            // Default button styling for light mode
            button.style.setProperty('background', '#f8f8f8', 'important');
            button.style.setProperty('color', '#333', 'important');
            button.style.setProperty('border', '1px solid #ccc', 'important');
            
            // Special styling for specific button types
            if (button.classList.contains('yes') || button.classList.contains('bright')) {
                button.style.setProperty('background', '#4a90d9', 'important');
                button.style.setProperty('color', '#ffffff', 'important');
                button.style.setProperty('border', '1px solid #357abd', 'important');
            }
            
            if (button.classList.contains('no')) {
                button.style.setProperty('background', '#6c757d', 'important');
                button.style.setProperty('color', '#ffffff', 'important');
                button.style.setProperty('border', '1px solid #545b62', 'important');
            }
        }

        // Add hover effects
        button.addEventListener('mouseenter', () => {
            if (isDark) {
                if (button.classList.contains('yes') || button.classList.contains('bright')) {
                    button.style.setProperty('background', '#4a8fc9', 'important');
                } else if (button.classList.contains('no')) {
                    button.style.setProperty('background', '#6c7582', 'important');
                } else {
                    button.style.setProperty('background', '#4a4a4a', 'important');
                }
            } else {
                if (button.classList.contains('yes') || button.classList.contains('bright')) {
                    button.style.setProperty('background', '#357abd', 'important');
                } else if (button.classList.contains('no')) {
                    button.style.setProperty('background', '#545b62', 'important');
                } else {
                    button.style.setProperty('background', '#e8e8e8', 'important');
                }
            }
        });

        button.addEventListener('mouseleave', () => {
            // Restore original styling on mouse leave
            this._applyDialogButtonStyles(button, isDark);
        });
    }

    static _applyDialogButtonsContainerStyles(dialogButtons, isDark) {
        if (isDark) {
            dialogButtons.style.setProperty('background-color', '#2a2a2a', 'important');
            dialogButtons.style.setProperty('border-top', '1px solid #555', 'important');
        } else {
            dialogButtons.style.setProperty('background-color', '#f8f8f8', 'important');
            dialogButtons.style.setProperty('border-top', '1px solid #ddd', 'important');
        }
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
