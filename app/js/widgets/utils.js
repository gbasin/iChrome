/**
 * This defines a constructor that creates a widget
 */
define(["lodash", "jquery", "backbone", "core/status", "i18n/i18n", "core/render"], function(_, $, Backbone, Status, Translate, render) {
	var i18n = Translate.getAll();

	/**
	 * Widget utils, this abstracts things like rendering and config saving
	 *
	 * @api public
	 * @constructor
	 * @param {Object} widget The widget to attach the utils to
	 */
	var Utils = function(widget) {
		this.widget = widget;
	};


	_.extend(Utils.prototype, Backbone.Events);


	/**
	 * This handles errors that occur in widgets
	 *
	 * @api    public
	 * @param  {String} msg The error that occurred
	 */
	Utils.prototype.error = function(msg) {
		Status.error("An error occurred in the " + this.name + " widget: " + msg);

		this.trigger("error", msg, this.widget);
	};


	/**
	 * Triggers a save event, this is also saveData for backwards compatibility
	 *
	 * @api    public
	 */
	Utils.prototype.save = Utils.prototype.saveConfig = Utils.prototype.saveData = function(data) {
		this.trigger("save", this.widget);
	};


	/**
	 * Renders the widgets main template
	 *
	 * @api    public
	 * @param  {Object} [data={}]  The data to pass to Hogan
	 * @param  {Object} [partials] Any partials that should be rendered with it
	 */
	Utils.prototype.render = function(data, partials) {
		data = _.clone(data) || {};

		data[this.widget.config.size] = true;

		data.i18n = i18n.widgets[this.widget.nicename] || {};

		this.elm[0].innerHTML = 
			'<div class="handle"></div>' +
			(this.widget.settings ? '\r\n<div class="settings">&#xF0AD;</div>' : "") +
			render("widgets." + this.widget.nicename, data, partials) +
			'\r\n<div class="resize"></div>'
		;

		this.trigger("render");
	};


	/**
	 * Gets a widgets template
	 *
	 * @api    public
	 * @param  {String} [name] The template to get
	 * @return {String}        The retrieved template
	 */
	Utils.prototype.getTemplate = function(name) {
		return (render.getRaw("widgets." + this.widget.nicename + (name ? "." + name : "")) || "").replace(/\{\{&gt\;/gi, "{{>");
	};


	/**
	 * Renders a widget's template
	 *
	 * @api    public
	 * @param  {String} name        The template to render
	 * @param  {Object} [data={}]   The data to render with
	 * @param  {Object} [partials]  Any partials to be included
	 * @return {String}             The rendered template
	 */
	Utils.prototype.renderTemplate = function(name, data, partials) {
		data = _.clone(data) || {};

		data.i18n = i18n.widgets[this.widget.nicename] || {};

		return render(("widgets." + this.widget.nicename + (name ? "." + name : "")) || "", data, partials);
	};


	/**
	 * Namespaces and proxies a widgets i18n request to the main i18n
	 *
	 * @api    public
	 * @param  {String}   id     The key of the string to get
	 * @param  {...*}     [data] The data to interpolate
	 * @return {String}          The returned string, interpolated if variables were provided
	 */
	Utils.prototype.translate = function(id) {
		var args = _.toArray(arguments);

		args[0] = "widgets." + this.widget.nicename + "." + id;

		var ret = Translate.apply(Translate, args);

		if (!ret) {
			args[0] = args[0].replace(this.widget.nicename, "shared");

			ret = Translate.apply(Translate, args);
		}

		return ret;
	};


	/**
	 * Resolves references in a string to the version from the i18n module
	 *
	 * @api    public
	 * @param  {String} [str=""] The string to resolve
	 * @return {String}          The resolved string
	 */
	Utils.prototype.resolve = function(str) {
		if (!str) return "";

		if (str.indexOf("i18n.") === 0) {
			// This uses the prototype so resolve can be called with a different this object
			return Utils.prototype.translate.call(this, str.substr(5));
		}

		return str;
	};


	return Utils;
});