/*globals jQuery, window, document */
(function ($, window, document) {
    "use strict";
    window.EVG = window.EVG || {
        init: function () {
            this.expanderAccordion();
            this.exchangeCheck();
        },
        expanderAccordion: function () {
            $(".expander").on("click", function (e) {
                if ($(this).hasClass("on")) {
                    $(this).removeClass("on").parent().find(".expanded").slideUp();
                } else {
                    $(this).parent().siblings().find(".on").removeClass("on");
                    $(this).parent().siblings().find(".expanded").slideUp();
                    $(this).addClass("on").parent().find(".expanded").slideDown();
                }
                e.preventDefault();
            });
        },
        exchangeCheck: function () {
            $(".curr-list").find("a").on("click", function(e) {
                if ($(this).parent().hasClass("active")) {
                    $(this).parent().removeClass("active");
                } else {
                    $(this).parent().siblings().removeClass("active");
                    $(this).parent().addClass("active");
                }
                e.preventDefault();
            });
        }
    };
    $(document).on('ready', function () {
        window.EVG.init();
    });
}(jQuery, window, document));