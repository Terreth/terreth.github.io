(function($) {

	var App = {

		/**
		 * Init Function
		 */
		init: function() {
			$("html").removeClass("no-js");
			App.mainSlider();
			App.scrollAnimations();
			App.popUp();
			App.toolTip();
			App.modalEffects();
			// $('#main-slider').addClass('inview');
			
		},

		mainSlider: function() {
			$('#main-slider').bxSlider({
				mode: 'fade'
			});
		},

		/**
		 * Animations when scrolling - using waypoints plugin (http://imakewebthings.com/jquery-waypoints)
		 */
		scrollAnimations: function() {
			$('#main-slider').waypoint(function(){
				$(this).addClass('inview');
			}
			, {
				triggerOnce: true,
				offset: function(){
					return $(window).height() - $(this).outerHeight() + 400;
				}
			}
			);
		},

		popUp: function() {
			$(document).ready(function() {
				$(".various").fancybox({
					maxWidth	: 1280,
					maxHeight	: 800,
					fitToView	: true,
					width		: '80%',
					height		: '80%',
					autoSize	: false,
					closeClick	: false,
					openEffect	: 'none',
					closeEffect	: 'none',
					padding		: 0
				});
			});
		},

		toolTip: function() {
			$('.bx-prev').tooltip({
				title: function() {
					if($('#main-slider li:visible').prev('li').length === 0) {
						var name = $("#main-slider li:last-child").find('a').attr('title');
						return name;
					} else {
						var name = $('#main-slider li:visible').prev('li').find('a').attr('title');
						return name;
					}
				}
			});
			$('.bx-next').tooltip({
				title: function() {
					if($('#main-slider li:visible').next('li').length === 0) {
						var name = $("#main-slider li:first-child").find('a').attr('title');
						return name;
					} else {
						var name = $('#main-slider li:visible').next('li').find('a').attr('title');
						return name;
					}
				}
			});
		},

		modalEffects: function() {
			$('#myModal').on('show', function () {
				$(this).addClass("scale");
				$(this).addClass("top");
				$("body").addClass("big");
			});
			$('#myModal').on('shown', function () {
				$("body").addClass("light");
			});
			$('#myModal').on('hide', function () {
				var winWidth = $(window).width();
				$(this).removeClass("scale");
				$("body").removeClass("big");
				$("body").removeClass("light");
			});
			$('#myModal').on('hidden', function () {
				$(this).removeClass("top");
			});
			
		}
	}
	
	$(function() {
		App.init();
	});

})(jQuery);
