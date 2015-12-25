/**
 * The widget wrapper model. This handles widget loading.
 */
define(["lodash", "backbone", "core/auth", "browser/api", "i18n/i18n", "widgets/registry/css"], function(_, Backbone, Auth, Browser, Translate, CSSManager) {
	var Widget = Backbone.Model.extend({
		constructor: function(manifest) {
			// Since widgets should be retrievable by both ID and name, we might
			// as well populate the id and cid fields and let Backbone handle lookups
			this.id = manifest.id;

			this.manifest = manifest;

			this.name = this.cid = manifest.name;


			// Data properties. These hold core information about the widget,
			// such as settings, available sizes, browser permissions, etc.
			this.sizes = manifest.sizes;

			this.settings = manifest.settings;

			this.isListed = manifest.listed !== false;

			this.requiresAuth = manifest.requiresAuth !== false;

			this.icon = "widgets/" + this.name + "/" + manifest.icon;

			this.browserPermissions = manifest.browser_permissions || [];

			this.isAvailable = !(manifest.environments && manifest.environments.indexOf(Browser.environment) === -1);

			this.isMaximizable = Auth.isPro && (manifest.maximizable || (manifest.templates && manifest.templates.maximized) || (manifest.views && manifest.views.maximized));


			this.enStrings = manifest.strings.en || {};

			this.strings = manifest.strings[Browser.language] || manifest.strings.en || {};
		},


		/**
		 * Renders the widget's description template and returns the HTML result
		 *
		 * @api     public
		 * @param   {Function}  cb  The callback
		 */
		getDesc: function(cb) {
			this.initialize(function() {
				cb((this.templates && this.templates.desc && this.templates.desc.render({
					i18n: this.strings
				})) || "");
			}, this);
		},


		/**
		 * Checks to see if the required permissions have been granted
		 *
		 * @api     public
		 * @param   {Function}  cb  The callback
		 * @param   {*}         ctx The context to call the callback with
		 */
		checkPermissions: function(cb, ctx) {
			// Make sure we don't make unnecessary calls
			if (!this.browserPermissions.length || this._permissionsGranted) {
				return cb.call(ctx, true);
			}

			Browser.permissions.contains({
				permissions: this.browserPermissions
			}, function(granted) {
				this._permissionsGranted = granted;

				cb.call(ctx, granted);
			}.bind(this));
		},


		isInitialized: false,

		_initializing: false,


		/**
		 * Initializes this widget, loading and compiling templates, prefixing CSS, etc.
		 *
		 * This is only called when the widget is needed
		 *
		 * @param {Function} cb   The function to call when this widget is completely initialized
		 * @param {*}        ctx  The context to call the callback in
		 */
		initialize: function(cb, ctx) {
			if (!this.isAvailable) {
				return;
			}

			if (this.isInitialized) {
				return cb.call(ctx);
			}


			this.once("initialized", cb, ctx);

			if (this._initializing) {
				return;
			}

			this._initializing = true;


			var tasks = 1,
				done = 0;

			var next = _.bind(function() {
				done++;

				if (done === tasks) {
					this._initializing = false;

					this.isInitialized = true;

					this.trigger("initialized");
				}
			}, this);


			var m = this.manifest;

			var basePath = "w/" + m.name + "/";


			if (m.templates) {
				tasks++;

				this.loadTemplates(basePath, next);
			}


			if (m.css && !CSSManager.registeredWidgets[m.name]) {
				tasks++;

				// The callback here is ignored so the CSS is non-blocking and
				// in the event of an error after build, rendering is not halted
				require(["text!" + basePath + m.css], function(css) {
					if (css && !CSSManager.registeredWidgets[m.name]) {
						// Register the CSS with the global manager, prefixing it
						// only if the widget is not marked as pre-compiled
						CSSManager.register(m.name, css, m.isCompiled === true);
					}

					next();
				});
			}


			if (m.model) {
				tasks++;

				require([basePath + m.model], _.bind(function(model) {
					// Translate default config properties
					if (model.prototype.defaults && model.prototype.defaults.config) {
						model.prototype.defaults.config = _.mapValues(model.prototype.defaults.config, function(str) {
							if (typeof str === "string" && str.slice(0, 5) === "i18n.") {
								return this.translate(str.substr(5));
							}
							else {
								return str;
							}
						}, this);
					}

					this.model = model;

					next();
				}, this));
			}


			if (m.views) {
				tasks++;

				var vArr = [];

				require(_.map(m.views, function(e, k) {
					vArr.push(k);

					return basePath + e;
				}), _.bind(function() {
					// Map each returned view to its name as a key on the views object
					this.views = _.zipObject(vArr, arguments);

					next();
				}, this));
			}

			// This extra call and the counter initialized at zero are necessary
			// in a sync environment (built) to ensure that every step runs
			next();
		},


		/**
		 * Proxies calls to the I18N module, namespacing keys before returning
		 * their values.  Returns the key itself if no value is found.
		 *
		 * @param  {String}   id     The key of the string to get
		 * @param  {...*}     [data] The data to interpolate
		 * @return {String}          The returned string, interpolated if variables were provided
		 */
		translate: function(id) {
			id = id || "";

			try {
				var string = _.reduce(
					id.split("."),
					function(obj, i) { return obj && obj[i]; },
					this.strings
				);

				// If the string isn't available in the current language, try
				// falling back to English (assumed to be the source language for now)
				if (!string) {
					string = _.reduce(
						id.split("."),
						function(obj, i) { return obj && obj[i]; },
						this.enStrings
					);
				}

				// If the string isn't available in the local widget's strings,
				// try shared widget strings
				if (!string) {
					string = Translate("widgets.shared." + id) || "";
				}


				// If data is to be interpolated, replace every instance of %s
				// in the string one-by-one with it's match from the arguments
				// until none are left
				if (arguments.length > 1) {
					var data = _.rest(arguments);

					while (data.length) {
						string = string.replace("%s", data.shift());
					}
				}

				return string || id;
			}
			catch (e) {
				return "";
			}
		},


		loadTemplates: function(basePath, cb) {
			var templates = {};

			var done = 0,
				total = Object.keys(this.manifest.templates).length;

			_.each(this.manifest.templates, function(path, name) {
				require(["widgetTemplate!" + basePath + path], _.bind(function(template) {
					templates[name] = template;

					done++;

					if (done === total) {
						this.templates = templates;

						cb();
					}
				}, this));
			}, this);
		}
	});

	return Widget;
});