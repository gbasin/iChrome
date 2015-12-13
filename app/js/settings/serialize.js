/**
 * Serializes the settings into the standard settings object.  This has hardcoded boolean definitions that might be more appropriate in the defaults file.
 */
define(["jquery", "lodash", "i18n/i18n"], function($, _, Translate) {
	var serialize = function(modal, storage) {
		var settings = {
				links: [],
				ok: false,
				ltab: false,
				stab: false,
				apps: false,
				plus: false,
				voice: false,
				gmail: false,
				def: storage.settings.def,
				editing: storage.settings.editing
			},
			booleans = ["ok", "ltab", "stab", "apps", "plus", "voice", "gmail"];

		modal.find(".general form, .visual form, .advanced form").serializeArray().forEach(function(e) {
			if (booleans.indexOf(e.name) !== -1) {
				settings[e.name] = true; // jQuery will only include a boolean value when serializing if it's checked/true
			}
			else if (e.name === "custom-css") { // Limit custom CSS
				settings["custom-css"] = e.value.slice(0, 1000);
			}
			else if (e.value !== "") { // If it's neither just set it
				settings[e.name] = e.value;
			}
		});

		for (var i = 0; i < 3; i++) { // For each of the custom links
			// If the custom(i) boolean value is set and either the text or URL of the link is set, push it and delete the boolean, text and URL values
			if (settings["custom" + i] && settings["custom" + i + "-text"] || settings["custom" + i + "-url"]) {
				settings.links.push({
					text: settings["custom" + i + "-text"] || "",
					link: settings["custom" + i + "-url"] || ""
				});

				delete settings["custom" + i];
				delete settings["custom" + i + "-url"];
				delete settings["custom" + i + "-text"];
			}
		}

		// For each tab specific form
		modal.find(".specific form").each(function() {
			var tab = storage.tabs[$(this).attr("data-tab") - 1],
				propagating = ["theme"],
				tabSettings = {},
				number, columns, key;

			// If the tab's ID isn't in the storage.tabs array it doesn't exist or is corrupt, skip it
			if (!tab) {
				return;
			}

			// Serialize its settings
			$(this).serializeArray().forEach(function(e) {
				if (e.value !== "") {
					tabSettings[e.name] = e.value;
				}
			});

			for (key in tabSettings) {
				if (key === "name") {
					tab[key] = tabSettings[key];
				}

				// These are the properties that can be set under Visual or another tab and be overridden under Tab Specific
				else if (propagating.indexOf(key) !== -1) {
					if ( // If
						settings[key] && // The key is set, it should be but JIC...
						( // And
							tabSettings[key] === settings[key] || // The Tab Specific setting is the same as the main setting
							( // Or
								storage.settings[key] && tabSettings[key] === storage.settings[key] // The Tab Specific setting is the same as the _previous_ main setting
							)
						)
					) { // Then set the Tab Specific value to the main setting value
						tab[key] = settings[key];
					}
					else { // Otherwise it was set to override the main setting, keep its value
						tab[key] = tabSettings[key];
					}
				}

				// If this is the columns key they might need to be reprocessed so the arrays are merged
				else if (key === "columns") {
					// Again, see above, but this time just with the columns property
					if (settings.columns && (tabSettings.columns === settings.columns || (storage.settings.columns && tabSettings.columns === storage.settings.columns))) {
						columns = settings.columns.split("-");
					}
					else {
						columns = tabSettings.columns.split("-");
					}


					var wasMedley = false;

					// If the new layout is "medley", AKA grid-based
					if (columns[0] === "medley") {
						columns = ["1", "fixed"]; // The number of columns is 1 for conversion and storage

						if ( // If it wasn't previously a medley tab, then confirm
							!tab.medley &&
							!confirm(Translate("column_to_grid_warning"))
						) {
							continue;
						}

						// The tab is now medley
						tab.medley = true;
					}
					else { // The opposite of the above
						if (
							tab.medley &&
							!confirm(Translate("grid_to_column_warning"))
						) {
							continue;
						}

						wasMedley = true;

						tab.medley = false;
					}

					// Parse the number of columns from the split value
					number = parseInt(columns[0] || "0");

					// Set the fixed boolean
					tab.fixed = (columns[1] && columns[1] === "fixed");


					var i;

					// If the column number hasn't changed
					if (tab.columns.length === number) {
						if (wasMedley) { // And it was a medley column (this is only set if the value was changed)
							tab.columns[0].forEach(function(w, i) {
								delete w.loc; // Delete each widgets loc property

								tab.columns[0][i] = w;
							});
						}

						continue;
					}
					else if (tab.columns.length < number) { // If the number of columns needs to be increased
						for (i = number - tab.columns.length; i > 0; i--) {
							tab.columns.push([]); // Push empty columns until the value is reached
						}
					}
					else if (tab.columns.length > number) { // If the number of columns needs to be reduced
						for (i = tab.columns.length - 1; i >= number; i--) {
							tab.columns[0] = tab.columns[0].concat(tab.columns[i]); // Move all widgets in extra columns to the first
						}

						tab.columns.splice(number); // And delete the extra columns
					}

					if (wasMedley) {
						tab.columns.forEach(function(col, i1) {
							col.forEach(function(w, i) {
								delete w.loc; // Delete the loc property from all widgets

								tab.columns[i1][i] = w;
							});
						});
					}
				}
			}
		});

		return settings; // _.defaults(settings, storage.settings);
	};

	return serialize;
});