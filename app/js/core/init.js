/**
 * The main iChrome view, this initializes everything.
 */
define([
	"jquery", "lodash", "browser/api", "backbone", "core/auth", "core/status", "core/analytics", "storage/storage", "core/css",
	"themes/controller", "themes/bginfo", "core/tooltips", "menu/menu", "menu/toolbar", "menu/button", "tabs/tabs", "widgets/store"
], function($, _, Browser, Backbone, Auth, Status, Track, Storage, CSS, Themes, BGInfo, Tooltips, Menu, Toolbar, MenuButton, Tabs, Store) {
	var Model = Backbone.Model.extend({
		init: function() {
			this.on("change:theme", function() {
				Themes.setTheme(this.get("theme"));
			});

			Storage.on("done updated", function(storage) {
				this.set({
					style: storage.settings.style,
					theme: storage.settings.theme,
					toolbar: storage.settings.toolbar,
					editing: storage.settings.editing,
					target: storage.settings.openLinksInNewTab ? "_blank" : "_self"
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
			},

			"click .bg-info .icon": function(e) {
				e.currentTarget.parentNode.appendChild(new BGInfo({
					body: this.$el
				}).el);
			},

			"click .add-widget-link .icon": function() {
				if (!this.Store) {
					this.Store = new Store();
				}

				// This delays displaying the modal until after the init JS is done so the animation is smooth
				requestAnimationFrame(this.Store.show.bind(this.Store));
			}
		},


		initialize: function() {
			this.model = new Model();

			var loaded = false;

			// This only fires on change otherwise users with the
			// button might see a FOUT (Flash Of Unchosen Toolbar)
			this.model.on("change:toolbar", function() {
				if (!this.Toolbar) {
					this.Toolbar = new Toolbar();
				}

				if (this.model.get("toolbar") === "full2" || this.model.get("toolbar") === "full") {
					if (this.MenuButton) {
						this.MenuButton.$el.detach();
					}
					else {
						Track.event("Toolbar", "Load"); // If a menu button doesn't exist this isn't a setting change
					}

					this.$el.removeClass("floating-toolbar");
				}
				else {
					if (!this.MenuButton) {
						this.MenuButton = new MenuButton();
					}

					if (this.Toolbar) {
						this.Toolbar.$el.detach();
					}
					else {
						Track.event("Menu Button", "Load");
					}

					this.$el.prepend(this.MenuButton.render().el);

					this.$el.addClass("floating-toolbar");
				}

				this.$el.prepend(this.Toolbar.render().el);
				this.Toolbar.trigger("inserted");

				if (!loaded) {
					loaded = true;

					var loader = this.$el.removeClass("unloaded").children(".loading");

					var animationPlayer = loader[0].animate([
						{ opacity: 1 },
						{ opacity: 0 }
					], {
						duration: 100,
						easing: "cubic-bezier(.4, 0, .2, 1)"
					});

					animationPlayer.onfinish = function() {
						loader.remove();
					};
				}
			}, this).on("change:editing", function() {
				this.$el.toggleClass("no-edit", this.model.get("editing") === false);
			}, this).on("change:style", function() {
				this.$el.removeClass(this.model.previous("style"));

				if (Auth.isPro && this.model.get("style") !== "light") {
					this.$el.addClass(this.model.get("style"));
				}
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

			//Append custom CSS to body
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
	var themeImg = Browser.storage.themeImg;

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
});