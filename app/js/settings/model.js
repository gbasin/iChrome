/**
 * The settings model
 */
define(["lodash", "backbone", "storage/storage"], function(_, Backbone, Storage) {
	var Model = Backbone.Model.extend({
		initialize: function() {
			Storage.on("done updated", function(storage) {
				this.storage = storage;

				this.set(_.assign({
					_tabs: storage.tabs
				}, storage.settings), {
					external: true
				});

				this.trigger("storage:updated");
			}, this);

			_.each(["layout", "columns"], function(prop) {
				this.on("change:" + prop, function(model, value, options) {
					if ((options && options.external === true) || !model.previous(prop)) {
						return;
					}

					this.handleLayoutChange(prop, value);
				}, this);
			}, this);

			this.on("change", function(model, options) {
				if (options && options.external === true) {
					return;
				}

				this.saving = true;

				this.trigger("save:start");

				this.storage.settings = _.omit(this.toJSON(), "_tabs");

				this.storage.tabs = this.get("_tabs");

				this.storage.sync(true, function() {
					this.saving = false;

					this.trigger("save save:finish");
				}.bind(this));
			});
		},


		/**
		 * Handles changes to the tab layout.
		 *
		 * This function does not save its results since change:* event handlers are
		 * always called before general change handlers in Backbone. So, the general
		 * handler will be called just after this runs and will save the _tabs property.
		 *
		 * @param   {String}  prop   The name of the property that changed
		 * @param   {*}       value  The new value
		 */
		handleLayoutChange: function(prop, value) {
			this.set("_tabs", _.map(this.get("_tabs"), function(tab) {
				var wasGrid = prop === "layout" && (typeof tab.isGrid === "boolean" ? tab.isGrid : this.previous("layout") === "grid") && value !== "grid";

				// Remove the legacy layout properties
				if (typeof tab.fixed !== "undefined" || typeof tab.isGrid !== "undefined") {
					delete tab.fixed;
					delete tab.isGrid;
				}

				// Increase or decrease the number of columns as appropriate
				if (prop === "columns") {
					if (tab.columns.length < value) {
						for (var i = value - tab.columns.length; i > 0; i--) {
							tab.columns.push([]); // Push empty columns until the value is reached
						}
					}
					else if (tab.columns.length > value) {
						// Move all widgets in extra columns to the first
						tab.columns[0] = tab.columns[0].concat(_.flatten(_.takeRight(tab.columns, tab.columns.length - value)));

						// And delete the extra columns
						tab.columns.splice(value);
					}
				}
				else if (tab.columns.length > 1) {
					// Move all widgets in all columns to the first
					tab.columns = [_.flatten(tab.columns)];
				}

				// If this was a grid-based tab, remove the extra loc property on each widget
				if (wasGrid) {
					tab.columns = _.map(tab.columns, function(col) {
						return _.map(col, function(e) {
							delete e.loc; // Delete the loc property from all widgets

							return e;
						});
					});
				}

				return tab;
			}, this));
		}
	});

	return _.once(function() {
		return new Model();
	});
});