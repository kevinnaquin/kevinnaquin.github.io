var kn = {};
var images;

$(document).ready(function() {
	$.ajax({
		cache: false,
		dataType: "json",
		success: function(data) {
			images = data;

			randomizeImages();

			addThumbnails();

			// load images only when they are in view
			$(window).resize(function() {deferedImageLoad(); });
			$(window).scroll(function() {
				showNavbar(); 
				deferedImageLoad(); 
			});
			showNavbar();
			deferedImageLoad();

			enableKeyboardShortcuts();
				
		},
		url: "http://kevinnaquin.com/images.json"
	});
});

function addThumbnails() {
	$.each(
		images,
		function(i, x) {
			var thumbnail = document.createElement("div");
			$(thumbnail).addClass("thumbnail-preview");
			$(thumbnail).addClass("transition");
			$(thumbnail).attr("id", x.hash_id);
			$(thumbnail).click(function() { selectImage(x, i); });
			$(thumbnail).css("opacity", 0);

			$("#thumbnailContainer").append(thumbnail);
		}
	);
}

function deferedImageLoad() {
	var windowTop = $(window).scrollTop();
	var windowBottom = windowTop + $(window).height();
	$.each(
		images,
		function(i, x) {
			var thumbnail = $("#" + x.hash_id);
			var offset = $(thumbnail).offset();
			var divTop = offset.top;
			var divBottom = divTop + $(thumbnail).height();
						
			if (!(divBottom < windowTop) && !(windowBottom < divTop)) {
				if ($(thumbnail).css("backgroundImage") == "none") { loadImage(x); }
			}
		}
	);
}

function deselectImage() {
	var image_full = $("#image");
	$(image_full).css("height", "");
	$(image_full).css("opacity", "");
	$(image_full).css("pointerEvents", "none");
	$(image_full).css("width", "");

	$.each(images, function(i, x) { $("#" + x.hash_id).css("opacity", ""); });
}

function displayImageInfo() {
	var image = kn.selectedImage;
	$("#image").html([
		"f/" + image.f_stop, 
		image.shutter_speed, 
		image.zoom + "mm", 
		"ISO" + image.iso
	].join(" "));
}

function enableKeyboardShortcuts() {
	$(document).on(
		"keydown",
		function(event) {
			switch (event.keyCode) {
				// escape key
				case 27: deselectImage(); break;
				// left arrow key
				case 37: rewind(); break;
				// right arrow key
				case 39: fastForward(); break;	
			}
		}
	);
}		

function hideImageInfo() { $("#image").html(""); }

function fastForward() {
	var index = typeof kn.selectedIndex == "undefined" ? -1 : kn.selectedIndex;
	index++;
	index = index > images.length - 1 ? 0 : index;
	selectImage(images[index], index);
}

function filterImages(filter) {
	if (filter == "all") { 
		$.each(images, function(i, x) { $("#" + x.hash_id).css("display", ""); }); 
	}
	else {
		$.each(
			images,
			function(i, x) {
				var thumbnail = $("#" + x.hash_id);
				if (x.filters.indexOf(filter) > -1) {$(thumbnail).css("display", "");  }
				else { $(thumbnail).css("display", "none"); }
			}
		);
	}
}

function loadImage(image) {
	var img = new Image();
	$(img).load(function() {
		image.height = this.height;
		if (kn.max_height < image.height || !kn.max_height) { kn.max_height = image.height; }
		image.width = this.width;
		if (kn.max_width < image.width || !kn.max_width) { kn.max_width = image.width; }

		var thumbnail = $("#" + image.hash_id);
		$(thumbnail).css("backgroundImage", "url('" + $(this).attr("src") + "')");
		$(thumbnail).css("opacity", "");
	});
	$(img).attr("src", "https://dl.dropboxusercontent.com/s/" + image.hash_id + "/" + image.name + ".JPG");
}

function randomizeImages() { images.sort(function() { return 0.5 - Math.random() }); }

function rewind() {
	var index = typeof kn.selectedIndex == "undefined" ? images.length : kn.selectedIndex;
	index--;
	index = index < 0 ? images.length - 1 : index;
	selectImage(images[index], index);
}

function selectImage(image, index) {
	kn.selectedImage = image;
	kn.selectedIndex = index;

	var thumbnail = $("#" + image.hash_id);

	var background_image = $(thumbnail).css("backgroundImage");
	var image_full = $("#image");
	$(image_full).css("backgroundImage", background_image);
	$(image_full).css("height", image.height);
	$(image_full).css("opacity", 1);
	$(image_full).css("pointerEvents", "auto");
	$(image_full).css("width", image.width);
	if ($(image_full).html() != "") { displayImageInfo(); }


	$.each(images, function(i, x) { $("#" + x.hash_id).css("opacity", 0.1); });

	$(thumbnail).css("opacity", 0);
}

function showNavbar() { 
	$(".navbar").css("opacity", 1); 
	if (kn.hideNavbar) { clearTimeout(kn.hideNavbar); }
	kn.hideNavbar = setTimeout(function() { $(".navbar").css("opacity", 0); }, 5000);
}
