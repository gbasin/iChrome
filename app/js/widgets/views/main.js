define(["lodash", "backbone", "core/pro", "core/analytics"], function(_, Backbone, Pro, Track) {
	return Backbone.View.extend({
		/**
		 * Returns a Hogan template that should be used to render this view.
		 *
		 * This is in a function so it can be easily overridden by variations of
		 * the main view and widgets
		 */
		getTemplate: function() {
			return this.widget.templates["default"];
		},

		constructor: function(options) {
			this.widget = options.widget;

			var manifest = this.widget.manifest;

			// Set core properties
			this.id = manifest.id;
			this.name = manifest.name;
			this.model = options.model;
			this.template = this.getTemplate();
			this.cid = _.uniqueId("widgetView");
			this.isPreview = options.instance.isPreview;

			Object.defineProperty(this, "isPro", {
				get: function() {
					return Pro.isPro;
				}
			});


			// Binding the translate method once, now, avoids unnecessary calls later
			this.translate = _.bind(this.widget.translate, this.widget);


			// Create the content element
			this.el = document.createElement("div");

			this.el.setAttribute("class", "content");

			this.setElement(this.el);

			this.initialize();
		},


		initialize: function() {
			this.listenTo(this.model, "change", _.ary(this.render, 0));

			this.render();
		},


		/**
		 * Passes errors to the parent instance via an event
		 */
		error: function(explanation, advice) {
			this.trigger("error", explanation, advice);
		},


		/**
		 * Destroys this view
		 *
		 * @api     public
		 */
		destroy: function() {
			if (this.onBeforeDestroy) {
				// onBeforeDestroy can cancel destruction
				if (!this.onBeforeDestroy()) {
					return;
				}
			}

			this.trigger("before:destroy");

			this.remove();

			this.stopListening();

			if (this.onDestroy) {
				this.onDestroy();
			}

			this.trigger("destroy");
		},


		/**
		 * Renders the main template
		 *
		 * @param  {Object}  [data={}]  An object of data to pass to Hogan
		 * @param  {Object}  [partials] Any partials that the template should be rendered with
		 */
		render: function(data, partials) {
			// We only do a shallow clone, if widgets need a deep clone they
			// still have to do it themselves
			data = _.extend({
				isPro: Pro.isPro,
				i18n: this.widget.strings
			}, data || this.model.data);

			data[this.model.get("size")] = true;

			try {
				// We use a system similar to Marionette's, except that onBeforeRender
				// can return a new data object
				if (this.onBeforeRender) {
					var ret = this.onBeforeRender(data, this.isPreview);

					if (typeof ret === "object") {
						data = ret;
					}
				}

				this.trigger("before:render", data, this.isPreview);
			}
			catch (e) {
				Track.queue("widgets", "error", this.nicename, this.size, "beforeRender", e.stack);

				return this.error();
			}

			// We need to use $.html even though it's slower than innerHTML
			// because it cleans up jQuery events and data
			this.$el.html(this.template.render(data, partials));

			try {
				if (this.onRender) {
					this.onRender(data, this.isPreview);
				}

				this.trigger("render", data, this.isPreview);
			}
			catch (e) {
				Track.queue("widgets", "error", this.nicename, this.size, "render", e.stack);

				this.error();
			}

			return this;
		}
	});
});