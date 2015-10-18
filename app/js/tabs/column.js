/**
 * The column collection, this creates the widgets
 */
define(["backbone", "backbone.viewcollection", "widgets/registry"], function(Backbone, ViewCollection, Registry) {
	var Column = ViewCollection.extend({
		view: function(options) {
			if (options && options.model) {
				return Registry.createInstance(options.model);
			}
		},
		model: Backbone.Model.extend({
			idAttribute: "cid"
		})
	});

	return Column;
});