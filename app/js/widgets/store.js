/**
 * The widget store
 */
define(
	["lodash", "jquery", "backbone", "browser/api", "storage/storage", "i18n/i18n", "widgets/registry", "core/analytics", "modals/modals", "core/render"],
	function(_, $, Backbone, Browser, Storage, Translate, Registry, Track, Modal, render) {
		var sizes = {
			tiny: Translate("widgets.sizes.tiny"),
			small: Translate("widgets.sizes.small"),
			medium: Translate("widgets.sizes.medium"),
			large: Translate("widgets.sizes.large"),
			variable: Translate("widgets.sizes.variable")
		};

		var Model = Backbone.Model.extend({
				initialize: function() {
					var widgets = Registry.chain().filter(function(widget) {
						return widget.isListed && widget.isAvailable;
					}).map(function(widget) {
						return {
							id: widget.id,
							icon: widget.icon,
							name: widget.translate("name"),
							desc: widget.translate("desc")
						};
					}).value().sort(function(a, b) {
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
							widget = Registry.get(id),
							view = Registry.createInstance(new Registry.InstanceModel({ id: id }), true);

						// The getDesc method might need to load the template remotely,
						// so it needs to be async. But, in a compiled version this
						// will never take longer than requestAnimationFrame
						widget.getDesc(function(descHTML) {
							wModal.content.replaceWith(
								render("store-detail", {
									name: widget.translate("name"),
									sizes: widget.sizes.map(function(e) { return [e, sizes[e]]; }),
									desc: descHTML
								})
							);

							wModal.content = wModal.$(".content");

							Track.FB.logEvent("VIEWED_CONTENT", null, { fb_content_type: "page", fb_content_id: "widgets/" + widget.name });

							Track.pageview("Store: " + widget.name, "/store/" + widget.name);

							wModal.content.find(".sizes").sortable({
								group: "columns",
								drop: false
							}).find("section.handle").on("sortabledragstart", function(e, item) {
								var newView = Registry.createInstance(new Registry.InstanceModel({
									id: id,
									size: item.attr("data-size")
								}));

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

					Track.FB.logEvent("VIEWED_CONTENT", null, { fb_content_type: "page", fb_content_id: "widgets" });

					return this;
				}
			});

		return View;
	}
);