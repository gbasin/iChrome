/**
 * The tabs container-model.
 */
define(
	["lodash", "jquery", "backbone", "storage/storage", "storage/defaults", "core/status", "core/analytics", "tabs/collection", "core/render"],
	function(_, $, Backbone, Storage, Defaults, Status, Track, Tabs, render) {
		var Model = Backbone.Model.extend({
				initialize: function() {
					this.tabs = new Tabs();
				},

				init: function() {
					Storage.on("done updated", function(storage, promise, data) {
						if (!(data && data.tabSort)) {
							var defaults = _.assign({}, Defaults.tab, {
								alignment: storage.settings.alignment,
								theme: storage.settings.theme,
								fixed: storage.settings.columns.split("-")[1] == "fixed"
							});


							var oTabs = this.get("tabs") || "";

							this.set({
								tabs: JSON.stringify(_.map(storage.tabs, function(e) {
									return _.omit(e, "columns");
								})),
								default: (storage.settings.def || 1),
								defaults: defaults
							});

							this.storage = storage;

							this.tabs.defaults = defaults;
							this.tabs.default = (storage.settings.def || 1);


							if (this.get("tabs") !== oTabs) {
								this.tabs.reset(JSON.parse(JSON.stringify(storage.tabs || [])));
							}
							else {
								this.tabs.set(JSON.parse(JSON.stringify(storage.tabs || [])));
							}

							this.tabs.navigate();
						}
					}, this);
				}
			}),
			View = Backbone.View.extend({
				tagName: "div",
				className: "tab-container",
				attributes: {
					tabindex: "-1"
				},

				events: {
					"click .tab-nav > nav": function(e) {
						this.model.tabs.navigate($(e.currentTarget).attr("class"));
					},
					"keydown": function(e) {
						if (e.which == 37) this.model.tabs.navigate("prev");
						else if (e.which == 39) this.model.tabs.navigate("next");
					},
					"keydown .widgets-container .widget": function(e) {
						if (e.currentTarget.className.indexOf("dragged") == -1) e.stopPropagation();
					},
					"mouseover .tab-nav > nav": function(e) {
						if ($(document.body).hasClass("dragging")) {
							this.timeout = setTimeout(function() {
								this.model.tabs.navigate($(e.currentTarget).attr("class"));
							}.bind(this), 500);
						}
					},
					"mouseout .tab-nav > nav": function(e) {
						clearTimeout(this.timeout);
					}
				},

				navigate: function(id) {
					this.model.tabs.navigate(id);
				},

				initialize: function(options, navigate) {
					this.model = new Model();

					this.on("navigate", navigate);

					this.model.tabs
						.on("views:change", this.render, this)
						.on("sort save:columns.value", function() {
							this.model.storage.tabs = this.model.tabs.toJSON();

							this.model.storage.sync({ tabSort: true });
						}, this)
						.on("navigate", function(index, view, model) {
							this.trigger("navigate", index, view, model);
						}, this);

					// init() needs to be called after the listener is attached to prevent a race condition when storage is already loaded.
					// It also needs to be here instead of attached directly to new Model() otherwise this.model might not be set yet.
					this.model.on("change", this.render, this).init();
				},

				render: function() {
					// If the tabs are not detached and are still active then when the .html() is called the
					// jQuery data will be removed from all descendants (including columns), destroying sorting.
					$(_.pluck(this.model.tabs.views, "el")).detach();


					this.$el
						.html(
							'<div class="tab-nav">' +
								'<nav class="prev"></nav>' +
								'<nav class="next"></nav>' +
							'</div>'
						)
						.toggleClass("one-tab", this.model.tabs.length == 1)
						.append(_.pluck(this.model.tabs.views, "el"));

					return this;
				}
			});

		return View;
	}
);