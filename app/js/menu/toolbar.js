/**
 * This generates the toolbar and its submodules
 */
define(["lodash", "jquery", "backbone", "storage/storage", "storage/defaults", "search/search", "menu/menu", "core/render"], function(_, $, Backbone, Storage, Defaults, Search, Menu, render) {
	var Model = Backbone.Model.extend({
			init: function() {
				Storage.on("done updated", function(storage) {
					this.storage = storage;

					this.set(storage.settings);

					if (
						!storage.settings.name || storage.settings.name == Defaults.settings.name ||
						!storage.settings.profile || storage.settings.profile == Defaults.settings.profile
					) {
						this.getProfile();
					}
				}, this);
			},


			/**
			 * Gets the profile picture and user's first name
			 *
			 * @api    private
			 */
			getProfile: function() {
				$.get("https://apis.google.com/u/0/_/+1/hover?url=http%3A%2F%2Fichro.me&isSet=false", function(d) {
					var img = $("img", $.parseHTML(d));

					var profile = img.attr("src").replace("s24", "s72-c"),
						name = img.parent().next().find("a").text().split(" ")[0];

					// We're probably not signed in, skip till next time
					if (!name || profile.indexOf("s72-c") == -1) {
						return;
					}

					this.storage.settings.name = name;
					this.storage.settings.profile = profile;

					this.storage.sync(true);
				}.bind(this));
			}
		}),
		View = Backbone.View.extend({
			tagName: "header",
			className: "toolbar",

			events: {
				"click .apps-toggle": "toggleApps",
				"click .menu-toggle": Menu.toggle.bind(Menu),

				"click .apps a.icon": function(e) {
					e.preventDefault();
				},
				"click a.custom-link": function(e) {
					var href = e.currentTarget.getAttribute("href");

					if (href.indexOf("chrome") == 0) { // chrome:// links can't be opened directly for security reasons, this bypasses that feature.
						e.preventDefault();

						chrome.tabs.getCurrent(function(d) {
							if (e.which == 2) {
								chrome.tabs.create({
									url: href,
									index: d.index + 1
								});
							}
							else {
								chrome.tabs.update(d.id, {
									url: href
								});
							}
						});
					}
				}
			},


			/**
			 * Shows and hides the apps panel
			 *
			 * @api    private
			 * @param  {Event} e The event
			 */
			toggleApps: function(e) {
				var elm = $(e.currentTarget);

				if (!elm.hasClass("active")) {
					if (!this.appsLoaded) {
						elm.find("img[data-src]").each(function(e, i) {
							this.setAttribute("src", this.getAttribute("data-src"));

							this.removeAttribute("data-src");
						});

						this.appsLoaded = true;
					}

					var elms = elm.find("*").add(elm);

					$(document.body).on("click.apps", function(e) {
						if (!elms.is(e.target)) {
							elm.removeClass("active");

							$(document.body).off("click.apps");
						}
					});

					elm.addClass("active");
				}
				else {
					$(document.body).off("click.apps");

					elm.removeClass("active");
				}
			},


			initialize: function() {
				this.model = new Model();

				this.Menu = Menu;

				this.Search = new Search();

				// init() needs to be called after the listener is attached to prevent a race condition when storage is already loaded.
				// It also needs to be here instead of attached directly to new Model() otherwise this.model might not be set yet.
				this.model.on("change", this.render, this).init();
			},


			render: function() {
				var toolbar = this.model.get("toolbar") == "full" || this.model.get("toolbar") === true;

				if (toolbar) {
					this.Menu.$el.detach();
				}

				// The app icons attributes get reset on render
				this.appsLoaded = false;

				this.Search.$el.detach();

				this.$el.html(render("toolbar", this.model.toJSON()));

				this.$(".search").replaceWith(this.Search.el);

				if (toolbar) {
					this.$("nav.menu").replaceWith(this.Menu.el);

					this.Menu.delegateEvents();
				}

				return this;
			}
		});

	return View;
});