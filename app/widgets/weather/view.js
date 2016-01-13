define(["lodash", "jquery", "widgets/views/main"], function(_, $, WidgetView) {
	return WidgetView.extend({
		events: {
			"click .temp .toggle span": function(e) {
				e.preventDefault();
				e.stopPropagation();

				this.model.config.units = e.currentTarget.getAttribute("data-units") === "metric" ? "metric" : "imperial";

				this.model.saveConfig();

				this.model.refresh();
			},

			"click button.more": function(e) {
				var btn = $(e.currentTarget),
					details = btn.parent().next(".details"),
					isVisible = details.hasClass("visible");

				e.stopPropagation();

				btn.text(this.translate(isVisible ? "more" : "less"));

				if (isVisible) {
					details.css("height", details[0].offsetHeight);

					requestAnimationFrame(function() {
						details.removeClass("visible").css("height", "");
					});
				}
				else {
					// Remove the transition and get the final height
					details.css("transition", "none").addClass("visible");

					var height = details[0].offsetHeight;

					// Reset the element
					details.css("transition", "").removeClass("visible");

					// Trigger layout
					details[0].offsetHeight; // jshint ignore:line

					// Add the visible class
					details.addClass("visible");

					// Set the final height so we transition smoothly
					details.css("height", height);

					setTimeout(function() {
						details.css("height", "");
					}, 200);
				}
			},

			"keydown .forecast": function(e) {
				var dir;

				if (e.which === 39 || e.which === 40) {
					dir = "next";
				}
				else if (e.which === 37 || e.which === 38) {
					dir = "prev";
				}

				if (!dir) {
					return;
				}

				// Stop the tabs from scrolling
				e.stopPropagation();


				var fElm = $(e.currentTarget),
					items = fElm.find(".items .item.active");

				var selectedElm = items[dir](".item");

				if (!selectedElm.length && e.currentTarget.classList.contains("hourly")) {
					// Move the daily forecast up one
					fElm.prev(".forecast").trigger($.Event("keydown", { which: dir === "next" ? 39 : 37 }));

					// And make the first hourly item active
					selectedElm = fElm.find(".items .item")[dir === "next" ? "first" : "last"]();

					if (dir === "prev") {
						// Scroll to the end
						fElm.find(".items .pull").css("margin-left", -(selectedElm[0].parentElement.scrollWidth - selectedElm[0].parentElement.offsetWidth));

						fElm.find("button.prev").prop("disabled", false).siblings(".next").prop("disabled", true);
					}
				}
				else if (!selectedElm.length) {
					selectedElm = items.siblings(".item")[dir === "next" ? "first" : "last"]();
				}

				selectedElm.click();

				// If the element isn't mostly in view, scroll it into view
				if (selectedElm[0].offsetLeft + 30 < 0) {
					fElm.find("button.prev").click();
				}
				else if (selectedElm[0].offsetLeft + selectedElm[0].offsetWidth - 30 > selectedElm[0].parentElement.offsetWidth) {
					fElm.find("button.next").click();
				}
			},

			"click .forecast button": "scrollForecast",
			"click .forecast.daily .item[data-index]": "loadDailyForecast",
			"click .forecast.hourly .item[data-index]": "loadHourlyForecast"
		},


		loadDailyForecast: function(e) {
			if (!this.Auth.isPro) {
				return;
			}

			var elm = $(e.currentTarget),
				loc = elm.parents(".location").first();

			var day = elm.attr("data-index"),
				locIndex = loc.attr("data-index");

			var dayForecast = this.model.data.weather[locIndex].forecast[day];

			this.activeDays[locIndex] = dayForecast;

			elm.addClass("active").siblings().removeClass("active");

			loc.children(".current").html(this.widget.templates.details.render({
				current: dayForecast,
				isPro: this.Auth.isPro,
				i18n: this.widget.strings,
				units: this.model.data.units,
				showDetails: loc.find(".current .details.extended").hasClass("visible")
			}));


			if (dayForecast.hourly) {
				loc.find(".forecast.hourly .items").html('<div class="pull"></div>' +

					_.map(dayForecast.hourly, function(e, i) {
						return '<div class="item" data-index="' + i + '">' +
							'<div class="period">' + e.date + '</div>' +

							'<div class="cond ' + e.conditions + '" title="' + e.caption + '"></div>' +

							'<span class="temp">' + e.temp + '&deg;</span>' +
						'</div>';
					}).join("")
				);

				loc.find(".forecast.hourly button.prev").prop("disabled", true).siblings(".next").prop("disabled", false);
			}
		},


		loadHourlyForecast: function(e) {
			var elm = $(e.currentTarget),
				loc = elm.parents(".location").first();

			var locIndex = loc.attr("data-index"),
				activeDay = this.activeDays[locIndex] || this.model.data.weather[locIndex].forecast[0];

			var hourForecast = activeDay.hourly[elm.attr("data-index")];

			elm.addClass("active").siblings().removeClass("active");

			loc.children(".current").html(this.widget.templates.details.render({
				current: hourForecast,
				isPro: this.Auth.isPro,
				i18n: this.widget.strings,
				units: this.model.data.units,
				showDetails: loc.find(".current .details.extended").hasClass("visible")
			}));
		},


		scrollForecast: function(e) {
			var direction = e.currentTarget.getAttribute("data-direction");

			// The prev and next buttons appear just before and just after the items list, respectively
			var items = e.currentTarget.nextElementSibling || e.currentTarget.previousElementSibling;

			var pull = items.children[0],
				offsetWidth = items.offsetWidth,
				finalLeft = -(parseInt(pull.style.marginLeft) || 0);


			// The scrollWidth value isn't the width of the scrollable content
			// since we aren't scrolling. We need to add our offset back to get
			// the actual value
			var scrollWidth = items.scrollWidth + finalLeft;


			// Scroll by the element width, minus some padding
			if (direction === "left") {
				finalLeft -= offsetWidth - 50;

				// This stops the forecast from scrolling to just after the beginning
				if (finalLeft < 60) {
					finalLeft = 0;
				}
			}
			else if (direction === "right") {
				finalLeft += offsetWidth - 50;

				if (finalLeft + offsetWidth + 60 >= scrollWidth) {
					finalLeft = scrollWidth - offsetWidth;
				}
			}

			if (finalLeft < 0) {
				finalLeft = 0;
			}


			pull.style.marginLeft = -finalLeft + "px";

			// Update the state of the navigation buttons
			if (scrollWidth - offsetWidth > 15) {
				items.previousElementSibling.disabled = finalLeft === 0;

				items.nextElementSibling.disabled = finalLeft + offsetWidth >= scrollWidth - 10;
			}
		},


		activeDays: {},

		onBeforeRender: function(data) {
			if (!data.weather) {
				data.weather = [];
			}

			this.activeDays = {};

			data.units = this.model.data.units || {};

			data.unitsToggle = [{
				value: "imperial",
				label: "F"
			}, {
				value: "metric",
				label: "C"
			}];

			if (data.units.temp === "C") {
				data.unitsToggle = [data.unitsToggle[1], data.unitsToggle[0]];
			}


			if (this.Auth.isPro) {
				data.weather = _.each(data.weather, function(loc) {
					if (loc.forecast && loc.forecast[0]) {
						loc.forecast[0].active = true;
					}
				}, this);
			}

			return data;
		},

		render: function(data, partials) {
			return WidgetView.prototype.render.call(this, data || this.model.data, partials || {
				details: this.widget.templates.details
			});
		}
	});
});