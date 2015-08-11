/**
 * The main iChrome view, this initializes everything.
 */
define(
	["jquery", "lodash", "backbone", "core/status", "core/analytics", "storage/storage", "core/css", "core/tooltips", "menu/menu", "menu/toolbar", "menu/button", "tabs/tabs", "modals/updated", "modals/getting-started", "modals/translate-request", "lib/extends"],
	function($, _, Backbone, Status, Track, Storage, CSS, Tooltips, Menu, Toolbar, MenuButton, Tabs) {
		var Model = Backbone.Model.extend({
			init: function() {
				Storage.on("done updated", function(storage) {
					if (typeof storage.settings.toolbar == "boolean") {
						if (storage.settings.toolbar) {
							storage.settings.toolbar = "full";
						}
						else {
							storage.settings.toolbar = "button";
						}
					}

					this.set({
						toolbar: storage.settings.toolbar,
						editing: storage.settings.editing,
						target: storage.settings.ltab ? "_blank" : "_self"
					});
				}, this);

				return this;
			}
		});

		var iChrome = Backbone.View.extend({
			el: "body",

			Status: Status,

			events: {
				"click .nested-link[data-href]": function(e) {
					// If this was an anchor inside a nested link (like the
					// Twitter widget), then let it pass
					if ($(e.target).is("a")) {
						return;
					}

					e.preventDefault();

					var a = document.createElement("a"),
						elm = $(e.currentTarget);

					a.href = elm.attr("data-href") || "#";
					
					var target = elm.attr("target");

					if (target) {
						a.target = target;
					}

					a.click();
				}
			},


			initialize: function() {
				this.model = new Model();

				// This only fires on change otherwise users with the
				// button might see a FOUT (Flash Of Unchosen Toolbar)
				this.model.on("change:toolbar", function() {
					if (this.model.get("toolbar") == "full") {
						if (!this.Toolbar) this.Toolbar = new Toolbar();

						if (this.MenuButton) this.MenuButton.$el.detach();
						else Track.event("Toolbar", "Load"); // If a menu button doesn't exist this isn't a setting change

						this.$el.prepend(this.Toolbar.render().el);
					}
					else {
						if (!this.MenuButton) this.MenuButton = new MenuButton();

						if (this.Toolbar) this.Toolbar.$el.detach();
						else Track.event("Menu Button", "Load");

						this.$el.prepend(this.MenuButton.render().el);
					}

					this.$el.removeClass("unloaded").children(".loading").remove();
				}, this).on("change:editing", function() {
					this.$el.toggleClass("no-edit", !this.model.get("editing"));
				}, this).on("change:target", function() {
					$("base").attr("target", this.model.get("target"));
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


				// requestAnimationFrame ensures this runs after everything is done
				requestAnimationFrame(function() {
					Track.pageDone(this.model.get("toolbar"));
				}.bind(this));
			}
		});


		/**
		 * Background image preloading
		 *
		 * This makes the background image appear with the first render
		 * and makes the first paint happen sooner
		 */
		var themeImg = localStorage.themeImg;

		if (themeImg) {
			var loader = new Image();

			loader.src = themeImg;

			loader.onload = function() {
				if (!document.body.style.backgroundImage) {
					document.body.style.backgroundImage = "url(\"" + themeImg + "\")";
				}

				// Force repaint
				document.body.offsetHeight; // jshint ignore:line
			};
		}

		return new iChrome();
	}
);