/*
 * The Tasks widget.
 */
define(["lodash", "jquery", "moment", "oauth"], function(_, $, moment, OAuth) {
	return {
		id: 34,
		size: 2,
		order: 8,
		interval: 300000,
		nicename: "tasks",
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
				nicename: "list",
				label: "i18n.settings.list",
				options: "getLists"
			}
		],
		config: {
			title: "i18n.title",
			size: "variable",
			list: ""
		},
		data: {
			items: [
				{
					"id": "1",
					"title": "Sample task"
				},
				{
					"id": "2",
					"title": "An overdue task",
					"due": 1425186000000
				},
				{
					"id": "3",
					"title": "This one has a note, click to see what it says.",
					"notes": "Here's the note, type in this box to edit it.  You can use the buttons at the left below this box to move and delete this task."
				}
			]
		},

		oAuth: false,

		/**
		 * Creates an OAuth instance for this widget
		 *
		 * @api  private
		 */
		setOAuth: function() {
			this.oAuth = new OAuth({
				name: "tasks",
				id: "559765430405-jtbjv5ivuc17nenpsl4dfk9r53a3q0hg.apps.googleusercontent.com",
				secret: "__API_KEY_tasks__",
				scope: "https://www.googleapis.com/auth/tasks"
			});
		},


		/**
		 * Queries and returns a list of task list from the user's Tasks
		 *
		 * @api     public
		 * @param   {Function}  cb  The callback function
		 */
		getLists: function(cb) {
			if (!this.oAuth) this.setOAuth();

			this.oAuth.ajax({
				type: "GET",
				dataType: "json",
				url: "https://www.googleapis.com/tasks/v1/users/@me/lists?fields=items(id%2Ctitle)",
				success: function(d) {
					if (!d || !d.items) return cb("error");

					var taskLists = {};

					d.items.forEach(function(e, i) {
						taskLists[e.id] = e.title;
					});

					cb(taskLists);
				}
			});
		},

		refresh: function() {
			if (!this.oAuth) this.setOAuth();
			if (!this.config.list) return false;

			this.oAuth.ajax({
				type: "GET",
				dataType: "json",
				url: "https://www.googleapis.com/tasks/v1/lists/" + this.config.list + "/tasks?fields=items(completed%2Cdue%2Cid%2Cnotes%2Cstatus%2Ctitle)",
				success: function(d) {
					if (d && d.items) {
						var items = d.items.map(function(e, i) {
							var ret = {
								id: e.id,
								title: e.title.trim(),
								done: e.status == "completed"
							};

							if (e.notes) {
								ret.notes = e.notes.trim();
							}

							if (e.due) {
								// Parsing with this format avoids timezone issues by reducing the precision to YMD
								ret.due = moment(e.due, "YYYY-MM-DD").valueOf();
							}

							return ret;
						});

						this.data = {
							items: items
						};

						this.render();

						this.utils.saveData(this.data);
					}
				}.bind(this)
			});
		},


		/**
		 * Handles the edit/create form save event
		 *
		 * @api     private
		 * @param   {Event}  elm  The edit form
		 */
		save: function(elm) {
			var that = this,
				oAuth = this.oAuth || { ajax: function() {} };

			elm.addClass("transitioning");


			var dta = {
				title: elm.find(".title").val().trim(),
				due: elm.find(".due-date").val().trim() || null,
				notes: elm.find(".notes").val().trim() || null
			};

			if (dta.due) {
				var date = moment(dta.due);

				if (!date.isValid()) {
					date = moment(dta.due, "MMMM D YYYY");
				}

				if (!date.isValid()) {
					dta.due = null;
				}
				else {
					dta.due = date.valueOf();
				}
			}


			var item;

			if (elm.is(this.addForm)) {
				item = $('<div class="item">' + this.utils.renderTemplate("item", this.formatItem(dta)) + "</div>").insertAfter(elm);

				if (dta.due) dta.due = new Date(dta.due);

				oAuth.ajax({
					type: "POST",
					url: "https://www.googleapis.com/tasks/v1/lists/" + this.config.list + "/tasks?fields=id&previous=" + _.last(that.data.items).id,
					data: JSON.stringify(dta),
					contentType: "application/json",
					complete: function(xhr) {
						if (xhr.status == 200 && xhr.responseJSON && xhr.responseJSON.id) {
							item.attr("data-id", xhr.responseJSON.id);

							if (dta.due) dta.due = dta.due.getTime();

							dta.id = xhr.responseJSON.id;

							that.data.items.push(dta);

							that.utils.saveData(that.data);
						}
						else {
							item.remove();
						}
					}
				});

				elm.animate({ height: 0 }, 200, function() {
					elm.remove();

					that.addForm = null;
				});
			}
			else {
				var id = elm.attr("data-id");
				
				item = _.find(this.data.items, {
					id: id
				});

				_.assign(item, dta);

				this.utils.saveData(this.data);

				if (dta.due) dta.due = new Date(dta.due).toISOString();

				oAuth.ajax({
					type: "PATCH",
					url: "https://www.googleapis.com/tasks/v1/lists/" + this.config.list + "/tasks/" + id + "?fields=id",
					data: JSON.stringify(dta),
					contentType: "application/json"
				});

				setTimeout(function() {
					elm.removeClass("edit").html(that.utils.renderTemplate("item", that.formatItem(item))).removeClass("transitioning");
				}, 150);
			}
		},


		/**
		 * Formats a task object for display
		 *
		 * @api     private
		 * @param   {Object}  e  The task object
		 * @return  {Object}     The formatted object
		 */
		formatItem: function(e) {
			var ret = _.clone(e);

			if (e.due) {
				var date = moment(e.due);

				if (Math.abs(date.diff(new Date(), "days")) + 1 > 7) {
					ret.due = date.format("MMMM Do");
				}
				else {
					ret.due = date.calendar().replace(" at 12:00 AM", "").replace("Today at ", "");
				}


				if (date.isBefore(moment().subtract(1, "days"))) {
					ret.overdue = true;
				}
				else if (moment().isSame(date, "day")) {
					ret.duetoday = true;
				}
			}

			return ret;
		},

		render: function(demo) {
			var data = {
				title: this.config.title
			};

			if (!demo && !this.config.list) {
				data.authorize = true;

				return this.utils.render(data);
			}


			data.items = _.map((this.data || {}).items, this.formatItem);

			this.utils.render(data, {
				item: this.utils.getTemplate("item")
			});


			var oAuth = this.oAuth;
			
			// If this is a demo, or not authenticated, it shouldn't attempt any requests
			if (demo || !this.oAuth) {
				oAuth = {
					ajax: function() {}
				};
			}

			var that = this;

			this.elm.off(".tasks")
				.on("click.tasks", "button.add", function(e) {
					if (that.addForm) return;

					that.addForm = $('<div class="item edit transitioning add" style="height: 0;">' + that.utils.renderTemplate("item", { edit: true }) + '</div>');

					$(this).parent().siblings(".items").append(that.addForm);

					requestAnimationFrame(function() {
						that.addForm.removeClass("transitioning").css("height", "").find(".title").focus();
					});
				})
				.on("click.tasks", ".item:not(.edit)", function(e) {
					if ($(e.target).is(".check")) return;

					var item = $(this);

					item.addClass("transitioning");

					setTimeout(function() {
						var itm = _.clone(_.find(that.data.items, {
							id: item.attr("data-id")
						}));

						if (itm && itm.due) {
							itm.due = moment(itm.due).format("MMMM Do YYYY");
						}

						item.addClass("edit").html(that.utils.renderTemplate("item", _.assign(
							{},
							itm,
							{ edit: true }
						))).removeClass("transitioning");

						var val = item.find(".title").focus().val();

						item.find(".title").val(val);
					}, 150);
				})
				.on("click.tasks", ".item.edit .done", function(e) {
					that.save($(this).parent());
				})
				.on("keydown.tasks", ".item.edit input, .item.edit .done", function(e) {
					if (e.which === 13) that.save($(this).parent());
				})
				.on("keydown.tasks", ".item.edit textarea", function(e) {
					if (e.which === 13 && e.shiftKey) that.save($(this).parent());
				})
				.on("click.tasks", ".item.edit .delete", function(e) {
					var item = $(this).parent(),
						id = item.attr("data-id");

					item.css({
						height: 0,
						padding: 0
					}).removeClass("edit");

					oAuth.ajax({
						type: "DELETE",
						url: "https://www.googleapis.com/tasks/v1/lists/" + that.config.list + "/tasks/" + item.attr("data-id") + "",
						complete: function(xhr) {
							if (xhr.status === 200 || xhr.status === 204) {
								setTimeout(function() {
									item.remove();

									_.remove(that.data.items, { id: id });

									that.utils.saveData(that.data);
								}, 200);
							}
							else {
								item.css({
									height: "",
									padding: ""
								}).addClass("edit");
							}
						}
					});
				})
				.on("click.tasks", ".item.edit .move-up", function(e) {
					var item = $(this).parent(),
						id = item.attr("data-id");

					if (!item.prev().length) return;

					item.insertBefore(item.prev());

					oAuth.ajax({
						type: "POST",
						url: "https://www.googleapis.com/tasks/v1/lists/" + that.config.list + "/tasks/" + id + "/move" +
								"?previous=" + item.prev().attr("data-id"),
						success: function(xhr) {
							var idx = _.findIndex(that.data.items, { id: id });

							that.data.items.splice(idx - 1, 0, that.data.items.splice(idx, 1)[0]);

							that.utils.saveData(that.data);
						}
					});
				})
				.on("click.tasks", ".item.edit .move-down", function(e) {
					var item = $(this).parent(),
						id = item.attr("data-id");

					if (!item.next().length) return;

					item.insertAfter(item.next());

					oAuth.ajax({
						type: "POST",
						url: "https://www.googleapis.com/tasks/v1/lists/" + that.config.list + "/tasks/" + id + "/move" +
								"?previous=" + item.prev().attr("data-id"),
						success: function(xhr) {
							var idx = _.findIndex(that.data.items, { id: id });

							that.data.items.splice(idx + 1, 0, that.data.items.splice(idx, 1)[0]);

							that.utils.saveData(that.data);
						}
					});
				})
				.on("focusout.tasks", ".item.edit .due-date", function(e) {
					if (this.value) {
						var date = moment(this.value);

						if (!date.isValid()) {
							date = moment(this.value, "MMMM D YYYY");
						}

						this.value = date.format("MMMM Do YYYY");
					}
				})
				.on("change.tasks", ".item .check", function(e) {
					var check = this,
						id = this.parentNode.getAttribute("data-id");

					oAuth.ajax({
						type: "PATCH",
						url: "https://www.googleapis.com/tasks/v1/lists/" + that.config.list + "/tasks/" + id + "?fields=id",
						data: JSON.stringify({
							status: this.checked ? "completed" : "needsAction",
							completed: this.checked ? new Date() : null
						}),
						contentType: "application/json",
						complete: function(xhr) {
							if (xhr.status !== 200) {
								check.checked = false;
							}
							else {
								_.find(that.data.items, {
									id: id
								}).done = check.checked;

								that.utils.saveData(that.data);
							}
						}
					});
				});
		}
	};
});