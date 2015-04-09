/*
 * The Calendar widget.
 */
define(["jquery", "moment", "oauth"], function($, moment, OAuth) {
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
			},
			{
				type: "number",
				nicename: "events",
				label: "i18n.settings.events",
				min: 1,
				max: 10
			}
		],
		config: {
			title: "i18n.title",
			size: "variable",
			events: 5,
			show: "all",
			calendars: []
		},
		data: {
			events: [
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDAxMDNUMTkwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-01-03T11:00:00-08:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
				},
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDAxMTdUMTkwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-01-17T11:00:00-08:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
				},
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDAxMzFUMTkwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-01-31T11:00:00-08:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
				},
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDAyMTRUMTkwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-02-14T11:00:00-08:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
				},
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDAyMjhUMTkwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-02-28T11:00:00-08:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
				},
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDAzMTRUMTgwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-03-14T11:00:00-07:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
				},
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDAzMjhUMTgwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-03-28T11:00:00-07:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
				},
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDA0MTFUMTgwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-04-11T11:00:00-07:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
				},
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDA0MjVUMTgwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-04-25T11:00:00-07:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
				},
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDA1MDlUMTgwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-05-09T11:00:00-07:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
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
						maxResults: this.config.events || 5,
						singleEvents: true,
						orderBy: "startTime",
						timeZone: -(new Date().getTimezoneOffset() / 60),
						timeMin: moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
						fields: "summary,items(description,htmlLink,id,location,start,summary)"
					};

				if (this.config.show == "today") {
					params.timeMax = moment().endOf("day").format("YYYY-MM-DDTHH:mm:ss.SSSZ");
				}

				var requests = this.config.calendars.map(function(calendar) {
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
								events = events.concat(d.items.map(function(e, i) {
									var event = {
										link: e.htmlLink,
										title: e.summary,
										date: new Date(e.start.dateTime || e.start.date + " 00:00:00").getTime()
									};

									if (multiple && d.summary) {
										event.calendar = d.summary;
									}

									if (e.location) {
										event.location = e.location;
									}

									return event;
								}));
							}
						}
					});
				});

				$.when.apply($, requests).then(function() {
					events = events.sort(function(a, b) {
						return a.date - b.date;
					}).slice(0, this.config.events || 5);


					this.data = {
						events: events
					};

					this.render();

					this.utils.saveData(this.data);
				}.bind(this));
			}.bind(this));
		},
		render: function(demo) {
			var data = $.extend(true, {}, this.data);

			data.events = data.events.slice(0, this.config.events || 5);

			data.events.forEach(function(e, i) {
				var date = moment(e.date);

				if (date.diff(new Date(), "days") + 1 > 7) {
					e.date = date.format("dddd, MMMM Do YYYY");

					if ((date = date.format("h:mm A")) !== "12:00 AM") {
						e.date += " at " + date;
					}
				}
				else {
					e.date = date.calendar().replace(" at 12:00 AM", "").replace("Today at ", "");
				}
			});

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			if (!demo && !data.events.length) {
				data.noEvents = true;
			}

			this.utils.render(data);
		}
	};
});