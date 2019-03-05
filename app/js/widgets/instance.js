/**
 * The widget instance wrapper, manages elements, configuration and data persistence, settings, etc.
 */
define([
	"lodash", "jquery", "backbone", "browser/api", "core/uservoice", "core/auth", "core/analytics", "i18n/i18n", "core/status", "widgets/settings", "widgets/views/main", "widgets/views/maximized", "widgets/views/minimized", "widgets/model", "core/render"
], function(_, $, Backbone, Browser, UserVoice, Auth, Track, Translate, Status, Settings, MainView, Maximized, Minimized, WidgetModel, render) {
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

	var GRID_SIZE = 10;

	var WidgetInstance = Backbone.View.extend({
		className: function() {
			return "widget " + this.widget.name + " " + this.model.get("size") + (this.widget.isTabbed === true ? " tabbed" : "") + (this.widget.isAvailable === false ? " hide" : "");
		},

		events: {
			"click > .settings": function() {
				try {
					if (this.widget.views && this.widget.views.settings) {
						this.model.set("state", "settings");
					}
					else {
						new Settings({
							instance: this,
							model: this.model,
							widget: this.widget,
							config: this.widgetModel ? this.widgetModel.config : this.instance.config
						}).once("hide", function() {
							this.trigger("settings:hide");
						}, this);

						this.trigger("settings:show");
					}
				}
				catch (err) {
					this.error();

					Track.queue("widgets", "error", this.widget.name, this.model.get("size"), "settings", err.stack);

					Status.error("An error occurred while trying to open the settings for the " + this.widget.name + " widget!");
				}
			},

			"click > .delete": function(e) {
				$(document).trigger("deletewidget", $(e.currentTarget).parents(".widget"));
			},

			"click > .minimize": function() {
				this.model.set("state", "default");
			},

			"click > .maximize": function() {
				this.model.set("state", "maximized");
			}
		},

		constructor: function(options) {
			this.widget = options.widget;

			var manifest = this.widget.manifest;

			// Set core properties
			this.id = manifest.id;
			this.model = options.model;
			this.cid = _.uniqueId("widget");
			this.isPreview = options.isPreview;
			this.hasSettings = !!(Array.isArray(this.widget.settings) || (manifest.views && manifest.views.settings));

			this.model.set({
				state: "default",
				size: sizes[options.size || this.model.get("size") || manifest.defaultSize || manifest.sizes[0]]
			}, {
				silent: true
			});


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
			var widgetModel = this.widget.model || WidgetModel;

			try {
				this.widgetModel = new widgetModel({
					size: this.model.get("size"),
					data: this.model.get("data"),
					syncData: this.model.get("syncData"),
					state: this.model.get("state") || "default",
					config: _.defaults({}, this.model.get("config"), _.cloneDeep(widgetModel.prototype.defaults.config))
				}, {
					instance: this,
					widget: this.widget
				});
			}
			catch (e) {
				return this.error();
			}


			// updateState creates a new view for the current state
			this.state = null;

			this.updateState(true);


			if (!this.isPreview) {
				Track.FB.logEvent("VIEWED_CONTENT", null, { fb_content_type: "widget", fb_content_id: this.widget.name, widgetSize: this.model.get("size") });

				Track.queue("widgets", "view", this.widget.name, this.model.get("size"));
			}

			this.model.on("change", this.handleChange, this);

			this.widgetModel.on("error", this.error, this);
			this.widgetModel.on("change", this.updateModel, this);
			this.widgetModel.on("refreshInterval:change", this.setRefresh, this);

			this.setRefresh(true);
		},


		/**
		 * Sets an interval to refresh the widget
		 */
		setRefresh: function(initial) {
			if (this.widgetModel.refresh && !this.isPreview && !this._authorizing) {
				if (!initial) {
					clearInterval(this._refreshInterval);
				}
				else {
					try {
						this.widgetModel.refresh();
					}
					catch (e) {
						return this.error();
					}
				}

				if (this.widgetModel.refreshInterval) {
					this._refreshInterval = setInterval(_.bind(this.widgetModel.refresh, this.widgetModel), _.result(this.widgetModel, "refreshInterval"));
				}
			}
		},


		/**
		 * Requests any permissions the widget requires, if this isn't a preview
		 * and they haven't already been granted. Called before any widget code is
		 * run.
		 *
		 * @api    private
		 * @param  {Function}  cb  The function to call after all required permissions have been granted
		 */
		requestPermissions: function(cb) {
			if (this.isPreview) {
				return cb.call(this);
			}

			this.widget.checkPermissions(function(granted) {
				if (granted) {
					return cb.call(this);
				}

				this._requestingPermissions = true;

				this.$el.addClass("splash permissions-request");

				this.el.innerHTML = '<div class="handle"></div>' + render("widgets/permissions-request");

				this.$el.on("click", ".notice button", function() {
					Browser.permissions.request({
						permissions: this.widget.browserPermissions
					}, function(granted) {
						// The page needs to be reloaded after a permission is granted
						// so the API made available by it can be called (CR Bug 435141,
						// fixed in Chrome 45)
						//
						// Unfortunately that still doesn't allow access to URLs like
						// chrome://extension-icon until the browser is restarted
						if (granted) {
							location.reload();
						}
					});
				}.bind(this));
			}, this);
		},


		/**
		 * Handles errors by destroying the widget, unbinding events, and displaying
		 * a notice to the user
		 *
		 * @api     private
		 * @param   {String}  explanation  An explanation to show to the user,
		 *                                 i.e. "Something went wrong while we were trying to display this widget."
		 * @param   {String}  advice       Advice to be given to the user,
		 *                                 i.e. "Try reloading your page or clicking the button below for help."
		 */
		error: function(explanation, advice) {
			// If we're already in an error state (maybe from an async callback), don't do anything
			if (this._errored) {
				return;
			}

			this._errored = true;

			this.$el.addClass("splash error");

			// Cleanup to avoid continued errors from events, etc.
			try {
				this.cleanup();
			}
			catch (e) {}

			var data = {};

			if (explanation) {
				data.explanation = explanation;
			}

			if (advice) {
				data.advice = advice;
			}

			this.el.innerHTML = '<div class="handle"></div>' +
			(this.hasSettings ? '\r\n<div class="settings">&#xF0AD;</div>' : "") +
			render("widgets/error", data) + '\r\n<div class="resize"></div>';


			this.$el.on("click.error", ".notice button.refresh", function() {
				this.$el.off(".error").removeClass("splash error");

				delete this._errored;

				this.initialize();
			}.bind(this)).on("click.error", ".notice button.support", function() {
				UserVoice("showLightbox", "classic_widget", { mode: "support" });
			});
		},


		/**
		 * Cleans up event listeners, widget instances, etc.
		 */
		cleanup: function() {
			if (this.widgetModel) {
				try {
					this.widgetModel.destroy();
				}
				catch (e) {}
			}

			if (this.widgetView) {
				try {
					this.widgetView.destroy();
				}
				catch (e) {}
			}

			this.model.off("change");

			clearInterval(this._refreshInterval);
		},


		/**
		 * The remove method is called by the ViewCollection, so we override it
		 * to call the destroy method
		 *
		 * @api     public
		 */
		remove: function() {
			this.destroy();
		},


		/**
		 * Destroys this instance
		 *
		 * @api     public
		 */
		destroy: function() {
			this.cleanup();

			Backbone.View.prototype.remove.call(this);

			this.stopListening();
		},


		/**
		 * Creates and sets the correct view for the current widget state
		 *
		 * @param {Boolean}  [initial]  If this is the initial setup and no events should be fired
		 */
		updateState: function(initial) {
			var state;

			// Set the state
			if (!Auth.isPro && (this.model.get("state") === "maximized" || this.model.get("state") === "minimized")) {
				state = "default";
			}
			else {
				state = this.model.get("state");
			}


			// See if anything's changed
			if (!initial && ((this.state && this.state === state) || !this.widget.isAvailable)) {
				return;
			}

			this.state = state;


			var view = this.widget.views[state] || this.widget.views.default || MainView;

			// Widgets can implement completely custom settings
			if (state === "maximized") {
				if (!this.model.previous("state") || this.model.previous("state") !== "maximized") {
					// These methods need to be called before the widget view is replaced
					this.maximize();
				}

				view = this.widget.views.maximized || Maximized;
			}
			else if (state === "minimized") {
				view = this.widget.views.minimized || Minimized;
			}


			if (this.model.previous("state") === "maximized" && state !== "maximized") {
				this.minimize();
			}


			if (this.widgetView) {
				try {
					this.widgetView.destroy();
				}
				catch (e) {
					this.error();

					Track.queue("widgets", "error", this.widget.name, this.model.get("size"), "viewDestroy", e.stack);

					Status.error("An error occurred while trying to destroy the " + this.widget.name + " view!");

					return;
				}
			}


			if (!this.isPreview && this.widgetModel.oAuth && this.widget.requiresAuth && this.widgetModel.oAuth.hasToken && !this.widgetModel.oAuth.hasToken()) {
				return this.renderAuth();
			}


			// We update the model before creating the new view since it might
			// need to expect certain calls (i.e. view calls getRenderableData
			// on init and the model needs to check its current state)
			if (initial !== true) {
				this.widgetModel.set("state", state);
			}


			// If the state was maximized, then we're minimizing now, don't remove the class
			if (this.model.previous("state") !== "default" && this.model.previous("state") !== "maximized") {
				this.$el.removeClass(this.model.previous("state"));
			}

			if (state !== "default") {
				this.$el.addClass(state);
			}

			try {
				this.widgetView = new view({
					// The instance property is used by the constructor to inherit
					// select properties
					instance: this,
					widget: this.widget,
					model: this.widgetModel,
					errorHandler: this.error.bind(this)
				});
			}
			catch (e) {
				this.error();

				Track.queue("widgets", "error", this.widget.name, this.model.get("size"), "viewCreate", e.stack);

				Status.error("An error occurred while trying to create a view for the " + this.widget.name + " widget!");

				return;
			}

			this.render();
		},


		/**
		 * Animates a widget to its maximized state
		 */
		maximize: function() {
			var rect = this.el.getBoundingClientRect();

			this.placeholderStyle = 'height:' + rect.height + 'px;' + this.$el.attr("style");

			this.$el
				.css({
					// We need to unset the width and height properties for grid-based layouts
					width: "",
					height: "",
					top: rect.top,
					left: rect.left,
					right: window.innerWidth - rect.right,
					bottom: window.innerHeight - rect.bottom
				})
				.addClass("maximized")
				.on("animationend", _.after(2, function() {
					// Maximizing uses two animations. We disable both so they don't
					// get triggered again if the tabs re-render
					$(this).off("animationend").css({
						top: "",
						left: "",
						right: "",
						bottom: "",
						animation: "none"
					});
				}));

			$('<section class="widget placeholder"></section>').attr("style", this.placeholderStyle).insertBefore(this.$el);

			$(document.body).addClass("widget-maximized");
		},


		/**
		 * Animates a widget to its minimized state
		 */
		minimize: function() {
			var placeholder = this.$el.prev(".placeholder");

			if (!placeholder.length) {
				placeholder = $('<section class="widget placeholder"></section>').attr("style", this.placeholderStyle).insertBefore(this.$el);
			}

			delete this.placeholderStyle;


			var rect = placeholder[0].getBoundingClientRect();

			var updateLoc = this.updateLoc.bind(this);

			this.$el
				.css({
					animation: "",
					top: rect.top,
					left: rect.left,
					right: window.innerWidth - rect.right,
					bottom: window.innerHeight - rect.bottom
				})
				.addClass("transition-out")
				.on("animationend", _.after(2, function() {
					$(this)
						.off("animationend")
						.css({
							top: "",
							left: "",
							right: "",
							bottom: ""
						})
						.removeClass("maximized transition-out")
						.prev(".placeholder")
						.remove();

					updateLoc();

					$(document.body).removeClass("widget-maximized");
				}));
		},


		/**
		 * Renders the OAuth authorization screen
		 *
		 * @api     private
		 */
		renderAuth: function() {
			this._authorizing = true;

			this.$el.addClass("auth-required");

			var data = {
				name: this.widget.translate("name"),
				message: this.widget.translate("authMessage"),
				button: this.widget.translate("authButton")
			};

			if (!data.button || data.button === "authButton") {
				delete data.button;
			}

			if (!data.message || data.message === "authMessage") {
				delete data.message;
			}

			this.el.innerHTML = '<div class="handle"></div>' + render("widgets/auth-required", data);


			this.$el.on("click.auth-required", ".notice button", function() {
				this.widgetModel.oAuth.getToken(function() {
					this.$el.off(".auth-required").removeClass("auth-required");

					delete this._authorizing;

					this.updateState(true);

					this.setRefresh(true);
				}.bind(this));
			}.bind(this));
		},


		/**
		 * Updates the widget's location on grid-based layouts
		 *
		 * @api     private
		 * @param   {Boolean}  [remove=false]  If the location CSS properties should be removed if not
		 *                                     present in the model (if this was on a grid)
		 */
		updateLoc: function(remove) {
			var loc = this.model.get("loc");

			if (loc) {
				this.$el.css({
					top: loc[0] * GRID_SIZE,
					left: loc[1] * GRID_SIZE,
					width: loc[2] * GRID_SIZE - 1,
					height: loc[3] * GRID_SIZE - 1
				});
			}
			else if (remove === true) {
				this.$el.css({
					top: "",
					left: "",
					width: "",
					height: ""
				});
			}
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
			var set = {};

			if (this.model.hasChanged("config") && this.widgetModel) {
				set.config = _.defaults({}, this.model.get("config"), _.cloneDeep(this.widgetModel.defaults.config));
			}

			if (this.model.hasChanged("data")) {
				set.data = this.model.get("data");
			}

			if (this.model.hasChanged("syncData")) {
				set.syncData = this.model.get("syncData");
			}

			if (this.model.hasChanged("state")) {
				this.updateState();

				set.state = this.model.get("state") || "default";
			}

			if (this.model.hasChanged("loc")) {
				this.updateLoc(true);
			}

			if (this.model.hasChanged("size")) {
				set.size = this.model.get("size");

				this.el.setAttribute("data-size", this.model.get("size"));
				this.el.setAttribute("class", this.className());
			}


			if ((!options || !options.widgetChange) && this.widgetModel) {
				this.widgetModel.set(set);
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
		 * Handles changes in the widget's model, persisting them to this instance's model
		 *
		 * @api     private
		 */
		updateModel: function() {
			// All known properties (no custom ones are saved) are copied
			var set = _(this.widgetModel.attributes).pick("state", "size", "config", "data", "syncData", "loc").mapValues(function(e, key) {
				if (key === "config") {
					return _.omit(this.widgetModel.get("config"), function(e, k) {
						return this.widgetModel.defaults.config.hasOwnProperty(k) && e === this.widgetModel.defaults.config[k];
					}, this);
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
		 * Refreshes the rendered element, called by the sortable controller.
		 *
		 * This method is primarily used by the legacy instance since it needs
		 * to handle re-rendering differently
		 *
		 * @api     public
		 */
		refresh: function() {
			this.render();
		},


		render: function() {
			// Set by the onDrop handler
			if (this.onGrid === false && this.model.has("loc")) {
				this.model.unset("loc");
			}

			if (this._requestingPermissions) {
				return;
			}

			// Here we safely use innerHTML since we don't want to destroy the
			// widget view's event listeners
			this.el.innerHTML =
				(this.state === "maximized" ?
					'<div class="minimize" title="' + Translate("widgets.minimize") + '">' +
						'<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path></svg>' +
					'</div>'
				: "") +
				(this.widget.isMaximizable && this.state !== "maximized" ?
					'<div class="maximize" title="' + Translate("widgets.maximize") + '">' +
						'<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path></svg>' +
					'</div>'
				: "") +
				'<div class="handle"></div>' +
				(this.hasSettings ?
					'\r\n<div class="settings">' +
						'<svg width="16" height="16" viewBox="0 0 1792 1792" fill="currentColor">' +
							'<path d="M448 1472q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm644-420l-682 682q-37 37-90 37-52 0-91-37l-106-108q-38-36-38-90 0-53 38-91l681-681q39 98 114.5 173.5t173.5 114.5zm634-435q0 39-23 106-47 134-164.5 217.5t-258.5 83.5q-185 0-316.5-131.5t-131.5-316.5 131.5-316.5 316.5-131.5q58 0 121.5 16.5t107.5 46.5q16 11 16 28t-16 28l-293 169v224l193 107q5-3 79-48.5t135.5-81 70.5-35.5q15 0 23.5 10t8.5 25z"></path>' +
						'</svg>' +
					'</div>'
					: ""
				) +
				'\r\n<div class="resize"></div>' +
				'\r\n<div class="delete">' + 
						'<svg width="24" height="24" fill="currentColor" transform="scale(0.75 0.8)"><path style=" " d="M9,0 C8.164063453674316,0 7.34375,0.1640630066394806 6.75,0.75 C6.15625,1.3359379768371582 5.96875,2.167968988418579 5.96875,3.03125 L2,3.03125 C1.449218988418579,3.03125 1,3.480468988418579 1,4.03125 L0,4.03125 L0,6.03125 L22,6.03125 L22,4.03125 L21,4.03125 C21,3.480468988418579 20.55078125,3.03125 20,3.03125 L16.03125,3.03125 C16.03125,2.167968988418579 15.84375,1.3359379768371582 15.25,0.75 C14.65625,0.1640630066394806 13.835938453674316,0 13,0 zM9,2.0625 L13,2.0625 C13.546875,2.0625 13.71875,2.191406011581421 13.78125,2.25 C13.84375,2.308593988418579 13.96875,2.472656011581421 13.96875,3.03125 L8.03125,3.03125 C8.03125,2.472656011581421 8.15625,2.308593988418579 8.21875,2.25 C8.28125,2.191406011581421 8.453125,2.0625 9,2.0625 zM2,7.03125 L2,23.03125 C2,24.68359375 3.347655773162842,26.03125 5,26.03125 L17,26.03125 C18.65234375,26.03125 20,24.68359375 20,23.03125 L20,7.03125 zM6,10.03125 L8,10.03125 L8,22.03125 L6,22.03125 zM10,10.03125 L12,10.03125 L12,22.03125 L10,22.03125 zM14,10.03125 L16,10.03125 L16,22.03125 L14,22.03125 z"/></svg>' +
					'</div>';

			if (this.widgetView && this.widgetView.el) {
				if (this.$el && this.widgetView.model && this.widgetView.model.widgetClassname) {
					this.$el.addClass(this.widgetView.model.widgetClassname);
				}

				this.el.insertBefore(this.widgetView.el, this.el.children[2]);
			}
		}
	});

	return WidgetInstance;
});