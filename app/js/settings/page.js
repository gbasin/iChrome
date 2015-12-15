/**
 * The settings page base
 */
define(["lodash", "jquery", "backbone", "core/pro", "settings/model", "core/render"], function(_, $, Backbone, Pro, model, render) {
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

			// All pages share a single settings model
			this.model = model();

			Backbone.View.prototype.constructor.call(this, options);

			// change fires on text inputs when they're focused out, which is what we want,
			// and as changes happen on others, which is also what we want
			this.$el.on("change", "input, textarea, select", function(e) {
				this.onInputChange(e.currentTarget, e.name, e.value);
			}.bind(this)).on("keydown", "input", function(e) {
				if (e.keyCode && e.keyCode === 13) {
					this.onInputChange(e.currentTarget, e.name, e.value);
				}
			}.bind(this));
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


		/**
		 * Sets the values of all radio and checkbox inputs
		 *
		 * @param  {Object}  data  The rendered data
		 */
		setRadios: function(data) {
			var radios = this.radios,
				elms = this.el.querySelectorAll("input[type='radio'], input[type='checkbox']");

			if (this.radios && elms.length) {
				_.each(elms, function(e) {
					if (radios[e.name] && data[radios[e.name]] && data[radios[e.name]] === e.value) {
						e.checked = true;
					}
				});
			}
		},

		onBeforeRender: function(data) {
			return data;
		},

		render: function() {
			var data = this.model.toJSON();

			this.trigger("before:render", data);

			data = this.onBeforeRender(data);

			this.$el.html(this.template(data));

			this.setRadios(data);

			this.trigger("render", data);

			this.onRender(data);

			return this;
		},

		onRender: _.noop
	});

	return View;
});