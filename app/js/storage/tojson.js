/**
 * Converts a non-JSON.stringify()able tabs object to JSON.  This is used for syncing and comparing tab objects.
 */
define(["lodash", "storage/defaults"], function(_, defaults) {
	var toJSON = function(tabs, settings) {
		var stabs = _.map(tabs, function(tab) {
			tab = _.omit(tab, function(e, k) {
				return defaults.tab[k] && e === defaults.tab[k] ||
					k === "isGrid" && e === (settings.layout === "grid") ||
					k === "fixed" && e === (settings.columnWidth === "fixed");
			});

			tab.columns = _.map(tab.columns || [], function(column) {
				return _.map(column, function(widget) {
					widget = _.pick(widget, ["id", "loc", "size", "config", "syncData"]);

					if (widget.config) {
						if (Object.keys(widget.config).length === (widget.config.size ? 1 : 0)) {
							delete widget.config;
						}
						else {
							widget.config = _.clone(widget.config);

							delete widget.config.size;
						}
					}

					return widget;
				});
			});

			return tab;
		});

		return JSON.stringify(stabs);
	};

	return toJSON;
});