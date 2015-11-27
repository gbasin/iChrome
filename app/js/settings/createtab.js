/**
 * This function creates a new tab
 */
define(["jquery", "lodash", "core/analytics", "storage/defaults", "i18n/i18n", "core/render"], function($, _, Track, Defaults, Translate, render) {
	return function(modal, storage, btns, item, forms) {
		var id = storage.tabs.length + 1,
			tab = _.assign({}, Defaults.tab, {
				id: id,
				columns: [],
				theme: storage.settings.theme,
				name: Translate("settings.specific.default_name"),
				fixed: storage.settings.columns.split("-")[1] == "fixed"
			}),
			medley = storage.settings.columns.split("-")[0] == "medley";

		if (medley) {
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
			themename: (
				!storage.settings.theme ? Translate("settings.visual.theme") :
				(
					storage.cached[storage.settings.theme] || storage.themes[storage.settings.theme.replace("custom", "")] || {}
				).name
			)
		};

		btns.before(render("settings/new-tab", rTab));

		var form = modal.$el.find("form[data-tab='" + id + "']")
			.find("#columns" + id).val(medley ? "medley" : rTab.columns + (rTab.fixed ? "-fixed" : "-fluid")).end();

		item.siblings().add(forms).removeClass("active");

		$('<li data-id="' + id + '">' + Translate("settings.specific.default_name") + '</li>').insertBefore(item).add(form).addClass("active");

		Track.event("Tabs", "Add", "settings-" + storage.tabs.length);
	};
});