var check = function() {
	if (document.body && document.body.id !== "wunderlist-base") {
		document.body.id = "wunderlist-base";
	}
};

check();

window.addEventListener("load", check);
window.addEventListener("DOMContentLoaded", check);