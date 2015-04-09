/**
 * The main tooltip handler.  This displays tooltips for any element with a data-tooltip attribute
 */
define(["jquery", "backbone", "core/analytics", "core/render"], function($, Backbone, Track, render) {
	var View = Backbone.View.extend({
		tagName: "div",
		className: "tooltip",

		events: {
			"mouseenter": function() {
				clearTimeout(this.timeout);

				this.$el.addClass("visible");
			},
			"mouseleave": function() {
				clearTimeout(this.timeout);

				this.$el.removeClass("visible");

				this.timeout = setTimeout(function() {
					this.$el.css({
						top: "",
						left: "",
						maxHeight: ""
					});
				}.bind(this), 300);
			}
		},

		timeout: null,


		/**
		 * Handles the mouse enter event, showing the tooltip
		 *
		 * @api    private
		 * @param  {Event}  e The event
		 */
		mouseEnter: function(e) {
			var elm = $(e.currentTarget),
				offset = elm.offset();

			clearTimeout(this.timeout);

			this.timeout = setTimeout(function() {
				var content = elm.attr("data-tooltip");

				if (!content) {
					return;
				}

				var top = offset.top + elm.outerHeight() + 10,
					maxHeight = false;

				// The RegExp removes extra newlines at the end of tooltips, RegExp should
				// generally not be used with HTML but this is a visual improvement, not functional
				this.$el.html(content.replace(/(<br(?:\s|\n|\r)*(?:\/)?>(?:\s|\n|\r)*)+$/, ""));

				var tHeight = this.$el.outerHeight();

				if ((top + tHeight) > (document.body.scrollTop + window.innerHeight)) {
					top = offset.top - tHeight - 5;

					if (top < 0) {
						maxHeight = tHeight + top;

						top = 0;
					}
				}

				this.$el.css({
					top: Math.round(top),
					maxHeight: maxHeight || "",
					left: Math.round(offset.left)
				}).addClass("visible");

				Track.event("Tooltip", "Show");
			}.bind(this), 500);
		},


		/**
		 * Handles the mouse leave event, hiding the tooltip
		 *
		 * @api    private
		 * @param  {Event}  e The event
		 */
		mouseLeave: function(e) {
			clearTimeout(this.timeout);

			this.$el.removeClass("visible");

			this.timeout = setTimeout(function() {
				this.$el.css({
					top: "",
					left: "",
					maxHeight: ""
				});
			}.bind(this), 300);
		},

		initialize: function() {
			this.body = $(document.body);

			this.body
				.on("mouseenter", "[data-tooltip]", this.mouseEnter.bind(this))
				.on("mouseleave", "[data-tooltip]", this.mouseLeave.bind(this));

			this.body.append(this.$el);
		},

		render: function() {
			this.$el.html(render("css", this.model.toJSON()));

			return this;
		}
	});

	return View;
});