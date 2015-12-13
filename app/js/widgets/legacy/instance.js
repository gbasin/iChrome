/**
 * The legacy widget instance wrapper
 */
define([
	"jquery", "lodash", "backbone", "browser/api", "core/status", "core/analytics", "widgets/instance", "widgets/settings", "core/render"
], function($, _, Backbone, Browser, Status, Track, WidgetInstance, Settings, render) {
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
	};

	var LegacyInstance = WidgetInstance.extend({
		className: function() {
			return "widget legacy " + this.widget.name + " " + this.model.get("size") + (this.widget.isAvailable === false ? " hide" : "");
		},

		/**
		 * This needs to be overridden since attributes and className need to use this.widget
		 *
		 * @api    public
		 * @param  {Object} options The options for the view, these must include a model
		 */
		constructor: function(options) {
			this.widget = options.widget;

			var widget = this.widget.widget;

			// Set core properties
			this.id = widget.id;
			this.model = options.model;
			this.cid = _.uniqueId("widget");
			this.isPreview = options.isPreview;
			this.hasSettings = Array.isArray(this.widget.settings);

			this.model.set("size", sizes[options.size || this.model.get("size") || (widget.config && widget.config.size) || widget.sizes[0]]);


			// Create the element. Native methods are significantly faster than
			// Backbone's jQuery-backed system, and performance is essential
			// in a constructor that's used so often.
			this.el = document.createElement("section");

			this.el.setAttribute("data-id", this.cid);
			this.el.setAttribute("data-name", this.widget.name);
			this.el.setAttribute("data-size", this.model.get("size"));
			this.el.setAttribute("class", this.className());

			this.setElement(this.el);

			this.$el.data("view", this);


			// If the widget isn't available we create the element anyway so it's
			// preserved during serialization, but don't initialize it or call
			// any widget code
			if (!this.widget.isAvailable) return;

			this.updateLoc();


			/**
			 * Triggers a save event, this is also saveData for backwards compatibility
			 *
			 * @api    public
			 */
			this.save = this.saveConfig = this.saveData = this.updateModel;

			this.translate = _.bind(this.widget.translate, this.widget);


			this.widget.initialize(function() {
				this.requestPermissions(this.initialize);
			}, this);
		},


		/**
		 * Initializes the instance.  This _will_ be called again if the widget
		 * has errored and is being refreshed.
		 *
		 * @api     private
		 */
		initialize: function() {
			var instance = this.instance = _.assign(_.cloneDeep(this.widget.widget), this.model.attributes);

			instance.utils = this;

			instance.elm = this.$el;

			instance.config = $.extend(true, _.cloneDeep(this.widget.widget.config || {}), this.model.get("config"));

			instance.size = instance.config.size = this.model.get("size");

			instance.internalID = this.cid;


			if (!this.preview) {
				Track.queue("widgets", "view", this.widget.name, this.model.get("size"));
			}


			this.model.on("change", this.handleChange, this);


			try {
				this.instance.render(this.isPreview);
			}
			catch (e) {
				this.error();

				Track.queue("widgets", "error", this.widget.name, this.model.get("size"), "render", e.stack);

				Status.error("An error occurred while trying to render the " + this.widget.name + " widget!");
			}

			if (this.instance.refresh && !this.isPreview) this.instance.refresh();


			if (this.instance.interval) {
				this._refreshInterval = setInterval(function() {
					if (this.instance.refresh && !this.isPreview) {
						this.instance.refresh();
					}
					else {
						this.instance.render(this.isPreview);
					}
				}.bind(this), this.instance.interval);
			}
		},


		/**
		 * Cleans up event listeners, widget instances, etc.
		 */
		cleanup: function() {
			if (this.instance) {
				delete this.instance;
			}

			this.model.off("change");

			clearInterval(this._refreshInterval);
		},


		/**
		 * Handles changes in this instance's model
		 *
		 * @api     private
		 * @param   {Object}  options  Any options passed from Backbone, these can include a
		 *                             widgetChange boolean that indicates if this change
		 *                             came from the widget
		 */
		handleChange: function(model, options) {
			if (this.model.hasChanged("loc")) {
				this.updateLoc(true);
			}

			if (this.model.hasChanged("size")) {
				this.el.setAttribute("data-size", this.model.get("size"));
				this.el.setAttribute("class", this.className());
			}


			if (!options || !options.widgetChange) {
				if (this.model.hasChanged("config")) {
					this.instance.config = $.extend(true, _.cloneDeep(this.widget.widget.config), this.model.get("config"));

					this.instance.size = this.instance.config.size = this.model.get("size");
				}

				if (this.model.hasChanged("data")) {
					this.instance.data = this.model.get("data");
				}

				if (this.model.hasChanged("syncData")) {
					this.instance.syncData = this.model.get("syncData");
				}

				if (this.model.hasChanged("size")) {
					this.instance.size = this.instance.config.size = this.model.get("size");
				}


				// This needs to be called first so renders happen faster after things change and in
				// the case that we're offline the widget still renders before attempting to refresh.
				try {
					this.instance.render(this.isPreview);
				}
				catch (e) {
					this.error();

					Track.queue("widgets", "error", this.widget.name, this.model.get("size"), "render", e.stack);

					Status.error("An error occurred while trying to render the " + this.widget.name + " widget!");
				}

				if (this.instance.refresh && !this.isPreview) this.instance.refresh();
			}


			var changedKeys = Object.keys(this.model.changed);

			// The tabs collection listens for widget save events and triggers
			// a sync. We only want to do that when something other than the
			// widget state changes (otherwise maximizing would trigger a save)
			if (changedKeys.length !== 1 || changedKeys.indexOf("state") === -1) {
				this.model.trigger("save");
			}
		},


		/**
		 * Handles changes in the widget, persisting them to this instance's model
		 *
		 * @api     private
		 */
		updateModel: function() {
			// All known properties (no custom ones are saved) except state, which
			// the widget isn't alllowed to change, are copied
			var set = _(this.instance).pick("size", "config", "data", "syncData", "loc").mapValues(function(e, key) {
				if (key === "config") {
					var config = $.unextend(this.widget.widget.config, e);

					delete config.size;

					return config;
				}
				else {
					return e;
				}
			}, this).value();

			this.model.set(set, {
				// This lets the handleChange function know that it shouldn't
				// update the widget, to avoid endless recursive calls
				widgetChange: true
			});
		},


		/**
		 * This handles errors that occur in widgets
		 *
		 * @api    public
		 * @param  {String} msg The error that occurred
		 */
		error: function(msg) {
			Track.queue("widgets", "error", this.widget.name, this.model.get("size"), "utils", msg);

			Status.error("An error occurred in the " + this.widget.name + " widget: " + msg);
		},


		/**
		 * Retrieves a widget's template
		 *
		 * @api    public
		 * @param  {String}  [name]  The template to get
		 * @return {Hogan.Template}  The retrieved template
		 */
		getTemplate: function(name) {
			return render.getTemplate("widgets." + this.widget.name + (name ? "." + name : ""));
		},


		/**
		 * Renders a widget's template
		 *
		 * @api    public
		 * @param  {String} name        The template to render
		 * @param  {Object} [data={}]   The data to render with
		 * @param  {Object} [partials]  Any partials to be included
		 * @return {String}             The rendered template
		 */
		renderTemplate: function(name, data, partials) {
			data = _.clone(data) || {};

			data.i18n = this.widget.strings || {};

			return render(("widgets." + this.widget.name + (name ? "." + name : "")) || "", data, partials);
		},


		/**
		 * Refreshes the rendered element, called by the sortable controller
		 *
		 * @api     public
		 */
		refresh: function() {
			if (this._requestingPermissions) return;

			try {
				this.instance.render(this.isPreview);
			}
			catch (e) {
				this.error();

				Track.queue("widgets", "error", this.widget.name, this.model.get("size"), "render", e.stack);

				Status.error("An error occurred while trying to render the " + this.widget.name + " widget!");
			}
		},


		render: function(data, partials) {
			// Set by the onDrop handler
			if (this.onGrid === false && this.model.has("loc")) {
				this.model.unset("loc");
			}

			if (this._requestingPermissions) {
				return;
			}

			data = _.clone(data) || {};

			data[this.model.get("size")] = true;

			data.i18n = this.widget.strings || {};

			this.el.innerHTML =
				'<div class="handle"></div>' +
				(this.hasSettings ? '\r\n<div class="settings">&#xF0AD;</div>' : "") +
				render("widgets." + this.widget.name, data, partials) +
				'\r\n<div class="resize"></div>'
			;
		}
	});

	return LegacyInstance;
});