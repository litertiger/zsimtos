"use strict";

/**
 * Created by kingser on 2016/9/6.
 */

function Ajax(opt) {
  return new Promise(function (resolve, reject) {
    opt.success = function (req) {
      var txt = req.responseText;
      var json = Wb.decode(txt, true);
      resolve(json || txt);
    };

    opt.failure = function (req) {
      var txt = req.responseText;
      var json = Wb.decode(txt, true);
      console.log(opt.url);
      reject(json || txt);
    };
    Wb.request(opt);
  });
}

function Confirm(message, title) {
  return new Promise(function (resolve, reject) {
    Wb.confirm(message, [resolve, reject], null, title);
  });
}

function Load(url, params) {
  return new Promise(function (resolve, reject) {
    Wb.run({
      url: url,
      params: params,
      success: resolve,
      failure: reject
    });
  });
}

function Wait(ms) {
  //
  if (ms === undefined) //如果没有传参数，则判断是不是通过bind方式以this传入超时
    if (isNaN(this)) ms = 0;else ms = this;
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, ms);
  });
}

function ShowProp(category, ts, pos) {
  return Load("m?xwl=yardManage/yardedit/" + category + "DataOper/OperWnd").then(function (app) {
    window.app.propWnd = app.window1;
    if (ts) Wb.setValue(app.window1, ts);
    app.window1.addListener("ok", function () {
      var currentInfo = Wb.getValue(app.window1);

      if (ts) {
        currentInfo.OLD_ID = ts.ID;
        if (!currentInfo.ID) currentInfo.ID = ts.ID;
        ts.setProperties(currentInfo);
        pos = ts.position;
        if (pos) {
          currentInfo.X = pos.x;
          currentInfo.Y = pos.y;
        }
        yardObjDataUpdate(currentInfo, category).then(function () {
          return app.window1.close();
        });
      } else {
        if (pos) {
          currentInfo.X = pos.x;
          currentInfo.Y = pos.y;
        }
        yardObjDataSave(currentInfo, category).then(function () {
          var Obj = seajs.require("main/ct/obj/" + category);
          var obj = new Obj(currentInfo);
          if ("position" in obj) obj.position = pos;
          app.window1.close();
        });
      }
    });
    app.window1.show();
    return app.window1;
  });
}

function PrefixInteger(num, n) {
  return (Array(n).join(0) + num).slice(-n);
}
//数组删除指定元素
function removeByValue(arr, val) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == val) {
      arr.splice(i, 1);
      break;
    }
  }
}

function chkjo(num) {
  //return num?num%2?"����":"ż��":"0"
  return num ? num % 2 ? "s" : "d" : "0";
}

function plancTp(type) {
  var p = {};
  var n = "M0,0 L0,100 L100,100 L90,90 M100,100 L90,110";
  var r = "M0,0 L0,100 L100,100 M0,0 L-10,10 M0,0 L10,10";
  switch (type) {
    case 0:
      p.geometryString = "";
      break;
    case 1:
      p.geometryString = n;
      p.angle = 0;
      break;
    case 2:
      p.geometryString = n;
      p.angle = 90;
      break;
    case 3:
      p.geometryString = n;
      p.angle = 180;
      break;
    case 4:
      p.geometryString = n;
      p.angle = 270;
      break;
    case 5:
      p.geometryString = r;
      p.angle = 0;
      break;
    case 6:
      p.geometryString = r;
      p.angle = 90;
      break;
    case 7:
      p.geometryString = r;
      p.angle = 180;
      break;
    case 8:
      p.geometryString = r;
      p.angle = 270;
      break;
  }
  return p;
}

/*
 *函数功能：从href获得参数
 *sHref:   http://www.artfh.com/arg.htm?arg1=d&arg2=re
 *sArgName:arg1, arg2
 *return:    the value of arg. d, re
 */
function GetArgsFromHref(sHref, sArgName) {
  var args = sHref.split("?");
  var retval = "";

  if (args[0] == sHref) /*参数为空*/{
      return retval;
      /*无需做任何处理*/
    }
  var str = args[1];
  args = str.split("&");
  for (var i = 0; i < args.length; i++) {
    str = args[i];
    var arg = str.split("=");
    if (arg.length <= 1) continue;
    if (arg[0] == sArgName) retval = arg[1];
  }
  return retval;
}
//生成UUID
function uuid() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr(s[19] & 0x3 | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
}
