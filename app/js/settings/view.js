/**
 * The settings view
 */
define([
	"lodash", "jquery", "backbone", "core/analytics", "i18n/i18n", "modals/snackbar", "settings/model", "core/render",

	"settings/pages/accounts", "settings/pages/advanced", "settings/pages/misc", "settings/pages/pro",
	"settings/pages/tabs", "settings/pages/toolbar", "settings/pages/visual", "settings/pages/widgets", "settings/pages/ads"
], function(_, $, Backbone, Track, Translate, Snackbar, model, render, Accounts, Advanced, Misc, Pro, Tabs, Toolbar, Visual, Widgets, Ads) {
	var pages = {
		accounts: Accounts,
		advanced: Advanced,
		misc: Misc,
		pro: Pro,
		tabs: Tabs,
		toolbar: Toolbar,
		visual: Visual,
		widgets: Widgets,
		ads: Ads
	};

	var View = Backbone.View.extend({
		tagName: "div",
		className: "app settings",
		attributes: {
			tabindex: -1
		},

		events: {
			"click .side-nav button.exit": "hide",

			"click .side-nav li[data-id] > .header": function(e) {
				this.navigate($(e.currentTarget).parent());
			},

			"click .side-nav li .sections li[data-id]": function(e) {
				var elm = $(e.currentTarget);

				var sectionId = elm.attr("data-id");

				this.navigate(elm.parents("li").first(), function() {
					this.$("main").animate({
						scrollTop: this.$("section[data-id=" + sectionId + "]")[0].offsetTop - (this.$("header").height() + 10)
					}, 300);
				}.bind(this));
			},

			"keydown": function(e) {
				if (e.keyCode === 27) {
					this.hide(e);
				}
			}
		},

		pages: {},

		navigate: function(itm, cb) {
			cb = typeof cb === "function" ? cb : _.noop;

			if (typeof itm === "string") {
				itm = this.$(".side-nav nav > ul > li[data-id='" + itm + "']");
			}

			var page = itm.attr("data-id");

			if (!pages[page]) {
				return false;
			}

			if (!this.pages[page]) {
				this.pages[page] = new pages[page]();
			}

			if (this._activePage && this._activePage === page) {
				return cb();
			}

			var currPage = this._activePage && this.pages[this._activePage];

			this._activePage = page;

			itm.addClass("active").siblings().removeClass("active");

			if (currPage) {
				currPage.transitionOut(function() {
					currPage.$el.detach();

					// We focus the main element so scrolling using the arrow keys works immediately
					this.$el.append(this.pages[page].el).find("main").focus();

					this.pages[page].transitionIn();

					cb();
				}.bind(this));
			}
			else {
				this.$el.append(this.pages[page].el).find("main").focus();

				this.pages[page].transitionIn();

				cb();
			}
		},

		show: function(page) {
			if (this._activePage) {
				this.pages[this._activePage].$el.detach();

				delete this._activePage;
			}

			this.$el.html(render("settings"));

			this.navigate(page || this.$(".side-nav nav > ul > li:first"));

			// The settings are a "page", not a modal. The document shouldn't scroll.
			//
			// This is done on the documentElement so it isn't erased when the tabs
			// are re-rendered (updating the CSS of the body element).
			$(document.documentElement).css("overflow", "hidden");

			this.$el.appendTo(document.body).addClass("visible")[0].animate([
				{ opacity: 0 },
				{ opacity: 1 }
			], {
				duration: 150,
				easing: "cubic-bezier(.4, 0, .2, 1)"
			});

			Track.FB.logEvent("VIEWED_CONTENT", null, { fb_content_type: "page", fb_content_id: "settings" });

			Track.pageview("Settings", "/settings");
		},

		hide: function() {
			this.el.animate([
				{ opacity: 1 },
				{ opacity: 0 }
			], {
				duration: 150,
				easing: "cubic-bezier(.4, 0, .2, 1)"
			}).onfinish = function() {
				this.$el.removeClass("visible");

				$(document.documentElement).css("overflow", "");
			}.bind(this);
		},


		/**
		 * Creates a new tab
		 */
		createTab: function() {
			this.pages.tabs.createTab();
		},

		initialize: function(options) {
			this.model = model();

			this.listenTo(this.model, "save", function() {
				new Snackbar(Translate("settings.saved"));
			});

			this.show(options && options.page);
		}
	});

	var Settings = null;

	return function(page) {
		if (Settings) {
			Settings.show(page);

			return Settings;
		}
		else {
			return (Settings = new View({ page: page }));
		}
	};
});