/**
 * The widget view.  This does the coupling of Backbone => non-Backbone code.
 */
define(["jquery", "lodash", "backbone", "core/status", "widgets/widgets", "widgets/settings", "widgets/utils"], function($, _, Backbone, Status, Widgets, Settings, Utils) {
	var sizes = {
			1: "tiny",
			2: "small",
			3: "medium",
			4: "large",
			5: "variable",
			tiny: "tiny",
			small: "small",
			medium: "medium",
			large: "large",
			variable: "variable"
		},
		GRID_SIZE = 10;



	var view = Backbone.View.extend({
		tagName: "section",
		className: function() {
			return "widget " + this.widget.nicename + " " + this.widget.config.size;
		},

		attributes: function() {
			return {
				"data-id": this.widget.internalID,
				"data-name": this.widget.nicename,
				"data-size": this.widget.config.size
			};
		},


		events: {
			"click .settings": function(e) {
				if (!this.settings) {
					this.settings = new Settings({
						widget: this.widget
					});
				}

				this.settings.show();
			}
		},


		/**
		 * Updates the widget data from the model and rerenders it.
		 * Called on init and model change.
		 *
		 * @api    public
		 * @param  {Backbone.DocumentModel} [model]   The model
		 * @param  {Object}                 [options] The options passed to the set event that triggered the change
		 */
		update: function(model, options) {
			if (options && options.viewChange) return;


			if (this.model.has("config")) {
				this.widget.config = {};

				$.extend(true, this.widget.config, Widgets[this.widget.id].config, this.model.get("config"));

				this.widget.size = this.model.get("size") || Widgets[this.widget.id].size;

				this.widget.config.size = sizes[this.widget.size];
			}

			if (this.model.has("data")) {
				this.widget.data = this.model.get("data");
			}

			if (this.model.has("syncData")) {
				this.widget.syncData = this.model.get("syncData");
			}


			if (this.model.has("loc")) {
				var loc = this.model.get("loc");

				this.$el.css({
					top: loc[0] * GRID_SIZE,
					left: loc[1] * GRID_SIZE,
					width: loc[2] * GRID_SIZE - 1,
					height: loc[3] * GRID_SIZE - 1
				});
			}

			// This needs to be called first so renders happen faster after things change and in
			// the case that we're offline the widget still renders before attempting to refresh.
			this.render();

			if (this.widget.refresh) this.widget.refresh.call(this.widget, true);
		},


		/**
		 * Updates the model data from the widget.
		 * Called as changes occur, not when serializing
		 *
		 * @api    public
		 */
		updateModel: function() {
			var set = {};


			_(this.widget).pick(["id", "size", "config", "data", "syncData", "loc"]).each(function(e, key) {
				if (key == "config") {
					var config = $.unextend(Widgets[this.widget.id].config, e);

					delete config.size;

					set.config = config;
				}
				else {
					set[key] = e;
				}
			}, this);

			this.model.set(set, {
				// This lets the update function that will be called know that it
				// shouldn't refresh the widget since it was an internal change
				viewChange: true
			});
		},


		/**
		 * This needs to be overridden since attributes and className need to use this.widget
		 *
		 * @api    public
		 * @param  {Object} options The options for the view, these must include a model
		 */
		constructor: function(options) {
			var model = options.model;

			var d = model.attributes,
				widget = this.widget = {};

			$.extend(true, widget, Widgets[d.id], d);

			// These should not be deep-extended
			if (d.data) widget.data = d.data;
			if (d.syncData) widget.syncData = d.syncData;


			widget.config.size = sizes[widget.size];

			// Used to lookup a widget from it's element among other things
			widget.internalID = _.uniqueId("widget");

			Backbone.View.apply(this, arguments);
		},


		initialize: function() {
			// These need to be created here instead of in the constructor since ensureElement gets called in between
			this.widget.utils = new Utils(this.widget);

			this.widget.utils.elm = this.widget.elm = this.$el;

			this.widget.utils.on("save", function() {
				this.updateModel();

				this.model.trigger("save");
			}, this);

			this.$el.data("view", this);


			this.model.on("change", this.update, this);

			this.update();


			if (this.widget.interval) {
				clearInterval(this.interval);

				this.interval = setInterval((this.widget.refresh || this.widget.render).bind(this.widget), this.widget.interval);
			}
		},


		render: function() {
			try {
				this.widget.render.call(this.widget);
			}
			catch (e) {
				Status.error("An error occurred while trying to render the " + this.widget.nicename + " widget!");
			}

			return this;
		}
	});


	return view;
});