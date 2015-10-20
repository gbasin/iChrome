/**
 * A View Collection, used by tabs and columns to create collections of models with corresponding views
 */
define(["lodash", "backbone"], function(_, Backbone) {
	var ViewCollection = Backbone.Collection.extend({
		view: Backbone.View,


		/**
		 * Creates a new view from the specified model
		 *
		 * @api   public
		 * @param {Backbone.Model} model     The model
		 * @param {Boolean}        silent    Whether or not to emit an event
		 * @param {Boolean}        skipSort  Whether or not to skip resorting the views
		 */
		addView: function(model, silent, skipSort) {
			var view = new this.view({
				model: model
			});

			this.views.push(view);

			if (!skipSort) {
				this.sortViews(silent);
			}

			if (!silent) {
				this.trigger("views:add", view, model);
				this.trigger("views:change", this.views, this.models);
			}

			return this;
		},



		/**
		 * Erases and recreates all views from the models
		 *
		 * @api   public
		 */
		resetViews: function() {
			// This function needs to work off of a difference otherwise views will be destroyed
			// erasing event handlers and other jQuery data from their respective elements
			var viewModels = _.pluck(this.views, "model");

			_.each(_.difference(viewModels, this.models), function(e) {
				this.removeView(e, true);
			}, this);

			_.each(_.difference(this.models, viewModels), function(e) {
				this.addView(e, true, true);
			}, this);

			this.sortViews(true);

			this.trigger("views:reset views:change", this.views, this.models);

			return this;
		},



		/**
		 * Sorts the views array to match the models
		 *
		 * @api   public
		 * @param {Boolean}        silent Whether or not to emit an event
		 */
		sortViews: function(silent) {
			// This is used to see if the views actually changed at all
			var oldViews = _.pluck(this.views, "cid").join(" ");

			// Get the model cids as an array.  This can't use this.pluck() since that
			// calls .get() which won't return the cid
			var order = _.pluck(this.models, "cid");

			// Using an object instead of an array makes the sort O(n2) instead of O(n^2)
			order = _.zipObject(order, order.map(function(e, i) {
				// This is +1 so the later order[e.cid] || Infinity doesn't trigger on 0s
				return i + 1;
			}));

			this.views = _.sortBy(this.views, function(e) {
				// If the model isn't present then move it to the end
				return order[e.model.cid] || Infinity;
			});

			if (!silent && oldViews !== _.pluck(this.views, "cid").join(" ")) {
				this.trigger("views:sort views:change", this.views, this.models);
			}

			return this;
		},


		/**
		 * Removes either the specified view or the view for the specified model
		 *
		 * @api   public
		 * @param {String|Backbone.Model|Backbone.View} e      The model, model cid or view
		 * @param {Boolean}                             silent Whether or not to emit an event
		 */
		removeView: function(e, silent) {
			if (e instanceof Backbone.View) {
				var i = this.views.indexOf(e);

				if (i !== -1) {
					var view = this.views.splice(i, 1)[0];
				}
			}
			else if (e instanceof Backbone.Model) {
				var view = _.remove(this.views, {
					model: {
						cid: e.cid
					}
				})[0];
			}
			else if (typeof e == "string") {
				var view = _.remove(this.views, {
					model: {
						cid: e
					}
				})[0];
			}

			if (view) {
				view.remove();

				if (!silent) {
					this.trigger("views:remove", view, view.model);
					this.trigger("views:change", this.views, this.models);
				}
			}

			return this;
		},


		// Backbone overrides
		reset: function(models, options) {
			// This is set so the add handler doesn't fire for each model. Since
			// it's synchronous it'll never get seen by anything else
			this.resetting = true;

			Backbone.Collection.prototype.reset.call(this, models, options);

			delete this.resetting;

			this.resetViews();

			return this;
		},

		_reset: function() {
			Backbone.Collection.prototype._reset.call(this);

			if (this.views) {
				_.each(_.clone(this.views), function(e) {
					this.removeView(e, true);
				}, this);
			}
			else {
				this.views = [];
			}
		},

		add: function(models, options) {
			// See above
			this.adding = true;

			Backbone.Collection.prototype.add.call(this, models, options);

			delete this.adding;

			if (!this.resetting && !this.setting) {
				if (!Array.isArray(models)) {
					models = [models];
				}

				_.each(models, function(e) {
					this.addView(e, options.silent);
				}, this);
			}

			return this;
		},

		set: function(models, options) {
			this.setting = true;

			Backbone.Collection.prototype.set.call(this, models, options);

			delete this.setting;

			if (!this.adding && !this.removing && !this.resetting) {
				this.resetViews();
			}

			return this;
		},

		remove: function(models, options) {
			this.removing = true;

			Backbone.Collection.prototype.remove.call(this, models, options);

			delete this.removing;

			if (!this.resetting && !this.setting) {
				if (!Array.isArray(models)) {
					models = [models];
				}

				_.each(models, function(e) {
					this.removeView(e, options.silent);
				}, this);
			}

			return this;
		},

		sort: function(options) {
			Backbone.Collection.prototype.sort.call(this, options);

			if (!this.resetting && !this.setting) {
				this.resetViews();
			}

			return this;
		}
	});

	return ViewCollection;
});