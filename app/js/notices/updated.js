/**
 * Displays a modal after updates
 */
define([
	"browser/api", "backbone", "core/auth", "modals/modals", "modals/alert", "i18n/i18n", "storage/storage", "storage/syncapi", "core/render"
], function(Browser, Backbone, Auth, Modal, Alert, Translate, Storage, SyncAPI, render) {
	var View = Backbone.View.extend({
		className: "updated",

		events: {
			"click .nav button": "navigate",

			"click .sign-in button.sign-in": function() {
				Alert({
					title: Translate("storage.signin_confirm.title"),
					contents: [Translate("storage.signin_confirm.desc")],
					buttons: {
						negative: Translate("storage.signin_confirm.keep_account"),
						positive: Translate("storage.signin_confirm.keep_local")
					}
				}, function(sendData) {
					Storage.once("done", function(storage) {
						SyncAPI.authorize(storage, sendData, function() {
							this.$(".slide.sign-in .complete").addClass("visible").siblings().removeClass("visible");

							// If the user is Pro, we need to reload so the app initializes properly
							if (Auth.isPro) {
								location.reload();
							}
						}.bind(this));
					}, this);
				}.bind(this));
			}
		},


		/**
		 * Handles click events on the nav buttons
		 *
		 * @api    private
		 * @param  {Event}  e  A click event
		 */
		navigate: function(e) {
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
				this.modal.hide();

				delete Browser.storage.showUpdated;
			}

			var slideID = page.attr("data-id");

			this.$el.attr("data-slide", slideID);
		},

		constructor: function() {
			this.modal = new (Modal.extend({
				classes: "updated",

				destroyOnHide: true,

				close: function() {}
			}))();

			this.el = this.modal.el;

			Backbone.View.call(this);
		},

		initialize: function() {
			this.modal.mo.appendTo(document.body);

			this.$el.attr("data-slide", 1).html(render("updated"));

			this.modal.show();
		}
	});

	return new View();
});