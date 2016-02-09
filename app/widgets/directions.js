/*
 * Directions
 */
define(["jquery", "lodash", "moment", "backbone"], function($, _, moment, Backbone) {
	var View = Backbone.View.extend({
		events: {
			"focusout input.from, input.to": function() {
				if (!this.$(".results .route").length) {
					this.getDirections();
				}
				else {
					var from = this.$("input.from").val().trim(),
						to = this.$("input.to").val().trim();

					if (from && to && (from !== this.data.from || to !== this.data.to)) {
						this.getDirections(from, to);
					}
				}
			},

			"keydown input.from, input.to": function(e) {
				if (e.which === 13) {
					this.getDirections();
				}
			},

			"click .results .route": function(e) {
				e.currentTarget.classList.toggle("active");
			},

			"click .methods button": function(e) {
				$(e.currentTarget).addClass("active").siblings().removeClass("active");

				this.getDirections();
			}
		},


		/**
		 * Retrieves and renders directions
		 *
		 * @api     private
		 * @param   {String}  [from]    The start location
		 * @param   {String}  [to]      The destination location
		 * @param   {String}  [method]  The transit method
		 */
		getDirections: function(from, to, method) {
			if (typeof from !== "string") {
				from = null;
			}

			from = from || this.$("input.from").val().trim();
			to = to || this.$("input.to").val().trim();
			method = method || this.$(".methods .active").attr("data-method") || "driving";

			if (!(from && to)) {
				return;
			}

			this.$(".error").removeClass("visible");

			this.$(".loading").addClass("visible");

			this.$(".map-wrapper, .results").slideUp(function() {
				$(this).remove();
			});

			$.ajax({
				type: "GET",
				url: "https://maps.googleapis.com/maps/api/directions/json",
				data: {
					mode: method,
					origin: from,
					destination: to,
					alternatives: "true"
				},
				success: function(d) {
					if (!d || !d.status || d.status !== "OK" || !d.routes || !d.routes.length) {
						this.$(".loading").removeClass("visible");

						this.$(".error").addClass("visible");

						return;
					}

					_.assign(this.data, {
						to: to,
						from: from,
						method: method
					});

					this.utils.saveData(this.data);


					var data = _.clone(this.data),
						mapWidth = this.$el.outerWidth();

					data.mapsLink = "https://www.google.com/maps?saddr=" + encodeURIComponent(from) + "&daddr=" + encodeURIComponent(to);

					data.routes = _.compact(_.map(d.routes, function(e) {
						try {
							var ret = {
								summary: e.summary,
								copyrights: e.copyrights,
								time: e.legs[0].duration.text,
								distance: e.legs[0].distance.text,
								steps: _.map(e.legs[0].steps, function(e) {
									return {
										distance: e.distance.text,
										description: e.html_instructions
									};
								})
							};

							if (!data.map) {
								data.map = "https://maps.googleapis.com/maps/api/staticmap?" +
									"scale=2&" +
									"size=" + mapWidth + "x220&" +
									"markers=color:red%7Clabel:A%7C" + encodeURIComponent(e.legs[0].start_location.lat + "," + e.legs[0].start_location.lng) + "&" +
									"markers=color:red%7Clabel:B%7C" + encodeURIComponent(e.legs[0].end_location.lat + "," + e.legs[0].end_location.lng) + "&" +
									"path=weight:5%7Cenc:" + encodeURIComponent(e.overview_polyline.points);
							}

							return ret;
						}
						catch (err) {
							return null;
						}
					}));

					this.render(data);
				}.bind(this)
			});
		},

		render: function(data) {
			if (typeof data !== "object") {
				data = {};
			}

			data.from = data.from || this.data.from;
			data.to = data.to || this.data.to;
			data.method = data.method || this.data.method;

			if (!data.method) {
				data.method_driving = "active";
			}
			else {
				data["method_" + data.method] = "active";
			}

			this.utils.render(data);
		}
	});

	return {
		id: 44,
		size: 1,
		nicename: "directions",
		sizes: ["variable"],
		config: {
			size: "variable"
		},
		data: {
			method: "driving"
		},
		render: function() {
			if (!this.view) {
				this.view = new (View.extend({
					utils: this.utils,
					config: this.config,
					data: this.data || {}
				}))({
					el: this.elm
				});
			}

			this.view.config = this.config;
			this.view.data = this.data || {};

			this.view.render();
		}
	};
});