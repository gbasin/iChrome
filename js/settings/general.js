/**
 * This is the General tab in the settings
 */
define(["jquery", "backbone", "storage/storage", "modals/getting-started", "core/templates"], function($, Backbone, Storage, Guide, render) {
	var Model = Backbone.Model.extend({
			init: function() {
				Storage.on("done updated", function(storage) {
					this.set(storage.settings);
				}, this);
			}
		}),
		View = Backbone.View.extend({
			tagName: "div",
			className: "tab general active",
			events: {
				// This toggles the custom links inputs
				"change .links .options label:first-child input": function(e) {
					var elm = $(e.currentTarget);

					if (elm.is(":checked")) elm.parents("div").first().addClass("visible");
					else elm.parents("div").first().removeClass("visible").find("input").val("");
				},
				"click .btns .guide": function(e) {
					e.preventDefault();

					if (!this.Guide) {
						this.Guide = new Guide();
					}
					else {
						this.Guide.show();
					}
				}
			},
			initialize: function() {
				this.model = new Model();

				this.model.on("change", this.render, this).init();
			},
			render: function() {
				this.$el.html(render("settings/general", this.model.toJSON()));

				return this;
			}
		});

	return View;
});