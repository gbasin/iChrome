define(["lodash", "jquery", "browser/api", "widgets/views/main"], function(_, $, Browser, WidgetView) {
	return WidgetView.extend({
		events: {
			"click button.more": function(e) {
				var expanding = e.currentTarget.getAttribute("data-state") === "collapsed";

				this.$(".forms, ol li .synonyms, ol li .antonyms, ol li:nth-child(n + 2), .usage:nth-of-type(n + 3)")[expanding ? "slideDown" : "slideUp"](300);

				e.currentTarget.textContent = expanding ? "Less" : "More";
				e.currentTarget.setAttribute("data-state", expanding ? "maximized" : "collapsed");
			}
		},

		onBeforeRender: function(data) {
			return data;
		}
	});
});