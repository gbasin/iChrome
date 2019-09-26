/**
 * The onboarding modal
 */
define([
	"backbone", "browser/api", "core/analytics", "storage/storage", "modals/modals", "core/auth", "storage/syncapi", "core/render", "settings/checkout", "core/uservoice", "modals/alert", "i18n/i18n"
], function(Backbone, Browser, Track, Storage, Modal, Auth, SyncAPI, render, Checkout, UserVoice, Alert, Translate) {
	var View = Backbone.View.extend({
		events: {
			"click button.upgrade": function() {
				Track.FB.logEvent("INITIATED_CHECKOUT", null, { fb_content_type: "pro" });

				Alert({
					confirm: true,
					title: Translate("settings.pro.checkout.signin"),
					contents: [Translate("settings.pro.checkout.signin_desc")],
					buttons: {
						positive: Translate("settings.pro.checkout.signin_btn")
					}
				}, function() {
					Storage.on("done", function(storage) {
						SyncAPI.authorize(storage, false, function() {
							if (Auth.isPro) {
								this.trigger("complete");
								location.reload();
							}
							else {
								new Checkout("pro");
								this.trigger("dismiss");
							}
						}.bind(this));
					}.bind(this));

					return;
				}.bind(this));
			},

			"click header .business a": function(e) {
				e.preventDefault();

				UserVoice("show", { mode: "contact" });
			},

			"click .nav button": "navigate",
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

			this.modal.hide();

			this.trigger("complete");
		},

		constructor: function() {
			this.modal = new (Modal.extend({
				classes: "onboarding upgrade",

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

			this.$el.html(render("onboarding/upgrade", {
				newTab: Browser.app.newTab
			}));
		}
	});

	return View;
});