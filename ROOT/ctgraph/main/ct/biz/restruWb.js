"use strict";

/**
* Created by kingser on 2016/10/17.
*/
define(function (require, exports, module) {
    'use strict';

    function f(data, col) {
        var newdata = {};
        var datarows = data.rows;
        for (var i = 0; i < datarows.length; i++) {
            var datarow = datarows[i],
                yardno = eval("datarow." + col),
                jobItem = newdata[yardno];
            if (jobItem) {
                newdata[yardno].push(datarow);
            } else {
                newdata[yardno] = [datarow];
            }
        }
        return newdata;
    }

    module.exports = f;
});