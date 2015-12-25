/**
 * The onboarding modal
 */
define(["backbone", "browser/api", "core/analytics", "modals/modals", "core/render"], function(Backbone, Browser, Track, Modal, render) {
	var View = Backbone.View.extend({
		events: {
			"click .nav button": "navClick"
		},


		/**
		 * Handles click events on the nav buttons
		 *
		 * @api    private
		 * @param  {Event} e
		 */
		navClick: function(e) {
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

				this.$(".nav button.next").toggleClass("finish", !page.next().length);
			}
			else if (active.attr("data-id") !== "1") {
				this.modal.hide();

				this.trigger("close");
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