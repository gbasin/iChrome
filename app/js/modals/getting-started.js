/**
 * The Getting Started guide, this is only shown once on installation or when opened manually from the settings
 */
define(
	["jquery", "backbone", "modals/modals", "core/analytics", "core/render"],
	function($, Backbone, Modal, Track, render) {
		var installed = localStorage.installed == "true",
			modal = new (Modal.extend({
				classes: "getting-started",

				close: function() {}
			}))(),
			View = Backbone.View.extend({
				el: modal.el,

				events: {
					"click .nav div": "navClick"
				},


				/**
				 * Handles click events on the nav buttons
				 *
				 * @api    private
				 * @param  {Event} e
				 */
				navClick: function(e) {
					e.preventDefault();

					var active = this.$(".slide.active"),
						page;

					if ($(e.currentTarget).hasClass("prev")) {
						page = active.prev(".slide");
					}
					else {
						page = active.next(".slide");
					}

					if (page.length) {
						active.removeClass("active");

						page.addClass("active");
					}
					else if (active.attr("data-id") !== "1") {
						modal.hide();

						delete localStorage.installed;

						installed = false;

						this.$(".slide[data-id=1]").addClass("active").siblings(".slide").removeClass("active");
					}
				},

				show: function() {
					if (!this.rendered) {
						this.render();
					}

					modal.show();

					Track.pageview("/guide");
				},

				initialize: function() {
					modal.mo.appendTo(document.body);

					requestAnimationFrame(this.show.bind(this));
				},
				
				render: function() {
					this.$el.html(render("getting-started", {
						newtab: chrome.app.getDetails().id == "iccjgbbjckehppnpajnmplcccjcgbdep"
					}));

					this.rendered = true;
				}
			});

		if (installed) {
			new View();
		}

		return View;
	}
);