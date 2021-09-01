/**
 * The legacy widget wrapper model
 */
define(["lodash", "browser/api", "i18n/i18n", "widgets/registry/css", "widgets/registry/widget", "core/render"], function(_, Browser, Translate, CSSManager, Widget, render) {
	var strings = Translate.getAll().widgets,
		enStrings = Translate.getAll("en").widgets;

	var LegacyWidget = Widget.extend({
		constructor: function(widget) {
			// Since widgets should be retrievable by both ID and name, we might
			// as well populate the id and cid fields and let Backbone handle lookups
			this.id = widget.id;

			this.widget = widget;

			this.name = this.cid = widget.nicename;


			// Data properties. These hold core information about the widget,
			// such as settings, available sizes, browser permissions, etc.
			this.sizes = widget.sizes;

			this.settings = widget.settings;

			this.isListed = !widget.unlisted;

			this.icon = "icons/" + this.name + ".png";

			this.browserPermissions = widget.permissions || [];

			this.isAvailable = !(widget.environments && widget.environments.indexOf(Browser.environment) === -1);


			this.enStrings = enStrings[this.name] || {};

			this.strings = strings[this.name] || enStrings[this.name] || {};

			this.sort = widget.sort || 99999;

			CSSManager.registeredWidgets[this.name] = true;
		},


		/**
		 * Renders the widget's description template and returns the HTML result
		 *
		 * @api     public
		 * @param   {Function}  cb  The callback
		 */
		getDesc: function(cb) {
			cb(render("widgets." + this.name + ".desc", {
				i18n: this.strings
			}));
		},


		isLegacy: true,

		isInitialized: false,


		/**
		 * Initializes this widget. This is a no-op on legacy widgets
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

			this.isInitialized = true;

			// Translate default config properties
			if (this.widget && this.widget.config) {
				this.widget.config = _.mapValues(this.widget.config, function(str) {
					if (typeof str === "string" && str.slice(0, 5) === "i18n.") {
						return this.translate(str.substr(5));
					}
					else {
						return str;
					}
				}, this);
			}

			return cb.call(ctx);
		}
	});

	return LegacyWidget;
});