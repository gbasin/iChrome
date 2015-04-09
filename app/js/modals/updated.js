/**
 * This is the Updated dialog, it's only shown after a large update is released
 */
define(["backbone", "modals/modals", "core/render"], function(Backbone, Modal, render) {
	if (localStorage.updated == "true") {
		var modal = new (Modal.extend({
				height: 640,
				classes: "updated",
				close: function() {
					delete localStorage.updated;

					this.hide();
				}
			}))(),
			View = Backbone.View.extend({
				el: modal.content,
				events: {
					"click .btn.ok": function(e) {
						e.preventDefault();

						modal.close();
					}
				},
				initialize: function() {
					this.$el.html(render("updated"));

					modal.mo.appendTo(document.body);

					modal.show();
				}
			});

		return new View();
	}
	else {
		return false;
	}
});