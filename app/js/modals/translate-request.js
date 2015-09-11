/**
 * This is the notification-like box shown at the bottom right, it's used for various announcements and notifications.
 */
define(["backbone", "browser/api", "modals/modals", "core/render"], function(Backbone, Browser, Modal, render) {
	if (Browser.storage.translateRequest == "true") {
		var View = Backbone.View.extend({
			tagName: "div",
			className: "notification",

			events: {
				"click .close": function(e) {
					this.$el.removeClass("visible");

					delete Browser.storage.translateRequest;
				}
			},
			
			initialize: function() {
				this.$el.html(render("translate-request")).appendTo(document.body).addClass("visible");
			}
		});

		return new View();
	}
	else {
		return false;
	}
});