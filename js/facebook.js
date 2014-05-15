var check = function() {
	[].forEach.call(document.querySelectorAll("style"), function(e) {
		if (e.innerText.indexOf("body *") !== -1) {
			e.parentElement.removeChild(e);
		}
	});
};

check();

window.addEventListener("load", check);

window.addEventListener("DOMContentLoaded", function() {
	var stl = document.createElement("style");

	stl.innerText =
	"._5rgr ._120," +
	"._5rgr ._4hkg ._120," +
	"._5rgr ._4hkg .widePic," +
	"._5rgr .widePic {" +
		"margin: 0;" +
	"}" +

	"#m_newsfeed_stream > .storyAggregation.fullwidth {" +
		"display: none;" +
	"}" +

	".touch ._57_6 .scrollArea {" +
		"overflow: auto;" +
	"}";

	document.head.appendChild(stl);

	check();
});