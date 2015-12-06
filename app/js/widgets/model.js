/**
 * The widget model
 */
define(["lodash", "backbone", "core/pro", "core/analytics", "widgets/oauth"], function(_, Backbone, Pro, Track, WidgetOAuth) {
	var WidgetModel = Backbone.Model.extend({
		idAttribute: "cid",

		Pro: Pro,

		constructor: function(attrs, options) {
			// We can't call the default constructor since we need to run
			// _.defaults() on the config and data properties. So, the contents
			// of the constructor are included here
			attrs = attrs || {};
			options = options || {};

			// Set core properties
			this.attributes = {};
			this.widget = options.widget;
			this.id = this.widget.manifest.id;
			this.cid = _.uniqueId("widgetModel");
			this.name = this.widget.manifest.name;
			this.isPreview = options.instance.isPreview;

			this.translate = _.bind(this.widget.translate, this.widget);


			var defaults = _.result(this, "defaults");

			attrs = _.defaults({}, attrs, defaults);

			if (defaults.config) {
				attrs.config = _.defaults(attrs.config, defaults.config);
			}

			this.set(attrs, options);

			this.changed = {};

			// Convenience properties to access the data and config attributes.
			//
			// Since these are objects modifications made to them will not trigger
			// a change event, and therefore won't persist changes unless the
			// events are fired manually. Since we'll need to make a convenience
			// method to handle that anyway, there's no good reason to require
			// this.get("config") calls everywhere.
			this.data = this.attributes.data;
			this.config = this.attributes.config;
			this.syncData = this.attributes.syncData;

			this.on("change:data change:syncData change:config", function() {
				this.data = this.attributes.data;
				this.config = this.attributes.config;
				this.syncData = this.attributes.syncData;
			}, this);


			if (typeof this.oAuth !== "undefined") {
				this.oAuth = new WidgetOAuth(this);
			}


			this.initialize();
		},


		initialize: function() {
			if (this.refresh) {
				this.on("change", function(model, options) {
					if (options && options.widgetChange === true) return;

					this.refresh();
				}, this);
			}
		},


		/**
		 * Passes errors to the parent instance via an event
		 */
		error: function(explanation, advice) {
			this.trigger("error", explanation, advice);
		},


		/**
		 * Destroys this model
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

			this.stopListening();

			if (this.onDestroy) {
				this.onDestroy();
			}

			this.trigger("destroy");
		},


		/**
		 * Fires change events on the data attribute and persists its value to localStorage
		 *
		 * @api     public
		 * @param   {Object}  [data]  Optional. An object that the existing data
		 *                            property should be overwritten with
		 */
		saveData: function(data) {
			if (data) {
				this.data = data;
			}

			this.set("data", this.data, {
				silent: true
			});

			// This is the simplest way to ensure that the appropriate
			// change events get triggered.
			//
			// The parent widget instance listens for change events, so we
			// don't need to do anything beyond that
			this.trigger("change:data", this, this.data, { widgetChange: true });
			this.trigger("change", this, { widgetChange: true });
		},


		/**
		 * See above, but for syncData
		 */
		saveSyncData: function(data) {
			if (data) {
				this.syncData = data;
			}

			this.set("syncData", this.syncData, {
				silent: true
			});

			this.trigger("change:syncData", this, this.syncData, { widgetChange: true });
			this.trigger("change", this, { widgetChange: true });
		},


		/**
		 * Fires change events on the config attribute and persists its value to localStorage.
		 *
		 * This does the same thing as the saveData function, just for the config attribute
		 *
		 * @api     public
		 * @param   {Object}  [config]  Optional. An object that the existing config
		 *                              property should be overwritten with
		 */
		saveConfig: function(config) {
			if (config) {
				this.config = config;
			}

			this.set("config", this.config, {
				silent: true
			});

			// This is the simplest way to ensure that the appropriate
			// change events get triggered.
			//
			// The parent widget instance listens for change events, so we
			// don't need to do anything beyond that
			this.trigger("change:config", this, this.config, { widgetChange: true });
			this.trigger("change", this, { widgetChange: true });
		}
	});

	return WidgetModel;
});