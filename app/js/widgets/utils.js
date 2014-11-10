/**
 * This defines a constructor that creates a widget
 */
define(["lodash", "jquery", "backbone", "core/status", "core/render"], function(_, $, Backbone, Status, render) {
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
		data = $.extend({}, data || {});

		data[this.widget.config.size] = true;

		this.elm.html(
			'<div class="handle"></div>' +
			(this.widget.settings ? '\r\n<div class="settings">&#xF0AD;</div>' : "") +
			render("widgets." + this.widget.nicename, data, partials) +
			'\r\n<div class="resize"></div>'
		);

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
		return (render.getRaw("widgets." + this.widget.nicename + (name ? "." + name : "")) || "").replace("{{&gt;", "{{>");
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
		data = $.extend({}, data || {});

		return render(("widgets." + this.widget.nicename + (name ? "." + name : "")) || "", data, partials);
	};


	return Utils;
});