/**
 * Converts a non-JSON.stringify()able tabs object to JSON.  This is used for syncing and comparing tab objects.
 */
define(["lodash"], function(_) {
	var Deprecate = {
		settings: function(settings) {
			// Renames
			_.each({
				def: "defaultTab",
				stab: "searchInNewTab",
				ltab: "openLinksInNewTab",
				"custom-css": "customCSS",
				"search-url": "searchURL"
			}, function(updated, prev) {
				// Actual old property removal is handled below
				if (settings.hasOwnProperty(prev)) {
					settings[updated] = settings[prev];
				}
			});


			// deprecated settings removal
			settings = _.omit(settings,
				"wcolor", // Widget BG color
				"hcolor", // Toolbar BG color
				"alignment", // Column alignment
				"logo-url", // Custom Logo URL
				"animation", // Loading animation control

				// Old versions of renamed settings
				"def", // Default tab
				"stab", // Search results tab
				"ltab", // Link target
				"custom-css", // Custom CSS
				"search-url" // Search URL
			);


			return settings;
		},

		tabs: function(tabs) {
			_.each(tabs, function(tab, i) {
				if (tab.theme) {
					delete tabs[i].theme;
				}
			});

			return tabs;
		}
	};

	return Deprecate;
});