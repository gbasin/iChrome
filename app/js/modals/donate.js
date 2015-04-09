/**
 * The Donate dialog
 */
define(["backbone", "modals/modals", "core/analytics", "core/uid", "core/render"], function(Backbone, Modal, Track, uid, render) {
	var modal = new (Modal.extend({
		width: 950,
		height: 530,
		classes: "donate"
	}))();
	
	var View = Backbone.View.extend({
		el: modal.content,

		events: {
			"click .bitcoin": function() {
				prompt("Please send Bitcoins to:", "1LoVCTBLBGbgFxchXtt7MhNov1VD1yrMYu");

				Track.event("Donate", "Bitcoin", uid);
			},
			"click .litecoin": function() {
				prompt("Please send Litecoins to:", "LWUgLkXhbVromJzxkL82wPidBV8Fq9pC3p");

				Track.event("Donate", "Litecoin", uid);
			},
			"click .paypal": function() {
				var link = document.createElement("a");

				link.setAttribute("href", "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=L6P25ZLBKAGMG");
				link.setAttribute("target", "_blank");

				link.click();

				Track.event("Donate", "PayPal", uid);
			}
		},

		show: function() {
			modal.show();
		},

		initialize: function() {
			this.$el.html(render("donate"));

			modal.mo.appendTo(document.body);

			modal.show();
		}
	});

	return View;
});