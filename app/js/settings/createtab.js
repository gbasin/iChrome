/**
 * This function creates a new tab
 */
define(["jquery", "core/analytics", "storage/defaults", "i18n/i18n", "core/render"], function($, Track, Defaults, Translate, render) {
	return function(modal, storage, btns, item, forms) {
		var id = storage.tabs.length + 1,
			tab = $.extend(true, {}, Defaults.tabs, {
				id: id,
				columns: [],
				name: Translate("settings.specific.default_name"),
				fixed: storage.settings.columns.split("-")[1] == "fixed"
			});

		if (storage.settings.columns.split("-")[0] == "medley") {
			var medley = true;

			tab.columns.push([]);
		}
		else {
			for (var i = storage.settings.columns.split("-")[0]; i > 0; i--) {
				tab.columns.push([]);
			}
		}

		storage.tabs.push(tab);

		var rTab = {
			id: id,
			fixed: tab.fixed,
			theme: storage.settings.theme || "default",
			columns: (medley ? "medley" : (tab.columns.length || 3)),
			alignment: storage.settings.alignment || "center",
			themename: (
				!storage.settings.theme ? Translate("settings.visual.theme") :
				(
					storage.cached[storage.settings.theme] || storage.themes[storage.settings.theme.replace("custom", "")] || {}
				).name
			)
		};

		btns.before(render("settings/new-tab", rTab));

		var form = modal.$el.find("form[data-tab='" + id + "']")
			.find("#columns" + id).val(medley ? "medley" : rTab.columns + (rTab.fixed ? "-fixed" : "-fluid")).end()
			.find("#alignment" + id).val(rTab.alignment).end();

		item.siblings().add(forms).removeClass("active");

		$('<li data-id="' + id + '">' + Translate("settings.specific.default_name") + '</li>').insertBefore(item).add(form).addClass("active");

		Track.event("Tabs", "Add", "settings-" + storage.tabs.length);
	};
});