/**
 * The main iChrome view, this initializes everything.
 */
define(
	["lodash", "backbone", "storage/storage", "core/css", "core/tooltips", "core/menu", "core/toolbar", "core/button", "tabs/tabs", "modals/updated", "modals/getting-started", "lib/extends"],
	function(_, Backbone, Storage, CSS, Tooltips, Menu, Toolbar, MenuButton, Tabs) {
		var Model = Backbone.Model.extend({
			init: function() {
				Storage.on("done updated", function(storage) {
					var toolbar = storage.settings.toolbar;

					if (typeof toolbar == "boolean") {
						if (toolbar) {
							toolbar = "full";
						}
						else {
							toolbar = "button";
						}
					}

					this.set({
						toolbar: toolbar
					});
				}, this);

				return this;
			}
		});

		var iChrome = Backbone.View.extend({
			el: "body",
			initialize: function() {
				this.model = new Model();

				// This only fires on change otherwise users with the
				// button might see a FOUT (Flash Of Unchosen Toolbar)
				this.model.on("change", function() {
					if (this.model.get("toolbar") == "full") {
						if (!this.Toolbar) this.Toolbar = new Toolbar();

						if (this.MenuButton) this.MenuButton.$el.detach();

						this.$el.prepend(this.Toolbar.el);
					}
					else {
						if (!this.MenuButton) this.MenuButton = new MenuButton();

						if (this.Toolbar) this.Toolbar.$el.detach();

						this.$el.prepend(this.MenuButton.el);
					}
				}, this).init();


				this.css = new CSS();

				this.tooltips = new Tooltips();

				var menu = this.Menu = Menu.init(function() {
					tabs.navigate.apply(tabs, arguments);
				});

				var tabs = this.Tabs = new Tabs({
					el: this.$(".tab-container")
				}, function() {
					menu.navigate.apply(menu, arguments);
				});

				this.$el.append(this.css.el);
			}
		});

		return new iChrome();
	}
);