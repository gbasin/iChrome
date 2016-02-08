/**
 * The widget registry
 */
define([
	"backbone", "widgets/registry/widget", "widgets/instance", "widgets/legacy/widget", "widgets/legacy/instance", "widgets/registry/index"
], function(Backbone, Widget, WidgetInstance, LegacyWidget, LegacyInstance, index) {
	var Registry = Backbone.Collection.extend({
		/**
		 * Given a legacy widget (single file), creates and returns a
		 * new LegacyWidget, adding it to the registry in the process
		 *
		 * @api     public
		 * @param   {Object}        spec  The legacy widget's specification
		 * @return  {LegacyWidget}        The new LegacyWidget instance
		 */
		registerLegacyWidget: function(spec) {
			var widget = new LegacyWidget(spec);

			this.add(widget);

			return widget;
		},


		/**
		 * Given a valid JSON manifest, creates and returns a new widget,
		 * adding it to the registry in the process
		 *
		 * @api     public
		 * @param   {Object}  manifest  A valid widget manifest
		 * @return  {Widget}            The new Widget instance
		 */
		registerWidget: function(manifest) {
			var widget = new Widget(manifest);

			this.add(widget);

			return widget;
		},


		/**
		 * This is passed a widget instance specification and returns
		 * a new WidgetInstance view
		 *
		 * @api     public
		 * @param   {Backbone.Model}  model      A Backbone model containing configuration options for this instance
		 * @param   {Boolean}         isPreview  Whether or not this widget is being rendered as a preview
		 * @return  {WidgetInstance}             A new instance of the widget specified in the model
		 */
		createInstance: function(model, isPreview) {
			var widget = this.get(model.get("id"));

			if (!widget) {
				return;
			}

			// If this is a legacy widget, return a legacy widget instance, which
			// exposes the same API but operates differently internally
			var Instance = widget instanceof LegacyWidget ? LegacyInstance : WidgetInstance;

			return new Instance({
				model: model,
				isPreview: isPreview,
				widget: widget
			});
		},


		/**
		 * The model used by widget instances
		 *
		 * @type {Backbone.Model}
		 */
		InstanceModel: Backbone.Model.extend({
			idAttribute: "cid",

			validate: function(attrs) {
				return !attrs.id || !registry.get(attrs.id);
			}
		})
	});


	var registry = new Registry();

	// The manifests and contents (for legacy widgets) of widgets are provided
	// by the index file and added to the registry here.
	index.widgets.forEach(function(e) {
		registry.registerWidget(e);
	});

	index.legacy.forEach(function(e) {
		registry.registerLegacyWidget(e);
	});


	return registry;
});