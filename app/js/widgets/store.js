/**
 * The widget store
 */
define(
	["lodash", "jquery", "backbone", "browser/api", "storage/storage", "i18n/i18n", "widgets/widgets", "widgets/view", "widgets/model", "widgets/utils", "core/analytics", "modals/modals", "core/render"],
	function(_, $, Backbone, Browser, Storage, Translate, Widgets, Widget, WidgetModel, Utils, Track, Modal, render) {
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
					var widgets = _(Widgets).filter(function(widget) {
						if (widget.unlisted || (widget.environments && widget.environments.indexOf(Browser.environment) === -1)) {
							return false;
						}

						return true;
					}).map(function(widget) {
						return {
							id: widget.id,
							order: widget.order,
							nicename: widget.nicename,
							name: widget.name ? resolve(widget, widget.name) : translate(widget, "name"),
							desc: widget.desc ? resolve(widget, widget.desc) : translate(widget, "desc")
						};
					}).uniq("id").value().sort(function(a, b) {
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
				classes: "store"
			}))(),
			View = Backbone.View.extend({
				el: modal.content,

				events: {
					"click > .content .widget": function(e) {
						var wModal = new (Modal.extend({
							destroyOnHide: true,
							classes: "store-detail"
						}))();


						var id = parseInt($(e.currentTarget).attr("data-id")),
							widget = Widgets[id],
							view = new Widget({
								model: new WidgetModel({
									id: id,
									size: widget.config && widget.config.size || { size: widget.sizes[0] }
								}),
								preview: true
							});

						wModal.content.replaceWith(
							render("store-detail", {
								name: widget.name ? resolve(widget, widget.name) : translate(widget, "name"),
								sizes: widget.sizes.map(function(e) { return [e, sizes[e]]; }),
								desc: Utils.prototype.renderTemplate.call({ widget: widget }, "desc")
							})
						);

						wModal.content = wModal.$(".content");

						Track.pageview("Store: " + widget.nicename, "/store/" + widget.nicename);

						wModal.content.find(".sizes").sortable({
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

							wModal.close();
							modal.hide();

							item.css(css).addClass("dragged").appendTo("body > .widgets-container");

							item.installing = true;

							return item;
						});

						wModal.content.find("section.preview").append(view.el);

						wModal.mo.appendTo(document.body);

						requestAnimationFrame(wModal.show.bind(wModal));
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