'use strict';

/**
* Created by kingser on 2016/10/17.
*/
define(function (require, exports, module) {
    'use strict';

    function loadDiag() {
        $('#dialog').dialog({
            autoOpen: false,
            width: 300, title: "过滤器",
            height: 400,
            position: { using: function using(pos) {
                    // var topOffset = $(this).css(pos).offset().top;
                    // if (topOffset = 0||topOffset>0) {
                    $(this).css('left', 600);
                    // }
                } }
        });
        $("#dialog").load("filter.html", function () {
            $.ajax({
                url: '../m?xwl=yardManage/yardedit/getbay', // 跳转到 action
                data: {},
                type: 'post',
                cache: false,
                dataType: 'json',
                success: function success(data) {},
                error: function error() {
                    alert("异常！");
                }
            });
        });
        $('#dialog').dialog('open');;
    }
    module.exports = loadDiag;
});