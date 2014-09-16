/**
 * The tab model, this creates columns
 */
define(["lodash", "backbone", "storage/defaults", "tabs/column"], function(_, Backbone, Defaults, Column) {
	var Tab = Backbone.DocumentModel.extend({
		/**
		 * This is called by Backbone DocumentModel.  It creates a nested collection.
		 *
		 * @api    public
		 * @param  {String} key     The key of the current item. i.e. `columns`
		 * @param  {Array}  value   The value of the item
		 * @param  {Object} options Any options that were passed to the constructor
		 * @return {Backbone.DocumentCollection} The constructed collection
		 */
		getNestedCollection: function(key, value, options) {
			if (key == "columns") {
				// columns is an array of arrays, the second-level arrays need to be
				// column collections instead of DocumentCollections
				var columns = Backbone.DocumentCollection.extend({
					model: Backbone.DocumentModel.extend({
						getNestedCollection: function(key, value, options) {
							return new Column(value, options);
						}
					})
				});

				return new columns(value, options);
			}
			else {
				return new Backbone.DocumentCollection(value, options);
			}
		}
	});

	return Tab;
});