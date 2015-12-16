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

			this.on("change:columns", function(model, value, options) {
				if ((options && options.external === true) || !model.previous("columns")) {
					return;
				}

				this.handleLayoutChange(value);
			}, this).on("change", function(model, options) {
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
		 * Handles changes to the tab layout
		 *
		 * @param   {String}  value  The new layout
		 */
		handleLayoutChange: function(value) {
			var previous = this.previous("columns");

			previous = {
				type: previous.split("-")[1] || previous,
				number: parseInt(previous.split("-")[0]) || 1
			};

			var current = {
				type: value.split("-")[1] || value,
				number: parseInt(value.split("-")[0]) || 1
			};


			_.each(this.storage.tabs, function(tab) {
				var wasGrid = (typeof tab.medley === "boolean" ? tab.medley : previous.type === "medley") && current.type !== "medley";

				tab.fixed = current.type === "fixed";
				tab.medley = current.type === "medley";


				// Increase or decrease the number of columns as appropriate
				if (tab.columns.length < current.number) {
					for (var i = current.number - tab.columns.length; i > 0; i--) {
						tab.columns.push([]); // Push empty columns until the value is reached
					}
				}
				else if (tab.columns.length > current.number) {
					// Move all widgets in extra columns to the first
					tab.columns[0] = tab.columns[0].concat(_.flatten(_.takeRight(tab.columns, tab.columns.length - current.number)));

					// And delete the extra columns
					tab.columns.splice(current.number);
				}

				// If this was a grid, remove the extra loc property
				if (wasGrid) {
					tab.columns = _.map(tab.columns, function(col) {
						return _.map(col, function(e) {
							delete e.loc; // Delete the loc property from all widgets

							return e;
						});
					});
				}
			});
		}
	});

	return _.once(function() {
		return new Model();
	});
});