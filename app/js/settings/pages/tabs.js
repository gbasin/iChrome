/**
 * The tabs settings page
 */
define(["lodash", "i18n/i18n", "modals/alert", "settings/page"], function(_, Translate, Alert, Page) {
	var View = Page.extend({
		id: "tabs",

		monitorProps: ["defaultTab", "_tabs"],

		events: {
			"click .tabs .tab[data-id] button[data-action]": function(e) {
				var action = e.currentTarget.getAttribute("data-action"),
					tabIndex = parseInt(e.currentTarget.parentElement.getAttribute("data-id"));

				var tabs = _.clone(this.model.get("_tabs"));

				var tab = tabs[tabIndex];

				var save = function() {
					var defaultTab = this.model.get("defaultTab");

					var set = {};

					set._tabs = _.map(tabs, function(e, i) {
						if (e.id === defaultTab && !set.defaultTab) {
							set.defaultTab = i + 1;
						}

						e.id = i + 1;

						return e;
					});

					// If the default tab wasn't found, then it must have been deleted.
					// Set the first tab as default.
					set.defaultTab = set.defaultTab || 1;

					this.model.set(set);
				}.bind(this);

				switch (action) {
					case "make-default":
						this.model.set("defaultTab", tab.id);
					break;

					case "delete":
						if (tabs.length === 1) {
							return;
						}

						Alert({
							confirm: true,
							contents: [Translate("settings.tabs.delete_confirm")]
						}, function() {
							tabs.splice(tabIndex, 1);

							save();
						});
					break;

					case "move-up": case "move-down":
						tabs.splice(tabIndex + (action === "move-up" ? -1 : 1), 0, tabs.splice(tabIndex, 1)[0]);

						save();
					break;
				}
			},

			"click button.create-new": "createTab"
		},


		/**
		 * Creates a new tab
		 *
		 * @public
		 * @return  {Object}  The newly created tab
		 */
		createTab: function() {
			var tabs = _.clone(this.model.get("_tabs"));

			var columns = this.model.get("columns");

			var tab = {
				name: "",
				id: tabs.length + 1,
				columns: new Array(columns)
			};


			var index = -1;

			while (++index < columns) {
				tab.columns[index] = [];
			}


			tabs.push(tab);

			this.model.set("_tabs", tabs);

			// The page has now been re-rendered, focus on the new tab's name field
			this.$(".tabs .tab input[name='tab-name']").focus();
		},


		/**
		 * Handles input changes, persisting changes to the model
		 *
		 * @param   {HTMLElement}  elm    The input element
		 * @param   {String}       name   The name of the input
		 * @param   {String}       value  The value of the input
		 */
		onInputChange: function(elm, name, value) {
			if (name === "tab-name") {
				var tabIndex = elm.parentElement.getAttribute("data-id");

				var tabs = _.clone(this.model.get("_tabs"));

				// If we don't clone this (_.assign({}, obj) does the same thing) then the
				// change will happen in the actual tabs array and the _.isEqual check
				// in Backbone.Model.set will determine that the property is unchanged.
				tabs[tabIndex] = _.assign({}, tabs[tabIndex], {
					name: value
				});

				this.model.set("_tabs", tabs);
			}
		},


		onBeforeRender: function(data) {
			return {
				tabs: _.map(data._tabs, function(e) {
					return {
						name: e.name,
						index: e.id - 1,
						isDefault: e.id === data.defaultTab
					};
				})
			};
		}
	});

	return View;
});