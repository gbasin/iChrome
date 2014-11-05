/**
 * The widget store
 */
define(["lodash", "jquery", "backbone", "storage/storage", "widgets/widgets", "widgets/view", "core/analytics", "modals/modals", "core/templates"], function(_, $, Backbone, Storage, Widgets, Widget, Track, Modal, render) {
	var Model = Backbone.Model.extend({
			initialize: function() {
				var widgets = _.uniq(_.map(Widgets, function(widget) {
					return {
						id: widget.id,
						name: widget.name,
						nicename: widget.nicename,
						desc: widget.desc,
						order: widget.order
					};
				}), "id").sort(function(a, b) {
					return a.order - b.order;
				});

				this.set({
					widgets: widgets
				});
			}
		}),
		modal = new (Modal.extend({
			classes: "store",
			close: function() {
				if (this.$el.hasClass("detail")) {
					this.$el.removeClass("detail");
				}
				else {
					this.hide();
				}
			}
		})),
		View = Backbone.View.extend({
			el: modal.content,

			events: {
				"click > .content .widget": function(e) {
					var elm = $(e.currentTarget),
						id = parseInt(elm.attr("data-id")),
						widget = Widgets[id],
						view = new Widget({
							model: new Backbone.Model({
								id: id,
								size: widget.config && widget.config.size || { size: widget.sizes[0] }
							}),
							preview: true
						});

					this.$(".detail").html(
						render("store-detail", {
							name: widget.name,
							desc: render("widgets." + widget.nicename + ".desc"),
							sizes: widget.sizes.map(function(e) { return [e.toLowerCase(), e.slice(0, 1).toUpperCase() + e.slice(1).toLowerCase()] })
						})
					).find(".preview").prepend(view.el);

					modal.$el.addClass("detail").find(".detail .desc-container").sortable({
						group: "columns",
						drop: false
					}).find("section.handle").on("sortabledragstart", function(e, item, container, _super) {
						var newView = new Widget({
							model: new Backbone.Model({
								id: id,
								size: item.attr("data-size")
							})
						});

						// This lets it render completely before getting dragged
						view.$el.replaceWith(newView.$el);

						view.remove();


						var width = newView.el.offsetWidth,
							css = {
								width: width,
								minWidth: width,
								maxWidth: width,
								height: newView.el.offsetHeight
							};

						item.clone().insertAfter(item);

						item.replaceWith(newView.$el);

						// This way any events attached by jquery.sortable stay intact
						item[0] = newView.el;

						modal.hide().$el.removeClass("detail");

						item.css(css).addClass("dragged").appendTo("body > .widgets-container");

						item.installing = true;

						return item;
					});
				}
			},

			show: function() {
				this.render();

				modal.show();
			},

			initialize: function() {
				this.model = new Model();

				modal.mo.appendTo(document.body);

				this.model.on("change", this.render, this);
			},

			render: function() {
				this.$el.removeClass("content").addClass("wrapper").html(render("store", {
					widgets: this.model.get("widgets")
				}));

				return this;
			}
		});

	return View;
});