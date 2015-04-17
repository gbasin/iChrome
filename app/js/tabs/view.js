/**
 * The tabs view.  This does the actual rendering of data, creaton of columns and widget insertion.
 */
define(["jquery", "lodash", "backbone", "core/status", "core/analytics", "i18n/i18n", "themes/utils"], function($, _, Backbone, Status, Track, Translate, Themes) {
	var view = Backbone.View.extend({
		tagName: "div",
		className: function() {
			return "tab" + (this.model.get("medley") ? " medley" : "");
		},

		initialize: function() {
			this.model.on("reset:columns set:columns add:columns remove:columns change:fixed change:medley", function() {
				var options = _.last(arguments);

				if (!(options && options.noRefresh)) {
					this.render();
				}
			}, this);

			this.render();
		},


		/**
		 * Get the tabs CSS based on it's theme
		 *
		 * @api    public
		 * @return {String} A CSS string
		 */
		getCSS: function() {
			var css = "",
				theme = Themes.get(this.model.get("theme")),
				image = Themes.getImage(theme);
			
			if (theme.color) {
				css += "background-color: " + theme.color + ";";
			}

			if (image) {
				css += "background-image: url(\"" + image + "\");";
			}

			if (theme.scaling) {
				css += "background-size: " + theme.scaling + ";";
			}

			if (theme.position) {
				css += "background-position: " + theme.position + ";";
			}

			if (theme.repeat) {
				css += "background-repeat: " + theme.repeat + ";";
			}

			if (theme.fixed) {
				css += "background-attachment: " + theme.fixed + ";";
			}

			if (theme["inline-css"]) {
				css += theme["inline-css"];
			}
			
			return css;
		},


		/**
		 * Serializes the widgets and columns into a JSON object, updating the model in the process
		 *
		 * @api    public
		 * @param  {Boolean} [trigger] Whether or not to trigger a sort event for this serialize
		 * @return {Object}  The serialized tab
		 */
		serialize: function(trigger) {
			var columns = [];

			if (this.model.get("medley")) {
				var column = [];

				this.$(".widget").each(function() {
					var that = $(this),
						widget = that.data("view");

					var loc = [
						Math.round(that.position().top / 10),
						Math.round(that.position().left / 10),
						Math.round(that.outerWidth() / 10),
						Math.round(that.outerHeight() / 10)
					];

					if (loc[0] < 0) loc[0] = 0;
					if (loc[1] < 0) loc[1] = 0;

					// This is silent so a save isn't triggered prematurely
					widget.model.set("loc", loc, { silent: true });

					column.push(widget);
				});

				columns.push(column);
			}
			else {
				this.$(".widgets-container > .column").each(function() {
					var column = [];

					$(this).children(".widget").each(function() {
						column.push($(this).data("view"));
					});

					columns.push(column);
				});
			}

			_.each(columns, function(column, i) {
				var collection = this.model.get("columns").at(i).get("value");

				// Only update the collection if the order is different from the columns
				if (_.pluck(collection.views, "cid").join(" ") !== _.pluck(column, "cid").join(" ")) {
					// Remove the old models and views
					collection.remove(
						_(collection.views).difference(column).each(function(e) {
							// If the element is still in the document then it was just moved out
							// of this tab, don't destroy it
							if (!$.contains(document.documentElement, e.el)) {
								// Again, silenced to avoid premature event triggering
								collection.removeView(e, true);
							}
							else {
								// This has to splice so the remove call, which calls removeView,
								// won't destroy the element
								collection.views.splice(collection.views.indexOf(e), 1);
							}
						}).pluck("model").valueOf(),
						{ silent: true }
					);


					// Insert the new ones.  Backbone needs to set up references so these can't be directly inserted
					collection.add(_(column).difference(collection.views).pluck("model").valueOf(), { silent: true });


					// Sort the models to match the views, see lib/backbone.viewcollection for comments
					var cids = _.pluck(_.pluck(column, "model"), "cid"),
						order = _.zipObject(cids, cids.map(function(e, i) {
							return i + 1;
						}));

					collection.models = _.sortBy(collection.models, function(e) {
						return order[e.cid] || Infinity;
					});


					// And then the views to match the new model order
					collection.sortViews(true);
				}
			}, this);


			if (trigger) {
				this.model.trigger("sort", this.model, this.model.get("columns"));

				// Since the render only inserts columns and widgets it's not expensive
				// This is called in requestAnimationFrame so there isn't a visible freeze
				window.requestAnimationFrame(this.render.bind(this));
			}

			return columns;
		},

		
		/**
		 * Initializes sortable.
		 *
		 * By the time this is called the sortable group has already been initialized, this simply adds
		 * the views columns
		 *
		 * @api    private
		 */
		sortable: function() {
			this.$el.children(".remove, .widgets-container.medley").add(this.$el.children(".widgets-container").children(".column")).sortable({
				group: "columns",
				handle: ".handle",
				itemSelector: "section",
				placeholder: "<section class=\"placeholder\"/>"
			});
		},


		/**
		 * Initializes widget resizing for grid-based tabs
		 *
		 * @api    private
		 */
		resizable: function() {
			var body = $(document.body),
				serialize = this.serialize.bind(this);

			this.$el.on("mousedown", ".widget > .resize", function(e) {
				var startX = e.pageX,
					startY = e.pageY,
					widget = this.parentNode,
					startWidth = widget.offsetWidth,
					startHeight = widget.offsetHeight,

					grid = widget.parentNode,
					tc = body.children(".tab-container")[0],
					tcHeight = tc.offsetHeight,
					gridMax = tcHeight - 50,
					h;

				_.each(grid.querySelectorAll(".widget"), function(e) {
					h = e.offsetTop + e.offsetHeight;

					if (h >= gridMax) { gridMax = h; }
				});

				body.addClass("resizing").on("mousemove.widgetResize", function(e) {
					e.preventDefault();

					// -1 so it lines up with the insides of the grid squares
					widget.style.width = ((10 * Math.round((startWidth + (e.pageX - startX)) / 10)) - 1) + "px";
					widget.style.height = ((10 * Math.round((startHeight + (e.pageY - startY)) / 10)) - 1) + "px";


					var max = widget.offsetTop + widget.offsetHeight;

					if (gridMax > max) {
						max = gridMax;
					}

					grid.style.height = (max + 50) + "px";
				}).on("mouseup.widgetResize", function() {
					body.removeClass("resizing").off("mousemove.widgetResize mouseup.widgetResize");

					serialize(true);
				});
			});
		},


		/**
		 * Overrides Backbone's remove method
		 *
		 * @api    private
		 * @param  {sortable} [sortable] Whether or not only sortable should be removed
		 */
		remove: function(sortable) {
			// jQuery sortable doesn't have a method for removing containers from
			// groups without destroying the entire group or for accessing them directly.
			// 
			// So, we have to get the rootGroup directly from an element's `data` which we
			// can then cleanup.
			var elms = this.$el.children(".remove, .widgets-container.medley").add(this.$el.children(".widgets-container").children(".column")),
				dta = elms.first().data("sortable");

			if (dta) {
				var rootGroup = dta.rootGroup;

				_.remove(rootGroup.containers, function(e) {
					return elms.filter(e.el).length >= 1;
				});
			}


			if (sortable !== true) Backbone.View.prototype.remove.call(this);
		},


		render: function() {
			// Remove sortable
			this.remove(true);

			// If the sub-views are not detached and are still active then when the .html() is called the
			// jQuery data will be removed from all descendants destroying all event handlers in the process.
			this.$(".widgets-container > .column > .widget, .widgets-container.medley > .widget").detach();


			var medley = this.model.get("medley");

			this.$el.html(
				'<div class="remove">' + Translate("remove_widget") + '</div>' +
				'<main class="widgets-container' +
					(this.model.get("fixed") && !medley ? " fixed" : "") +
					(medley ? " medley" : "") +
				'"></main>'
			);

			var main = this.$("main"),
				models = [];

			this.model.get("columns").models.forEach(function(e, i) {
				var column = main;

				if (!medley) {
					column = $('<div class="column"></div>').appendTo(main);
				}

				var collection = (e.get("value") || { views: [], models: [] });

				models.push(collection.models);

				column.append(_.pluck(collection.views, "el"));
			});


			if (medley) {
				var max = this.$el.height() - 50;

				/**
				 * This is the number of pixels the bottom of the furthest widget from the top is.
				 *
				 * It uses Lodash and the model instead of elements since it's significantly faster
				 *
				 * @type {Number}
				 */
				var btm = _(models)
					.flatten()
					.pluck("attributes")
					.pluck("loc") // Get the loc values of all widgets
					.compact() // Remove invalid ones
					.map(function(e) { // Convert the values to a height in pixels
						return (e[0] + e[3]) * 10;
					})
					.tap(function(a) { // Add a 0 to the end just in case there are no values
						a.push(0);
					})
					.max() // And finally, get the largest value
					.valueOf();

				if (btm > max) max = btm;

				// The -50 and +50 makes sure that the container is either 50px from the bottom of
				// the last widget or at the bottom of the tab but never past it if it isn't necessary
				this.$el.find("main.widgets-container").css("height", max + 50);

				this.resizable();
			}


			this.sortable();

			return this;
		}
	});


	return view;
});