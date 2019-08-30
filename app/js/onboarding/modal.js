/**
 * The onboarding modal
 */
define([
	"backbone", "browser/api", "core/analytics", "storage/storage", "modals/modals", "core/auth", "storage/syncapi", "core/render"
], function(Backbone, Browser, Track, Storage, Modal, Auth, SyncAPI, render) {
	var View = Backbone.View.extend({
		events: {
			"click .nav button": "navigate",

			"click .sign-in button.sign-in": function() {
				Storage.once("done", function(storage) {
					SyncAPI.authorize(storage, false, function(err, isNewUser) {
						if (err) {
							return;
						}

						this.$(".slide.sign-in .complete." + (isNewUser ? "new" : "existing")).addClass("visible").siblings().removeClass("visible");

						this._userType = (isNewUser ? "new" : "existing") + (Auth.isPro ? "_pro" : "");
					}.bind(this));
				}, this);
			}
		},


		/**
		 * Handles click events on the nav buttons
		 *
		 * @api    private
		 * @param  {Event}  e  A click event
		 */
		navigate: function(e) {
			if (!this._interactionTracked) {
				// It's important to know how many users don't even click to see the next slide
				Track.event("Onboarding", "Modal", "Interaction");

				this._interactionTracked = true;
			}

			var active = this.$(".slide.active"),
				page;

			if (e.currentTarget.getAttribute("data-direction") === "prev") {
				page = active.prev(".slide");
			}
			else {
				page = active.next(".slide");
			}

			if (page.length) {
				active.removeClass("active");

				page.addClass("active");

				this.$(".nav button.next").toggleClass("finish", !page.next(".slide").length);
			}
			else if (active.attr("data-id") !== "1") {
				active.removeClass("active");

				page.addClass("active");

				this.modal.hide();

				this.trigger("close", this._userType || "unknown");
			}

			var slideID = page.attr("data-id");

			this.$el.attr("data-slide", slideID);

			Track.pageview("Onboarding Modal: Slide " + slideID, "/onboarding/modal/slide" + slideID);
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
			Track.pageview("Onboarding Modal: Slide 1", "/onboarding/modal/slide1");
		},

		render: function() {
			this.$el.attr("data-slide", 1);

			this.$el.html(render("onboarding/modal", {
				newTab: Browser.app.newTab
			}));
		}
	});

	return View;
});