// Link smooth scrolling

$(document).on('click', 'a.scroller', function(event) {
	event.preventDefault();
	var link = $(this).attr('href');
	//or to scroll to the element with the ID "#someID":
	TweenLite.to(window, 1.5, {scrollTo: link, ease: Power3.easeInOut });

});

// $(window).on('load scroll resize', function() {
// 	var pageY = window.scrollY;
//
// 	$('.parallax:in-viewport').each(function() {
// 		var $this = $(this);
// 		var image = $this.find('.bg');
// 		var formula = (pageY - $this.position().top) / 4
//
// 		TweenLite.to(image, 0, {
// 			y: formula
// 		});
// 	});
// });