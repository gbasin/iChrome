/**
 * Converts a non-JSON.stringify()able tabs object to JSON.  This is used for syncing and comparing tab objects.
 */
define(["storage/defaults"], function(defaults) {
	var toJSON = function(tabs, settings) {
		var stabs = [];

		tabs.forEach(function(t, i) {
			var tab = {},
				allowed = ["id", "size", "syncData", "loc"],
				key;

			for (key in t) {
				if (key !== "columns") {
					tab[key] = t[key];
				}
				else {
					tab.columns = [];

					t[key].forEach(function(c, i) {
						var column = [];

						c.forEach(function(w, i) {
							var widget = {},
								wkey;

							for (wkey in w) {
								if (allowed.indexOf(wkey) !== -1) {
									widget[wkey] = w[wkey];
								}
								else if (wkey == "config") {
									var config = {};

									for (var ckey in w.config) {
										if (ckey !== "size") config[ckey] = w.config[ckey];
									}

									config = $.unextend(Widgets[w.id].config, config); // DEPENDENCY: Widgets

									if (JSON.stringify(config) !== "{}") widget.config = config;
								}
							}

							column.push(widget);
						});

						tab.columns.push(column);
					});
				}
			}

			tab = $.unextend({
				alignment: settings.alignment,
				theme: settings.theme,
				fixed: settings.columns.split("-")[1] == "fixed"
			}, $.unextend(defaults.tab, tab)); // DEPENDENCY: iChrome.Tabs

			stabs.push(tab);
		});

		return JSON.stringify(stabs);
	};

	return toJSON;
});