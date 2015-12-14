/**
 * The settings page base
 */
define(["lodash", "jquery", "backbone", "core/pro", "core/render"], function(_, $, Backbone, Pro, render) {
	var View = Backbone.View.extend({
		constructor: function(options) {
			this.tagName = "div";

			this.attributes = _.assign(this.attributes || {}, {
				"data-id": this.id
			});

			this.className = "page " + this.id + (this.className ? " " + this.className : "");

			this.template = function(data, partials) {
				return render("settings/" + this.id, _.assign({
					isPro: Pro.isPro
				}, data), partials);
			};

			Backbone.View.prototype.constructor.call(this, options);
		},

		transitionIn: function(cb) {
			this.render();

			var header = this.$("header")[0],
				sections = this.$("section");


			// After every animation is done, call the cb.
			//
			// We add an extra call in case there aren't any elements to animate.
			var done = _.after((header ? 1 : 0) + sections.length + 1, cb || _.noop);

			done();


			if (header) {
				header.animate([{
					opacity: 0,
					transform: "translateY(-20%)"
				}, {
					opacity: 1,
					transform: "translateY(0)"
				}], {
					duration: 150,
					easing: "cubic-bezier(.4, 0, .2, 1)"
				}).onfinish = done;
			}


			if (sections.length) {
				_.each(sections, function(e, i) {
					var player = e.animate([{
						opacity: 0,
						transform: "translateY(30px)"
					}, {
						opacity: 1,
						transform: "translateY(0)"
					}], {
						duration: 150,
						easing: "cubic-bezier(.4, 0, .2, 1)"
					});

					if (i) {
						player.pause();

						setTimeout(function() {
							player.play();
						}, i * 50);
					}

					player.onfinish = done;
				});
			}
		},

		transitionOut: function(cb) {
			var header = this.$("header")[0],
				sections = this.$("section");


			// After every animation is done, call the cb.
			//
			// We add an extra call in case there aren't any elements to animate.
			var done = _.after((header ? 1 : 0) + sections.length + 1, cb || _.noop);

			done();


			if (header) {
				header.animate([{
					opacity: 1,
					transform: "translateY(0)"
				}, {
					opacity: 0,
					transform: "translateY(-20%)"
				}], {
					duration: 150,
					fill: "forwards",
					easing: "cubic-bezier(.4, 0, .2, 1)"
				}).onfinish = done;
			}


			if (sections.length) {
				_.each(sections, function(e, i) {
					var player = e.animate([{
						opacity: 1,
						transform: "translateY(0)"
					}, {
						opacity: 0,
						transform: "translateY(30px)"
					}], {
						duration: 150,
						fill: "forwards",
						easing: "cubic-bezier(.4, 0, .2, 1)"
					});

					if (sections.length - i > 1) {
						player.pause();

						setTimeout(function() {
							player.play();
						}, (sections.length - i - 1) * 50);
					}

					player.onfinish = done;
				});
			}
		},

		render: function() {
			this.$el.html(this.template());

			return this;
		}
	});

	return View;
});