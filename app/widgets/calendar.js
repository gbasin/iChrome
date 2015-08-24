/*
 * The Calendar widget.
 */
define(["jquery", "lodash", "moment", "oauth"], function($, _, moment, OAuth) {
	return {
		id: 10,
		size: 1,
		order: 7,
		interval: 300000,
		nicename: "calendar",
		sizes: ["variable"],
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "i18n.settings.title",
				placeholder: "i18n.settings.title_placeholder"
			},
			{
				type: "select",
				multiple: true,
				label: "i18n.settings.calendar",
				nicename: "calendars",
				options: "getCalendars"
			},
			{
				type: "radio",
				label: "i18n.settings.show",
				nicename: "show",
				options: {
					all: "i18n.settings.show_options.all",
					today: "i18n.settings.show_options.today"
				}
			}
		],
		config: {
			title: "i18n.title",
			size: "variable",
			show: "all",
			calendars: []
		},
		data: {
			events: [
				{
					"link": "https://www.google.com/calendar",
					"title": "Multi-day Event",
					"start": 1437278400000,
					"end": 1437624000000,
					"time": "July 19th - July 22nd",
					"calendar": "Personal",
					"calendarId": "Personal",
					"location": "Mountain View, CA, USA",
					"color": "#4986e7"
				},
				{
					"link": "https://www.google.com/calendar",
					"title": "Single day event",
					"start": 1437364800000,
					"end": 1437451200000,
					"calendar": "Secondary Calendar",
					"calendarId": "Secondary Calendar",
					"color": "#ffad46"
				},
				{
					"link": "https://www.google.com/calendar",
					"title": "Lunch",
					"start": 1437494400000,
					"end": 1437494400000,
					"time": "12 PM",
					"calendar": "Secondary Calendar",
					"calendarId": "Secondary Calendar",
					"color": "#ffad46"
				},
				{
					"link": "https://www.google.com/calendar",
					"title": "Meeting",
					"start": 1437505200000,
					"end": 1437505200000,
					"time": "3 PM",
					"calendar": "Secondary Calendar",
					"calendarId": "Secondary Calendar",
					"color": "#ffad46"
				},
				{
					"link": "https://www.google.com/calendar",
					"title": "Dinner",
					"start": 1437604200000,
					"end": 1437607800000,
					"time": "6:30 PM - 7:30 PM",
					"calendar": "emailaddress@gmail.com",
					"calendarId": "emailaddress@gmail.com",
					"color": "#4986e7"
				}
			]
		},
		oAuth: false,
		setOAuth: function() {
			this.oAuth = new OAuth({
				name: "calendar",
				id: "559765430405-2710gl95r9js4c6m4q9nveijgjji50b8.apps.googleusercontent.com",
				secret: "__API_KEY_calendar__",
				scope: "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar"
			});
		},
		getCalendars: function(cb) {
			if (!this.oAuth) this.setOAuth();

			this.oAuth.ajax({
				type: "GET",
				dataType: "json",
				url: "https://www.googleapis.com/calendar/v3/users/me/calendarList/",
				success: function(d) {
					if (!d || !d.items) return cb("error");

					var calendars = {};

					d.items.forEach(function(e, i) {
						calendars[e.id] = e.summary;
					});

					cb(calendars);
				}
			});
		},
		refresh: function() {
			if (!this.oAuth) this.setOAuth();

			if (!this.config.calendars || !this.config.calendars.length) {
				if (this.config.calendar) {
					this.config.calendars = [this.config.calendar];

					delete this.config.calendar;
				}
				else {
					return false;
				}
			}


			this.oAuth.getToken(function(token) {
				var events = [],
					multiple = this.config.calendars.length > 1,
					params = {
						maxResults: 20,
						singleEvents: true,
						orderBy: "startTime",
						timeZone: -(new Date().getTimezoneOffset() / 60),
						timeMin: moment().startOf("day").format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
						fields: "summary,items(description,htmlLink,id,location,start,end,summary)"
					};

				if (this.config.show == "today") {
					params.timeMax = moment().endOf("day").format("YYYY-MM-DDTHH:mm:ss.SSSZ");
				}


				var requests = [],
					calendarColors = {};

				if (multiple) {
					requests.push($.ajax({
						type: "GET",
						dataType: "json",
						url: "https://www.googleapis.com/calendar/v3/users/me/calendarList?fields=items(backgroundColor%2Cid)",
						beforeSend: function(xhr) {
							xhr.setRequestHeader("Authorization", "Bearer " + token);
						},
						success: function(d) {
							if (!d || !d.items) return;

							d.items.forEach(function(e, i) {
								if (e.backgroundColor) {
									calendarColors[e.id] = e.backgroundColor;
								}
							});
						}.bind(this)
					}));
				}

				requests = requests.concat(_.map(this.config.calendars, function(calendar) {
					return $.ajax({
						type: "GET",
						dataType: "json",
						data: params,
						url: "https://www.googleapis.com/calendar/v3/calendars/" + encodeURIComponent(calendar) + "/events",
						beforeSend: function(xhr) {
							xhr.setRequestHeader("Authorization", "Bearer " + token);
						},
						success: function(d) {
							if (d && d.items) {
								events = events.concat(_.map(d.items, function(e, i) {
									var event = {
										link: e.htmlLink,
										title: e.summary,
										start: new Date(e.start.dateTime || e.start.date + " 00:00:00").getTime(),
										end: e.end && new Date(e.end.dateTime || e.end.date + " 00:00:00").getTime()
									};

									event.time = this.getTimeStr(event.start, event.end);

									if (!event.time) {
										delete event.time;
									}

									if (multiple && d.summary) {
										event.calendar = d.summary;
									}

									if (multiple) {
										event.calendarId = calendar;
									}

									if (e.location) {
										event.location = e.location;
									}

									return event;
								}, this));
							}
						}.bind(this)
					});
				}, this));

				$.when.apply($, requests).then(function() {
					events = events.sort(function(a, b) {
						return a.start - b.start;
					}).slice(0, 20);


					if (multiple && Object.keys(calendarColors).length) {
						events = events.map(function(e) {
							if (e.calendarId && calendarColors[e.calendarId]) {
								e.color = calendarColors[e.calendarId];
							}

							return e;
						});
					}


					this.data = {
						events: events
					};

					this.render();

					this.utils.saveData(this.data);
				}.bind(this));
			}.bind(this));
		},


		/**
		 * Returns a formatted time string for an event
		 *
		 * @api     private
		 * @param   {Number}  oStart  The start time of the event, in ms
		 * @param   {Number}  oEnd    The end time of the event
		 * @return  {String}          The formatted time, date, or range string
		 */
		getTimeStr: function(oStart, oEnd) {
			var start = moment(oStart),
				end = moment(oEnd),
				timeStr;


			var endTimeStr = end.minutes() ? "h:mm A" : "h A",
				endHasTime = end.hours() + end.minutes();

			var endSameAsStart = (endHasTime && end.clone().startOf("day").isSame(start.clone().startOf("day"))) ||
								(!endHasTime && end.subtract(1, "days").isSame(start)) || end.isSame(start);

			// If the end time doesn't exist, or it's the same as the start date, delete it
			if (!oEnd || (endSameAsStart && !endHasTime) || end.isSame(start)) {
				end = null;
			}

			// If it has time and is on the same day as the start date, format it as a simple time value
			else if (endHasTime && endSameAsStart) {
				timeStr = end.format(endTimeStr);
			}

			// Otherwise, if it does have time and didn't match the last clause (meaning it's on a different
			// date than the start date), format it with a month and day.
			else if (endHasTime) {
				timeStr = end.format("MMMM Do, " + endTimeStr);
			}

			// If it doesn't match the last clause (and doesn't have a time) and is not on the same day as
			// the start date, format it as a plain date string
			else {
				timeStr = end.format("MMMM Do");
			}


			var startTimeStr = start.minutes() ? "h:mm A" : "h A",
				startHasTime = start.hours() + start.minutes();

			// If the start time doesn't exist (for some reason) or it doesn't have time or an end date (and
			// therefore shouldn't be displayed), return now
			if (!oStart || (!startHasTime && !end)) {
				return;
			}

			// If it has time and is on the same day as the end date, format it as a plain time string
			else if (startHasTime && end && endSameAsStart) {
				timeStr = start.format(startTimeStr) + " - " + timeStr;
			}

			// Otherwise, if it has time and is not on the same day as the end date, which exists, format
			// it as a date and time string
			else if (startHasTime && end) {
				timeStr = start.format("MMMM Do, " + startTimeStr) + " - " + timeStr;
			}

			// If it has time and the end date doesn't exist
			else if (startHasTime) {
				timeStr = start.format(startTimeStr);
			}

			// If it didn't match the last clauses (and doesn't have time), and has an end date
			// that's not on the same day, format it as a date string
			else if (end && !endSameAsStart) {
				timeStr = start.format("MMMM Do") + " - " + timeStr;
			}

			return timeStr;
		},

		render: function(demo) {
			var data = _.clone(this.data, true);

			data.title = this.config.title;

			data.days = {};

			_(data.events).each(function(e) {
				var start = new Date(e.start).toDateString();

				data.days[start] = (data.days[start] || []);

				data.days[start].push(e);

				var end = moment(e.end).subtract(1, "seconds").startOf("day");

				if (end.isValid() && end.toDate().toDateString() !== start) {
					var diff = end.diff(moment(e.start).startOf("day"), "days"),
						d;

					for (var i = 1; i <= diff; i++) {
						d = new Date(e.start + (864E5 * i)).toDateString();

						data.days[d] = (data.days[d] || []);

						data.days[d].push(e);
					}
				}
			}, this).value();


			var dt = new Date();

			if (demo) {
				dt = new Date(1437364800000);
			}

			var today = moment(dt).startOf("day"),
				rangeStart, rangeEnd;

			if (this.config.show == "today") {
				rangeStart = moment(dt).startOf("day");
				rangeEnd = moment(dt).endOf("day");
			}
			else {
				rangeStart = moment(dt).startOf("day");
				rangeEnd = null;
			}

			data.days = _.compact(_.map(data.days, function(e, i) {
				var date = moment(new Date(i)),
					dateStr = "";

				if (date.isBefore(rangeStart) || (rangeEnd && date.isAfter(rangeEnd))) {
					return null;
				}

				if (date.diff(new Date(), "days") + 1 >= 7) {
					dateStr = date.format("dddd, MMMM Do YYYY");
				}
				else {
					dateStr = date.calendar(dt).replace(" at 12:00 AM", "");
				}

				return {
					events: e,
					date: dateStr,
					status: date.isSame(today) ? "today" : date.isBefore(today) ? "past" : ""
				};
			}));

			if (this.config.calendars.length > 1) {
				data.multiple = true;
			}

			if (!data.days.length) {
				data.noEvents = true;
			}

			this.utils.render(data);
		}
	};
});