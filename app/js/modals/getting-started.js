/**
 * The Getting Started guide, this is only shown once on installation or when opened manually from the settings
 */
define(
	["jquery", "backbone", "browser/api", "modals/modals", "core/analytics", "core/render"],
	function($, Backbone, Browser, Modal, Track, render) {
		var installed = Browser.storage.installed === "true",
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

						delete Browser.storage.installed;

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
						newtab: Browser.app.newTab
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