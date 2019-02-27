/**
 * This generates the toolbar and its submodules
 */
define([
	"lodash", "jquery", "backbone", "browser/api", "core/auth", "core/analytics", "storage/storage",
	"storage/defaults", "search/search", "menu/menu", "core/announcements", "core/render"
], function(_, $, Backbone, Browser, Auth, Track, Storage, Defaults, Search, Menu, Announcements, render) {
	var Model = Backbone.Model.extend({
			init: function() {
				Storage.on("done updated", function(storage) {
					var set = _.clone(storage.settings);

					set.links = _.take(set.links, Auth.isPro ? 8 : 3);

					set.name = storage.user.fname || Defaults.user.fname;

					set.profileimage = storage.user.image ? storage.user.image.replace("s128-c", "s72-c") : Defaults.user.image;

					if (set.toolbar === "full") {
						set.toolbar = "button";
						storage.settings = "button";
					}

					Announcements.off("countchange", null, this).on("countchange", function(count) {
						this.set("announcements", count);
					}, this);

					set.announcements = Announcements.count;

					this.set(set);
				}, this);
			}
		}),
		View = Backbone.View.extend({
			tagName: "header",
			className: "toolbar",

			events: {
				"click .apps-toggle": "toggleApps",
				"click .menu-toggle": Menu.toggle.bind(Menu),

				"click .announcements": function() {
					Announcements.show();
				},
				"click .apps a.icon": function(e) {
					e.preventDefault();
				},
				"click a.custom-link": function(e) {
					var href = e.currentTarget.getAttribute("href");

					if (href.indexOf("chrome") === 0) { // chrome:// links can't be opened directly for security reasons, this bypasses that feature.
						e.preventDefault();

						Browser.tabs.getCurrent(function(d) {
							if (e.which === 2 || $("base").attr("target") === "_blank") {
								Browser.tabs.create({
									url: href,
									index: d.index + 1
								});
							}
							else {
								Browser.tabs.update(d.id, {
									url: href
								});
							}
						});

						Track.event("Toolbar", "Link Click", "Chrome");
					}
					else {
						Track.event("Toolbar", "Link Click");
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
						elm.find("img[data-src]").each(function() {
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

					Track.event("Toolbar", "Apps Menu", "Open");
				}
				else {
					$(document.body).off("click.apps");

					elm.removeClass("active");

					Track.event("Toolbar", "Apps Menu", "Close");
				}
			},


			initialize: function() {
				this.model = new Model();

				this.Menu = Menu;

				this.Search = new Search();


				var insertTriggered = false;

				// The inserted event is triggered once the toolbar is inserted into the document
				this.on("inserted", function() {
					this.Search.trigger(insertTriggered ? "reinserted" : "inserted");

					if (!insertTriggered) {
						insertTriggered = true;
					}
				});

				// init() needs to be called after the listener is attached to prevent a race condition when storage is already loaded.
				// It also needs to be here instead of attached directly to new Model() otherwise this.model might not be set yet.
				this.model.on("change", this.render, this).init();
			},


			render: function() {
				var toolbar = this.model.get("toolbar") === "full" || this.model.get("toolbar") === "full2" || this.model.get("toolbar") === true;
				this.model.set('isFull', toolbar, {silent:true});

				if (toolbar) {
					this.Menu.$el.detach();
				}

				// The app icons attributes get reset on render
				this.appsLoaded = false;

				this.Search.$el.detach();

				this.$el.html(render("toolbar", this.model.toJSON()));
				this.$el.toggleClass('floating', !toolbar);

				var hiddenSearch = this.model.get("toolbar") === "button_ns";
				this.$el.toggleClass('nosearch', hiddenSearch);

				this.$(".search").replaceWith(this.Search.el);

				this.Search.trigger("reinserted");

				if (toolbar) {
					this.$("nav.menu").replaceWith(this.Menu.el);
				}

				this.Menu.delegateEvents();

				return this;
			}
		});

	return View;
});