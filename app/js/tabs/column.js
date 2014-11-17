/**
 * The column collection, this creates the widgets
 */
define(["backbone.viewcollection", "widgets/view", "widgets/model"], function(ViewCollection, Widget, Model) {
	var Column = ViewCollection.extend({
		view: Widget,
		model: Model
	});

	return Column;
});