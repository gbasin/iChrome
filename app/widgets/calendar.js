 /*
 * The Calendar widget.
 */
 define(["jquery", "lodash", "moment", "oauth", "fullcalendar"], function($, _, moment, OAuth) { 
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
				type: "radio",
				label: "i18n.settings.view",
				nicename: "view",
				options: {
					agenda1d: "i18n.settings.view_options.agenda1d",
					list2w: "i18n.settings.view_options.list2w",
					short1d: "i18n.settings.view_options.short1d",
				},
			},
			{
				type: "time",
				label: "i18n.settings.range.start",
				nicename: "startTime"
			},
			{
				type: "time",
				label: "i18n.settings.range.end",
				nicename: "endTime"
			}
		],
		config: {
			title: "i18n.title",
			size: "variable",
			show: "all",
			view: "agenda1d",
			startTime: "08:00",
			endTime: "22:00",
			calendars: []
		},
		data: {
			events: [
				{
					"url": "https://www.google.com/calendar",
					"title": "Multi-day Event",
					"start": "2018-07-19",
					"end": "2018-07-22",
					"calendar": "Personal",
					"calendarId": "Personal",
					"location": "Mountain View, CA, USA",
					"color": "#4986e7"
				},
				{
					"url": "https://www.google.com/calendar",
					"title": "Single day event",
					"start": "2018-07-19",
					"calendar": "Secondary Calendar",
					"calendarId": "Secondary Calendar",
					"color": "#ffad46"
				},
				{
					"url": "https://www.google.com/calendar",
					"title": "Lunch",
					"start": "2018-07-19 12:00:00",
					"end": "2018-07-19 13:00:00",
					"calendar": "Secondary Calendar",
					"calendarId": "Secondary Calendar",
					"color": "#ffad46"
				},
				{
					"url": "https://www.google.com/calendar",
					"title": "Meeting",
					"start": "2018-07-19 15:00:00",
					"end": "2018-07-19 16:00:00",
					"calendar": "Secondary Calendar",
					"calendarId": "Secondary Calendar",
					"color": "#ffad46"
				},
				{
					"url": "https://www.google.com/calendar",
					"title": "Dinner",
					"start": "2018-07-19 16:30:00",
					"end": "2018-07-19 19:30:00",
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
			if (!this.oAuth) {
				this.setOAuth();
			}

			this.oAuth.ajax({
				type: "GET",
				dataType: "json",
				url: "https://www.googleapis.com/calendar/v3/users/me/calendarList/",
				success: function(d) {
					if (!d || !d.items) {
						return cb("error");
					}

					var calendars = {};

					d.items.forEach(function(e) {
						calendars[e.id] = e.summary;
					});

					cb(calendars);
				}
			});
		},
		refresh: function() {
			if (!this.oAuth) {
				this.setOAuth();
			}

			this.config.calendars = this.config.calendars || [];

			if (!this.config.calendars.length) {
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
						singleEvents: true,
						orderBy: "startTime",
						timeZone: -(new Date().getTimezoneOffset() / 60),
						timeMin: moment().startOf("day").format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
						timeMax: moment().startOf("day").add(14, 'days').format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
						fields: "summary,items(description,htmlLink,id,location,start,end,summary)"
					};

				if (this.config.show === "today") {
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
							if (!d || !d.items) {
								return;
							}

							d.items.forEach(function(e) {
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
						cache: false,
						url: "https://www.googleapis.com/calendar/v3/calendars/" + encodeURIComponent(calendar) + "/events",
						beforeSend: function(xhr) {
							xhr.setRequestHeader("Authorization", "Bearer " + token);
						},
						success: function(d) {
							if (d && d.items) {
								events = events.concat(_.map(d.items, function(e) {
									var event = {
										id: e.id,
										title: e.summary,
										start: e.start.dateTime || e.start.date,
										end: e.end.dateTime || e.end.date,
										url: e.htmlLink,
									};

									if (multiple && d.summary) {
										event.calendar = d.summary;
									}

									if (multiple) {
										event.calendarId = calendar;
									}

									if (e.location) {
										event.location = e.location;
									}

									if (e.description) {
										event.description = e.description;
									}

									return event;
								}, this));
							}
						}.bind(this)
					});
				}, this));

				$.when.apply($, requests).then(function() {
					if (multiple && Object.keys(calendarColors).length) {
						events = events.map(function(e) {
							if (e.calendarId && calendarColors[e.calendarId]) {
								e.color = calendarColors[e.calendarId];
							}

							return e;
						});
					}

					if (events.length > 0) {
						var startDate = this.getRange(events).start;
						var maxEvents = 40;
						if (events.length > maxEvents) {
							//Remove extra days from array until it is < 40
							var days = 13;
							while (days > 1 && events.length > maxEvents) {
								var endDate = moment(startDate).add(days, 'days');
								events = _.filter(events, function(e) {
									return moment(e.start, moment.ISO_8601).startOf('day').diff(endDate) < 0;
								});
	
								days--;
							}
						}
					}

					this.data = {
						events: events
					};

					var gcalendar = this.elm.children('.gcalendar');
					gcalendar.fullCalendar('removeEventSources');
					gcalendar.fullCalendar('option', 'validRange', this.getRange(events));
					gcalendar.fullCalendar('addEventSource', this.data.events);

					this.utils.saveData(this.data);
				}.bind(this));
			}.bind(this));
		},

		render: function(demo) {
			var data = _.clone(this.data, true);

			data.title = this.config.title;

			if (!demo && (!this.config.calendars || !this.config.calendars.length)) {
				data.noCalendars = true;
				this.utils.render(data);
				return;
			}

			this.utils.render(data);

			if (_.indexOf(["agenda1d", "list2w", "short1d"], this.config.view) < 0) {
				this.config.view = "agenda1d";
			}

			var gcalendar = this.elm.children('.gcalendar');
			var settings = {
				header: {
					left: 'prev,next today',
					center: 'title',
					//right: ''
					right: 'agenda1d,list2w,short1d'
				},
				height: "auto",
				displayEventTime: true, 
				showNonCurrentDates : false,
				eventLimit: true, 
				defaultView: this.config.view,
				eventRender: function(event, element) {
					var location = _.isString(event.location) ? "Location: " + event.location : null;
					var calendar = _.isString(event.calendar) ? "Calendar: " + event.calendar : null;
					element.attr('data-tooltip', [event.description, location, calendar].filter(Boolean).join('<br>'));
				},
				lazyFetching: false,
				viewRender: function(view) {
					if (this.config.view !== view.name) {
						this.config.view = view.name;
						this.utils.saveConfig();
					}
				}.bind(this),
				views: {
					short1d:  {
						type: 'list',
						duration: { weeks: 3 },
						buttonText: 'list'
					},
					list2w:  {
						type: 'basic',
						duration: {days: 1 },
						buttonText: 'short',
						eventLimit: false, 
					},
					agenda1d:  {
						type: 'agenda',
						duration: {days: 1 },
						buttonText: 'agenda'
					}
				}    
			};

			if (this.config.startTime !== this.config.endTime) {
				settings.minTime = this.config.startTime;
				settings.maxTime = this.config.endTime;
			}

			if (!demo) {
				settings.validRange = this.getRange(data.events);
			}

			gcalendar.fullCalendar(settings);
			gcalendar.fullCalendar('removeEventSources');
			gcalendar.fullCalendar('addEventSource', data.events);
			if (demo) {
				setTimeout(function() {
					gcalendar.fullCalendar('refetchEvents');
					gcalendar.fullCalendar('gotoDate', moment("2018-07-19"));
				});
			}

			this.elm.addClass("tabbed");
		},

		getRange: function(events) {
			if (events.length <= 0)	{
				return {
					start: moment().startOf("day"),
					end: moment().add(2, 'weeks').startOf("day")
				};
			}

			var starts = events.map(function(e) { return moment(e.start).startOf("day"); });
			var ends = events.map(function(e) { return moment(e.end).add(1, 'days').subtract(1, 'seconds').startOf("day"); });
			
			return {
				start: starts.reduce(function(a, b) { return a.valueOf() <= b.valueOf() ? a : b; }).format('YYYY-MM-DD'),
				end: ends.reduce(function(a, b) { return a.valueOf() >= b.valueOf() ? a : b; }).format('YYYY-MM-DD')
			};
		}



	};
});