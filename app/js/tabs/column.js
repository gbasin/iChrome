/**
 * The column collection, this creates the widgets
 */
define(["lodash", "backbone", "backbone.viewcollection", "widgets/view"], function(_, Backbone, ViewCollection, Widget) {
	var Column = ViewCollection.extend({
		view: Widget,
		model: Backbone.Model
	});

	return Column;
});