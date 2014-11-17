/**
 * The widget model
 */
define(["backbone"], function(Backbone) {
	var Model = Backbone.Model.extend({
		idAttribute: "cid"
	});

	return Model;
});