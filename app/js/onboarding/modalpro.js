/**
 * The onboarding modal
 */
define([
	"backbone", "browser/api", "core/analytics", "storage/storage", "modals/modals", "core/auth", "storage/syncapi", "core/render", "settings/proxy"
], function(Backbone, Browser, Track, Storage, Modal, Auth, SyncAPI, render, SettingsProxy) {
	var View = Backbone.View.extend({
		events: {
			"click .nav button": "navigate",

			"click a.upgrade": "upgrade"
		},

		/**
		 * Handles click events on the nav buttons
		 *
		 * @api    private
		 * @param  {Event}  e  A click event
		 */
		navigate: function() {
			this.modal.hide();
			this.trigger("complete", this._userType || "unknown");
		},

		upgrade: function() {
			this.modal.hide();
			this.trigger("complete", this._userType || "unknown");
			SettingsProxy("pro");
			return false;
		},

		constructor: function() {
			this.modal = new (Modal.extend({
				classes: "onboarding",

				destroyOnHide: true,

				close: function() {}
			}))();

			this.el = this.modal.el;

			Backbone.View.call(this);
		},

		initialize: function() {
			this.modal.mo.appendTo(document.body);

			this.render();

			this.modal.show();

			// Pages are tracked in addition to events so a funnel can be set up
			Track.pageview("Onboarding Modal Pro: Slide 1", "/onboarding/modal/slide1");
		},

		render: function() {
			this.$el.attr("data-slide", 1);

			this.$el.html(render("onboarding/modalpro", {
				newTab: Browser.app.newTab
			}));
		}
	});

	return View;
});