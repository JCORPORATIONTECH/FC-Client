"use strict";requirejs(["jquery","jqueryCookie"],function(o){function e(o){n.cookie("phone",o)}function c(){h.val(n.cookie("phone"))}function i(){n.removeCookie("phone")}var n=o,s=n("#password"),h=n("#phone"),a=n("#remember"),k=n(".btn_login");!function(){void 0===n.cookie("phone")?(a.removeClass("check_on"),a.addClass("check_off")):(a.removeClass("check_off"),a.addClass("check_on"),c())}(),k.bind("click",function(){void 0===n.cookie("phone")&&a.hasClass("check_on")&&e(h.val())}),a.bind("click",function(){n(this).hasClass("check_on")?(n(this).removeClass("check_on"),n(this).addClass("check_off")):(n(this).removeClass("check_off"),n(this).addClass("check_on")),n(this).hasClass("check_on")||void 0!==n.cookie("phone")&&i()}),h.bind("click",function(o){window.$(".alert").hide()}),s.bind("click",function(o){window.$(".alert").hide()})});
//# sourceMappingURL=../maps/login.js.map
