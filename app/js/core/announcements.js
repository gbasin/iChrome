/**
 * Announcements
 */
define(["backbone", "modals/modals", "core/analytics", "core/render"], function(Backbone, Modal, Track, render) {
	var modal = new (Modal.extend({
		width: 450,
		height: 530,
		classes: "announcements",
		close: function(e) {
			return this.trigger("close").hide();
		}
	}))();

	var Model = Backbone.Model.extend({
		url: "http://ichro.me/announcements.json",

		defaults: {
			count: 0,
			title: "Announcements"
		},

		initialize: function() {
			if (localStorage.showWhatsNew) {
				this.set({
					count: 10,
					isUpdate: true
				});

				setTimeout(function() {
					var shown = (parseInt(localStorage.showWhatsNew) || 0) + 1;

					if (shown >= 10) {
						localStorage.removeItem("showWhatsNew");
					}
					else {
						localStorage.showWhatsNew = shown;
					}
				}, 3000);
			}


			/**
			 * Sample announcement from server:
			 *
			 * {
			 *     "count": 2,
			 *     "alert": false,
			 *     "announcement_id": 1,
			 *     "title": "Test title",
			 *     "contents": "<p>Test announcement</p><section><h3>Test</h3><ul><li>List item #1</li><li>List item #2</li></ul></section>"
			 * }
			 */

			this.fetch();

			// Refetch every hour
			setInterval(function() {
				this.fetch({
					url: this.url + "?refetch=true"
				});
			}.bind(this), 3600000);
		},

		parse: function(d) {
			if (d && d.contents) {
				if (d.announcement_id && d.announcement_id.toString() == localStorage.dismissedAnnouncement) {
					return {};
				}

				d.isUpdate = false;

				d.count = d.count || 1;
			}

			return d;
		}
	});
	
	var View = Backbone.View.extend({
		el: modal.content,

		initialize: function() {
			modal.on("close", function() {
				this.trigger("dismissed");

				if (this.model.get("isUpdate")) {
					localStorage.removeItem("showWhatsNew");
				}
				else {
					localStorage.dismissedAnnouncement = this.model.get("announcement_id");
				}

				this.model.clear({ silent: true }).set(this.model.defaults);

				Track.event("Announcements", "Dismissed");
			}, this);

			this.model = new Model();

			this.model.on("change", this.render, this).on("change:count", function() {
				this.count = this.model.get("count");

				this.trigger("countchange", this.count);
			}, this).trigger("change change:count");
		},

		show: function() {
			modal.show();

			Track.event("Announcements", "Shown", "Click");
		},

		render: function() {
			var d = this.model.attributes;

			if (!d.isUpdate && !d.contents) {
				return;
			}

			if (d.isUpdate) {
				this.$el.replaceWith(render("announcements", {
					title: d.title,
					isUpdate: true
				}));
			}
			else {
				this.$el.replaceWith(render("announcements", {
					title: d.title,
					contents: d.contents
				}));
			}

			modal.mo.appendTo(document.body);

			if (d.alert === true) {
				modal.show();

				Track.event("Announcements", "Shown", "Alert");
			}
		}
	});

	return new View();
});