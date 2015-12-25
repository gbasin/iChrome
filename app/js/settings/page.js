/**
 * The settings page base
 */
define(["lodash", "jquery", "backbone", "core/auth", "settings/model", "core/render"], function(_, $, Backbone, Auth, model, render) {
	var View = Backbone.View.extend({
		constructor: function(options) {
			this.tagName = "div";

			this.attributes = _.assign(this.attributes || {}, {
				"data-id": this.id
			});

			this.className = "page " + this.id + (this.className ? " " + this.className : "");

			this.template = function(data, partials) {
				return render("settings/" + this.id, _.assign({
					isPro: Auth.isPro
				}, data), partials);
			};

			// All pages share a single settings model
			this.model = model();

			this.model.on(this.monitorProps ? "change:" + this.monitorProps.join(" change:") : "change", _.throttle(function() {
				var options = _.last(arguments);

				if (options && options.noRender) {
					return;
				}

				// Get a selector for the currently focused element so we can restore focus
				var el = this.$(":focus")[0];

				var focusedElm = [];

				while (el && el.parentElement && el !== this.el) {
					focusedElm.unshift(el.tagName + ":nth-child(" + (Array.prototype.indexOf.call(el.parentElement.children, el) + 1) + ")");

					el = el.parentElement;
				}

				focusedElm = focusedElm.join(" > ");


				var scrollTop = this.$("main").scrollTop();


				this.render();


				this.$("main").scrollTop(scrollTop);

				if (focusedElm) {
					this.$("> " + focusedElm).focus();
				}
			}, 100), this);

			Backbone.View.prototype.constructor.call(this, options);


			// The change event fires on text inputs when they're focused out, which is what we want,
			// and as changes happen on others, which is also what we want
			var inputChange = function(e) {
				var value;

				if (e.currentTarget.type === "checkbox") {
					value = e.currentTarget.checked;
				}
				else {
					value = e.currentTarget.value;
				}

				this.onInputChange(e.currentTarget, e.currentTarget.name, value);
			}.bind(this);

			this.$el.on("change", "input, textarea, select", inputChange);
		},


		/**
		 * General input change handler
		 *
		 * @param   {HTMLElement}  elm    The input element
		 * @param   {String}       name   The name of the input
		 * @param   {String}       value  The value of the input
		 */
		onInputChange: function(elm, name, value) {
			this.model.set(name, value, {
				noRender: true
			});
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
		setDynamicControls: function(data) {
			var controls = this.dynamicControls,
				elms = this.el.querySelectorAll("input[type='radio'], input[type='checkbox'], select");

			if (!controls || !elms.length) {
				return;
			}

			_.each(elms, function(e) {
				if (!controls[e.name] || typeof data[controls[e.name]] === "undefined") {
					return;
				}

				if (e.type === "checkbox") {
					e.checked = !!data[controls[e.name]];
				}
				else if (e.type === "radio") {
					if (data[controls[e.name]] === e.value) {
						e.checked = true;
					}
				}
				else if (e.tagName.toLowerCase() === "select") {
					e.value = data[controls[e.name]];
				}
			});
		},

		onBeforeRender: function(data) {
			return data;
		},

		render: function() {
			var data = this.model.toJSON();

			this.trigger("before:render", data);

			data = this.onBeforeRender(data);

			this.$el.html(this.template(data));

			this.setDynamicControls(data);

			this.trigger("render", data);

			this.onRender(data);

			return this;
		},

		onRender: _.noop
	});

	return View;
});