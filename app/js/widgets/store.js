/**
 * The widget store
 */
define(
	["lodash", "jquery", "backbone", "storage/storage", "i18n/i18n", "widgets/widgets", "widgets/view", "widgets/model", "widgets/utils", "core/analytics", "modals/modals", "core/render"],
	function(_, $, Backbone, Storage, Translate, Widgets, Widget, WidgetModel, Utils, Track, Modal, render) {
		var sizes = {
			tiny: Translate("widgets.sizes.tiny"),
			small: Translate("widgets.sizes.small"),
			medium: Translate("widgets.sizes.medium"),
			large: Translate("widgets.sizes.large"),
			variable: Translate("widgets.sizes.variable")
		};

		var resolve = function(widget, string) {
			return Utils.prototype.resolve.call({ widget: widget }, string);
		};

		var translate = function(widget, id) {
			return Utils.prototype.translate.call({ widget: widget }, id);
		};

		var Model = Backbone.Model.extend({
				initialize: function() {
					var widgets = _.uniq(_.map(Widgets, function(widget) {
						return {
							id: widget.id,
							order: widget.order,
							nicename: widget.nicename,
							name: widget.name ? resolve(widget, widget.name) : translate(widget, "name"),
							desc: widget.desc ? resolve(widget, widget.desc) : translate(widget, "desc")
						};
					}), "id").sort(function(a, b) {
						// sensitivity: "accent" ensures that accented characters differ
						// while ignoring case and avoiding a toLocaleLowerCase() call
						return a.name.localeCompare(b.name, "en", { sensitivity: "accent" });
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
								model: new WidgetModel({
									id: id,
									size: widget.config && widget.config.size || { size: widget.sizes[0] }
								}),
								preview: true
							});

						this.$(".detail").html(
							render("store-detail", {
								name: widget.name ? resolve(widget, widget.name) : translate(widget, "name"),
								sizes: widget.sizes.map(function(e) { return [e, sizes[e]] }),
								desc: Utils.prototype.renderTemplate.call({ widget: widget }, "desc")
							})
						).find(".preview").prepend(view.el);

						Track.pageview("Store: " + widget.nicename, "/store/" + widget.nicename);

						modal.$el.addClass("detail").find(".detail .desc-container").sortable({
							group: "columns",
							drop: false
						}).find("section.handle").on("sortabledragstart", function(e, item, container, _super) {
							var newView = new Widget({
								model: new WidgetModel({
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

					Track.pageview("Store", "/store");
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
	}
);