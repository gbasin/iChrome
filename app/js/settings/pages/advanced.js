/**
 * The advanced settings page
 */
define([
	"lodash", "moment", "browser/api", "i18n/i18n", "modals/alert", "settings/page", "settings/debug", "storage/deprecate"
], function(_, moment, Browser, Translate, Alert, Page, DebugTools, Deprecate) {
	var View = Page.extend({
		id: "advanced",

		monitorProps: ["customCSS"],

		events: {
			"click .backups button.backup": function() {
				this.backup();

				this.render();
			},

			"click .backups button.upload": function() {
				this.$(".backups input[type=file]").click();
			},

			"click .backups .backup button.restore": function(e) {
				this.restore(parseInt(e.currentTarget.parentElement.getAttribute("data-date")));
			},

			"click .backups .backup button.download": function(e) {
				this.download(parseInt(e.currentTarget.parentElement.getAttribute("data-date")));
			},

			"click .debug-tools button": function() {
				if (!this.DebugTools) {
					this.DebugTools = new DebugTools();
				}
				else {
					this.DebugTools.show();
				}
			}
		},


		/**
		 * Creates a new backup
		 *
		 * @param   {Array}  [backups]  An array of existing backups
		 */
		backup: function(backups) {
			if (!Array.isArray(backups)) {
				backups = JSON.parse(Browser.storage.backups || "[]");
			}

			backups.unshift({
				date: new Date().getTime(),
				data: {
					themes: this.model.storage.themes,
					settings: this.model.storage.settings,
					tabs: this.model.storage.tabsSync
				}
			});

			backups = backups.slice(0, 4);

			Browser.storage.backups = JSON.stringify(backups);
			Browser.storage.lastBackup = new Date().getTime();

			backups = null;
		},


		/**
		 * Given a date, restores a backup
		 *
		 * @param   {String|Number}  d  Either a backup's JSON contents or the timestamp of the backup to restore
		 */
		restore: function(d) {
			Alert({
				contents: [Translate("settings.advanced.backups.restore_confirm")],
				confirm: true
			}, function() {
				try {
					var backups = JSON.parse(Browser.storage.backups || "[]"),
						backup;

					if (typeof d === "string") {
						backup = JSON.parse(d).data;
					}
					else {
						// Pull the backup so we can insert a new one without erasing others
						backup = _.pullAt(backups, _.findIndex(backups, "date", d))[0].data;
					}

					// Create a new backup now, before restoring
					this.backup(backups);

					this.model.storage.themes = backup.themes;
					this.model.storage.tabs = Deprecate.tabs(backup.tabs);
					this.model.storage.settings = Deprecate.settings(backup.settings);

					this.model.storage.sync(true, function() {
						this.trigger("restore");

						this.render();
					}.bind(this));
				}
				catch (e) {
					Alert(Translate("settings.advanced.backups.restore_error"));
				}
			}.bind(this));
		},


		/**
		 * Saves a backup to the user's computer as a JSON file
		 *
		 * @param   {Number}  timestamp  The timestamp of the backup to download
		 */
		download: function(timestamp) {
			try {
				var backup = _.find(JSON.parse(Browser.storage.backups || "[]"), "date", timestamp);

				var a = document.createElement("a"),
					url = URL.createObjectURL(new Blob([JSON.stringify(backup)], {
						type: "octet/stream"
					}));

				a.href = url;

				a.download = Translate("settings.advanced.backups.download_name") + " " + moment(timestamp).format("LL") + ".json";

				a.click();

				URL.revokeObjectURL(url);
			}
			catch(e) {}
		},


		/**
		 * Handles the change event on the file input, restoring from an uploaded backup
		 *
		 * @param   {Event}  e  The change event
		 */
		upload: function(e) {
			if (e.currentTarget.files.length) {
				var fr = new FileReader();

				fr.onloadend = function() {
					if (!fr.error) {
						this.restore(fr.result);
					}
				}.bind(this);

				fr.readAsText(e.currentTarget.files[0]);
			}
		},


		/**
		 * General input change handler
		 *
		 * @param   {HTMLElement}  elm    The input element
		 * @param   {String}       name   The name of the input
		 * @param   {String}       value  The value of the input
		 */
		onInputChange: function(elm, name, value) {
			switch (name) {
				case "css":
					this.model.set("customCSS", value);
				break;

				case "backup-upload":
					if (elm.files.length) {
						var fr = new FileReader();

						fr.onloadend = function() {
							if (!fr.error) {
								this.restore(fr.result);
							}
						}.bind(this);

						fr.readAsText(elm.files[0]);
					}
				break;
			}
		},


		onBeforeRender: function(data) {
			return {
				backups: _.map(JSON.parse(Browser.storage.backups || "[]"), function(e) {
					return {
						date: e.date,
						label: e.label || moment(e.date).calendar()
					};
				}),

				css: data.customCSS
			};
		}
	});

	return View;
});