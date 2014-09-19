/**
 * The settings dialog.
 */
define(
	[
		"jquery", "backbone", "storage/storage", "core/analytics", "modals/modals", "settings/general", "settings/visual",
		"settings/specific", "settings/advanced", "core/templates", "settings/serialize", "settings/createTab"
	],
	function($, Backbone, Storage, Track, Modal, General, Visual, Specific, Advanced, render, serialize, createTab) {
		var Model = Backbone.Model.extend({
				save: function(d, cb) {
					if (d.tabs)		this.storage.tabs = d.tabs;
					if (d.themes)	this.storage.themes = d.themes;
					if (d.settings)	this.storage.settings = d.settings;

					this.get("sync")(true, cb);
				},
				init: function() {
					Storage.on("done updated", function(storage) {
						this.set(storage); // The settings end up using every part of storage so the whole object is set here

						this.storage = storage;
					}, this);
				}
			}),
			modal = new (Modal.extend({
				classes: "settings"
			})),
			View = Backbone.View.extend({
				el: modal.content,

				events: {
					"click .nav > li": function(e) {
						var elm = $(e.currentTarget),
							tabs = this.$(".tabs .tab");

						this.$(".nav > li").add(tabs).removeClass("active");

						elm.add(tabs.filter("." + elm.attr("data-tab"))).addClass("active");
					},
					"keydown input:not([type=radio], [type=checkbox]), select": function(e) { // Even though this isn't in the tab views the events bubble
						if (e.which == 13) {
							this.save(e); // This calls preventDefault and modal.hide in one shot
						}
					},
					"click .nav li.specific li": function(e) { // Because parents can interact with children but not vice-versa this has to be handled here
						var elm = $(e.currentTarget),
							forms = this.$(".specific form");

						if (elm.parents("li").first().hasClass("active")) {
							e.stopPropagation();
						}

						if (elm.attr("data-id") == "new") {
							return createTab(modal, this.model.attributes, this.$(".specific .btns"), elm, forms);
						}

						elm.siblings().add(forms).removeClass("active");

						elm.add(forms.filter("[data-tab='" + elm.attr("data-id") + "']")).addClass("active");
					},
					"click .btn.save": "save"
				},

				save: function(e) {
					if (typeof e == "function") {
						var cb = e;
					}
					else if (e && e.preventDefault) {
						e.preventDefault();
					}

					this.model.save({
						settings: serialize(this.$el, this.model.attributes)
					}, cb || modal.hide.bind(modal));
				},

				show: function() {
					this.render();

					modal.show();
				},

				initialize: function() {
					this.model = new Model();

					modal.mo.appendTo(document.body);

					this.model.once("change", function() {
						this.loaded = true;

						if (modal.mo.hasClass("visible")) { // If the modal is visible and the settings were just changed
							this.render(); // Re-render
						}
					}, this).init();
				},


				/**
				 * Creates a new tab, shows the settings modal and focuses on that tabs settings
				 *
				 * @api    public
				 */
				createTab: function() {
					// The modal needs to be shown first (although since this is all sync it actually appears later)
					// so that the elements needed by the createTab function are present
					this.show();

					this.$(".nav li.specific").click();

					createTab(modal, this.model.attributes, this.$(".specific .btns"), this.$(".nav li.specific li").last(), this.$(".specific form"));
				},

				render: function() {
					//  These are initialized here so they don't listen for storage change events, etc. until the dialog has been shown
					if (!this.General) {
						this.General = new General();
						this.Visual = new Visual();
						this.Specific = new Specific();
						this.Advanced = new Advanced();

						this.Specific.on("tab:removed", function() {
							// An empty function needs to be passed so the dialog isn't automatically closed
							this.save(function() {});

							this.render();
						}, this);
					}

					// Reset the active tabs
					this.General.$el.addClass("active").siblings().removeClass("active");

					this.$(".nav li.specific li:first, .specific form:first").addClass("active").siblings().removeClass("active");


					// The tab elms need to be detached so their event listeners aren't destroyed when this.$el.html() is called
					$(_.pluck(_.pick(this, "General", "Visual", "Specific", "Advanced"), "el")).detach();


					var data = {
						tabs: []
					};
					
					this.model.get("tabs").forEach(function(tab, i) {
						data.tabs.push({
							name: tab.name || "Home",
							id: tab.id,
							active: (i == 0 ? "active" : "")
						});
					});

					this.$el.html(render("settings", data));

					this.$(".tabs").append(this.General.el, this.Visual.el, this.Specific.el, this.Advanced.el);

					return this;
				}
			});

		return new View();
	}
);