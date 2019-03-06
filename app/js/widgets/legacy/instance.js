/**
 * The legacy widget instance wrapper
 */
define([
	"jquery", "lodash", "backbone", "browser/api", "core/status", "core/analytics", "widgets/instance", "widgets/settings", "lib/unextend", "core/render"
], function($, _, Backbone, Browser, Status, Track, WidgetInstance, Settings, unextend, render) {
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
			if (!this.widget.isAvailable) {
				return;
			}

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
				Track.FB.logEvent("VIEWED_CONTENT", null, { fb_content_type: "widget", fb_content_id: this.widget.name, widgetSize: this.model.get("size") });

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

			if (this.instance.refresh && !this.isPreview) {
				this.instance.refresh();
			}


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

				if (this.instance.refresh && !this.isPreview) {
					this.instance.refresh();
				}
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
					var config = unextend(this.widget.widget.config, e);

					delete config.size;

					return config;
				}
				else {
					// We remove the value so all change events get triggered properly.
					//
					// Otherwise, legacy widgets access a referenced object and no change will be properly detected.
					this.model.unset(key, {
						silent: true
					});

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
			if (this._requestingPermissions) {
				return;
			}

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
				(this.hasSettings ?
					'\r\n<div class="settings">' +
						'<svg width="16" height="16" viewBox="0 0 1792 1792" fill="currentColor">' +
							'<path d="M448 1472q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm644-420l-682 682q-37 37-90 37-52 0-91-37l-106-108q-38-36-38-90 0-53 38-91l681-681q39 98 114.5 173.5t173.5 114.5zm634-435q0 39-23 106-47 134-164.5 217.5t-258.5 83.5q-185 0-316.5-131.5t-131.5-316.5 131.5-316.5 316.5-131.5q58 0 121.5 16.5t107.5 46.5q16 11 16 28t-16 28l-293 169v224l193 107q5-3 79-48.5t135.5-81 70.5-35.5q15 0 23.5 10t8.5 25z"></path>' +
						'</svg>' +
					'</div>'
					: ""
				) +
				render("widgets." + this.widget.name, data, partials) +
				'\r\n<div class="resize"></div>' +
				'\r\n<div class="delete">' + 
						'<svg width="24" height="24" fill="currentColor" transform="scale(0.75 0.8)"><path style=" " d="M9,0 C8.164063453674316,0 7.34375,0.1640630066394806 6.75,0.75 C6.15625,1.3359379768371582 5.96875,2.167968988418579 5.96875,3.03125 L2,3.03125 C1.449218988418579,3.03125 1,3.480468988418579 1,4.03125 L0,4.03125 L0,6.03125 L22,6.03125 L22,4.03125 L21,4.03125 C21,3.480468988418579 20.55078125,3.03125 20,3.03125 L16.03125,3.03125 C16.03125,2.167968988418579 15.84375,1.3359379768371582 15.25,0.75 C14.65625,0.1640630066394806 13.835938453674316,0 13,0 zM9,2.0625 L13,2.0625 C13.546875,2.0625 13.71875,2.191406011581421 13.78125,2.25 C13.84375,2.308593988418579 13.96875,2.472656011581421 13.96875,3.03125 L8.03125,3.03125 C8.03125,2.472656011581421 8.15625,2.308593988418579 8.21875,2.25 C8.28125,2.191406011581421 8.453125,2.0625 9,2.0625 zM2,7.03125 L2,23.03125 C2,24.68359375 3.347655773162842,26.03125 5,26.03125 L17,26.03125 C18.65234375,26.03125 20,24.68359375 20,23.03125 L20,7.03125 zM6,10.03125 L8,10.03125 L8,22.03125 L6,22.03125 zM10,10.03125 L12,10.03125 L12,22.03125 L10,22.03125 zM14,10.03125 L16,10.03125 L16,22.03125 L14,22.03125 z"/></svg>' +
				'</div>'
			;
		}
	});

	return LegacyInstance;
});