/*
Copyright (c) putdb.com, all rights reserved.
Contact: contact@putdb.com
Visit: http://www.putdb.com
*/

/**
 * @class Wb
 *
 * Wb 提供了客户端的JavaScript方法库，以方便使用JavaScript进行客户端的编程。
 */
var Wb = {
    /**
     * 修改requset
     * @param options
     * @returns {*}
     */
    requestAg: function(options) {
        var newOptions, params, showMask = Wb.getBool(options.showMask, true),
            oldSuccess = options.success,
            oldFailure = options.failure;

        params = Ext.apply({}, options.params, Wb.getValue(options.out));
        if (!Ext.Object.isEmpty(params))
            options.params = params;
        options.url="m?xwl=system/common/save-all";
        newOptions = Ext.applyIf({
            success: function() {
                if (showMask)
                    Wb.unmask(newOptions.mask, newOptions.message);
                Ext.callback(oldSuccess, newOptions.scope, arguments);
            },
            failure: function(response) {
                if (showMask)
                    Wb.unmask(newOptions.mask, newOptions.message);
                if (Wb.getBool(newOptions.showError, true))
                    Wb.except(response);
                Ext.callback(oldFailure, newOptions.scope, arguments);
            }
        }, options);
        if (showMask)
            Wb.mask(newOptions.mask, newOptions.message);
        return Ext.Ajax.request(newOptions);
    },
  /** @property {String} dateFormat 日期格式，兼容Java Timestamp日期格式 */
  dateFormat: 'Y-m-d H:i:s.u',
  /** @property {String} nullImage 空图片url地址 */
  nullImage: 'wb/images/null.png',
  /** @property {Number} maxInt 兼容Java整数的最大值 */
  maxInt: 2147483647,
  /** @method encode 对字符、数字、日期、对象和数组等进行编码，并转换为以字符串表示的值。
   * @param {Object} value 需要编码的值。
   * @return {String} 编码后的值。
   */
  encode: window.Ext ? Ext.encode : null,
  /** @method decode 对以字符串形式表示的值进行解码，并转换为与之对应的值。
   * @param {String} value 需要解码的值。
   * @return {Object} 解码后的值。
   */
  decode: window.Ext ? Ext.decode : null,
  //使兼容ServerScript
  apply: window.Ext ? Ext.apply : null,
  applyIf: window.Ext ? Ext.applyIf : null,
  //菜单项显示模板
  menuItem: '<div style="height:40px"><div class="wb_gicon">&#x{glyph};</div>{text}</div>',
  //使用prompt创建的窗口列表
  promptWindows: {},
  /**
   * 显示浮动的提示信息窗口。
   * @param {String/Object} message 显示的信息或信息配置对象。
   * @param {Boolean} [topCenter] 是否在顶部中间位置显示，默认在右下角显示。该参数仅适于用桌面。
   */
  toast: window.Ext && Ext.isTouch ? Ext.toast : function(message, topCenter) {
    var config, html;
    if (Ext.isObject(message)) {
      html = message.html;
      config = Wb.exclude(message, 'html');
    } else {
      html = message;
      config = null;
    }
    new Ext.ux.window.Notification(Wb.apply({
      position: topCenter ? 'tc' : 'br',
      html: html,
      bodyPadding: 10,
      closeAction: 'destroy',
      bodyStyle: 'line-height:20px;background:' + (Wb.isNeptune ? '#3892d3;color:white;' : 'transparent;'),
      autoCloseDelay: 4500,
      maxWidth: 500,
      border: false,
      resizable: false,
      slideBackDuration: 500,
      slideInDuration: 500,
      slideInAnimation: 'easeIn',
      slideBackAnimation: 'easeIn',
      listeners: {
        afterrender: {
          single: true,
          fn: function(me) {
            me.header.hide();
            me.mon(me.el, 'mousedown', function(e) {
              //Ctrl允许复制
              if (!e.ctrlKey)
                me.close();
            });
          }
        }
      }
    }, config)).show();
  },
  /**
   * 显示带有标题和图标的浮动提示信息窗口。
   * @param {String/Object} message 显示的信息或信息配置对象。
   * @param {Boolean} [isError] 是否为错误信息，默认为false。
   * @param {Boolean} [topCenter] 是否自顶部中间显示，默认在右下角显示。
   */
  tip: function(message, isError, topCenter) {
    var config, html;
    if (Ext.isObject(message)) {
      html = message.html;
      config = Wb.exclude(message, 'html');
    } else {
      html = message;
      config = null;
    }
    new Ext.ux.window.Notification(Wb.apply({
      title: isError ? Str.error : Str.information,
      position: topCenter ? 'tc' : 'br',
      iconCls: isError ? 'error_icon' : 'message_icon',
      html: html,
      minWidth: 150,
      maxWidth: 500,
      draggable: true,
      bodyPadding: 10,
      closeAction: 'destroy',
      bodyStyle: 'line-height:20px;',
      autoCloseDelay: 4500,
      slideBackDuration: 500,
      slideInDuration: 500,
      slideInAnimation: 'easeIn',
      slideBackAnimation: 'easeIn'
    }, config)).show();
  },
  /**
   * 在Home主页的信息栏显示通知高亮消息。该方法仅在Home主页内有效，否则使用Wb.tip方法替代消息显示。
   * @param {String} html 显示消息的内容。
   * @param {Booleann} [highlight] 是否亮高背景。默认为false。
   * @param {Boolean} [autoClear] 是否自动清除消息内容。false不清除，true 4.5秒后清除消息。默认为false。
   */
  notify: function(html, highlight, autoClear) {
    if (!Wb.hasNS('sys.home')) {
      Wb.tip(html);
      return;
    }
    if (Wb.notifyTimer) {
      clearTimeout(Wb.notifyTimer);
      delete Wb.notifyTimer;
    }
    sys.home.msgLabel.setText(html);
    if (autoClear) {
      Wb.notifyTimer = setTimeout(function() {
        sys.home.msgLabel.setText('');
        delete Wb.notifyTimer;
      }, 4500);
    }
    if (highlight) {
      sys.home.msgLabel.el.highlight('ffff00', {
        duration: 3000
      });
    }
  },
  /**
   * 把对象转换成以字符串形式显示的值。
   * @param {Object} object 转换的对象。
   * @return {String} 字符串形式显示的值。
   */
  toString: function(object) {
    return Object.prototype.toString.call(object);
  },
  /**
   * 遍历数组或对象的各个元素。
   *
   * @param {Array/Object} data 遍历的数组或对象。
   * @param {Function} fn 每遍历一个元素所执行的回调方法。对于数组传递的参数为值和索引，对于对象传递的参数为名称和值。
   * 如果函数返回false，将中断遍历。
   * @param {Boolean} [reverse] 是否倒序遍历，仅适用于数组，默认为false。
   * @return {Boolean} true遍历完成，否则返回索引号（数组）或false（对象）。
   */
  each: function(data, fn, reverse) {
    if (Wb.toString(data) === '[object Array]') {
      var i, j = data.length;
      if (reverse !== true) {
        for (i = 0; i < j; i++) {
          if (fn(data[i], i) === false) {
            return i;
          }
        }
      } else {
        for (i = j - 1; i > -1; i--) {
          if (fn(data[i], i) === false) {
            return i;
          }
        }
      }
    } else {
      var property;
      for (property in data) {
        if (data.hasOwnProperty(property)) {
          if (fn(property, data[property]) === false) {
            return false;
          }
        }
      }
    }
    return true;
  },
  /**
   * 判断指定条目在数组中的位置。
   * @param {Array} array 数组对象。
   * @param {Object} item 需要判断的条目。
   * @return {Number} 条目在数组中的位置。第1个为0，第2个为1，依此类推。-1表示没有找到。
   */
  indexOf: function(array, item) {
    if (!array)
      return -1;
    var i, j;
    j = array.length;
    for (i = 0; i < j; i++)
      if (array[i] === item)
        return i;
    return -1;
  },
  /**
   * 获得指定id名称的dom对象
   * @param {String} id 组件的id名称。
   * @return {DOM} DOM对象。
   */
  dom: function(id) {
    return document.getElementById(id);
  },
  /**
   * 空方法。不执行任何操作，也不返回任何值。
   */
  emptyFn: function() {},
  /**
   * 判断值是否为空。如果值为null, undefined, 空串或数组长度为0，则为空。
   *
   * @param {Object} value 需要判断的值，可以为字符串或数组等。
   * @return {Boolean} 如果为空则返回true，否则返回false。
   */
  isEmpty: function(value) {
    return value === null || value === undefined || value.length === 0;
  },
  /**
   * 客户端wb.js初始化，完成对相关参数的赋值。
   * @param {Object} sysData 系统数据。
   */
  init: function(sysData) {
    Wb.defineConsoleMethods();
    Wb.maskTimeout = sysData.mask === undefined ? 1500 : sysData.mask;
    if (sysData.zo == -1)
      Wb.zoneOffset = -1;
    else
      Wb.zoneOffset = -sysData.zo - (new Date()).getTimezoneOffset();
    //统一监听beforeunload事件
    window.onbeforeunload = Wb.onBeforeUnload = function() {
      if (Wb.unloadEvents) {
        var result, value, count = 0;
        Wb.each(Wb.unloadEvents, function(name, fn) {
          value = fn();
          if (Wb.isValue(value)) {
            if (count === 0)
              result = value;
            count++;
          }
        });
        if (count == 1)
          return result;
        else if (count > 1)
          return Wb.format(Str.itemsInfo, result, count);
      }
    };
    if (window.Ext) {
      if (Ext.isTouch) {
        Wb.theme = sysData.touchTheme || 'classic';
        if (sysData.timeout !== undefined) {
          Ext.Ajax.setTimeout(sysData.timeout);
        }
      } else {
        Wb.theme = sysData.theme || 'gray';
        Wb.editTheme = sysData.editTheme || 'default';
        Wb.isNeptune = Wb.theme == 'neptune';
        Ext.setGlyphFontFamily('FontAwesome');
        Ext.QuickTips.init();
        if (sysData.timeout !== undefined) {
          Ext.Ajax.timeout = sysData.timeout;
          Ext.data.Connection.prototype.timeout = sysData.timeout;
          Ext.data.proxy.Server.prototype.timeout = sysData.timeout;
          Ext.data.JsonP.timeout = sysData.timeout;
          Ext.form.Basic.prototype.timeout = Math.round(sysData.timeout / 1000);
        }
        //取消浏览器退回按钮的导航功能，因易引起误操作
        Ext.getDoc().on('keydown', function(e, t) {
          if (e.getKey() == e.BACKSPACE && (!Wb.isEditor(t) || t.disabled || t.readOnly))
            e.stopEvent();
        });
      }
    }
  },
  /**
   * 定义浏览器控制台常用方法。如果指定控制台方法不存在，方法将不产生任何效果。
   */
  defineConsoleMethods: function() {
    window.Cs = {
      info: function() {
        if (window.console && console.info)
          Function.apply.call(console.info, console, arguments);
      },
      warn: function() {
        if (window.console && console.warn)
          Function.apply.call(console.warn, console, arguments);
      },
      error: function() {
        if (window.console && console.error)
          Function.apply.call(console.error, console, arguments);
      },
      log: function() {
        if (window.console && console.log)
          Function.apply.call(console.log, console, arguments);
      }
    };
  },
  /**
   * 发起HTTP请求至远程服务器，该方法是对Ext.Ajax.request的封装，以提供更多功能，如异常处理、参数传递及mask机制。
   *
   * Example:
   *
   *     Wb.request({url: 'm?xwl=file', params: {foo: 'abc', bar: 123}, success: function(response){
   *       Wb.info(response.responseText);
   *     }});
   *
   * @param {Object} options 配置选项，参见Ext.Ajax.request的options参数。更多的选项：
   * @param {String} [options.message] 请求时显示的mask信息，默认为Str.processing。
   * @param {Boolean} [options.showMask] 指定请求时是否显示mask，默认为true。
   * @param {Element/Component} [options.mask] 指定请求时mask的遮盖对象，默认为整个window。
   * @param {Boolean} [options.showError] 指定是否显示请求返回的错误信息，默认为true。
   * @param {Boolean} [options.rawParams] 是否输出原始的参数，true原始参数，false经过编码后的参数。默认为false。如设置为true，参数param:[1,2,3]将输出多个同名的参数。
   * @param {Component/Component[]} [options.out] 控件列表，指定列表中的所有控件及其子控件值作为参数。
   * @return 请求的对象，通常用于取消请求。
   */
  request: function(options) {
    var newOptions, params, showMask = Wb.getBool(options.showMask, true),
      oldSuccess = options.success,
      oldFailure = options.failure;

    params = Ext.apply({}, options.params, Wb.getValue(options.out));
    if (!Ext.Object.isEmpty(params))
      options.params = params;
    newOptions = Ext.applyIf({
      success: function() {
        if (showMask)
          Wb.unmask(newOptions.mask, newOptions.message);
        Ext.callback(oldSuccess, newOptions.scope, arguments);
      },
      failure: function(response) {
        if (showMask)
          Wb.unmask(newOptions.mask, newOptions.message);
        if (Wb.getBool(newOptions.showError, true))
          Wb.except(response);
        Ext.callback(oldFailure, newOptions.scope, arguments);
      }
    }, options);
    if (showMask)
      Wb.mask(newOptions.mask, newOptions.message);
    return Ext.Ajax.request(newOptions);
  },
  /**
   * 把服务器时间按时差转换成客户端本地时间。
   * @param {Date} date 服务器端时间。
   * @return {Date} 加上时差后的客户端本地时间。
   */
  toLocal: function(date) {
    if (Wb.zoneOffset != -1 && date)
      return Ext.Date.add(date, Ext.Date.MINUTE, Wb.zoneOffset);
    else
      return date;
  },
  /**
   * 显示一个带图表的信息对话框。
   * @param {String} title 标题。
   * @param {String} message 信息。
   * @param {Function} handler 回调函数。当对话框被点击按钮或按键而隐藏时触发。
   * @param {String} handler.buttonId 点击按钮时的值，可能值为ok, yes, no或cancel。
   * @param {String/Ext.dom.Element} animateTarget 对话框显示或隐藏时的动画效果目标id或元素对象。
   * @param {String} icon 显示在对话框中的图标，可能值为Ext.MessageBox.OK, Ext.MessageBox.WARNING,
   * Ext.MessageBox.QUESTION, Ext.MessageBox.ERROR。
   * @return {Ext.window.MessageBox} 对话框对象。
   */
  showIconMessage: function(title, message, handler, animateTarget, icon) {
    if (Ext.isString(message)) {
      message = Ext.String.ellipsis(message, 3000);
      //在路径分隔符"/"或"\"后添加自动换行符
      message = message.replace(/([^<]\/)|(\\)/g, '$&<wbr>');
    }
    if (Ext.isTouch) {
      Ext.Msg.show({
        title: title,
        message: message,
        buttons: Ext.MessageBox.OK,
        fn: handler,
        iconCls: icon
      });
    } else {
      return Ext.Msg.show({
        title: title,
        msg: message,
        buttons: Ext.MessageBox.OK,
        fn: handler,
        icon: icon,
        animateTarget: animateTarget
      });
    }
  },
  /**
   * 显示带消息图标的常规消息对话框。详细说明见 {@link #showIconMessage}。
   */
  info: function(message, handler, animateTarget, title) {
    return Wb.showIconMessage(title || Str.information, message, handler,
      animateTarget, Ext.MessageBox.INFO);
  },
  /**
   * 显示带警告图标的警告信息对话框。详细说明见 {@link #showIconMessage}。
   */
  warn: function(message, handler, animateTarget, title) {
    return Wb.showIconMessage(title || Str.warning, message, handler, animateTarget,
      Ext.MessageBox.WARNING);
  },
  /**
   * 显示带错误图标的错误信息对话框。详细说明见 {@link #showIconMessage}。
   */
  error: function(message, handler, animateTarget, title) {
    return Wb.showIconMessage(title || Str.error, message, handler, animateTarget,
      Ext.MessageBox.ERROR);
  },
  /**
   * 显示带错误图标的异常信息对话框。异常信息来自服务器端，根据服务器端返回的状态码执行异常处理。
   * 如果服务器返回401将打开登录对话框，其他状态码将显示该状态码的错误信息。
   * @param {XMLHttpRequest/Ext.form.action.Submit} response 包含响应数据的对象。
   * Ajax为response对象，form提交方法为action对象。
   * 详细说明见 {@link #showIconMessage}。
   */
  except: function(response, handler, animateTarget) {
    var msg, respText;
    if (Ext.isTouch && response.isUpload || !Ext.isTouch && response instanceof Ext.form.action.Submit) {
      switch (response.failureType) {
        case 'client':
          msg = Str.clientInvalid;
          break;
        case 'connect':
          msg = Str.connectFailure;
          break;
        case 'load':
          msg = Str.loadFailure;
          break;
        default:
          respText = response.result ? response.result.value : null;
          if (Ext.String.startsWith(respText, '$WBE201')) {
            Wb.login();
            return;
          } else {
            if (respText)
              msg = respText;
            else
              msg = (response.response ? response.response.responseText : null) || Str.unknowError;
          }
      }
    } else {
      respText = response.responseText;
      switch (response.status) {
        case 0:
          msg = Str.serverNotResp;
          break;
        case 400:
          msg = Str.e400;
          break;
        case 401:
          Wb.login();
          return;
        case 403:
          msg = Str.e403;
          break;
        case 404:
          msg = Str.e404;
          break;
        default:
          msg = respText || Str.unknowError;
      }
    }
    return Wb.error(msg, handler, animateTarget);
  },
  /**
   * 显示带问号图标的确认对话框。详细说明见 {@link #showIconMessage}。
   *
   * Example:
   *
   *     Wb.confirm('确定要执行吗？', function(){
   *       Wb.info('你点击了确定按钮');
   *     });
   *
   * @param {Function/Function[]} handler 如果参数为函数，则在点击确定按钮时执行；
   * 如果参数为函数数组，则第一个函数在点击确定时执行，第二个函数在没有点击确定时执行。
   */
  confirm: function(message, handler, animateTarget, title) {
    if (Ext.isTouch) {
      return Ext.Msg.show({
        title: title || Str.confirm,
        message: message,
        buttons: Ext.MessageBox.OKCANCEL,
        fn: function(btn) {
          var okHandler, cancelHandler;
          if (Ext.isArray(handler)) {
            okHandler = handler[0];
            if (handler.length > 1)
              cancelHandler = handler[1];
          } else
            okHandler = handler;
          if (btn == 'ok')
            okHandler();
          else if (cancelHandler)
            cancelHandler();
        },
        iconCls: Ext.MessageBox.QUESTION
      });
    } else {
      return Ext.Msg.show({
        title: title || Str.confirm,
        msg: message,
        buttons: Ext.MessageBox.OKCANCEL,
        fn: function(btn) {
          var okHandler, cancelHandler;
          if (Ext.isArray(handler)) {
            okHandler = handler[0];
            if (handler.length > 1)
              cancelHandler = handler[1];
          } else
            okHandler = handler;
          if (btn == 'ok')
            okHandler();
          else if (cancelHandler)
            cancelHandler();
        },
        icon: Ext.MessageBox.QUESTION,
        animateTarget: animateTarget
      });
    }
  },
  /**
   * 按格式化的提示文本显示确定对话框。见：Wb.confirm使用。
   * @param {Ext.data.Model[]} records 记录数组。该方法从这些记录中获取提示信息。
   * @param {Function} [handler] 回调函数。
   * @param {String} [fieldName] 提示文本取自哪个字段。默认为第1个字段。
   * @param {String} [verb] 提示文本中的操作词。默认为Str.del。
   * @param {String/Ext.dom.Element} [animateTarget] 对话框显示或隐藏时的动画效果目标id或元素对象。
   * @return {Ext.window.MessageBox} 对话框对象。
   */
  confirmDo: function(records, handler, fieldName, verb, animateTarget) {
    if (!Ext.isArray(records)) {
      records = records ? [records] : [];
    }
    var message, record, len = records.length;
    if (!verb)
      verb = Str.del;
    if (len === 0) {
      Wb.warn(Wb.format(Str.selectRecord, verb));
      return null;
    } else {
      record = records[0];
      if (!fieldName)
        fieldName = Ext.isTouch ? record.fields.items[0]._name : record.fields.items[0].name;
      if (len == 1) {
        message = Wb.format(Str.singleConfirm, verb, record.get(fieldName));
      } else {
        message = Wb.format(Str.manyConfirm, verb, record.get(fieldName), len);
      }
      return Wb.confirm(message, handler, animateTarget);
    }
  },
  /**
   * 显示带“是”，“否”和“取消”按钮的选择对话框。详细说明见 {@link #showIconMessage}。
   *
   * Example:
   *
   *     Wb.choose('请点击按钮。', function(btn){
   *       Wb.info('你点击了：'+btn);
   *     });
   *
   */
  choose: function(message, handler, animateTarget, title) {
    if (Ext.isTouch) {
      return Ext.Msg.show({
        title: title || Str.confirm,
        message: message,
        buttons: Ext.MessageBox.YESNOCANCEL,
        fn: handler,
        iconCls: Ext.MessageBox.QUESTION
      });
    } else {
      return Ext.Msg.show({
        title: title || Str.confirm,
        msg: message,
        buttons: Ext.MessageBox.YESNOCANCEL,
        fn: handler,
        icon: Ext.MessageBox.QUESTION,
        animateTarget: animateTarget
      });
    }
  },
  /**
   * 以对话框的形式显示登录窗口。
   * @param {Function} [beforeFn] 显示登录对话框后的回调函数。
   * @param {Function} [afterFn] 登录成功后的回调函数。
   */
  login: function(beforeFn, afterFn) {
    if (window.top != window && window.top.Wb) {
      window.top.Wb.login();
      return;
    }
    if (Wb.loginWinShown)
      return;
    else
      Wb.loginWinShown = true;
    if (Ext.isTouch) {
      Wb.run({
        url: 'tlogin',
        success: function(scope) {
          scope.loginSuccess = function(resp) {
            if (scope.saveToggle.getValue())
              Wb.setCookie('sys.username', scope.username.getValue());
            scope.win.destroy();
            Wb.each(scope.dockedItems, function(item) {
              item.show();
            });
            Wb.hasModalWin = false;
            Ext.repaint();
            Ext.callback(afterFn, scope, [scope]);
          };
          if (Wb.hasNS('sys.thome'))
            sys.thome.container.add(scope.win);
          scope.dockedItems = Ext.Viewport.getDockedItems();
          Wb.each(scope.dockedItems, function(item) {
            item.hide();
          });
          Wb.hasModalWin = true;
          scope.win.show();
          Ext.callback(beforeFn, scope, [scope]);
        }
      });
    } else {
      Wb.run({
        url: 'login-win',
        success: function(scope) {
          scope.loginSucessFn = afterFn;
          Ext.callback(beforeFn, scope, [scope]);
        }
      });
    }
  },
  /**
   * 对指定组件覆盖mask，并显示提示信息。如果组件被多次mask，则多条信息同时显示在mask上。组件在开始时只加盖透明mask，
   * 在指定时间之后加盖半透明mask，以防止快速加载时的闪烁，该时间值由变量sys.session.maskTimeout设定。
   *
   * Example:
   *
   *     Wb.mask(null, '正在保存中...');
   *
   * @param {Component/Function} [component] 需要加遮盖的组件，默认为整个窗口。
   * @param {String} [message] 指定覆盖在组件上mask的提示信息，默认为Str.processing。
   * @param {Number} [maskTimeout] 指定多少毫秒后显示mask，默认为sys.session.maskTimeout。
   */
  mask: function(component, message, maskTimeout) {
    var data, unionMsg, body = Ext.getBody(),
      timeout = maskTimeout || Wb.maskTimeout;
    if (Ext.isFunction(component))
      component = component();
    if (!component) {
      if (Ext.isTouch)
        component = Ext.Viewport;
      else
        component = body;
    }
    if (!Wb.isValue(message))
      message = Str.processing;
    if (!component.maskMsgs)
      component.maskMsgs = [];
    component.maskMsgs.push(message);
    //如果存在多个mask信息，剔重后用<br>联合起来显示。
    unionMsg = Ext.Array.unique(component.maskMsgs).join('<br>');
    if (Ext.isTouch) {
      var touchMask = component.getMasked(),
        spinIcon = '<span class="wb_spiner">&#xf110;</span>&nbsp;';
      if (touchMask) {
        if (component.maskMsgs.length == 1) {
          touchMask.updateMaskTimeout(timeout);
          touchMask.show();
        }
        touchMask.setMessage(spinIcon + unionMsg);
      } else {
        component.mask({
          xtype: 'loadmask',
          indicator: false,
          message: spinIcon + unionMsg,
          maskTimeout: timeout
        });
      }
    } else {
      component.mask(unionMsg, null, null, timeout);
      if (component == body) {
        data = (body.$cache || body.getCache()).data;
        if (data.maskShimEl)
          data.maskShimEl.setStyle('zIndex', 90001);
        if (data.maskEl)
          data.maskEl.setStyle('zIndex', 90001);
        if (data.maskMsg)
          data.maskMsg.setStyle('zIndex', 90001);
      }
    }
  },
  /**
   * 移去覆盖在组件上的mask。如果组件被多次mask，则每次unmask仅移去指定信息，直至信息为空而移去mask本身。
   * @param {Component/Function} component 需要移去遮盖的组件，默认为整个窗口。
   * @param {String} [message] 指定移去遮盖在组件上mask的提示信息，默认为Str.processing。
   */
  unmask: function(component, message) {
    var beforeLength, maskMsgs, unionMsg;

    if (Ext.isFunction(component))
      component = component();
    if (!component) {
      if (Ext.isTouch)
        component = Ext.Viewport;
      else
        component = Ext.getBody();
    }
    if (!Wb.isValue(message))
      message = Str.processing;
    maskMsgs = component.maskMsgs;
    if (maskMsgs && maskMsgs.length > 0) {
      beforeLength = maskMsgs.length;
      Ext.Array.remove(maskMsgs, message);
      if (maskMsgs.length === beforeLength)
        throw new Error('The component has no mask with message "' + message + '".');
      if (maskMsgs.length === 0) {
        component.unmask();
      } else {
        unionMsg = Ext.Array.unique(maskMsgs).join('<br>');
        if (Ext.isTouch) {
          var touchMask = component.getMasked();
          if (touchMask)
            touchMask.setMessage('<span class="wb_spiner">&#xf110;</span>&nbsp;' + unionMsg);
        } else
          component.mask(unionMsg, null, null, Wb.maskTimeout);
      }
    } else
      throw new Error('The component has no mask.');
  },
  /**
   * 执行指定控件下所有子控件指定名称的方法。
   * @param {Component} component 需要获取值的组件对象或组件对象列表。
   * @param {String} method 方法名称 需要执行的方法名称。
   * @param {Mixed...} [params] 参数。
   */
  doMethod: function(component, method) {
    var fn, args = arguments;
    Ext.suspendLayouts();
    try {
      component.queryBy(function(item) {
        fn = item[method];
        if (fn && Ext.isFunction(fn))
          fn.call(item, [].slice.call(args, 2));
        return false;
      });
    } finally {
      Ext.resumeLayouts(true);
    }
  },
  /**
   * 判断两个值是否相等。如果值为字符串，则null,undefined和空串都相等。
   * @param {Object} value1 比较的左值。
   * @param {Object} value2 比较的右值。
   * @return {Boolean} 如果值相等返回true，否则返回false。
   */
  equals: function(value1, value2) {
    if (!value1)
      value1 = '';
    if (!value2)
      value2 = '';
    return value1 == value2;
  },
  /**
   * 获取在指定对象中不存在的名称。默认名称如果在对象中不存在则直接返回，
   * 否则在默认名称后添加后缀索引直到名称不在对象中出现。
   * @param {Object} object 包含名称的对象。
   * @param {String} name 默认名称。
   * @return {String} 在对象中不存在的唯一的名称。
   */
  uniqueName: function(object, name) {
    var newName = name,
      index = 1;
    while (newName in object)
      newName = name + index++;
    return newName;
  },
  /**
   * 把文件大小数值转换成以KB或MB为单位的字符串。
   * @param {Number} size 文件大小数值。
   * @return {String} 以KB或MB为单位的值。如果size为非数值返回空串。
   */
  getFileSize: function(size) {
    if (Ext.isNumber(size)) {
      if (size >= 1048576)
        return Wb.format(size / 1048576, '#,##0.#') + ' MB';
      else
        return Wb.format(Math.ceil(size / 1024), '#,##0') + ' KB';
    } else
      return '';
  },
  /**
   * 根据特定节点，获取同一分支指定深度的节点。
   * @param {Ext.data.NodeInterface} node 节点对象，该节点深度必须大于等于所获取的节点。
   * @param {Number} [depth] 所获取节点的深度，默认为0（根节点）。
   * @return {Ext.data.NodeInterface} 如果指定深度的节点存在则返回，否则返回参数node指定的节点。
   */
  getNode: function(node, depth) {
    if (depth === undefined)
      depth = 0;
    while (node && node.getDepth() > depth) {
      node = node.parentNode;
    }
    return node;
  },
  /**
   * 转到控件所在的Tab，包含该控件的所有Tab选项卡都将被激活。。
   * @param {Component} component 需要转到的控件。
   */
  turnTab: function(component) {

    var x = component,
      y = x,
      components = [];
    Ext.suspendLayouts();
    try {
      while ((x = x.ownerCt)) {
        if (x instanceof Ext.tab.Panel)
          components.push(y);
        y = x;
      }
      while ((x = components.pop())) {
        x.ownerCt.setActiveTab(x);
      }
    } finally {
      Ext.resumeLayouts(true);
    }
  },
  /**
   * 显示对话框窗口并获取输入的值。
   *
   * Example:
   *
   *     Wb.prompt({title:'查询', iconCls: 'new_icon',
   *       items: [{fieldLabel: '姓名', allowBlank: false, itemId: 'name'}, {fieldLabel: '身高', xtype: 'numberfield'}],
   *       handler:function(values, win) {
   *         alert(Wb.encode(values));
   *         win.close();
   *       }});
   *
   * @param {Object} configs 配置选项。
   * @param {Object/Object[]} configs.items 对话框子控件配置项。每个子控件允许配置itemId作为控件的名称。配置
   * 控件saveKeyname为唯一名称，用于保存控件的最后输入值。当子控件为下拉框时，配置pickKeyname为唯一的名称，用于保
   * 存用户输入值作为下拉列表。该属性对应Ext.container.Container的items属性。
   * @param {Function} configs.handler 点击确定按钮后执行的回调函数。
   * @param {Object} configs.handler.values 值对象，例如：{itemId1:'abc',itemId2:123}。
   * @param {Ext.window.Window} configs.handler.win 窗口对象。
   * @param {Object} configs.defaults 窗口内组件的默认值。
   * @param {Object} configs.isUpload 是否为上传模式，上传模式使用form提交。
   * @param {Object} configs.windowName 如果指定该值，窗口关闭时将隐藏，下次调用时将不创建新实例而直接显示，同时
   * 每次将更新和应用以下属性title,iconCls,handler,focusControl。
   * @param {Object} configs.autoReset 指定窗口隐藏时是否重置所有控件值，默认为true。
   * @param {Object} configs.resetScrollbar 指定窗口隐藏后显示时是否重置垂直滚动条位置，默认为false。
   * @param {Mixed...} configs.more 窗口更多配置项，见Ext.window.Window。
   * @return {Ext.window.Window} 窗口对象。
   */
  prompt: function(configs) {
    if (Ext.isTouch) {
      var panel = Wb.touchPrompt(configs);
      focusComp(panel, configs.focusControl);
      return panel;
    }

    function saveData() {
      if (!Wb.promptPickList)
        Wb.promptPickList = {};
      if (!Wb.promptSaveList)
        Wb.promptSaveList = {};
      win.queryBy(function(item) {
        var name = item.pickKeyname,
          arr, value, index;
        if (item.saveKeyname)
          Wb.promptSaveList[item.saveKeyname] = item.getValue();
        if (name && item instanceof Ext.form.field.ComboBox) {
          arr = Wb.promptPickList[name];
          value = item.getValue();
          if (Wb.isEmpty(value))
            return;
          if (!arr) {
            Wb.promptPickList[name] = [value];
            item.store.add({
              field1: value,
              field2: value
            });
          } else {
            index = Wb.indexOf(arr, value);
            if (index != -1) {
              arr.splice(index, 1);
              item.store.clearFilter();
              item.store.removeAt(index);
            }
            arr.unshift(value);
            item.store.insert(0, {
              field1: value,
              field2: value
            });
          }
        }
        return false;
      });
    }

    function focusComp(win, focusControl) {
      var field;
      if (win.items.getCount() > 0 && focusControl !== null) {
        if (focusControl)
          field = win.down('#' + focusControl);
        else
          field = win.query('field')[0];
        if (field && field.focus) {
          if (Ext.isTouch)
            setTimeout(function() {
              field.focus();
            }, 50);
          else
            field.focus(true, true);
        }
      }
    }

    function setItems(items) {
      Wb.each(items, function(item) {
        if (!item.id)
          item.id = Wb.getId();
        if (!Wb.getBool(item.allowBlank, true)) {
          if (item.fieldLabel)
            item.fieldLabel = '* ' + item.fieldLabel;
        }
        if (Wb.promptPickList && item.pickKeyname && (Wb.isEmpty(item.store) || Ext.isArray(item.store)))
          item.store = Ext.Array.merge(
            Wb.promptPickList[item.pickKeyname] || [],
            item.store || []);
        if (item.readOnly) {
          item.selectOnFocus = true;
        }
        if (item.items && Ext.isArray(item.items))
          setItems(item.items);
      });
    }

    function setDefaultValue(items) {
      Wb.each(items, function(item) {
        if (Wb.promptSaveList && item.saveKeyname && Wb.promptSaveList[item.saveKeyname] !== undefined)
          Ext.getCmp(item.id).setValue(Wb.promptSaveList[item.saveKeyname]);
        if (item.items && Ext.isArray(item.items))
          setDefaultValue(item.items);
      });
    }

    if (configs.windowName) {
      var saveWin = Wb.promptWindows[configs.windowName];
      if (saveWin) {
        if (configs.resetScrollbar)
          saveWin.body.dom.scrollTop = 0;
        saveWin.setTitle(configs.title);
        saveWin.setIconCls(configs.iconCls);
        saveWin.handler = configs.handler;
        Wb.activePrompt = saveWin;
        saveWin.show();
        focusComp(saveWin, configs.focusControl);
        return saveWin;
      }
    }

    var win, items, focusControl, copyConfigs;
    copyConfigs = Ext.apply({}, configs);
    delete copyConfigs.defaults;
    delete copyConfigs.listeners;
    copyConfigs = Ext.apply({
      width: 500,
      minWidth: 100,
      minHeight: 100,
      maximizable: true,
      resizable: true,
      overflowX: 'hidden',
      overflowY: 'auto',
      bodyPadding: '2 10 10 10',
      modal: true,
      dialog: true,
      layout: 'anchor',
      items: items,
      defaults: {
        labelWidth: 100,
        labelAlign: 'right',
        xtype: 'textfield',
        margin: '8 0 0 0',
        anchor: '-16'
      },
      listeners: {
        close: function() {
          Wb.activePrompt = null;
        },
        ok: function() {
          saveData();
          Ext.callback(win.handler, win, [Wb.getValue(win), win]);
        }
      }
    }, copyConfigs);
    if (Wb.getBool(copyConfigs.autoReset, configs.windowName))
      copyConfigs.listeners.hide = function(me) {
        Wb.reset(me);
      };
    if (!configs.windowName)
      copyConfigs.closeAction = 'destroy';
    Ext.apply(copyConfigs.defaults, configs.defaults);
    Ext.apply(copyConfigs.listeners, configs.listeners);
    items = copyConfigs.items;
    if (!Ext.isArray(items))
      items = [items];
    setItems(items);
    focusControl = copyConfigs.focusControl;
    delete copyConfigs.focusControl;
    if (copyConfigs.isUpload) {
      copyConfigs.items = {
        xtype: 'form',
        itemId: 'form',
        layout: copyConfigs.layout,
        border: false,
        overflowX: 'hidden',
        overflowY: 'auto',
        defaults: copyConfigs.defaults,
        bodyStyle: 'background:transparent;',
        items: copyConfigs.items
      };
      delete copyConfigs.defaults;
      delete copyConfigs.overflowX;
      copyConfigs.layout = 'fit';
      delete copyConfigs.overflowY;
    }
    win = new Ext.window.Window(copyConfigs);
    Wb.activePrompt = win;
    win.show();
    if (!configs.win)
      win.setHeight(Math.min(win.getHeight() + 4, Ext.Element.getViewportHeight() - 8));
    Ext.suspendLayouts();
    try {
      setDefaultValue(items);
    } finally {
      Ext.resumeLayouts(true);
    }
    focusComp(win, focusControl);
    if (copyConfigs.windowName) {
      Wb.promptWindows[copyConfigs.windowName] = win;
      if (copyConfigs.destroyOn)
        copyConfigs.destroyOn.mon(copyConfigs.destroyOn, 'destroy', function() {
          win.destroy();
          delete Wb.promptWindows[copyConfigs.windowName];
        });
    }
    return win;
  },
  /**
   * Touch Prompt方法，使用说明见Wb.prompt。
   */
  touchPrompt: function(configs) {
    var panel, handler = configs.handler,
      dockedItems = Ext.Viewport.getDockedItems();
    Wb.each(dockedItems, function(item) {
      item.hide();
    });
    Wb.hasModalWin = true;

    function okHandler() {
      if (handler) {
        if (Wb.verify(panel))
          Ext.callback(handler, panel, [Wb.getValue(panel), panel]);
      } else panel.destroy();
    }
    panel = Ext.Viewport.add({
      xtype: 'formpanel',
      height: '100%',
      scrollable: true,
      width: '100%',
      left: 0,
      top: 0,
      listeners: {
        action: function() {
          okHandler();
        },
        destroy: function() {
          Wb.each(dockedItems, function(item) {
            item.show();
          });
          Wb.hasModalWin = false;
          Ext.repaint();
        }
      },
      items: [{
        xtype: 'titlebar',
        title: configs.title,
        docked: 'top',
        items: [{
          xtype: 'button',
          text: Str.cancel,
          align: 'left',
          handler: function(me) {
            Wb.each(dockedItems, function(item) {
              item.show();
            });
            me.up('panel').destroy();
          }
        }, {
          xtype: 'button',
          text: Str.ok,
          align: 'right',
          handler: function(me) {
            okHandler();
          }
        }]
      }, {
        xtype: 'fieldset',
        defaults: {
          xtype: 'textfield'
        },
        items: configs.items
      }]
    });
    return panel;
  },
  /**
   * 显示获取文本对话框窗口。
   * @param {String} title 窗口标题。
   * @param {Function} handler 点击确定后的回调函数，可用参数value和window，分别表示文本框输入值和窗口对象。
   * @param {Object} [configs] 窗口配置参数，指定allowBlank为false可设置文本框不允许为空，指定value属性可设置文本框默认值。
   * @return {Ext.window.Window} 窗口对象。
   */
  promptText: function(title, handler, configs) {
    var cfg = Ext.apply({}, configs),
      allowBlank, value;
    allowBlank = cfg.allowBlank;
    value = cfg.value;
    if (cfg.allowBlank)
      delete cfg.allowBlank;
    if (cfg.value)
      delete cfg.value;
    return new Ext.window.Window(Ext.apply({
      title: title,
      autoShow: true,
      modal: true,
      maximizable: true,
      layout: 'fit',
      iconCls: 'edit_icon',
      dialog: true,
      width: 500,
      height: 300,
      resizable: true,
      focusControl: 'text',
      listeners: {
        ok: function(win) {
          if (handler)
            handler(win.getComponent('text').getValue(), win);
        }
      },
      items: [{
        allowBlank: allowBlank === undefined ? true : allowBlank,
        itemId: 'text',
        xtype: 'textarea',
        value: value || ''
      }]
    }, configs));
  },
  /**
   * 打开显示文本的对话框窗口。
   * @param {String} title 窗口标题。
   * @param {String} text 要显示的文本。
   * @param {Object} [configs] 窗口内textArea控件的配置项。
   * @return {Ext.window.Window} 窗口对象。
   */
  viewText: function(title, text, configs) {
    return new Ext.window.Window({
      title: title,
      autoShow: true,
      layout: 'fit',
      modal: true,
      maximizable: true,
      resizable: true,
      iconCls: 'property_icon',
      width: 600,
      height: 450,
      items: Wb.apply({
        xtype: 'textarea',
        fieldStyle: 'line-height:1.5',
        readOnly: true,
        value: text
      }, configs),
      buttons: [{
        text: Str.close,
        iconCls: 'close_icon',
        handler: function() {
          this.up('window').close();
        }
      }]
    });
  },
  /**
   * 获取指定控件及其所包含控件的值组成的对象，对象中每个值的名称为指定控件的itemId。
   * 如果控件下存在重复itemId的控件，则只返回第一个控件值，其余重名的控件将被忽略。
   * Example:
   *
   *     var jsonObject1 = Wb.getValue(app.window1); //获取window1下所有控件的值组成的对象
   *     var jsonObject2 = Wb.getValue([text1, date1]); //获取text1和date1的值组成的对象
   *
   * @param {Component/Component[]} components 需要获取值的组件对象或组件对象列表。
   * @param {String/String[]} [itemIds] 需要获取值的组件itemId名称或名称列表，如果值为空则返回所有控件的值。
   * @param {Boolean} [getFileName] 是否获取文件控件的文件名称，默认为false。
   * @return {Object} 获取的控件值组成的对象。
   */
  getValue: function(components, itemIds, getFileName) {
    var result = {},
      fileType = Ext.isTouch ? Ext.field.File : Ext.form.field.File;
    if (!components)
      return result;

    function query(item) {
      var textValue, itemId = item.itemId;
      if (itemId && item.getValue && (!itemIds || Wb.indexOf(itemIds, itemId) != -1) &&
        !result.hasOwnProperty(itemId)) {
        if (item.getTextValue) { //获得显示值
          result['%' + itemId] = item.rawValue; //getTextValue();
        }
        if (item instanceof fileType) {
          result['$' + itemId] = item.removeFile ? 1 : 0;
          if (getFileName) {
            result[itemId] = item.getValue();
            //如果文件为空且显示clearIcon，则表示该文件存在值
            if (Ext.isTouch && !result[itemId] && item.element.hasCls(Ext.baseCSSPrefix + 'field-clearable'))
              result[itemId] = '(file)';
          }
        } else result[itemId] = item.getValue();
      }
      return false;
    }
    if (!Ext.isArray(components))
      components = [components];
    if (itemIds && !Ext.isArray(itemIds))
      itemIds = [itemIds];
    Wb.each(components, function(comp) {
      query(comp);
      if (comp.queryBy)
        comp.queryBy(query);
    });
    return result;
  },
  /**
   * 获取某个控件下第一个指定itemId控件的值。
   *
   * Example:
   *
   *     var dateValue = Wb.getVal(window1, 'date1'); //获取window1下itemId为date1的控件日期值
   *
   * @param {Component/Component[]} component 需要获取值的组件对象或组件对象列表。
   * @param {String} [itemId] 需要返回值的控件itemId名称，如果缺省该值则返回component[0]指定的值。
   * @return {Object} 获取的指定控件的值。
   */
  getVal: function(component, itemId) {
    if (!component)
      return undefined;
    if (!itemId) {
      if (Ext.isArray(component))
        itemId = component[0].itemId;
      else
        itemId = component.itemId;
    }
    return Wb.getValue(component, itemId)[itemId];
  },
  /**
   * 对指定控件下的一组控件进行赋值，其值由values对象指定，values中的每一子项的名称为控件的itemId，值为控件值。
   *
   * Example:
   *
   *     Wb.setValue(window1,{text1: 'foo', date1: new Date()});
   *
   * @param {Component/Component[]} components 顶层控件对象列表，只有在指定控件下的控件值才被设置。
   * @param {Object} values 包含一组控件itemId和值组成的Object对象。
   */
  setValue: function(components, values) {
    if (!components)
      return;
    var fileType = Ext.isTouch ? Ext.field.File : Ext.form.field.File;
    Ext.suspendLayouts();
    try {
      function query(item) {
        var itemId = item.itemId;
        if (itemId && values.hasOwnProperty(itemId) && item.setValue) {
          if (item instanceof fileType) {
            if (values[itemId]) {
              if (Ext.isTouch)
                item.showClearIcon(); //如果有文件值显示clearIcon
              else
                item.inputEl.dom.value = values[itemId] ? Str.hasFile : ''; //仅用于显示
            }
          } else
            item.setValue(values[itemId]);
        }
        return false;
      }
      if (!Ext.isArray(components))
        components = [components];
      Wb.each(components, function(comp) {
        query(comp);
        if (comp.queryBy)
          comp.queryBy(query);
      });
    } finally {
      Ext.resumeLayouts(true);
    }
  },
  /**
   * 设置某个控件下指定itemId控件的值。
   *
   * Example:
   *
   *     Wb.setVal(window1,'date1', new Date()); //设置window1下itemId为date1的控件值为new Date()
   *
   * @param {Component/Component[]} component 顶层控件对象，只有在指定控件下的控件值才被设置。
   * @param {String} itemId 需要设置值的控件itemId名称。
   * @param {Object} value 需要设置的值。
   */
  setVal: function(component, itemId, value) {
    var val = {};
    val[itemId] = value;
    Wb.setValue(component, val);
  },
  /**
   * 重置指定控件的滚动条指顶部。仅用于touch模式。
   * @param {Component} component 需要重置的组件对象。
   */
  resetScroll: function(component) {
    component.getScrollable().getScroller().scrollTo(0, 0);
  },
  /**
   * 重置指定控件及其所包含控件的值。
   * @param {Component/Component[]} components 需要重置值的组件对象或组件对象列表。
   * @param {String/String[]} itemIds 需要重置值的组件itemId名称或名称列表，如果值为null则重置所有控件的值。
   */
  reset: function(components, itemIds) {
    if (!components)
      return;
    Ext.suspendLayouts();
    try {
      function query(item) {
        var itemId = item.itemId;
        if (itemId && item.reset && (!itemIds || Wb.indexOf(itemIds, itemId) != -1)) {
          item.reset();
        }
        return false;
      }
      if (!Ext.isArray(components))
        components = [components];
      if (itemIds && !Ext.isArray(itemIds))
        itemIds = [itemIds];
      Wb.each(components, function(comp) {
        query(comp);
        if (comp.queryBy)
          comp.queryBy(query);
      });
    } finally {
      Ext.resumeLayouts(true);
    }
  },
  /**
   * 获取指定容器及其下每一个具有itemId属性的组件的实例引用组成的对象。
   *
   * Example:
   *
   *     var refer = Wb.getRefer(viewport1);
   *     Wb.info(refer.text1.getValue()); // refer.text1指向viewport1下的text1控件
   *
   * @param {Component/Component[]} components 需要获取引用的顶层容器控件列表。
   * @param {Object} [object] 被添加引用的对象，实例的引用将被添加到该对象。如果名称已经存在，
   * 那么之前的引用将被覆盖。如果缺少该值，系统将创建新的对象来存放引用。
   * @return {Object} 包含引用的对象。
   */
  getRefer: function(components, object) {
    function query(item) {
      var itemId = item.itemId;
      if (itemId)
        object[itemId] = item;
      return false;
    }
    if (!object)
      object = {};
    if (components && !Ext.isArray(components))
      components = [components];
    Wb.each(components, function(comp) {
      query(comp);
      if (comp.queryBy)
        comp.queryBy(query);
    });
    return object;
  },
  /**
   * 对指定组件进行高亮操作。如果未指定warning则采用默认高亮方案，否则采用红色渐变1.5秒。
   * @param {Element/Node} comp 需要高亮的元素。
   * @param {Boolean} [warning] 是否采用警告的高亮方案。
   */
  highlight: function(comp, warning) {
    var el;
    if (comp.isNode) {
      el = comp.getOwnerTree().view.getNode(comp);
      if (el) {
        el = Ext.fly(el);
      }
    } else el = comp;
    if (el) {
      if (comp.isHighlighting)
        return;
      comp.isHighlighting = true;
      if (warning) {
        el.highlight('ff0000', {
          duration: 1500,
          callback: function() {
            delete comp.isHighlighting;
          }
        });
      } else {
        el.highlight(null, {
          duration: 1500,
          callback: function() {
            delete comp.isHighlighting;
          }
        });
      }
    }
  },
  /**
   * 验证可编辑表格数据是否合法。如果非法，系统将把焦点转到第一个非法的单元格。
   * @param {Ext.grid.Panel/Ext.data.Store} object 表格或store对象。
   * @return {Boolean} true合法，false不合法。
   */
  verifyGrid: function(object) {
    var i, j, col, cols, store, valid = true,
      grid = object.bindTable || object,
      editing = Wb.findEditing(grid);
    if (!editing) return true;
    editing.completeEdit();
    cols = Wb.fetchColumns(grid);
    j = cols.length;
    store = grid.store;
    store.each(function(rec) {
      for (i = 0; i < j; i++) {
        col = cols[i];
        if ((col.editor && !col.editor.readOnly && col.editor.allowBlank === false ||
            col.field && !col.field.readOnly && col.field.allowBlank === false) &&
          !col.hidden && Wb.isEmpty(rec.get(col.dataIndex))) {
          valid = false;
          editing.startEdit(rec, col);
          if (editing.activeEditor)
            editing.activeEditor.field.validate();
          return false;
        }
      }
    });
    return valid;
  },
  /**
   * 对指定的控件及其子控件值的合法性进行校验。当存在非法值时，系统将对控件进行标记，
   * 并把焦点转到第一个存在非法值的控件上。
   *
   * Example:
   *
   *     if(Wb.verify(window1))
   *       alert('window1下所有控件的值合法。');
   *
   * @param {Component/Component[]} components 需要验证的控件。
   * @return {Boolean} 如果验证的所有控件的值合法，返回true，否则返加false。
   */
  verify: function(components) {
    var list, firstComp;
    if (Ext.isArray(components))
      list = components;
    else
      list = [components];

    function getFieldName(item) {
      var fieldName;
      if (item.getLabel)
        fieldName = item.getLabel();
      if (!fieldName)
        fieldName = item.getPlaceHolder();
      if (!fieldName)
        fieldName = Str.thisField;
      return fieldName;
    }

    function query(item) {
      if (Ext.isTouch) {
        if (firstComp)
          return false;
        var fieldValue, notHidden = !Wb.isHidden(item);
        if (item.getRequired && item.getRequired() && item.getValue && notHidden &&
          (!item.isDisabled || !item.isDisabled()) && (!item.getReadOnly || !item.getReadOnly()) &&
          Ext.isEmpty(item.getValue())) {
          firstComp = item;
          Wb.warn(Wb.format(Str.requiredField, getFieldName(item)), function() {
            if (item.focus)
              item.focus(true, true);
          });
        } else if (notHidden && item instanceof Ext.field.DateTime) {
          fieldValue = item.getValue();
          if (fieldValue && !Ext.isDate(fieldValue)) {
            firstComp = item;
            Wb.warn(Wb.format(Str.invalidValue, getFieldName(item)), function() {
              item.focus(true, true);
            });
          }
        }
      } else {
        if (item instanceof Ext.form.field.ComboBox)
          item.assertValue();
        if (item.validate && !item.hidden && !item.disabled && !item.readOnly && !item.validate() && !firstComp && !item.inEditor)
          firstComp = item;
      }
      return false;
    }

    Ext.suspendLayouts();
    try {
      Wb.each(list, function(comp) {
        query(comp);
        if (comp.queryBy) {
          comp.queryBy(query);
        }
      });
    } finally {
      Ext.resumeLayouts(true);
    }
    if (Ext.isTouch) {
      return !firstComp;
    } else {
      if (firstComp) {
        Wb.turnTab(firstComp);
        if (firstComp.focus) {
          if (firstComp instanceof Ext.form.field.Base)
            firstComp.focus(true, true);
          else firstComp.focus();
        }
        return false;
      } else
        return true;
    }
  },
  isHidden: function(comp) {
    var ct = comp;
    do {
      if (ct.isHidden && ct.isHidden())
        return true;
      ct = ct.parent;
    } while (ct);
    return false;
  },
  /**
   * 引用正则表达式，把正则表达式转换为普通的字符串。
   * @param {RegExp} regexp 正则表达式。
   * @return {String} 正则表达式各个字符对应的普通字符串。
   */
  quoteRegexp: function(regexp) {
    return regexp.replace(/[.?*+\^$\[\]\\(){}|\-]/g, '\\$&');
  },
  /**
   * 判断值是否为不是null和undefined的值。
   * @param {Object} value 任意值。
   * @return {String} 如果值为null或undefined则返回false，否则返回true。
   */
  isValue: function(value) {
    return value !== null && value !== undefined;
  },
  /**
   * 获取参数列表中首个不等于undefined的值。
   * @return {Object} 首个不等于undefined的值或undefined。
   */
  getDefined: function() {
    var v, i, j = arguments.length;
    for (i = 0; i < j; i++) {
      v = arguments[i];
      if (v !== undefined) {
        return v;
      }
    }
    return undefined;
  },
  /**
   * 查找表格中包含的编辑插件。如果找到则返回该插件，否则返回null。
   * @param {Ext.grid.Panel/Ext.data.Store} object 表格或store对象。
   * @return {Editing} 编辑插件或null。
   */
  findEditing: function(object) {
    var grid = object.bindTable || object;
    return grid.findPlugin('cellediting') || grid.findPlugin('rowediting');
  },
  /**
   * 删除表格中的记录、树的节点或指定的控件。如果删除的对象为表格或树，则在删除后将自动选中被删除记录的最近记录。
   * 1component为树，删除树节点；2compnent为表格，删除表格记录；3component为树节点数据，删除数组中的所有节点；
   * 4component为树节点数组,删除数组中的节点；5component为其他数组，删除数组中值为items的元素。
   *
   * Example:
   *
   *     Wb.remove(grid1); //删除grid1中选择的记录
   *
   * @param {Component} component 需要删除子项的对象。
   * @param {Array} [items] 需要删除的子项条目列表。如果删除对象为表格或树，缺省该值时将删除选中的表格记录或树节点。
   * 如果删除树节点且指定该项值，节点须按深度进行逆向排序（因为删除上级节点后无法删除下级节点），见{@link #reverse}。
   * @param {Boolean} [doSelect] 删除后是否选择下一个节点/记录，默认为true。
   */
  remove: function(component, items, doSelect) {
    if (Ext.isTouch) {
      if (!items)
        items = component.getSelection();
      component.store.remove(items);
      return;
    }
    var index, lastIndex, isArray = Ext.isArray(component),
      isNodeArray = isArray && (component[0] instanceof Ext.data.Model);
    if (isArray && !isNodeArray) {
      Ext.Array.remove(component, items);
      return;
    }
    doSelect = Wb.getBool(doSelect, true);
    if (items && !Ext.isArray(items))
      items = [items];
    Ext.suspendLayouts();
    try {
      if (component instanceof Ext.tree.Panel || component instanceof Ext.data.TreeStore) {
        //删除树节点
        component = component.bindTable || component;
        if (!items)
          items = Wb.reverse(component.getSelection());
        if (items.length === 0)
          return;
        var node, parentNode, willSelNode;
        if (doSelect) {
          node = items[items.length - 1];
          parentNode = node.parentNode;
          //找下一个非选择的节点
          willSelNode = node;
          while (true) {
            willSelNode = willSelNode.nextSibling;
            if (Wb.indexOf(items, willSelNode) == -1)
              break;
          }
          if (!willSelNode) {
            //找上一个非选择的节点
            willSelNode = node;
            while (true) {
              willSelNode = willSelNode.previousSibling;
              if (Wb.indexOf(items, willSelNode) == -1)
                break;
            }
          }
          if (!willSelNode && parentNode)
            willSelNode = parentNode;
        }
        Wb.each(items, function(n) {
          n.remove();
        });
        if (doSelect) {
          if (willSelNode && (willSelNode.parentNode || component.rootVisible))
            component.setSelection(willSelNode);
        }
      } else if (component instanceof Ext.grid.Panel || component instanceof Ext.data.Store) {
        //删除表格中的记录
        component = component.bindTable || component;
        var editing = Wb.findEditing(component);
        if (editing)
          editing.completeEdit();
        if (!items)
          items = component.getSelection();
        if (items.length === 0)
          return;
        if (doSelect)
          index = component.store.indexOf(items[0]);
        if (component instanceof Ext.grid.property.Grid)
          component.removeProperty(items[0].data.name);
        else {
          component.store.remove(items);
          Wb.refreshRowNum(component);
        }
        if (doSelect) {
          lastIndex = component.store.getCount() - 1;
          if (index > lastIndex)
            index = lastIndex;
          if (index > -1)
            component.setSelection(index);
        }
      } else if (component instanceof Ext.view.View) {
        //删除DataView中的项
        if (!items)
          items = component.getSelection();
        if (items.length === 0)
          return;
        if (doSelect)
          index = component.store.indexOf(items[0]);
        component.store.remove(items);
        if (doSelect) {
          lastIndex = component.store.getCount() - 1;
          if (index > lastIndex)
            index = lastIndex;
          if (index > -1)
            component.setSelection(index);
        }
      } else if (isArray) {
        //删除数组中的所有节点对象
        if (component[0] instanceof Ext.data.Model) {
          Wb.each(component, function(item) {
            item.remove();
          });
        }
      } else {
        //删除容器子控件
        Wb.each(items, function(item) {
          component.remove(item);
        });
      }
    } finally {
      Ext.resumeLayouts(true);
    }
  },
  /**
   * 设置面板的状态为被更改，设置被更改状态将在面板的标题前加“*”符，并添加isModified属性为true。
   * @param {Panel} panel 面板对象。
   * @return {Panel} panel 本身。
   */
  setModified: function(panel) {
    if (panel) {
      if (!panel.isModified) {
        panel.isModified = true;
        if (!Ext.String.startsWith(panel.title, '*'))
          panel.setTitle('*' + panel.title);
      }
    }
    return panel;
  },
  /**
   * 设置面板的状态为未更改，设置未更改状态将移除面板的标题前置“*”符，并设置isModified属性为false。
   * @param {Panel} panel 面板对象。
   * @return {Panel} panel 本身。
   */
  unModified: function(panel) {
    if (panel) {
      if (panel.isModified) {
        panel.isModified = false;
        panel.setTitle(panel.title.substring(1));
      }
    }
    return panel;
  },
  /**
   * 设置面板的子标题，子标题将以“标题 - 子标题”的形式显示在面板标题上。
   * @param {Panel} panel 面板对象。
   * @param {String} subTitle 子标题。
   * @return {Panel} 面板本身。
   */
  setTitle: function(panel, subTitle) {
    if (Ext.isTouch)
      panel = panel.down('titlebar');
    var title = Wb.isEmpty(panel.title || panel._title) ? '' : String(panel.title || panel._title),
      pos = title.indexOf(' - ');
    if (pos != -1)
      title = title.substring(0, pos);
    if (Wb.isEmpty(subTitle))
      panel.setTitle(title);
    else
      panel.setTitle(title + ' - ' + subTitle);
  },
  /**
   * 把值解析为布尔型。如果值为false, 'false', 0, '0', null, undefined和空串返回false，其他值返回true。
   * 如果指定默认值，则当值为null或undefined时返回此默认值。
   * @param {Object} value 需要解析的值。
   * @return {Boolean} 解析后的布尔值。
   */
  parseBool: function(value, defaultValue) {
    if (Wb.isValue(value)) {
      var str = String(value);
      return !(str == 'false' || str == '0' || str === '');
    } else {
      if (defaultValue === undefined)
        return false;
      else
        return defaultValue;
    }
  },
  /**
   * 判定指定值语义是否为真。如果值为undefined，则返回默认值。
   * @param {Mixed} value 需要判断的值。
   * @param {Mixed} [defaultValue] 默认值，默认为false。
   * @return {Boolean} true为真，false为假。
   */
  getBool: function(value, defaultValue) {
    return !!(value === undefined ? defaultValue : value);
  },
  /**
   * 重新加载树或表格。树：加载完成后重新选择最后选择的节点。表格或Ext.data.Store：不同于store.reload，使用该方法会叠加params指定参数。
   * @param {GridPanel/TreePanel/Store} component 表格、树或其绑定的Store对象。
   * @param {Function/Object} [object] 树：加载完成后执行的回调函数。表格：参数对象，同store.reload的options参数。
   * @param {Object} [params] 树：可选的参数对象。
   * @param {Object} [params.field] 刷新树时保存路径使用的字段名称，默认为displayField。
   * @param {Object} [params.separator] 刷新树时保存路径使用的分隔符，默认为'\n'。
   */
  reload: function(component, object, params) {
    if (component instanceof Ext.grid.Panel || component instanceof Ext.data.Store) {
      var store = component.store || component,
        options = object || {};
      options.params = Ext.apply({}, options.params, store.lastOptions ? store.lastOptions.params : null);
      store.reload(options);
    } else {
      component = component.bindTable || component;
      if (component.isRefreshing)
        return;
      component.isRefreshing = true;
      if (!params)
        params = {};
      var path, rootNode, node = component.getSelection()[0],
        useField = params.field || component.displayField;
      if (node)
        path = node.getPath(useField, params.separator || '\n');
      component.selModel.deselectAll();
      component.store.load({
        callback: function(records, operation, success) {
          if (component.isRefreshing)
            delete component.isRefreshing;
          if (success && path)
            component.selectPath(path, useField, params.separator || '\n', object);
        }
      });
    }
  },
  /**
   * 验证名称的合法性。
   * @param {String} name 需要被验证的字符串对象。
   * @return {Boolean} 如果名称由字母、下划线和数字构成且第一个字母不为数字则返回true，否则返回false。
   */
  verifyName: function(name) {
    var c, i, j = name.length;
    for (i = 0; i < j; i++) {
      c = name.charAt(i);
      if (!(c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c == '_' || i > 0 && (c >= '0' && c <= '9')))
        return Wb.format(Str.invalidChar, c);
    }
    return true;
  },
  /**
   * 验证文件名称的合法性。
   * @param {String} name 需要被验证的文件名称。
   * @return {Boolean} 如果名称是一个有效的文件名称则返回true，否则返回false。
   */
  verifyFile: function(name) {
    var c, i, j = name.length,
      key = '\/:*?"<>|';
    for (i = 0; i < j; i++) {
      c = name.charAt(i);
      if (key.indexOf(c) != -1)
        return Wb.format(Str.invalidChar, c);
    }
    return true;
  },
  htmlRender: function(v) {
    return Wb.htmlEncode(v);
  },
  /**
   * 获取iframe的文档对象。
   * @param {Iframe} iframe Iframe对象。
   * @return {Document} Iframe的document对象，如果获取过程发生异常将返回null。
   */
  getDoc: function(iframe) {
    try {
      return iframe.contentWindow.document || iframe.contentDocument || window.frames[iframe.id].document;
    } catch (e) {
      return null;
    }
  },
  /**
   * 把Iframe中的事件传递到父窗口。
   */
  relayEvent: function(event) {
    try {
      var iframeEl = this,
        iframeXY = Ext.Element.getTrueXY(iframeEl),
        originalEventXY = event.getXY(),
        eventXY = Ext.EventManager.getPageXY(event.browserEvent);

      event.xy = [iframeXY[0] + eventXY[0], iframeXY[1] + eventXY[1]];
      event.injectEvent(iframeEl);
      event.xy = originalEventXY;
    } catch (e) {
      //可以忽略
    }
  },
  /**
   * 在指定的控件中插入iframe，插入的iframe具有自动显示加载进度，自动释放资源，并管理全局点击事件的功能。
   * 管理全局点击事件是指iframe和其上层窗体之间的点击事件管理，比如当上层窗口显示菜单时，点击iframe能隐藏上层窗口的菜单。
   * 插入的iframe提供submit(url, params, method)方法，用于向指定url提交参数并显示在iframe中，示例：<br>
   * owner.iframe.submit('m?xwl=name', {p1: 'foo', p2: 'bar'}); //POST方法<br>
   * owner.iframe.submit('m', {xwl:'name', p1: 'foo', p2: 'bar'}, 'GET');//GET方法<br>
   * @param {Component} owner 需要被插入iframe的控件。
   * @param {Component} useMask 指定在加载过程中是否需要使用mask，默认为true。
   * @return {Element} 插入的iframe Element，也可通过owner.iframe获取iframe element。
   * 如果要获取dom，可通过iframe.dom获取iframe dom。
   */
  insertIframe: function(owner, useMask) {
    var iframeDom, id = Wb.getId();

    useMask = Wb.getBool(useMask, true);
    owner.update('<iframe scrolling="auto" id="' + id + '" name="' + id +
      '" frameborder="0" width="100%" height="100%" z-index="-999999" ></iframe>');
    owner.iframe = owner.el.down('iframe');
    iframeDom = owner.iframe.dom;
    owner.iframe.submit = function(url, params, method) {
      if (owner.isSubmiting)
        return;
      owner.isSubmiting = true;
      if (useMask)
        Wb.mask(owner, Str.loading);
      Wb.submit(url, params, iframeDom.id, method);
    };
    owner.iframe.getDoc = function() {
      return Wb.getDoc(iframeDom);
    };
    Ext.fly(iframeDom).on('load', function() {
      if (!owner.isSubmiting)
        return;
      delete owner.isSubmiting;
      if (useMask)
        Wb.unmask(owner, Str.loading);
      var doc = owner.iframe.getDoc();
      if (doc) {
        Ext.EventManager.on(doc, {
          mousedown: Wb.relayEvent,
          mousemove: Wb.relayEvent,
          mouseup: Wb.relayEvent,
          click: Wb.relayEvent,
          dblclick: Wb.relayEvent,
          scope: iframeDom
        });
      }
    });
    owner.mon(owner, 'beforedestroy', function(me) {
      var doc, prop;

      doc = me.iframe.getDoc();
      try {
        if (doc) {
          for (prop in doc) {
            if (doc.hasOwnProperty && doc.hasOwnProperty(prop)) {
              delete doc[prop];
            }
          }
          iframeDom.src = 'about:blank';
          doc.write('');
          doc.clear();
          doc.close();
        }
        me.iframe.destroy();
      } catch (e) {}
    });
    return owner.iframe;
  },
  /**
   * 获取路径中的文件部份名称。
   * @param {String} path 包含文件名称的路径。
   * @return {String} 文件部分名称。
   */
  getFilename: function(path) {
    if (Wb.isEmpty(path))
      return '';
    var pos = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
    if (pos == -1)
      return path;
    else
      return path.substring(pos + 1);
  },
  /**
   * 获取文件的路径部份字符串。
   * @param {String} path 包含文件名称的路径。
   * @return {String} 路径部分字符串。
   */
  getPath: function(path) {
    if (Wb.isEmpty(path))
      return '';
    var pos = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
    if (pos == -1)
      return path;
    else
      return path.substring(0, pos);
  },
  /**
   * 获取文件中的扩展名部分。
   * @param {String} fileName 文件名称。
   * @return {String} 文件扩展名。
   */
  extractFileExt: function(fileName) {
    if (!Wb.isEmpty(fileName)) {
      var i = fileName.lastIndexOf('.');
      if (i != -1)
        return fileName.substring(i + 1);
    }
    return '';
  },
  /**
   * 获取字符串中指定代码的错误信息片断。
   * @param {String} text 包含错误信息和代码的字符串。
   * @param {Number} errorCode 错误代码。
   * @return {String} 如果指定的错误代码存在则返回错误信息片断字符串，否则返回null。
   */
  getError: function(text, errorCode) {
    if (text) {
      var errorKey = '#WBE' + errorCode + ':',
        len = errorKey.length;
      if (text.substring(0, len) == errorKey)
        return text.substring(len);
    }
    return null;
  },
  /**
   * 选择指定的对象，把指定对象设置为选择状态。
   *
   * @param {Object} object 需要选择的对象。
   */
  select: function(object) {
    var tree = object.getOwnerTree(),
      nodes = [];
    if (!tree) return;
    Ext.suspendLayouts();
    object.bubble(function(node) {
      if (tree.rootVisible || node.parentNode)
        nodes.push(node);
    });
    nodes.shift();
    Wb.each(nodes, function(node) {
      node.expand();
    }, true);
    tree.setSelection(object);
    Ext.resumeLayouts(true);
  },
  /**
   * 指定对象按回车键时模仿触发itemclick或itemdblclick事件。
   */
  mimicClick: function(view, record, item, index, e) {
    var grid = view.ownerCt;
    if (e.getKey() == e.ENTER) {
      if (grid.hasListeners.itemclick)
        grid.fireEventArgs('itemclick', arguments);
      else grid.fireEventArgs('itemdblclick', arguments);
      e.stopEvent();
    }
  },
  /**
   * 在指定名称前面添加前缀。如果前缀不为空返回“前缀.名称”，否则直接返回名称。
   * @param {String} prefix 前缀。
   * @param {String} name 名称。
   * @return {String} 添加前缀后的名称或名称本身。
   */
  addPrefix: function(prefix, name) {
    if (prefix)
      return prefix + '.' + name;
    else return name;
  },
  /**
   * 根据Str.lang为当前语言代码，获取langs中对应值组成的对象。
   * @param {Object} langs 按不同语言定义的值对象。
   * @return {Object} 根据当前语言提取值后组成的对象。
   */
  getLang: function(langs) {
    var list = {};
    Wb.each(langs, function(k, v) {
      list[k] = v[Str.lang];
    });
    return list;
  },
  /**
   * 获取tabPanel中被修改的选项卡的概要信息描述。
   * @param {Ext.tab.Panel} tab 需要获取信息的TabPanel对象。
   * @param {Boolean} [turnFirstCard] 是否转到首个被修改的选项卡，默认为false。
   * @return {String} 如果tab中的选项卡被修改则返回被修改的选项卡概要信息，否则返回null。
   */
  getModifiedTitle: function(tab, turnFirstCard) {
    if (!tab) return null;
    var title, count = 0,
      firstCard;
    tab.items.each(function(card) {
      if (card.isModified) {
        if (!firstCard)
          firstCard = card;
        if (!title)
          title = card.title.substring(1);
        count++;
      }
    });
    if (turnFirstCard && firstCard)
      tab.setActiveTab(firstCard);
    if (count > 1)
      return Wb.format(Str.itemsInfo, title, count);
    else if (count == 1)
      return '"' + title + '"';
    else return null;
  },
  /**
   * 判断事件是否触发自面板。
   * @param {Panel} panel 面板对象。
   * @param {Event} e 事件对象。
   * @return {Boolean} 如果事件触发自面板返回true，否则返回false。
   */
  fromPanel: function(panel, e) {
    var target = e.target,
      id = panel.id;
    if (target.id == (id + '-innerCt'))
      return true;
    if (target.id == (id + '-body')) {
      if (e.getX() > panel.getX() + panel.body.dom.clientWidth ||
        e.getY() > panel.getY() + panel.body.dom.clientHeight)
        return false; //点击在滚动条上
      else
        return true;
    }
    return false;
  },
  /**
   * 复制节点及其所有子节点。
   * @param {Ext.data.NodeInterface} node 复制的节点。
   * @return {Ext.data.NodeInterface} 复制后的节点。
   */
  copy: function(node) {
    function doCopy(node) {
      var children, data = node.data,
        copiedData = {},
        sysProp = [
          'allowDrag', 'allowDrop', 'children', 'depth', 'id', 'index',
          'isFirst', 'isLast', 'loaded', 'loading', 'parentId', 'root'
        ];

      if (data.id)
        copiedData.id = Wb.getId();
      Wb.each(data, function(key, value) {
        if (Wb.indexOf(sysProp, key) == -1)
          copiedData[key] = value;
      });
      if (!node.isLeaf() && node.isLoaded()) {
        children = node.childNodes;
        copiedData.children = [];
        Wb.each(children, function(item) {
          copiedData.children.push(doCopy(item));
        });
      }
      return copiedData;
    }
    return Ext.clone(doCopy(node));
  },
  /**
   * 添加或移动一组节点至指定节点，并成为该节点的子节点。
   * @param {Ext.data.NodeInterface/Ext.data.NodeInterface[]} nodes 需要添加或移动的源节点列表。
   * @param {Ext.data.NodeInterface} parentNode 目标节点，源节点列表中的每个节点将被添加或移动到该节点下。
   * @param {Boolean} [isCopy] 是否复制源节点并添加到目标节点下，否则将移动源节点至目标节点下，默认为false。
   * @param {Boolean} [doSelect] 是否选择添加的节点，默认为true。
   * @return {Ext.data.NodeInterface[]} 被复制或移动的节点列表。
   */
  append: function(nodes, parentNode, isCopy, doSelect) {
    var newNode, newNodes = [];
    if (!Ext.isArray(nodes))
      nodes = [nodes];
    Ext.suspendLayouts();
    try {
      Wb.each(nodes, function(node) {
        if (isCopy)
          node = Wb.copy(node);
        newNode = parentNode.appendChild(node);
        newNode.commit();
        newNodes.push(newNode);
      });
      if (Wb.getBool(doSelect, true)) {
        parentNode.expand();
        parentNode.getOwnerTree().setSelection(newNodes);
      }
    } finally {
      Ext.resumeLayouts(true);
    }
    return newNodes;
  },
  /**
   * 插入或移动一组节点至指定节点上方，并成为该节点的同级节点。
   * @param {Ext.data.NodeInterface/Ext.data.NodeInterface[]} nodes 需要插入或移动的源节点列表。
   * @param {Ext.data.NodeInterface} refNode 目标节点，源节点列表中的每个节点将被插入或移动到该节点上方。
   * @param {Boolean} [isCopy] 是否复制源节点并插入到目标节点上方，否则将移动源节点至目标节点上方，默认为false。
   * @param {Boolean} [doSelect] 是否选择添加的节点，默认为true。
   * @return {Ext.data.NodeInterface[]} 被复制或移动的节点列表。
   */
  insertBefore: function(nodes, refNode, isCopy, doSelect) {
    var parentNode = refNode.parentNode,
      newNode, newNodes = [];
    if (!Ext.isArray(nodes))
      nodes = [nodes];
    Ext.suspendLayouts();
    try {
      Wb.each(nodes, function(node) {
        if (isCopy)
          node = Wb.copy(node);
        newNode = parentNode.insertBefore(node, refNode);
        newNode.commit();
        newNodes.push(newNode);
      });
      if (Wb.getBool(doSelect, true))
        refNode.getOwnerTree().setSelection(newNodes);
    } finally {
      Ext.resumeLayouts(true);
    }
    return newNodes;
  },
  /**
   * 插入或移动一组节点至指定节点下方，并成为该节点的同级节点。
   * @param {Ext.data.NodeInterface/Ext.data.NodeInterface[]} nodes 需要插入或移动的源节点列表。
   * @param {Ext.data.NodeInterface} refNode 目标节点，源节点列表中的每个节点将被插入或移动到该节点下方。
   * @param {Boolean} [isCopy] 是否复制源节点并插入到目标节点下方，否则将移动源节点至目标节点下方，默认为false。
   * @param {Boolean} [doSelect] 是否选择添加的节点，默认为true。
   * @return {Ext.data.NodeInterface[]} 被复制或移动的节点列表。
   */
  insertAfter: function(nodes, refNode, isCopy, doSelect) {
    var nextNode = refNode.nextSibling,
      parentNode = refNode.parentNode,
      newNode, newNodes = [];
    if (!Ext.isArray(nodes))
      nodes = [nodes];
    Ext.suspendLayouts();
    try {
      Wb.each(nodes, function(node) {
        if (isCopy)
          node = Wb.copy(node);
        if (nextNode)
          newNode = parentNode.insertBefore(node, nextNode);
        else
          newNode = parentNode.appendChild(node);
        newNode.commit();
        newNodes.push(newNode);
      });
      if (Wb.getBool(doSelect, true))
        refNode.getOwnerTree().setSelection(newNodes);
    } finally {
      Ext.resumeLayouts(true);
    }
    return newNodes;
  },
  /**
   * 全部展开或收缩选择的节点，如果没有节点被选中，则展开或收缩全部节点。
   * @param {Ext.tree.Panel/Ext.data.TreeStore} object 树或绑定的store对象。
   * @param {Boolean} [isCollapse] 是否执行收缩操作，默认为false。
   */
  expand: function(object, isCollapse) {
    Ext.suspendLayouts();
    try {
      var treePanel = object.bindTable || object,
        nodes = treePanel.getSelection(),
        rootNode;
      if (nodes.length === 0) {
        rootNode = treePanel.getRootNode();
        if (treePanel.rootVisible)
          nodes.push(rootNode);
        else {
          if (isCollapse)
            rootNode.collapseChildren(true);
          else
            rootNode.expandChildren(true);
          return;
        }
      }
      Wb.each(nodes, function(node) {
        if (isCollapse)
          node.collapse(true);
        else
          node.expand(true);
      });
    } finally {
      Ext.resumeLayouts(true);
    }
  },
  /**
   * 全部收缩选择的节点，如果没有节点被选中，则收缩全部节点。
   * @param {Ext.tree.Panel/Ext.data.TreeStore} object 树或绑定的store对象。
   */
  collapse: function(object) {
    var treePanel = object.bindTable || object;
    Wb.expand(treePanel, true);
  },
  /**
   * 判断当前页面是否为模态，如果当前页面存在可视的模态对话框和全屏mask则表示模态，否则为非模态。
   * @return {Boolean} true模态，false非模态。
   */
  isModal: function() {
    var found = false;
    Ext.WindowMgr.each(function(win) {
      if (win.modal && win.isVisible()) {
        found = true;
        return false;
      }
    });
    return found || Ext.getBody().isMasked();
  },
  /**
   * 生成客户端当前页面以"wb"开头的唯一字符串。该字符串仅保证在该页面内唯一。
   * @return {String} 当前页面内唯一的字符串。
   */
  getId: function() {
    if (!Wb.id)
      Wb.id = (new Date()).getTime();
    return 'wb' + Wb.id++;
  },
  /**
   * 生成嵌入到树控件标题栏中的操作工具按钮，实现对树节点的刷新、伸缩和查找等功能。
   * @param {Object} config 工具选项配置对象。
   * @param {Booolean} config.refresh 是否生成刷新按钮。
   * @param {Booolean} config.expand 是否生成展开按钮。
   * @param {Booolean} config.collapse 是否生成收缩按钮。
   * @param {Booolean} config.search 是否生成查找按钮。
   * @return {Object} 工具按钮配置对象。
   */
  getTreeTools: function(config) {
    var buttons = [];
    if (!config)
      config = {};
    if (Wb.getBool(config.refresh, true))
      buttons.push({
        type: 'refresh',
        tooltip: Str.refresh,
        callback: function(tree) {
          Wb.reload(tree);
        }
      });
    if (Wb.getBool(config.expand, true))
      buttons.push({
        type: 'expand',
        tooltip: Str.expandSelected,
        callback: function(tree) {
          Wb.expand(tree);
        }
      });
    if (Wb.getBool(config.collapse, true))
      buttons.push({
        type: 'collapse',
        tooltip: Str.collapseSelected,
        callback: function(tree) {
          Wb.collapse(tree);
        }
      });
    if (config.search)
      buttons.push({
        type: 'search',
        tooltip: Str.toggleSearch,
        callback: function(tree) {
          var bar = tree.getDockedComponent('_searchNodeBar'),
            displayField = tree.displayField;
          if (bar)
            bar.setVisible(!bar.isVisible());
          else
            bar = tree.addDocked({
              xtype: 'toolbar',
              itemId: '_searchNodeBar',
              dock: 'top',
              searchHandler: function() {
                var value = (bar.getComponent('combo').getValue() || '').toLowerCase(),
                  node = tree.getRootNode().findChildBy(function(n) {
                    if (value === (n.data[displayField] || '').toLowerCase())
                      return true;
                  }, tree, true);
                if (node)
                  Wb.select(node);
                else
                  Wb.warn(Wb.format(Str.notFound, value));
              },
              items: [{
                xtype: 'combo',
                itemId: 'combo',
                flex: 1,
                displayField: 'text',
                queryMode: 'local',
                store: {
                  fields: ['text']
                },
                doQuery: function(query) {
                  var text, me = this,
                    rows = [],
                    rootVisible = tree.rootVisible;
                  tree.getRootNode().cascadeBy(function(node) {
                    if (!rootVisible && node.getDepth() === 0)
                      return;
                    text = node.data[displayField] || '';
                    if (text.toLowerCase().indexOf(query) != -1)
                      rows.push({
                        text: text
                      });
                  });
                  me.store.loadData(rows);
                  if (rows.length)
                    me.expand();
                  else
                    me.collapse();
                  me.doAutoSelect();
                  return true;
                },
                listeners: {
                  specialkey: function(me, e) {
                    if (e.getKey() == e.ENTER && !me.isExpanded) {
                      bar.searchHandler();
                      e.stopEvent();
                    }
                  },
                  select: function() {
                    bar.searchHandler();
                  }
                }
              }, {
                iconCls: 'seek_icon',
                tooltip: Str.search,
                handler: function() {
                  bar.searchHandler();
                }
              }]
            })[0];
          if (bar.isVisible())
            bar.getComponent('combo').focus(false, true);
        }
      });
    return buttons;
  },
  /**
   * 保存下拉框输入的历史值并维护其列表，最后一次输入值将显示在下拉列表的第一行。
   * @param {Ext.form.field.ComboBox} combobox 需要保存历史输入值的下拉框。
   */
  save: function(combobox) {
    var st = combobox.store,
      value = combobox.getValue(),
      index;
    index = st.findExact('field1', value);
    if (index != -1)
      st.removeAt(index);
    st.insert(0, {
      field1: value
    });
  },
  /**
   * 按节点深度对节点列表进行逆向排序。该操作将直接对输入的参数排序。
   * @param {Ext.data.NodeInterface[]} nodes 需要排序的节点列表。
   * @return {Ext.data.NodeInterface[]} 排序后的节点列表。
   */
  reverse: function(nodes) {
    Ext.Array.sort(nodes, function(a, b) {
      return b.getDepth() - a.getDepth();
    });
    return nodes;
  },
  /**
   * 选择树或表格的第一个节点或记录。如果是树，那么该操作将只会被执行一次。
   * @param {Component} object 操作的树或表格对象或其绑定的store对象。
   */
  selFirst: function(object) {
    var component, root;
    if (object instanceof Ext.tree.Panel || object instanceof Ext.data.TreeStore) {
      component = object.bindTable || object;
      root = component.getRootNode();
      if (!component.rootVisible)
        root = root.firstChild;
      if (root && !component.selFirstDone) {
        component.selFirstDone = true;
        component.setSelection(root);
      }
    } else if (object instanceof Ext.grid.Panel || object instanceof Ext.data.Store) {
      component = object.bindTable || object;
      if (component.store && component.store.getCount() > 0)
        component.setSelection(0);
    }
  },
  /**
   * 获取记录集的概要信息文本，概要信息将以指定字段值或值加记录数量的形式提示。
   *
   * Example:
   *
   *     Wb.confirm('确定删除 '+Wb.getInfo(grid1), handler);
   *
   * @param {Object/Ext.data.Model[]} object 记录集或表格、树等对象，如果不是记录集将获取对象的选择记录作为记录集。
   * @param {String} [field] 概要信息中使用的字段名称，该字段内容将显示在概要信息中。默认为text。
   * @return {String} 生成的概要信息。如果记录集为空，则返回空字符串。
   */
  getInfo: function(object, field) {
    var sels;
    if (Ext.isArray(object))
      sels = object;
    else
      sels = object.getSelection();
    if (!field)
      field = 'text';
    if (sels.length) {
      if (sels.length == 1)
        return sels[0].get(field);
      else
        return Wb.format(Str.itemsInfo, sels[0].get(field), sels.length);
    } else
      return '';
  },
  /**
   * 获取以特定分隔符分隔的字符串第n个分隔符开始至字符串结尾的子串。
   * @param {String} string 需要获取子串的字符串。
   * @param {String} spliter 字符串中的分隔符。
   * @param {Number} sectionIndex 指定第几个分隔符所在的位置作为子串的开始位置。第一个为0，第二个为1，依此类推。
   * @return {String} 截取的子串。
   */
  getSection: function(string, spliter, sectionIndex) {
    var i = 0,
      pos = 0;
    for (i = 0; i < sectionIndex; i++) {
      pos = string.indexOf(spliter, pos);
      if (pos == -1)
        return '';
      pos++;
    }
    return string.substring(pos);
  },
  /**
   * 下载指定链接的文件或资源。
   * @param {String/Object} url url路径或资源对象。
   * @param {Object} [params] 可选参数。
   * @param {Boolean} [isUpload] 是否是文件上传模式。
   * @param {String} [method] 提交使用的方法。默认为'POST'。
   */
  download: function(url, params, isUpload, method) {
    if (url instanceof Ext.chart.Chart) {
      var chart = url;
      Wb.download('get-file', {
        data: Ext.draw.engine.SvgExporter.generate(chart.surface),
        filename: params || 'chart.svg'
      }, true);
      return;
    }
    var fr = Wb.getFrame(),
      fm = Wb.getForm(Ext.apply({
        _jsonresp: 1
      }, params), isUpload);
    fm.action = url;
    fm.method = method || 'POST';
    fm.target = fr.id;
    fm.submit();
  },
  /**
   * 删除对象中指定名称的属性，并返回删除这些属性后的新对象。该方法不影响原对象的值。
   * @param {Object } object 需要删除属性的对象。
   * @param {Array/String} names 需要删除的属性名称数组或以逗号分隔的属性名称组成的字符串。
   * @return {Object} 删除属性后的新对象。
   */
  exclude: function(object, names) {
    var result = {};
    if (!Ext.isArray(names))
      names = names.split(',');
    names = Wb.createObject(names);
    Wb.each(object, function(k, v) {
      if (!names[k])
        result[k] = v;
    });
    return result;
  },
  /**
   * 把数组转换为对象，对象的名称为数组项，值为true。
   * @param {Array} items 需要转换的数组。
   * @return {Object} 转换后的对象。如果没有内容将返回空对象。
   */
  createObject: function(items) {
    var result = {};
    Wb.each(items, function(item) {
      result[item] = true;
    });
    return result;
  },
  /**
   * 使用excel模块文件转换为web表单。并加载到指定的容器控件中。
   * @param {Object} options 配置参数对象。
   * @param {Container} options.container 容器控件，加载生成的表单到该控件。
   * @param {String} options.file Excel模板文件路径，基于wb/system/excel目录下的相对路径。
   * @param {Object} [options.params] 参数对象，提交请求时发送的参数。
   * @param {Function} [options.success] 调用成功之后的回调事件，可用参数为response对象，this指向container。
   * @param {Function} [options.failure] 调用失败之后的回调事件，可用参数为response对象，this指向container。
   * @param {Number} [options.sheetIndex] 使用的Excel模板文件中Sheet的索引号。默认为0。
   * @param {String} [options.align] 生成的表单的基于容器的水平对齐方式，有效值为left, center和right。默认为center。
   * @param {Object...} [options.more] 其他参数将直接应用于Wb.request方法内的参数。
   */
  loadExcel: function(options) {
    var container = options.container,
      extraOptions = Wb.exclude(options, 'container,file,params,success,failure,sheetIndex,align');

    if (options.fill) {
      //修改options中的语法使其符合规范
      options.fill = Wb.toArray(options.fill);
      Wb.each(options.fill, function(item) {
        if (item.mergeRows)
          item.mergeRows = Wb.toArray(item.mergeRows);
        if (item.mergeCols && item.mergeCols.length > 0) {
          if (!Ext.isArray(item.mergeCols[0]))
            item.mergeCols = [item.mergeCols];
        } else item.mergeCols = null;
      });
    }
    Wb.request(Wb.applyIf({
      url: 'get-excel-form',
      params: Wb.applyIf({
        __file: options.file,
        __sheetIndex: options.sheetIndex,
        __align: options.align,
        __fill: options.fill
      }, options.params),
      success: function(resp) {
        if (container.autoScroll === undefined)
          container.setAutoScroll(true);
        container.update(resp.responseText);
        container.updateObject();
        Ext.callback(options.success, container, [resp]);
      },
      failure: function(resp) {
        Ext.callback(options.failure, container, [resp]);
      }
    }, extraOptions));
  },
  /**
   * 把数据导入到Excel模板文件中，并下载该Excel文件。
   * @param {Object} params 导入的数据。
   * @param {String} tplFileName 基于wb/system/excel目录的Excel模板文件路径。
   * @param {Boolean} [sheetIndex] 使用的Excel Sheet索引号。-1表示使用所有Sheet。默认为-1。
   * @param {String} [exportFileName] 输出的文件名。默认为tplFileName。
   */
  getExcel: function(params, tplFileName, sheetIndex, exportFileName) {
    Wb.download('use-excel-tpl', {
      filename: tplFileName,
      exportFilename: exportFileName,
      params: params,
      sheetIndex: sheetIndex
    });
  },
  /**
   * 把指定的数据转换为数组，如果值为null、undefined或数组直接返回该值，否则返回[value]值。
   * @param {Object/Array} value 需要转换为数组的值。
   * @return {Array} 返回的数组或null/undefined。
   */
  toArray: function(data) {
    if (!Wb.isValue(data) || Ext.isArray(data))
      return data;
    else
      return [data];
  },
  /**
   * 获取表格的顶层列对象组成的数组。
   * @param {Ext.grid.Panel} grid 表格对象。
   * @return {Column[]} 列数组。
   */
  getTopColumns: function(grid) {
    var topCols = [],
      columns = Wb.fetchColumns(grid);
    Wb.each(columns, function(col) {
      while (col.ownerCt instanceof Ext.grid.column.Column) {
        col = col.ownerCt;
      }
      if (Wb.indexOf(topCols, col) == -1)
        topCols.push(col);
    });
    return topCols;
  },
  /**
   * 把表格中具有相同值的行合并为一行。该方法将扫描所有列，如果指定列允许合并行，则把相同值的行进行合并。
   * 设置列对象的mergeRow属性为true，则标记该列需要合并行，使用该方法后所有标记该属性为true的列都将执行合并行的操作。
   * @param {Ext.grid.Panel} grid 需要执行合并行的表格对象。
   */
  mergeRows: function(grid) {
    var rows, table = grid.view.el.down('table', true),
      cols = Wb.fetchColumns(grid),
      i, j = cols ? cols.length : 0,
      x, y = table.rows.length,
      cell, div, html, count, prevCell, prevHtml;

    for (i = j - 1; i > -1; i--) {
      if (!cols[i].mergeRows)
        continue;
      count = 0;
      prevCell = null;
      for (x = y - 1; x > -1; x--) {
        cell = table.rows[x].cells[i];
        div = cell.firstChild;
        html = div.innerHTML;
        if (prevCell) {
          if (html === prevHtml) {
            prevCell.parentNode.removeChild(prevCell);
            if (x === 0) {
              if (count > 0)
                cell.rowSpan = (count + 1).toString();
            }
          } else {
            if (count > 1)
              prevCell.rowSpan = count.toString();
            count = 0;
          }
        }
        count++;
        prevCell = cell;
        prevHtml = html;
      }
    }
  },
  /**
   * 把表格中具有相同值的列合并为一列。该方法将扫描所有行，如果指定列允许合并行，则把相同值的列进行合并。
   * 设置列对象的mergeColGroup属性以标识合并列的组名，使用该方法后具有相同mergeColGroup属性的列都将执行合并列的操作。
   * @param {Ext.grid.Panel} grid 需要执行合并列的表格对象。
   */
  mergeCols: function(grid) {
    var rows, table = grid.view.el.down('table', true),
      cols = Wb.fetchColumns(grid),
      i, j = cols ? cols.length : 0,
      x, y = table.rows.length,
      cell, div, row, html, count, group, prevGroup, prevCell, prevHtml;

    for (x = y - 1; x > -1; x--) {
      count = 0;
      row = table.rows[x];
      prevCell = null;
      for (i = j - 1; i > -1; i--) {
        cell = row.cells[i];
        if (!cell)
          continue;
        div = cell.firstChild;
        html = div.innerHTML;
        group = cols[i].mergeColGroup;
        if (prevCell) {
          if (html === prevHtml && group && group === prevGroup) {
            prevCell.parentNode.removeChild(prevCell);
            if (i === 0) {
              if (count > 0)
                cell.colSpan = (count + 1).toString();
            }
          } else {
            if (prevGroup && count > 1)
              prevCell.colSpan = count.toString();
            count = 0;
          }
        }
        count++;
        prevCell = cell;
        prevHtml = html;
        prevGroup = group;
      }
    }
  },
  /**
   * 导出表格中的数据为指定格式的输出。
   * @param {GridPanel/Store} component 需要导出的表格或关联的store对象。
   * @param {String} [type] 输出数据的格式，默认为Excel。
   * @param {Boolean} [isAll] 是否导出表格所有页数据，默认为当前页。如果值为false，
   * 导出使用客户端数据推送然后输出数据，否则在服务器端重新生成数据然后输出数据。
   */
  exportData: function(component, type, isAll) {
    function getHtmlData(component) {
      if (!component)
        return null;
      var table = component.el.down('table', true);
      if (!table)
        return null;
      var rows = table.rows,
        cells, cell, i, j, x, y = rows.length,
        rowData, data = [];

      for (x = 0; x < y; x++) {
        row = rows[x];
        cells = row.cells;
        j = cells.length;
        rowData = [];
        for (i = 0; i < j; i++) {
          cell = cells[i];
          rowData.push({
            value: cell.innerHTML,
            colSpan: cell.colSpan,
            align: cell.align,
            size: parseInt(cell.style.fontSize, 10),
            height: parseInt(cell.style.height, 10),
            weight: cell.style.fontWeight
          });
        }
        data.push({
          height: Ext.fly(row).getHeight(),
          items: rowData
        });
      }
      return data;
    }

    function getHeaders(columns, headers) {
      Wb.each(columns, function(col) {
        if (col instanceof Ext.grid.column.RowNumberer) {
          rowNumberWidth = col.getWidth() || col.width;
          rowNumberTitle = col.text;
          return;
        }
        var data;
        if (Ext.isTouch) {
          if (!Wb.getBool(col._allowExport, !col._hidden))
            return;
          data = {
            text: col._exportText || col._text,
            titleAlign: col._align
          };
          if (col.items && col.items.length) {
            data.items = [];
            getHeaders(col.items.items, data.items);
          } else {
            //叶子节点
            data.flex = col._flex;
            data.align = col._align;
            data.keyName = col._keyName;
            data.autoWrap = col._autoWrap;
            data.type = fieldTypes[col._dataIndex];
            data.format = col._format;
            data.field = col._dataIndex;
            data.width = col.innerElement.getWidth() || col._width; //列隐藏时getWidth()=0
          }
        } else {
          if (!Wb.getBool(col.allowExport, !col.hidden))
            return;
          data = {
            text: col.exportText || col.text,
            titleAlign: col.titleAlign || col.align
          };
          if (col.items && col.items.length) {
            data.items = [];
            getHeaders(col.items.items, data.items);
          } else {
            //叶子节点
            data.flex = col.flex;
            data.align = col.align;
            data.keyName = col.keyName;
            data.autoWrap = col.autoWrap;
            data.type = fieldTypes[col.dataIndex];
            data.format = col.format;
            data.field = col.dataIndex;
            data.width = col.getWidth() || col.width; //列隐藏时getWidth()=0
            mergeInfo.push([!!col.mergeRows, col.mergeColGroup]);
          }
        }
        headers.push(data);
      });
      return headers;
    }

    var params, url, urlParams, charIndex, rowNumberWidth, rowNumberTitle, fieldTypes = {},
      grid = component.bindTable || component,
      store = grid.store,
      mergeInfo = [],
      fields = Ext.isTouch ? store._proxy._reader.getFields() : store.proxy.reader.getFields();

    Wb.each(fields, function(field) {
      if (Ext.isTouch)
        fieldTypes[field._name] = field._type ? field._type.type : '';
      else
        fieldTypes[field.name] = field.type ? field.type.type : '';
    });
    url = Ext.isTouch ? store._proxy._url : store.url;
    charIndex = url.indexOf('?');
    if (charIndex != -1) {
      urlParams = url.substring(charIndex);
      url = url.substring(0, charIndex);
    } else {
      urlParams = '';
    }
    params = Wb.applyIf({
      __metaParams: {
        data: isAll ? null : Wb.getData(grid), //如果data不为null将直接使用该数据生成资源，否则从服务器端重新取数
        headers: getHeaders(Wb.getTopColumns(grid), []),
        url: url,
        type: type,
        reportInfo: {
          mergeInfo: mergeInfo,
          mergeRows: !!grid.mergeRows,
          mergeCols: !!grid.mergeCols,
          topHtml: getHtmlData(grid.down('#topHtml')),
          bottomHtml: getHtmlData(grid.down('#bottomHtml'))
        },
        dateFormat: Ext.isTouch ? XTL.defaultDateFormat : Ext.form.field.Date.prototype.format,
        timeFormat: Ext.isTouch ? XTL.defaultTimeFormat : Ext.form.field.Time.prototype.format,
        rowNumberWidth: rowNumberWidth || -1,
        rowNumberTitle: rowNumberTitle,
        thousandSeparator: Ext.util.Format.thousandSeparator,
        decimalSeparator: Ext.util.Format.decimalSeparator,
        title: grid.exportTitle,
        neptune: Wb.isNeptune,
        filename: grid.exportFilename || grid.exportTitle
      },
      page: 1,
      start: 0,
      limit: Wb.maxInt
    }, store.lastOptions.params);
    if (type == 'html')
      Wb.submit('transfer' + urlParams, params);
    else
      Wb.download('transfer' + urlParams, params);
  },
  /**
   * 把指定对象的数据更新到记录中。如果对象的属性未在记录中找到对应字段，该对象属性将被忽略。
   * @param {Ext.data.Model} record 需要更新的记录。
   * @param {Object} data 数据对象。
   * @param {Boolean} commit 更新完成后是否自动提交。默认为true。
   * @return {Ext.data.Model} 记录本身。
   */
  update: function(record, data, commit) {
    var name;
    record.fields.each(function(field) {
      name = field.name || field._name;
      if (data.hasOwnProperty(name))
        record.set(name, data[name]);
    });
    if (Wb.getBool(commit, true))
      record.commit();
  },
  /**
   * 把指定对象的数据设置到记录中，该方法直接更新记录字段值，不触发任何事件。如果对象的属性未在记录中找到对应字段，该对象属性将被忽略。
   * @param {Ext.data.Model} record 需要更新的记录。
   * @param {Object} data 数据对象。
   * @return {Ext.data.Model} 记录本身。
   */
  set: function(record, data) {
    var name;
    record.fields.each(function(field) {
      name = field.name || field._name;
      if (data.hasOwnProperty(name))
        record.data[name] = data[name];
    });
  },
  /**
   * 添加记录到指定表格。
   *
   * Example:
   *
   *     var newRecords = Wb.add(app.grid1, [{field: 'foo'}, {field: 'bar'}]);
   *
   * @param {Ext.grid.Panel/Ext.view.View/Ext.data.Store} object 表格或store对象。
   * @param {Object[]/Object} records 添加包含数据的对象或对象列表。
   * @param {String} [position] 添加到表格的位置，first首条，last末尾，before当前选择记录之前，after当前选择记录之后，add最后或排序后的位置。
   * add和last的区别在于表格排序影响add位置。如果当前未选择记录before等同first，after等同last。默认为last。
   * @param {Number} [editField] 激活编辑单元格所在的列对象或索引号。如果指定该值在添加记录后自动激活该列单元格。默认不自动激活。
   * @param {Number} [commit] 添加后是否自动提交数据。默认为true。
   * @return {Ext.data.Model[]} 添加的新记录。
   */
  add: function(object, records, position, editField, commit) {
    var index, newRecords, grid = object.bindTable || object,
      editing = Ext.isTouch ? null : Wb.findEditing(grid),
      store = grid.store;
    if (editing)
      editing.completeEdit();
    index = store.indexOf(grid.getSelection()[0]);
    if (position) {
      if (index == -1) {
        if (position == 'before')
          position = 'first';
        else if (position == 'after')
          position = 'last';
      }
    } else
      position = 'last';
    if (!records)
      records = {};
    switch (position) {
      case 'first':
        index = 0;
        newRecords = store.insert(index, records);
        break;
      case 'before':
        newRecords = store.insert(index, records);
        break;
      case 'after':
        index++;
        newRecords = store.insert(index, records);
        break;
      case 'last':
        index = store.getCount();
        newRecords = store.insert(index, records);
        break;
      case 'add':
        newRecords = store.add(records);
        index = store.indexOf(newRecords[0]);
        break;
    }
    if (!Ext.isTouch && grid instanceof Ext.grid.Panel && index < store.getCount() - 1) {
      Wb.refreshRowNum(grid);
    }
    commit = Wb.getBool(commit, true);
    Wb.each(newRecords, function(rec) {
      if (commit)
        rec.commit();
      else
        rec.dirty = true;
    });
    grid.setSelection(newRecords);
    if (editing && editField !== undefined) {
      editing.startEdit(newRecords[0], editField);
    }
    return newRecords;
  },
  /**
   * 在表格末尾添加新的记录，并对新记录首列开启编辑状态。详细说明见Wb.add。
   */
  addEdit: function(object, records) {
    return Wb.add(object, records, 'last', 1, false);
  },
  /**
   * 刷新grid的行号，使用此方法比view.refresh方法更高效。
   * @param {Ext.grid.Panel/Ext.data.Store} object 表格或store对象。
   */
  refreshRowNum: function(object) {
    var grid = object.bindTable || object;
    if (!Wb.hasRowNumber(grid))
      return;
    var newIndex, index = 1,
      store = grid.store,
      divs = grid.view.el.query('div[class~=x-grid-cell-inner-row-numberer]'),
      offsets = (store.currentPage - 1) * store.pageSize;
    Wb.each(divs, function(div) {
      newIndex = index + offsets;
      if (newIndex !== div.innerHTML)
        div.innerHTML = newIndex;
      index++;
    });
  },
  /**
   * 通过弹出对话框的方式向表格中添加记录。详细说明见Wb.edit。
   */
  insert: function(object, configs) {
    return Wb.edit(object, configs, true);
  },
  /**
   * 通过弹出对话框的方式向表格中添加/修改记录。首先系统将打开对话框，然后调用Ajax请求向后台发起添加/修改数据请求，
   * 最后在请求返回后把数据同步到表格中。当后台返回的数据为JSON Object格式的数据时，系统自动应用这些数据，并同步到记录中，
   * 如果后台返回的数据不是JSON Object，则不应用这些数据。
   * @param {Ext.grid.Panel/Ext.data.Store} object 需要编辑的表格或store对象。
   * @param {Object} configs 配置参数。
   * @param {String} configs.url 指向后台添加/修改模块的url地址。当窗口点击确定时系统会自动提交所有参数到该url。
   * @param {Object} [configs.params] 参数对象。该参数在应用窗口控件值和提交参数到后台时将覆盖同名的窗口控件值和记录字段值。
   * 优先级从低到高依次为记录字段值、窗口控件值和配置参数。
   * @param {String} [configs.title] 对话框标题。
   * @param {String} [configs.titleField] 修改的记录该字段值作为窗口子标题。仅用于修改模式。
   * @param {String} [configs.iconCls] 对话框图标。
   * @param {Object/Ext.window.Window} [configs.win] 窗口模板对象或实例。如果窗口中包含文件上传控件，
   * 必须在窗口内添加itemId为form的formPanel控件。在使用Wb.edit方法后将设置该窗口的editHandler属性为默认处理方法，
   * 并设置窗口isNew属性，用以标识是否为添加或修改操作。如果窗口为实例默认使用单例模式，closeAction为hide，
   * 并在表格销毁时自动销毁该窗口；如果窗口为非实例，将每次自动创建新的窗口实例，并在关闭后销毁窗口。
   * @param {Object[]} [configs.firstItems] 额外添加的前置控件列表。
   * @param {Object[]} [configs.lastItems] 额外添加的后置控件列表，
   * @param {Object[]} [configs.autoFocus] 如果后台异常，是否根据返回错误信息自动设置控件焦点。默认为true。
   * @param {Function} [configs.beforerequest] 在点击确定按钮发起后台请求前触发的事件。this指向窗口的appScope。如果返回false将取消请求。
   * @param {Object} [configs.beforerequest.values] 窗口所有值组成的对象。
   * @param {Ext.window.Window} [configs.beforerequest.win] 窗口对象。
   * @param {Function} [configs.success] 在请求成功完成之后触发的事件。this指向窗口的appScope。如果返回false将取消默认处理方法。请求失败
   * 事件请参考failure。
   * @param {Object} [configs.success.values] 窗口所有值组成的对象。
   * @param {Ext.window.Window} [configs.success.win] 窗口对象。
   * @param {String} [configs.success.responseText] 后台返回的字符串。
   * @param {Function} [configs.failure] 请求失败后触发的事件。this指向窗口的appScope。
   * @param {Object} [configs.failure.values] 窗口所有值组成的对象。
   * @param {Ext.window.Window} [configs.failure.win] 窗口对象。
   * @param {String} [configs.failure.responseText] 后台返回的字符串。
   * @param {Mixed...} configs.others 更多参数请参考Wb.prompt方法和Ext.window.Window对象。
   * @param {Boolean} [isNew] 是否为添加操作，默认为false即修改操作。
   * @return {Ext.window.Window} 编辑的对话框对象。如果为通过url加载窗口返回undefined。
   */
  edit: function(object, configs, isNew) {
    var win, handler, items, rec, hasBlob, grid = object.bindTable || object;
    if (!isNew) {
      rec = grid.getSelection()[0];
      if (!rec) {
        Wb.warn(Wb.format(Str.selectRecord, Str.modify));
        return;
      }
    }
    if (!configs)
      configs = {};
    if (configs.title === undefined)
      configs.title = isNew ? Str.add : Str.modify;
    if (configs.iconCls === undefined)
      configs.iconCls = isNew ? 'record_add_icon' : 'record_edit_icon';
    handler = function(values, win) {
      if (configs.beforerequest && Ext.callback(configs.beforerequest, win.appScope, [values, win]) === false)
        return;
      var data = Wb.apply(isNew ? {} : Wb.getData(rec, true), configs.params, values),
        requestConfig;
      if (hasBlob) {
        //使用表单上传时，清除同名的blob值，优先使用blob内容
        Wb.each(win.query('filefield'), function(item) {
          if (item.itemId)
            delete data[item.itemId];
        });
      }
      requestConfig = {
        url: configs.url,
        params: data,
        showError: false,
        failure: function(resp, action, value) {
          Wb.except(hasBlob ? action : resp, function() {
            if (Wb.getBool(configs.autoFocus, true) && resp.responseText) {
              //自动设置焦点
              var fieldLbl, focusCmp, blankPos = resp.responseText.indexOf(' ');
              if (blankPos > 0 && blankPos < 100) {
                fieldLbl = resp.responseText.substring(0, blankPos);
                try {
                  focusCmp = win.down('field[fieldLabel=* ' + fieldLbl + ']');
                  if (!focusCmp)
                    focusCmp = win.down('field[fieldLabel=' + fieldLbl + ']');
                  if (focusCmp && focusCmp.focus)
                    focusCmp.focus(true, true);
                } catch (e) {
                  //忽略
                }
              }
            }
          });
          if (configs.failure)
            Ext.callback(configs.failure, win.appScope, [values, win, hasBlob ? value : resp.responseText]);
        },
        success: function(resp, a, value) {
          var respObj, respText = hasBlob ? value : resp.responseText;
          //如果response返回json串应用到添加的记录中
          if (Ext.String.startsWith(respText, '{') && Ext.String.endsWith(respText, '}'))
            respObj = Wb.decode(respText);
          else respObj = {};
          if (isNew)
            Wb.add(grid, Wb.applyIf(respObj, data), configs.addPosition);
          else
            Wb.update(rec, Wb.applyIf(respObj, data));
          if (Ext.isTouch)
            win.destroy();
          else
            win.close();
          Ext.callback(configs.success, win.appScope, [values, win, respText]);
        }
      };
      if (hasBlob) {
        requestConfig.form = Ext.isTouch ? win : win.getComponent('form');
        Wb.upload(requestConfig);
      } else
        Wb.request(requestConfig);
    };
    if (configs.win) {
      win = object.bindEditWin; //单例模式下绑定的窗口
      if (!win) {
        win = configs.win;
        if (win instanceof Ext.window.Window) {
          //使用单例模式
          win.closeAction = 'hide';
          object.mon(object, 'destroy', function() {
            win.destroy();
            delete object.bindEditWin;
          });
          object.bindEditWin = win;
        } else {
          win.closeAction = 'destroy';
          win = new Ext.window.Window(win);
        }
      }
      hasBlob = !!win.down('filefield');
      win.editHandler = function() {
        var me = this;
        handler(Wb.getValue(me), me);
      };
      win.isNew = isNew;
      //editData提供给开发人员访问数据的接口
      win.editData = Wb.apply({}, configs.params, isNew ? null : rec.data);
      win.setTitle(configs.title);
      win.setIconCls(configs.iconCls);
      win.show();
      if (!isNew) {
        if (configs.titleField)
          Wb.setTitle(win, rec.data[configs.titleField]);
        Wb.setValue(win, Wb.apply({}, configs.params, rec.data));
      }
    } else {
      items = [];
      if (configs.firstItems) {
        Wb.each(configs.firstItems, function(item) {
          items.push(item);
        });
      }
      Wb.each(Wb.fetchColumns(grid) || Wb.getColumns(grid), function(column) {
        var editor, fieldName = column.dataIndex;
        if (column.editor) {
          editor = Wb.apply({
            itemId: fieldName
          }, column.editor);
        } else if (column.blobEditor) {
          hasBlob = true;
          if (isNew || Ext.isTouch) {
            editor = Wb.apply({
              itemId: fieldName
            }, column.blobEditor);
          } else {
            editor = {
              xtype: 'fieldcontainer',
              layout: 'hbox',
              allowBlank: column.blobEditor.allowBlank,
              items: [Wb.apply({
                flex: 1,
                itemId: fieldName
              }, column.blobEditor), {
                xtype: 'button',
                text: Str.del1,
                margin: '0 0 0 3',
                bindFieldName: fieldName,
                handler: function(me) {
                  var fileField = me.ownerCt.getComponent(me.bindFieldName);
                  fileField.reset();
                  fileField.removeFile = true; //标识该blob需删除
                }
              }]
            };
          }
        }
        if (editor) {
          if (Ext.isTouch)
            editor.label = column.text;
          else
            editor.fieldLabel = column.text;
          items.push(editor);
        }
      });
      if (configs.lastItems) {
        Wb.each(configs.lastItems, function(item) {
          items.push(item);
        });
      }
      win = Wb.prompt(Wb.apply({
        items: items,
        isUpload: hasBlob,
        handler: handler
      }, configs));
      if (!isNew) {
        if (configs.titleField)
          Wb.setTitle(win, rec.data[configs.titleField]);
        Wb.setValue(win, Wb.apply({}, configs.params, rec.data));
      }
    }
    return win;
  },
  /**
   * 删除表格中选择的记录。首先提示确定是否删除，然后向后台发请删除数据请求，最后在请求返回后删除表格中的数据。
   * @param {Ext.grid.Panel/Ext.data.Store} object 表格或store对象。
   * @param {Object} [configs] 配置参数。
   * @param {String} [configs.url] 后台url地址。
   * @param {Object} [configs.params] 参数对象。
   * @param {Function} [configs.failure] 调用失败后触发的事件。
   * @param {Function} [configs.success] 调用成功后触发的事件。传递参数grid。
   * @param {String} [configs.titleField] 用户提示信息的标题字段名称。
   */
  del: function(object, configs) {
    var grid = object.bindTable || object,
      sels = grid.getSelection();
    Wb.confirmDo(sels, function() {
      Wb.request({
        url: configs.url,
        failure: configs.failure,
        params: Wb.apply({
          destroy: Wb.getData(sels, true)
        }, configs.params),
        success: function() {
          Wb.remove(grid, sels);
          Ext.callback(configs.success, grid, [grid]);
        }
      });
    }, configs.titleField);
  },
  /**
   * 获取表格记录中的数据对象。
   * @param {Ext.data.Model/Ext.data.Model[]/GridPanel/Store} records 记录或数组。如果值为grid或store，将获取表格中所有记录数据。
   * @param {Boolean} mergeFields 是否合并记录原始值和修改值，原始记录的字段加#前缀。默认为false。
   * @return {Object/Array} 记录/记录数据组成的列表。
   */
  getData: function(records, mergeFields) {
    var rec, isArray, data = [],
      gridType = Ext.isTouch ? Ext.grid.Grid : Ext.grid.Panel;
    if (records instanceof gridType) {
      records = records.store.getRange();
      isArray = true;
    } else if (records instanceof Ext.data.Store) {
      records = records.getRange();
      isArray = true;
    } else {
      isArray = Ext.isArray(records);
      if (!isArray)
        records = [records];
    }
    Wb.each(records, function(record) {
      if (mergeFields) {
        rec = Ext.apply({}, record.data);
        Wb.each(record.data, function(name, value) {
          rec['#' + name] = value;
        });
        Wb.each(record.modified, function(name, value) {
          rec['#' + name] = value;
        });
      } else {
        rec = record.data;
      }
      data.push(rec);
    });
    return isArray ? data : data[0];
  },
  /**
   * 获得树指定节点下所有子节点的数据组成的对象。
   * @param {Ext.tree.Panel} tree 需要获取数据的树对象。
   * @param {Array/String} [properties] 需要获取节点的哪些属性，属性以逗号分隔或为数组。默认为获取全部属性。
   * @param {NodeInterface} [node] 指定获取数据的节点，默认为根节点。
   * @param {NodeInterface} [data] 存放返回数据的对象，默认为空对象。
   * @return {Object} 节点数据组成的对象。
   */
  getTree: function(tree, properties, node, data) {
    if (!node)
      node = tree.getRootNode();
    if (!data)
      data = {};
    if (properties)
      Ext.copyTo(data, node.data, properties);
    else
      Wb.apply(data, node.data);
    if (!node.data.leaf) {
      data.children = [];
      node.eachChild(function(child) {
        data.children.push(Wb.getTree(tree, properties, child, {}));
      });
    }
    return data;
  },
  /**
   * 获取表格或store中新增、删除和修改的记录，记录中被修改过的字段名称前加#。
   * @param {Ext.grid.Panel/Ext.data.Store} object 表格或store对象。
   * @return {Object} 被修改记录数据组成的对象：{destroy:destroyRecords, update:updateRecords, create: createRecords}。
   */
  getModified: function(object) {
    var store = object.store || object;

    return {
      destroy: Wb.getData(store.getRemovedRecords(), true),
      update: Wb.getData(store.getUpdatedRecords(), true),
      create: Wb.getData(store.getNewRecords())
    };
  },
  /**
   * 把表格或store数据同步到后台。同步操作在一个请求内完成。
   * @param {Object} configs 配置参数。
   * @param {Ext.grid.Panel} configs.grid 需要同步的表格，grid或store任选一个参数。
   * @param {Ext.data.Store} configs.store 需要同步的Store，grid或store任选一个参数。
   * @param {Object...} configs.configItems Wb.request请求时所有参数都可在该方法内使用。
   */
  sync: function(configs) {
    var editing, store = configs.store || configs.grid.store;
    if (store.bindTable) {
      editing = Wb.findEditing(store.bindTable);
      if (editing)
        editing.completeEdit();
    }
    configs = Ext.apply({}, configs); //创建副本
    if (!configs.params)
      configs.params = {};
    Ext.apply(configs.params, Wb.getModified(store));
    if (configs.store)
      delete configs.store;
    if (configs.grid)
      delete configs.grid;
    Wb.request(configs);
  },
  /**
   * 同步表格中新建或修改的记录。该方法首选把返回的数据更新到表格，然后再提交表格新建或修改的数据。
   * @param {Ext.grid.Panel/Ext.data.Store} object 需要同步的表格或store。
   * @param {Object[]} [records] 更新的记录列表，该数据将更新到表格的新建或修改记录。
   * @param {Boolean} [isNew] 同步的数据是否为新建的数据，true新建的数据，false修改的数据。默认为true。
   * @param {Boolean} [commit] 更新完成后是否自动提交。默认为true。
   */
  doSync: function(object, records, isNew, commit) {
    var index = 0,
      store = object.store || object,
      recs = isNew ? store.getNewRecords() : store.getUpdatedRecords();
    if (!Wb.isEmpty(records)) {
      Wb.each(recs, function(rec) {
        Wb.update(rec, records[index++], false);
      });
    }
    if (Wb.getBool(commit, true))
      store.commitChanges();
  },
  /**
   * 同步新建记录。该方法首选把返回的数据更新到表格，然后再提交表格新建的数据。
   * @param {Ext.grid.Panel/Ext.data.Store} object 需要同步的表格或store。
   * @param {Object[]} [records] 更新的记录列表，该数据将更新到表格的新建记录。
   * @param {Boolean} [commit] 更新完成后是否自动提交。默认为true。
   */
  syncCreate: function(object, records, commit) {
    Wb.doSync(object, records, true, commit);
  },
  /**
   * 同步修改的记录。该方法首选把返回的数据更新到表格，然后再提交表格修改的数据。
   * @param {Ext.grid.Panel/Ext.data.Store} object 需要同步的表格或store。
   * @param {Object[]} [records] 更新的记录列表，该数据将更新到表格的修改记录。
   * @param {Boolean} [commit] 更新完成后是否自动提交。默认为true。
   */
  syncUpdate: function(object, records, commit) {
    Wb.doSync(object, records, false, commit);
  },
  /**
   * 撤消对表格所有未决数据的更改。
   * @param {Ext.grid.Panel/Ext.data.Store} object 表格或store对象。
   */
  reject: function(object) {
    var grid = object.bindTable || object,
      editing = Wb.findEditing(grid);
    if (editing)
      editing.cancelEdit();
    grid.store.rejectChanges();
    Wb.refreshRowNum(grid);
  },
  /**
   * 判断表格是否含行号列。
   * @param {Ext.grid.Panel/Ext.data.Store} object 表格或store对象。
   * @return {Boolean} true含行号，false不含行号。
   */
  hasRowNumber: function(object) {
    var has = false,
      grid = object.bindTable || object,
      cols = Wb.fetchColumns(grid);
    if (!cols)
      return false;
    Wb.each(cols, function(col) {
      if (col.xtype == 'rownumberer') {
        has = true;
        return false;
      }
    });
    return has;
  },
  /**
   * 显示和更新进度条对话框。
   * @param {Number} pos 进度条的进度，值为0-1之间的任意数值。首次调用参数必须是0，以显示进度对话框。
   * @param {String} [message] 显示的文本提示信息，默认为Str.processing。
   * @param {String/Ext.dom.Element} [animateTarget] 对话框显示或隐藏时的动画效果目标id或元素对象。
   */
  progress: function(pos, message, animateTarget) {
    if (pos > 1)
      pos = 1;
    else if (pos < 0)
      pos = 0;
    if (pos === 0)
      Ext.MessageBox.show({
        msg: message || Str.processing,
        progressText: '0%',
        width: 300,
        closable: false,
        progress: true,
        animateTarget: animateTarget
      });
    else
      Ext.MessageBox.updateProgress(pos, Math.round(100 * pos) + '%');
  },
  /**
   * 上传表单中包括文件控件在内的所有控件值至后台。
   * @param {Object} configs 参数配置项。
   * @param {Ext.form.Panel} configs.form 提交的表单面板对象。
   * @param {String} configs.url 提交的url地址。
   * @param {Object} configs.params 参数对象。
   * @param {Component/Component[]} configs.out 控件列表，指定列表中的所有控件及其子控件值作为参数。
   * @param {String} configs.message 请求时显示的mask信息，默认为Str.processing。
   * @param {Boolean} configs.showMask 指定请求时是否显示mask，默认为true。
   * @param {Element/Component} configs.mask 指定请求时mask的遮盖对象，默认为整个window。
   * @param {Boolean} configs.showError 指定是否显示请求返回的错误信息，默认为true。
   * @param {Boolean} configs.showProgress 是否显示上传进度条，默认为false。
   * @param {Function} configs.callback 上传成功或失败后的回调事件。如果返回false将不触发success和failure事件，以及系统消息的显示。
   * @param {Ext.form.Panel} configs.callback.form formPanel对象。
   * @param {Object} configs.callback.action action对象。
   * @param {String} configs.callback.value 返回的文本值。
   * @param {Boolean} configs.callback.success 上传是否成功，true成功，false失败。
   * @param {Function} configs.success 上传成功后的事件，参数见callback方法。
   * @param {Function} configs.failure 上传失败后的事件，参数见callback方法。
   */
  upload: function(configs) {
    var copyConfigs, progressId = (new Date()).getTime(),
      form = configs.form;

    copyConfigs = Ext.apply({
      isUpload: true
    }, {
      showError: Wb.getBool(configs.showError, true),
      showMask: Wb.getBool(configs.showMask, true),
      params: Ext.apply(Wb.getValue(configs.out), configs.params, Wb.getValue(form)),
      progressId: progressId,
      url: configs.url + (configs.url.indexOf('?') != -1 ? '&' : '?') + '_jsonresp=1&uploadId=' + progressId
    }, configs);
    if (Ext.isTouch) {
      copyConfigs.formPanel = form;
      copyConfigs.form = form.element;
      Ext.Ajax.request(copyConfigs);
    } else {
      delete copyConfigs.form;
      form.form.submit(copyConfigs);
    }
  },
  /**
   * 显示服务器端的文件对话框。
   * @param {function} callback 点击对话框确定按钮时执行的方法。
   * @param {Array} callback.files 选择的文件列表。
   * @param {Ext.window.Window} callback.win 文件对话框窗口。
   * @param {Object} params 文件参数选项。
   * @param {function} [params.show] 对话框显示后的事件，可用参数scope。
   * @param {function} [params.hide] 对话框隐藏后的事件，可用参数scope。
   * @param {Boolean} [params.multiSelect] 是否允许多选，默认为false。
   * @param {String[]} [params.file] 文件路径，文件对话框将转到该文件所在路径。
   * @param {Boolean} [params.pathOnly] 是否仅显示路径，默认为false。
   * @param {String} [params.title] 对话框标题。
   * @param {Boolean} [params.forceSelection] 是否必须选择文件。
   * @param {Boolean} [params.autoClose] 是否自动关闭窗口，默认为true。
   * @param {String} [params.extName] 文件扩展名。
   */
  promptFile: function(callback, params) {
    if (Wb.hasNS('sys.dialog.openFile')) {
      sys.dialog.openFile.show(callback, params);
    } else {
      Wb.run({
        url: 'open-dialog',
        success: function(scope) {
          scope.show(callback, params);
        }
      });
    }
  },
  /**
   * 获取唯一的隐藏Iframe对象，用于模拟Ajax方式的文件下载。
   * @return {Iframe} Iframe dom对象。
   */
  getFrame: function() {
    if (!Wb.iframe) {
      var fr = document.createElement('iframe'),
        id = 'ifm' + Wb.getId();
      Ext.fly(fr).set({
        id: id,
        name: id,
        cls: Ext.baseCSSPrefix + 'hide-display',
        src: Ext.SSL_SECURE_URL
      });
      document.body.appendChild(fr);
      if (document.frames)
        document.frames[id].name = id;
      Ext.fly(fr).on('load', function() {
        var result, value, contentNode, doc;
        try {
          doc = Wb.getDoc(Wb.iframe);
          if (doc) {
            if (doc.body) {
              if ((contentNode = doc.body.firstChild) && /pre/i.test(contentNode.tagName)) {
                result = contentNode.textContent || contentNode.innerText;
              } else if ((contentNode = doc.getElementsByTagName('textarea')[0])) {
                result = contentNode.value;
              } else {
                result = doc.body.textContent || doc.body.innerText;
              }
              if (result) {
                result = Wb.decode(result);
                if (!result.success) {
                  value = result.value;
                  if (Ext.String.startsWith(value, '$WBE201'))
                    Wb.login();
                  else Wb.error(value);
                }
              }
            }
          } else {
            Wb.error(Str.serverNotResp);
          }
        } catch (e) {
          if (result)
            Wb.error(result);
          else
            Wb.error(Str.serverNotResp);
        }
      });
      Wb.iframe = fr;
    }
    return Wb.iframe;
  },
  /**
   * 获取唯一的表单对象，用于通过常规表单提交的方式提交参数。
   * @param {Object} [params] 参数对象。
   * @param {Boolean} [isUpload] 是否使用multipart/form-data编码，该编码方式通常用于上传文件。默认为false。
   * @return {Form} 表单dom对象。
   */
  getForm: function(params, isUpload) {
    var el, form = Wb.defaultForm;
    if (form) {
      while (form.childNodes.length !== 0)
        form.removeChild(form.childNodes[0]);
    } else {
      form = document.createElement('FORM');
      Wb.defaultForm = form;
      document.body.appendChild(form);
    }
    if (params) {
      Wb.each(params, function(key, value) {
        el = document.createElement('input');
        el.setAttribute('name', key);
        el.setAttribute('type', 'hidden');
        if (Ext.isArray(value) || Ext.isObject(value))
          value = Wb.encode(value);
        else if (Ext.isDate(value))
          value = Wb.dateToStr(value);
        el.setAttribute('value', Wb.isEmpty(value) ? '' : value);
        form.appendChild(el);
      });
    }
    if (isUpload)
      form.encoding = "multipart/form-data";
    else
      form.encoding = "application/x-www-form-urlencoded";
    return form;
  },
  /**
   * 向指定url通过常规的表单提交方式提交参数。表单提交区别于ajax提交，如果涉及文件的上传或下载必须使用表单提交的方式。
   *
   * Example:
   *
   *     Wb.submit('m?xwl=file', {p1: 'foo', p2: 123, p3: new Date()});
   *
   * @param {String} url 提交的URL地址。
   * @param {Object} [params] 参数对象。
   * @param {String} [target] 指定在何处打开url，可以为预设值或框架。默认为'_blank'。
   * @param {String} [method] 提交使用的方法。默认为'POST'。
   * @param {Boolean} [isUpload] 是否使用multipart/form-data编码，该编码方式通常用于上传文件。默认为false。
   */
  submit: function(url, params, target, method, isUpload) {
    var form = Wb.getForm(params, isUpload);
    form.action = url;
    form.method = method || 'POST';
    form.target = target || '_blank';
    form.submit();
  },
  /**
   * 把文本转换成单行，使用此函数将替换文本中的换行符为空格。
   * @param {String} text 需要替换的文本。
   * @param {Number} [ellipsisLength] 是否生成缩略文本，如果此值大于0将生成不大于该长度的缩略文本。
   * @return {String} 生成的单行文本。
   */
  toLine: function(text, ellipsisLength) {
    var val;
    if (text) val = text.replace(/\r?\n/g, ' ');
    else return '';
    if (ellipsisLength)
      return Ext.String.ellipsis(val, ellipsisLength);
    else
      return val;
  },
  /**
   * 获取指定位数和小数位数的数字验证函数。
   * @param {Number} precision 数字总长度。
   * @param {Number} [scale] 小数位数，默认为0。
   * @return {Function} 验证函数。
   */
  numValidator: function(precision, scale) {
    return function(value) {
      var numValue = this.getValue();
      if (Wb.isEmpty(numValue))
        return true;
      var arr, str = String(numValue); //使用getValue可处理指数
      if (Ext.String.startsWith(str, '-'))
        str = str.substring(1); //去掉负数符号
      if (str.indexOf('.') != -1)
        arr = str.split('.'); //.为小数分隔符
      else if (str.indexOf(',') != -1)
        arr = str.split(','); //,为小数分隔符
      else arr = [str, '']; //无小数
      if (arr[0].length + arr[1].length > precision || arr[1].length > scale)
        return Wb.format(Str.invalidValue, value);
      else return true;
    };
  },
  /**
   * 把标准格式的字符串转换成日期类型。标准格式指字符串必须符合Y-m-d H:i:s或Y-m-d H:i:s.u的格式。
   * @param {String} string 需要转换为日期类型的字符串。
   * @return {Date} 转换后的日期。如果string为空或格式无效返回undefined。
   */
  strToDate: function(string) {
    if (!string)
      return undefined;
    if (string.indexOf('.') == -1)
      return Ext.Date.parse(string, 'Y-m-d H:i:s');
    else
      return Ext.Date.parse(string, Wb.dateFormat);
  },
  /**
   * 把日期转换成标准格式的字符串。标准格式指Y-m-d H:i:s.u的格式。
   * @param {Date} date 需要转换为字符类型的日期。
   * @return {String} 转换后的字符串。
   */
  dateToStr: function(date) {
    return Wb.format(date, Wb.dateFormat);
  },
  /**
   * 把日期转换成可阅读的文本格式。转换的格式可受客户端使用的区域不同而不同。
   * @param {Date} date 需要转换为字符类型的日期。
   * @param {Boolean} [timePart] 是否显示时间部分。true只显示时间部分，false只显示日期部分，null显示日期和时间，
   * undefined如果时间部分为00:00:00.000则只显示日期部分否则显示日期和时间。默认为undefined。
   * @return {String} 转换后的字符串。
   */
  dateToText: function(date, timePart) {
    var format, dateFormat, timeFormat;

    if (Ext.isTouch) {
      dateFormat = XTL.defaultDateFormat;
      timeFormat = XTL.defaultTimeFormat;
    } else {
      dateFormat = Ext.form.field.Date.prototype.format;
      timeFormat = Ext.form.field.Time.prototype.format;
    }
    if (!date) return '';
    if (Ext.isString(date))
      date = Wb.strToDate(date);
    if (timePart === true)
      format = timeFormat;
    else if (timePart === false)
      format = dateFormat;
    else if (timePart === null)
      format = dateFormat + ' ' + timeFormat;
    else {
      if (Wb.format(date, 'Hisu') === '000000000')
        format = dateFormat;
      else format = dateFormat + ' ' + timeFormat;
    }
    return Wb.format(date, format);
  },
  /**
   * 把指定键名转换成对应的值。如果没有找到指定键名返回空串。
   * @param {Object} K 键名。
   * @param {Array} items 键值对应项列表。
   * @return {String} 键名对应的值或空串。
   */
  kv: function(value, items) {
    var item = Wb.find(items, 'K', value);
    return item ? item.V : value;
  },
  /**
   * 用于显示键值的Renderer。
   */
  kvRenderer: window.Ext && Ext.isTouch ? function(value, r) {
    var cols = this.up('grid').getColumns(),
      colIndex = cols.indexOf(this);
    return Wb.kv(value, cols[colIndex]._keyItems);
  } : function(value, m, r, i, colIndex) {
    var cols, grid = this;
    if (grid instanceof Ext.grid.column.Column)
      grid = grid.up('grid');
    cols = Wb.fetchColumns(grid);
    return Wb.kv(value, cols[colIndex].keyItems);
  },
  /**
   * 对指定类型的数据进行格式化。可格式化的数据包括日期，数字和字符串。关于此方法的说明分别见Ext.Date.format,
   * Ext.util.Format.number和Ext.String.format。
   * @param {Object} param 需要格式化的值。
   * @return {String} 格式化后的字符串。
   */
  format: function(param) {
    if (Ext.isDate(param))
      return Ext.Date.format.apply(this, arguments);
    else if (Ext.isNumber(param))
      return Ext.util.Format.number.apply(this, arguments);
    else
      return Ext.String.format.apply(this, arguments);
  },
  /**
   * 获取Store返回原始数据的附加属性。
   * @param {Ext.grid.Panel/Ext.data.Store} object 表格或store对象。
   * @param {String} tagName 属性名称。
   * @return {Object} 获取的属性值。
   */
  getTag: function(object, tagName) {
    var store = object.store || object;
    return store.proxy.reader.rawData[tagName];
  },
  /**
   * 获取store返回的原始columns列表。该值取自store.proxy.reader.rawData.columns属性。
   * @param {Ext.grid.Panel/Ext.data.Store} object 表格或store对象。
   * @return {Array} 原始列组成的数组。
   */
  getColumns: function(object) {
    if (!object) return null;
    var store;

    if (Ext.isTouch) {
      store = object._store || object;
      return store ? store._proxy._reader.rawData.columns : null;
    } else {
      store = object.store || object;
      return store ? store.proxy.reader.rawData.columns : null;
    }
  },
  /**
   * 获取store返回的columns实例列表。
   * @param {Ext.grid.Panel} grid 表格对象。
   * @return {Array} 实例列组成的数组。
   */
  fetchColumns: function(grid) {
    if (Ext.isTouch) {
      if (grid instanceof Ext.grid.Grid)
        return grid.getColumns();
      else
        return null;
    } else
      return grid.headerCt ? grid.headerCt.getGridColumns() : grid.columns;
  },
  /**
   * 获取表格中指定字段名称所在列对象。如果表格列对象未生成，列取自store.proxy.reader.rawData.columns属性。
   * @param {Ext.grid.Panel/Ext.data.Store} object 表格或store对象。
   * @param {String/Number} fieldName 字段名称或索引号。
   * @return {Object} 列对象。如果没有找到返回null。
   */
  getColumn: function(object, fieldName) {
    var cols, grid = object.bindTable || object;
    if (Wb.isEmpty(grid.columns))
      cols = Wb.getColumns(grid);
    else cols = grid.columns;
    if (Ext.isString(fieldName))
      return Wb.find(cols, 'dataIndex', fieldName);
    else return cols[fieldName] || null;
  },
  /**
   * 加载表格关联的列。列数据来自表格关联的store.proxy.reader.rawData.columns属性。
   * @param {Ext.grid.Panel/Ext.data.Store} object 表格或store对象。
   * @param {Boolean} reload 是否刷新列。如果false当只有表格列为空时加载，否则每次都刷新列。默认为false。
   */
  loadColumns: function(object, reload) {
    var cols, grid = object.bindTable || object;
    if (Ext.isTouch) {
      if (reload || Wb.isEmpty(grid.getColumns())) {
        cols = Wb.getColumns(grid._store);
        if (cols) {
          //touch列稍宽，补1.2倍宽度
          Wb.each(cols, function(col) {
            if (col.width)
              col.width = Math.round(col.width * 1.2);
            else if (col.flex)
              col.width = 200;
          });
          grid.updateColumns(cols);
        }
      }
    } else {
      cols = Wb.fetchColumns(grid);
      if (reload || Wb.isEmpty(cols) || cols.length == 1 && cols[0].isCheckerHd) {
        cols = Wb.getColumns(grid.store);
        if (cols)
          grid.reconfigure(null, cols);
      }
    }
  },
  /**
   * 表格自动加载列接口方法。
   * @param {Ext.grid.Panel} grid 表格对象。
   */
  autoLoadColumns: function(grid) {
    if (grid) {
      var loadColumns, cols;
      if (Ext.isTouch) {
        loadColumns = Wb.getBool(grid.loadColumns, grid.initialConfig.loadColumns);
        cols = grid.getColumns();
      } else {
        loadColumns = grid.loadColumns;
        cols = grid.headerCt.getGridColumns();
      }
      if ((!loadColumns || loadColumns == 'auto') && (Wb.isEmpty(cols) || cols.length == 1 && cols[0].isCheckerHd)) {
        Wb.loadColumns(grid);
      } else if (loadColumns == 'reload') {
        Wb.loadColumns(grid, true);
      }
    }
  },
  /**
   * 时间类型显示函数，仅显示日期类型的时间部分。参数说明见column的renderer属性。
   * @return {String} 时间部分文本。
   */
  timeRenderer: function(value) {
    return Wb.dateToText(value, true);
  },
  /**
   * 二进制字段的显示函数。提供二进制字段的上传、下载和清空功能。参数说明见column的renderer属性。
   */
  blobRenderer: function(value, b, c, rowIndex, colIndex) {
    var col, fieldName, grid, gridId,
      btns = [];

    if (Ext.isTouch) {
      grid = this.up('grid');
      rowIndex = grid.store.indexOf(b);
      fieldName = Wb.encode(c);
    } else {
      grid = this;
      col = Wb.getColumn(grid, colIndex);
      fieldName = Wb.encode(col ? (col.dataIndex || '') : '');
    }
    gridId = grid.id;
    if (grid.uploadBlob && (!grid.ifUploadBlob || grid.ifUploadBlob(fieldName) !== false)) {
      btns.push("<a href='javascript:Wb.call(\"" + gridId + "\",\"uploadBlob\"," +
        fieldName + "," + rowIndex + ")'>" + Str.upload + "</a>");
    }
    if (grid.downloadBlob && value && (!grid.ifDownloadBlob || grid.ifDownloadBlob(fieldName) !== false)) {
      btns.push("<a href='javascript:Wb.call(\"" + gridId + "\",\"downloadBlob\"," +
        fieldName + "," + rowIndex + ")'>" + Str.download + "</a>");
    }
    if (grid.removeBlob && value && (!grid.ifRemoveBlob || grid.ifRemoveBlob(fieldName) !== false)) {
      btns.push("<a href='javascript:Wb.call(\"" + gridId + "\",\"removeBlob\"," +
        fieldName + "," + rowIndex + ")'>" + Str.del1 + "</a>");
    }
    if (btns.length)
      return btns.join('&nbsp;&nbsp;');
    else return value;
  },
  /**
   * 生成指定图标样式的图标HTML脚本。该脚本通常可用于表格、树、下拉框、HTML等。
   *
   * Example:
   *
   *     return Wb.getIcon('user_icon', '用户') + value; //应用于Column的renderer配置项
   *
   * @param {String} iconCls 图标样式。
   * @param {String} [title] 图标提示文本。
   * @return {String} HTML脚本。
   */
  getIcon: function(iconCls, title) {
    if (Wb.isEmpty(title))
      title = '';
    else
      title = ' title=' + Wb.encode(title);
    return '<span class="wb_icon ' + iconCls + '"' + title + '></span>';
  },
  /**
   * 生成指定图标样式的图标HTML脚本。该脚本通常可用于表格、树、下拉框、HTML等。
   *
   * Example:
   *
   *     return Wb.getIcon('user_icon', '用户') + value; //应用于Column的renderer配置项
   *
   * @param {String} iconCls 图标样式。
   * @param {String} [title] 图标提示文本。
   * @return {String} HTML脚本。
   */
  getUrlIcon: function(url, title) {
    if (Wb.isEmpty(title))
      title = '';
    else
      title = ' title=' + Wb.encode(title);
    return '<span style="background-image:url(' + url + ')" class="wb_icon"' + title + '></span>';
  },
  /**
   * 通过指定对象id和方法名称来调用指定对象的指定方法。
   * @param {String} componentId 对象id。
   * @param {String} methodName 方法名称。
   * @param {Object...} params 方法调用的参数列表。
   */
  call: function(componentId, methodName, params) {
    var comp = Ext.getCmp(componentId);
    comp[methodName].apply(comp, [].slice.call(arguments, 2));
  },
  work: function(weight, volume, params) {
    //     if(weight*0.001<1){
    //     	return 1;
    //     }else if(volume*0.4>weight*0.001){
    //     	return volume*0.4;
    //     }else{
    //     	return weight*0.001;
    //     }
    if (weight * 0.001 > volume * 0.4) {
      return weight;
    } else {
      return volume;
    }
  },
  /**
   * 调用dom所在对象关联appScope内指定名称的方法，方法名称由dom组件method属性指定，关联组件的样式由cls属性指定，默认为x-grid。
   * @param {DOM} dom 关联的dom对象。
   * @param {Object...} params 方法调用的参数列表。
   */
  invoke: function(dom) {
    var el = Ext.fly(dom),
      grid = Ext.getCmp(Ext.fly(dom).up('div[class~=' + (el.getAttribute('cls') || 'x-grid') + ']').id);
    if (grid.ownerCt instanceof Ext.grid.Panel)
      grid = grid.ownerCt;
    grid.appScope[el.getAttribute('method')].apply(dom, [].slice.call(arguments, 1));
  },
  /**
   * 根据源控件大小和位置，设置目标控件大小和位置。
   * @param {Component} source 源控件。
   * @param {Component} dest 目标控件。
   * @return {Boolean} 如果已经更改目标位置返回true，否则返回false。
   */
  setBox: function(source, dest) {
    //替代element.setBox方法
    var result = false,
      x1 = source.getLocalX(),
      y1 = source.getLocalY(),
      width1 = source.width,
      height1 = source.height,
      x2 = dest.getLocalX(),
      y2 = dest.getLocalY(),
      width2 = dest.width,
      height2 = dest.height;
    if (x1 !== x2) {
      dest.setLocalX(x1);
      result = true;
    }
    if (y1 != y2) {
      dest.setLocalY(y1);
      result = true;
    }
    if (width1 != width2) {
      dest.setWidth(width1);
      result = true;
    }
    if (height1 != height2) {
      dest.setHeight(height1);
      result = true;
    }
    return result;
  },
  /**
   * 在指定对象中查找名称和值匹配的项。
   *
   * Example:
   *
   *     var index = Wb.find(store, 'name', value);
   *
   *     var item = Wb.find([{a: 123}, {a: 'abc'}], 'a', 'abc');
   *
   *     var item = Wb.find(records, fieldName, value);
   *
   * @param {Mixed} component 查找的对象。
   * @param {String} name 查找的名称。
   * @param {Object} value 查找的值。
   * @return {Object} 查找到的项。如果没有找到返回null。
   */
  find: function(component, name, value) {
    var result = null;
    if (Ext.isArray(component)) {
      if (component[0] instanceof Ext.data.Model) {
        Wb.each(component, function(rec) {
          if (rec.data[name] === value) {
            result = rec;
            return false;
          }
        });
      } else {
        Wb.each(component, function(item) {
          if (item[name] === value) {
            result = item;
            return false;
          }
        });
      }
    } else if (component) {
      component.each(function(rec) {
        if (rec.data[name] === value) {
          result = rec;
          return false;
        }
      });
    } else return null;
    return result;
  },
  /**
   * 获取字符串中的名称部分。名称部分为第一个“=”符号前的字符串。
   * @param {String} string 需要获取名称的字符串。
   * @return {String} 名称部分字符串。如果字符串中没有“=”，将返回整个字符串。
   */
  namePart: function(string) {
    if (Wb.isEmpty(string))
      return '';
    var i = string.indexOf('=');
    if (i == -1)
      return string;
    else
      return string.substring(0, i);
  },
  /**
   * 获取字符串中的值部分。值部分为第一个“=”符号后的字符串。
   * @param {String} string 需要获取值的字符串。
   * @return {String} 值部分字符串。如果字符串中没有“=”，将返回空串。
   */
  valuePart: function(string) {
    if (Wb.isEmpty(string))
      return '';
    var i = string.indexOf('=');
    if (i == -1)
      return '';
    else
      return string.substring(i + 1);
  },
  /**
   * 获取文档中选择的文本内容。
   * @return {String} 选择的文本内容。
   */
  getSelText: function() {
    if (window.getSelection)
      return window.getSelection().toString();
    else if (document.selection && document.selection.createRange)
      return document.selection.createRange().text;
    else return '';
  },
  /**
   * 获取记录集指定属性值组成的数组。
   * @param {Ext.data.Model[]} records 记录集。
   * @param {String} name 属性名称。
   * @return {Array} 值组成的数组。
   */
  pluck: function(records, name) {
    var i, j = records.length,
      data = [];
    for (i = 0; i < j; i++)
      data.push(records[i].data[name]);
    return data;
  },
  /**
   * 清除浏览器中所有选择的文本。
   */
  clearSelText: function() {
    if (document.selection) {
      document.selection.empty();
    } else if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  },
  /**
   * 监听面板按回车键，如果面板按回车键将执行指定方法。
   * @param {Panel} panel 面板对象，事件将添加到该面板。
   * @param {Function} fn 当面板上按回车键时执行的方法。
   */
  monEnter: function(panel, fn) {
    var keyMap = panel.getKeyMap();
    keyMap.on(13, function(key, e) {
      var me = panel,
        target = e.target;
      if (me.el.isMasked() || Ext.getBody().isMasked())
        return;
      if (target && target.type == 'textarea')
        return;
      e.stopEvent();
      fn(panel);
    });
  },
  /**
   * 判断指定DOM对象是否是可编辑的控件。
   * @param {DOM} dom 需要判断的dom对象。
   * @return {Boolean} true可编辑的控件，false不可编辑的控件。
   */
  isEditor: function(dom) {
    return dom.tagName == 'INPUT' && (dom.type == 'text' || dom.type == 'password') || dom.tagName == 'TEXTAREA';
  },
  /**
   * 设置指定名称和值的Cookie。Cookie保留时长为1个月。
   * @param {String} name Cookie名称。
   * @param {Object} value Cookie值。
   */
  setCookie: function(name, value) {
    Ext.util.Cookies.set(name, value, Ext.Date.add(new Date(), Ext.Date.MONTH, 1));
  },
  /**
   * 获取指定名称的cookie。
   * @param {String} name Cookie名称。
   * @return {Object} 获取的Cookie值。
   */
  getCookie: function(name) {
    return Ext.util.Cookies.get(name);
  },
  /**
   * 高效设置节点选择框是否选择，如果节点被选择节点文字使用蓝色高亮，如果节点未被选择节点文字使用灰色加删除线样式。
   * @param {NodeInterface} node 节点。
   * @param {Boolean} checked 选择状态。如果为null选择框不选中，文字不加样式。
   * @param {TreePanel} tree 树控件对象。
   * @param {Boolean} [ignoreBox] 是否不处理节点前的复选框，默认为false。
   */
  setChecked: function(node, checked, tree, ignoreBox) {
    var box, el, isNull = checked === null;
    checked = !!checked; //转换为布尔值
    node.data.checked = checked; //仅使用标识即可
    el = Ext.fly(tree.view.id + '-record' + node.id);
    if (!el) return; //未展开时el为null
    box = ignoreBox ? null : el.down('input[type=button]');
    if (isNull) {
      el.setStyle('text-decoration', '');
      el.setStyle('color', '');
      if (box) box.removeCls('x-tree-checkbox-checked');
    } else if (checked) {
      el.setStyle('text-decoration', '');
      el.setStyle('color', 'blue');
      if (box) box.addCls('x-tree-checkbox-checked');
    } else {
      el.setStyle('text-decoration', 'line-through');
      el.setStyle('color', 'gray');
      if (box) box.removeCls('x-tree-checkbox-checked');
    }
  },
  /**
   * 创建指定对象实例并显示。
   * @param {Object} config 实例配置对象。
   * @return {Component} 实例对象。
   */
  show: function(config) {
    //if(config.xtype=='window')备函数以后扩充
    var comp = new Ext.window.Window(config);
    return comp.show();
  },
  /**
   * 对指定数组进行正向非区分大小写的排序。
   * @param {Array} array 需要排序的数组。排序结果将影响数组。
   * @param {String} [itemName] 如果指定该值，表示比较对象中的该名称值。
   * @param {Boolean} [useLocale] 是否使用本地方法localeCompare比较，默认为true。
   * @return {Array} 排序后的数组本身。
   */
  sort: function(array, itemName, useLocale) {
    var locale = Wb.getBool(useLocale, true);
    return array.sort(function(val1, val2) {
      var v1, v2;
      if (itemName) {
        v1 = val1 ? val1[itemName] : '';
        v2 = val2 ? val2[itemName] : '';
      } else {
        v1 = val1 || '';
        v2 = val2 || '';
      }
      if (Ext.isString(v1))
        v1 = v1.toUpperCase();
      if (Ext.isString(v2))
        v2 = v2.toUpperCase();
      if (locale)
        return v1.localeCompare(v2);
      else {
        if (v1 > v2) return 1;
        else if (v1 < v2) return -1;
        else return 0;
      }
    });
  },
  /**
   * 绑定grid/store的所有列编辑器的change事件和对应store的添加/删除事件至指定事件。
   * @param {Ext.grid.Panel/Ext.data.Store} object 表格或store对象。
   * @param {Function} changeEvent 绑定的change事件。
   */
  bindChange: function(grid, changeEvent) {
    if (grid.bindTable)
      grid = grid.bindTable;
    if (!grid.changeEventBinded) {
      var store = grid.store;
      Wb.each(Wb.fetchColumns(grid), function(col) {
        if (col.editor) {
          if (col.editor.listeners)
            col.editor.listeners.change = changeEvent;
          else col.editor.listeners = {
            change: changeEvent
          };
        }
      });
      store.mon(store, 'add', changeEvent);
      store.mon(store, 'remove', changeEvent);
      grid.changeEventBinded = true;
    }
  },
  /**
   * 对参数列表中的所有控件设置禁用状态。
   * @param {Component/Component[]} items 控件列表或单个控件。
   * @param {Boolean} disabled 是否禁用。
   */
  setDisabled: function(items, disabled) {
    items = Ext.Array.from(items);
    Ext.suspendLayouts();
    Wb.each(items, function(item) {
      if (item.setDisabled)
        item.setDisabled(disabled);
    });
    Ext.resumeLayouts(true);
  },
  /**
   * 获取应用容器入口控件，返回的优先级依次为：itemId为main的入口,viewport/container,panel,form,tabpanel,fieldset。
   * 如果没找到以上控件，则返回第一个容器控件。如果无容器控件则返回null。
   * @param {Object} app 命名空间。
   * @return {Component} 获取的入口控件。
   */
  optMain: function(app) {
    if (!app)
      return null;
    var index, isValidContainer, foundMain, entries = [],
      entryXTypes = ['container', 'panel', 'form', 'tabpanel', 'fieldset']; //viewport已经转为container
    Wb.each(app, function(k, item) {
      if (Ext.isTouch) {
        isValidContainer = item && !item.ownerCt && item instanceof Ext.Container;
      } else {
        isValidContainer = item && !item.ownerCt && item instanceof Ext.container.Container &&
          !(item instanceof Ext.window.Window);
      }
      if (isValidContainer) {
        if (item.itemId == 'main') {
          foundMain = item;
          return false;
        }
        index = Wb.indexOf(entryXTypes, item.xtype);
        if (index == -1)
          index = 9; //优先级最低
        entries.push([item, index]);
      }
    });
    if (foundMain)
      return foundMain;
    entries.sort(function(v1, v2) {
      return v1[1] - v2[1];
    });
    return entries.length ? entries[0][0] : null;
  },
  /**
   * 在主页，IDE或其他任意窗口中打开指定xwl文件或任意url链接。xwl模块可以直接添加到应用主页而无需frame，从而使应用
   * 模块的加载更快速，同时更省资源。如果上下文环境在主页或IDE将直接打开，否则在新窗口内打开。如果需要直接在新窗口中打
   * 开，可以使用Wb.submit。
   *
   * Example:
   *
   *     Wb.open({url: 'm?xwl=path/myModule', title: 'My Module', iconCls: 'myIconCls',
   *              params: {param1: 'foo', param2: 'bar'}});
   *     Wb.open({url: 'http://www.google.com', title: 'Google', inframe:true, iconCls: 'web_icon'});
   *
   * @param {Object} PortalConfigs 打开模块或文件的配置参数。该参数子模块可见，首字母为大写。
   * @param {String} PortalConfigs.url url路径。
   * @param {String} [PortalConfigs.title] 显示在页标签中的标题。
   * @param {String} [PortalConfigs.iconCls] 显示在页标签中的图标样式。
   * @param {String} [PortalConfigs.icon] 显示在页标签中的图标URL。
   * @param {Object} [PortalConfigs.params] 提交的参数对象。
   * @param {Boolean} [PortalConfigs.inframe] 是否显示在Iframe中，默认为false。
   * @param {String} [PortalConfigs.method] 提交的方法，默认为POST提交。
   * @param {String} [PortalConfigs.tooltip] tab选项卡上的提示信息。
   * @param {Boolean} [PortalConfigs.reload] 如果模块已经存在是否重新加载。
   * @param {Container} [PortalConfigs.reloadCard] 需要重新加载的tab页。
   * @param {Boolean} [PortalConfigs.frameOnly] 是否只创建模块的框架。如果为true仅创建tab页，不加载模块内容。
   * @param {Boolean} [PortalConfigs.notActiveCard] 是否不激活创建的tab页。
   * @param {Boolean} [PortalConfigs.contextOwner] contextOwner对象。
   * @param {Boolean} [PortalConfigs.newWin] 是否在新窗口中使用表单提交方式打开，默认false。如果为GET方法且params为空则使用open函数打开。
   * @param {Boolean} [PortalConfigs.download] 是否下载资源，默认false。
   * @param {Boolean} [PortalConfigs.mask] 在加载过程中是否使用mask，默认为true。
   * @param {Boolean} [PortalConfigs.showError] 是否显示异常信息，默认为true。
   * @param {Boolean} [PortalConfigs.newTab] 如果指定模块已经打开，是否允许创建新的tab。默认为自动判断，即如果存在params，则允许创建新tab，
   * 否则激活已经打开的模块。
   * @param {Container/Boolean} [PortalConfigs.container] 把新的模块面板添加到该容器对象，默认为Home或IDE的tab。
   * 如果为false，则不创建模块面板。
   * @param {Function} [PortalConfigs.success] 加载xwl文件成功后的回调函数。传递参数appScope和responseText，this指向card。
   * @param {Function} [PortalConfigs.failure] 加载xwl文件失败后的回调函数。传递参数appScope和responseText，this指向card。
   * @return {Panel} 如果添加新的模块面板则返回该对象，否则为undefined。
   */
  open: function(PortalConfigs) {
    function destroyAll(ownerCt, scope) {
      if (!scope) return;
      Wb.each(scope, function(k, v) {
        //Ext.data.Model不需要手工释放
        if (v && v != ownerCt && !(v instanceof Ext.data.Model))
          Ext.destroy(v);
      });
      Ext.Object.clear(scope);
    }

    if (PortalConfigs.reloadCard) {
      PortalConfigs.url = Wb.toUrl(PortalConfigs.reloadCard.bindFile);
      PortalConfigs.reload = true;
    }
    if (PortalConfigs.download) {
      Wb.download(PortalConfigs.url, PortalConfigs.params);
      return;
    }
    var PortalVars = {}; //该变量在子模块可见，因此使用大写字母开头。
    PortalVars.xwlCall = Ext.String.startsWith(PortalConfigs.url, 'm?xwl=');
    if (PortalVars.xwlCall)
      PortalVars.path = PortalConfigs.url.substring(6) + '.xwl';
    else
      PortalVars.path = PortalConfigs.url;
    PortalVars.hasHome = Wb.hasNS('sys.home');
    PortalVars.hasIde = Wb.hasNS('sys.ide');
    if (!PortalConfigs.newWin && (Wb.isValue(PortalConfigs.container) || PortalVars.hasHome || PortalVars.hasIde)) {
      if (PortalConfigs.container === false)
        PortalVars.tab = null;
      else if (PortalConfigs.container)
        PortalVars.tab = PortalConfigs.container;
      else if (PortalVars.hasIde)
        PortalVars.tab = Ide.fileTab;
      else
        PortalVars.tab = sys.home.tab;
      if (PortalVars.tab) {
        if (PortalConfigs.newTab === false || !PortalConfigs.newTab && !PortalConfigs.params) {
          if (PortalConfigs.reloadCard)
            PortalVars.card = PortalConfigs.reloadCard;
          else {
            //只有不带参数的模块才不允许重复创建tab页
            PortalVars.card = null;
            PortalVars.tab.items.each(function(item) {
              if (item.bindFile == PortalVars.path) {
                PortalVars.card = item;
                return false;
              }
            });
          }
          if (PortalVars.card) {
            if (PortalConfigs.reload) {
              if (Wb.unloadEvents)
                delete Wb.unloadEvents[PortalVars.card.id];
              Ext.applyIf(PortalConfigs, PortalVars.card.lastPortalConfigs);
              Ext.Object.clear(PortalVars.card.lastPortalVars);
              PortalVars.card.lastPortalVars = PortalVars;
              Ext.Object.clear(PortalVars.card.lastPortalConfigs);
              PortalVars.card.lastPortalConfigs = PortalConfigs;
              PortalVars.card.removeAll(true);
              destroyAll(PortalVars.card, PortalVars.card.appScope);
              PortalVars.card.fireEvent('destroy', PortalVars.card);
            } else {
              if (!PortalConfigs.notActiveCard)
                PortalVars.tab.setActiveTab(PortalVars.card);
              return PortalVars.card;
            }
          }
        }
        if (!PortalVars.card) {
          PortalVars.cardConfig = {
            iconCls: PortalConfigs.iconCls,
            icon: PortalConfigs.icon,
            title: Ext.String.ellipsis(PortalConfigs.title, 20),
            closable: true,
            lastPortalVars: PortalVars,
            lastPortalConfigs: PortalConfigs,
            hideMode: 'offsets' /*Ext.isIE ? 'offsets' : 'display'*/ ,
            xtype: 'panel',
            hasParams: !!PortalConfigs.params,
            bindFile: PortalVars.path,
            border: false,
            layout: 'fit',
            listeners: {
              destroy: function(panel) {
                destroyAll(panel, panel.appScope);
                if (Wb.unloadEvents)
                  delete Wb.unloadEvents[panel.id];
              },
              beforeclose: function(panel) {
                if (!panel.confirmDisabled && Wb.unloadEvents) {
                  if (Wb.unloadEvents[panel.id] && panel.confirmClose !== false) {
                    var result = Wb.unloadEvents[panel.id]();
                    if (Wb.isValue(result)) {
                      Wb.confirm(result + '<br><br>' + Str.confirmClose, function() {
                        panel.confirmClose = false;
                        panel.close();
                      });
                      return false;
                    }
                  } else
                    delete Wb.unloadEvents[panel.id];
                }
              }
            }
          };
          if (PortalConfigs.tooltip || PortalVars.cardConfig.title !== PortalConfigs.title) {
            PortalVars.cardConfig.tabConfig = {
              tooltip: PortalConfigs.tooltip || PortalConfigs.title
            };
          }
          PortalVars.card = PortalVars.tab.add(PortalVars.cardConfig);
        }
        if (!PortalConfigs.notActiveCard)
          PortalVars.tab.setActiveTab(PortalVars.card);
      }
      if (PortalConfigs.frameOnly)
        return PortalVars.card;
      if (PortalVars.tab && (PortalConfigs.inframe ||
          PortalConfigs.inframe === undefined && PortalVars.card.iframe)) {
        if (!PortalVars.card.iframe) {
          Wb.insertIframe(PortalVars.card, PortalConfigs.mask);
        }
        PortalVars.card.iframe.submit(PortalConfigs.url, PortalConfigs.params, PortalConfigs.method);
      } else {
        var doRequest = function() {
          if (PortalVars.path && PortalVars.path.indexOf('?') == -1 && Ext.String.endsWith(PortalVars.path, '.xwl'))
            PortalVars.requestUrl = 'm?xwl=' + PortalVars.path.slice(0, -4);
          else PortalVars.requestUrl = PortalVars.path;
          return Wb.request({
            url: PortalVars.requestUrl + (PortalVars.requestUrl.indexOf('?') == -1 ? '?xwlt=1' : '&xwlt=1'),
            mask: PortalVars.card,
            timeout: -1,
            showError: false,
            method: PortalConfigs.method || 'POST',
            showMask: PortalConfigs.mask,
            params: PortalConfigs.params,
            callback: function(o, success, response) {
              //不可在failure事件中使用，因为failure在callback之前触发
              if (PortalVars.card) {
                delete PortalVars.card.request;
                if (!success) {
                  if (!PortalVars.card.notShowError && PortalConfigs.showError !== false)
                    Wb.except(response);
                  if (!PortalVars.card.isClosing) {
                    PortalVars.card.close();
                  }
                }
              } else if (!success && PortalConfigs.showError !== false)
                Wb.except(response);
              if (!success && PortalConfigs.failure) {
                Ext.callback(PortalConfigs.failure, PortalVars.card, [{}, response.responseText]);
              }
            },
            success: function(PortalResp) {
              if (PortalResp.responseText) {
                //如果已经定义为函数
                if (PortalResp.responseText.substring(0, 10) == '(function(' && PortalResp.responseText.slice(-3) == '();') {
                  PortalVars.appScope = eval(PortalResp.responseText.slice(0, -2) +
                    '{}, PortalConfigs.contextOwner||PortalVars.card||null);\n//# sourceURL=' +
                    window.location.href.substring(0, window.location.href.lastIndexOf('/')) + '/' + PortalVars.path);
                  //sourceURL用于在控制台标识文件
                  PortalVars.entry = Wb.optMain(PortalVars.appScope);
                  if (PortalVars.card)
                    PortalVars.card.appScope = PortalVars.appScope;
                  if (PortalVars.card && PortalVars.entry)
                    PortalVars.card.add(PortalVars.entry);
                  if (PortalConfigs.success) {
                    Ext.callback(PortalConfigs.success, PortalVars.card, [PortalVars.appScope, PortalResp.responseText]);
                  }
                } else {
                  //否则直接显示脚本内容
                  PortalVars.card.add({
                    xtype: 'container',
                    autoScroll: true,
                    style: 'font-size:13px;line-height:20px;',
                    padding: 8,
                    html: Wb.encodeHtml(PortalResp.responseText)
                  });
                  if (PortalConfigs.success) {
                    Ext.callback(PortalConfigs.success, PortalVars.card, [{}, PortalResp.responseText]);
                  }
                }
              } else {
                if (PortalConfigs.success) {
                  Ext.callback(PortalConfigs.success, PortalVars.card, [{}, '']);
                }
              }
            }
          });
        };
        if (PortalVars.tab) {
          if (PortalVars.card.iframe) {
            PortalVars.card.fireEvent('beforedestroy', PortalVars.card);
            PortalVars.card.mun(PortalVars.card, 'beforedestroy');
            delete PortalVars.card.iframe;
          }
          PortalVars.card.update('');
          PortalVars.card.request = doRequest(PortalVars.card);
          PortalVars.card.mon(PortalVars.card, 'close', function(me) {
            me.isClosing = true;
            if (me.request) {
              var xhr = me.request.xhr;
              if (xhr) {
                me.notShowError = true;
                xhr.abort();
              }
            }
          });
        } else doRequest();
      }
      if (PortalVars.tab)
        return PortalVars.card;
    } else {
      if (Ext.util.Format.uppercase(PortalConfigs.method) == 'GET' && !PortalConfigs.params) {
        //如果为GET方法且无参数则在新窗口中打开
        window.open(PortalConfigs.url);
      } else {
        //如果指定方法或带参数则采用表单提交的方式
        Wb.submit(PortalConfigs.url, PortalConfigs.params, null, PortalConfigs.method);
      }
    }
  },
  /**
   * 运行指定路径的xwl文件。该方法通过ajax的方法调用指定的模块，并在回调函数中获取模块的命名空间。
   * 该方法同Wb.open方法的区别为运行时不创建默认容器。
   * Example:
   *
   *     Wb.run({url: 'm?xwl=path/myModule', params: {foo: 'bar'}, success: function(scope, responseText){
   *        scope.myWin.show();
   *     }});
   *
   * @param {Object} configs 打开模块或文件的配置参数。该参数子模块可见，首字母为大写。
   * @param {String} configs.url 引用xwl模块的url相对路径或捷径。
   * @param {Object} [configs.params] 提交的参数对象。
   * @param {Function} [configs.success] 加载成功后的回调函数，可用参数scope和responseText。
   * @param {Function} [configs.failure] 加载失败后的回调函数，可用参数scope和responseText。
   * @param {Boolean} [configs.mask] 在加载过程中是否使用mask，默认为true。
   * @param {Boolean} [configs.showError] 是否显示异常信息，默认为true。
   */
  run: function(configs) {
    var cfg = Ext.apply({
      container: false
    }, configs);
    Wb.open(cfg);
  },
  /**
   * 监听window beforeunload事件。
   * @param {Function} fn 事件发生时的回调函数。
   * @param {Container} [owner] 加载模块的容器。
   */
  onUnload: function(fn, owner) {
    if (!Wb.unloadEvents)
      Wb.unloadEvents = {};
    Wb.unloadEvents[owner ? owner.id : Wb.getId()] = fn;
  },
  /**
   * 把xwl文件路径转换为web路径，如果不是xwl文件则直接返回。
   * @param {String} path 文件路径。
   * @return {String} web路径。
   */
  toUrl: function(path) {
    if (Ext.String.endsWith(path, '.xwl'))
      return 'm?xwl=' + path.slice(0, -4);
    else
      return path;
  },
  /**
   * 在主页中关闭指定的页面。如果在主页或IDE之外使用此函数，无任何效果。
   * @param {String/Boolean} value 关闭页面相关的文件名称或url路径。如果为空，表示关闭当前页面。
   * 如果为布尔值，true关闭全部页面，false关闭其他页面。
   */
  close: function(value) {
    if (window.top != window && window.top.Wb) {
      //在顶层home窗口中关闭
      window.top.Wb.close(value);
      return;
    }
    var hasHome = Wb.hasNS('sys.home'),
      hasIde = Wb.hasNS('sys.ide');
    if (hasHome || hasIde) {
      var tab = hasHome ? sys.home.tab : Ide.fileTab,
        card = tab.getActiveTab();
      if (Ext.isBoolean(value)) {
        Ext.suspendLayouts();
        tab.items.each(function(item) {
          if (value || !value && item != card) {
            if (item.closable)
              item.close();
          }
        });
        Ext.resumeLayouts(true);
      } else {
        if (value)
          card = tab.child('[bindFile=' + value + ']');
        if (card && card.closable) {
          card.close();
        }
      }
    }
  },
  /**
   * 把指定文本转换成html，除了转换html的保留词，该方法同时也转换换行符。该方法仅用于显示目的的转换。
   * @param {String} text 需要转换的html脚本。
   * @return {String} 转换后的html脚本。
   */
  encodeHtml: function(text) {
    if (!Wb.isValue(text))
      return '';
    if (Ext.isString(text))
      return Ext.htmlEncode(text).replace(/\r?\n/g, '<br>');
    else return text;
  },
  /**
   * 动态在文档header中注入js和css链接，加载成功后执行指定的回调方法。
   *
   * Example:
   *
   *     Wb.addLink(['file.css', 'file.js', {url: 'file', type: 'js'}], fn, true);
   *
   * @param {Array} [links] 需要加载的js或css链接列表。如果链接类型未明需要在对象中显式指明url和type属性。
   * @param {Function} [callback] 加载完成js和css后执行的方法。
   * @param {Boolean} [recursive] 是否采用递归加载，递归加载是依次加载链接，加载完成上后再加载下一个链接。默认为false。
   */
  addLink: function(links, callback, recursive) {
    if (!links || links.length === 0)
      return;
    var index, pointer = 0,
      completeCount = 0,
      total = links.length,
      head = document.getElementsByTagName('head');

    function opt() {
      var link = links[pointer++];
      if (typeof link === 'string') {
        return {
          url: link,
          type: link.slice(-3).toLowerCase() == '.js' ? 'js' : 'css'
        };
      } else
        return link;
    }

    function onLoadCallback() {
      completeCount++;
      if (completeCount >= total) {
        if (callback)
          callback();
      } else if (recursive)
        createLink();
    }

    function onLoad(node, url) {
      Wb.loadedLinks[url] = true;
      var fnList = Wb.loadedLinksFn[url];
      Wb.each(fnList, function(fn) {
        fn();
      });
    }

    function onReady(node, url) {
      if (node.readyState == 'loaded' || node.readyState == 'complete') {
        node.onreadystatechange = function() {};
        onLoad(node, url);
      }
    }

    function createLink() {
      var node, link = opt();
      if (!Wb.loadedLinks)
        Wb.loadedLinks = {};
      if (Wb.loadedLinks[link.url]) {
        onLoadCallback();
        return;
      } else {
        if (!Wb.loadedLinksFn)
          Wb.loadedLinksFn = {};
        if (Wb.loadedLinksFn[link.url]) {
          Wb.loadedLinksFn[link.url].push(onLoadCallback);
          return;
        } else {
          Wb.loadedLinksFn[link.url] = [onLoadCallback];
        }
      }
      if ((link.type || 'js').toLowerCase() == 'js') {
        node = document.createElement('script');
        node.type = 'text/javascript';
        node.src = link.url;
      } else {
        node = document.createElement('link');
        node.rel = 'stylesheet';
        node.href = link.url;
      }
      head[0].appendChild(node);
      if (node.readyState)
        node.onreadystatechange = Ext.bind(onReady, node, [node, link.url]);
      else
        node.onload = Ext.bind(onLoad, node, [node, link.url]);
    }
    if (recursive)
      createLink();
    else {
      for (index = 0; index < total; index++)
        createLink();
    }
  },
  /**
   * 使用浏览器内置的打印功能打印指定的对象。
   * @param {Object} object 打印的对象。如果对象为文本则打印该文本(html)，否则将打印对象中的html内容。
   * @param {String} [title] 输出的页面标题。
   */
  print: function(object, title) {
    if (!Wb.printFrame) {
      var fr = document.createElement('iframe'),
        id = 'ifm' + Wb.getId();
      Ext.fly(fr).set({
        id: id,
        name: id,
        width: 0,
        height: 0,
        src: Ext.SSL_SECURE_URL
      });
      document.body.appendChild(fr);
      if (document.frames)
        document.frames[id].name = id;
      Wb.printFrame = fr;
    }
    var html,
      doc = Wb.getDoc(Wb.printFrame);
    if (Wb.isEmpty(object))
      html = '';
    else if (object instanceof Ext.container.Container)
      html = object.el.down('#' + object.id + '-innerCt').getHTML();
    else if (object.html)
      html = object.html;
    else if (Ext.isString(object))
      html = object;
    else if (Ext.isFunction(object.getValue))
      html = object.getValue();
    else html = '';
    doc.write('<!DOCTYPE html><html><head><meta http-equiv="content-type" content="text/html;charset=utf-8"/><title>' +
      (title || '&#160;') + '</title><link type="text/css" rel="stylesheet" href="wb/css/style.css"></head>' +
      '<body onload="this.focus();this.print();" style="font-size:3.174mm;">' + html + '</body></html>');
    doc.close();
  },
  /**
   * 打印指定的报表。
   * @param {Panel/String} url 引用报表xwl模块或其url相对路径或捷径。
   * @param {Object/Object[]} rows 数据记录或记录列表。
   * @param {String} [title] html页面标题。
   * @param {Object} [params] 获取报表模板的参数对象。
   */
  printReport: function(url, rows, title, params) {
    Wb.report(url, rows, function(html) {
      Wb.print(html, title);
    }, params);
  },
  /**
   * 运行报表模块并获取生成的报表html文本。
   * @param {Panel/String} url 引用报表xwl模块或其url相对路径或捷径。
   * @param {Object/Object[]} rows 数据记录或记录列表。
   * @param {Function} callback 成功生成报表之后执行的回调函数，可用参数html。
   * @param {Object} [params] 参数对象。
   */
  report: function(url, rows, callback, params) {
    function create(entry) {
      var html = '',
        isFirst = true;

      function mm(pixel) {
        return Math.round(pixel / 4) + 'mm;';
      }

      function getData(item, row) {
        var isImage = item.xtype == 'image';
        if (!item.reportTpl)
          item.reportTpl = new Ext.XTemplate(item.text || item.html);
        html += (isImage ? '<image' : '<div') + ' style="left:' + mm(item.x) + 'top:' + mm(item.y) + 'width:' + mm(item.width) +
          (item.xtype == 'label' ? '' : ('height:' + mm(item.height))) +
          (item.labelAlign ? ('text-align:' + item.labelAlign + ';') : '') +
          (item.style || '') + '" class="wb_abs ' + (item.cls || '') + '"' +
          (isImage ? (' src="' + item.src + '"') : '') +
          '>' + item.reportTpl.apply(row) + '</' + (isImage ? 'image>' : 'div>');
      }
      Wb.each(rows, function(row) {
        if (isFirst)
          isFirst = false;
        else
          html += '<div class="wb_pb"></div>';
        html += '<div style="width:' + mm(entry.width) + 'height:' + mm(entry.height) +
          (entry.style || '') + '" class="wb_rel ' + (entry.cls || '') +
          '"><span style="visibility:hidden;">&#160;</span>';
        if (entry instanceof Ext.container.Container)
          entry.items.each(function(item) {
            getData(item, row);
          });
        else
          Wb.each(entry.items, function(item) {
            getData(item, row);
          });
        html += '</div>';
      });
      if (callback)
        callback(html);
    }
    if (Ext.isString(url)) {
      Wb.run({
        url: url,
        params: params,
        success: function(app) {
          var entry = Wb.optMain(app);
          create(entry);
          entry.destroy();
        }
      });
    } else {
      create(url);
    }
  },
  /**
   * 获取指定控件/元素内所有input控件的值组成的对象，对象中每个值的名称为指定控件的itemId。
   * 如果控件下存在重复itemId的控件，则只返回第一个控件值，其余重名的控件将被忽略。
   * @param {Component/Element} el 需要获取值的组件对象或元素。
   * @return {Object} 获取的控件值组成的对象。
   */
  getInputValue: function(el) {
    var itemId, vals = {};
    el = el.el || el.element || el;
    Wb.each(el.query('input'), function(item) {
      itemId = Ext.fly(item).getAttribute('itemId');
      if (itemId)
        vals[itemId] = item.value;
    });
    return vals;
  },
  /**
   * 对指定控件内所有input控件进行赋值，其值由values对象指定，values中的每一子项的名称为控件的itemId，值为控件值。
   * @param {Component/Element} el 组件或元素对象。
   * @param {Object} values 包含一组控件itemId和值组成的Object对象。
   */
  setInputValue: function(el, values) {
    var itemId, vals = {};
    el = el.el || el.element || el;
    Wb.each(el.query('input'), function(item) {
      itemId = Ext.fly(item).getAttribute('itemId');
      if (itemId && values.hasOwnProperty(itemId))
        item.value = values[itemId];
    });
  },
  /**
   * 创建命名空间。通过命名空间可以在全局访问指定函例。如果指定命名空间已经存在则直接返回命名空间对象。
   * @param {String} namespace 必须参数说明。
   * @return {Object} 指定命名空间对象。
   */
  ns: function(namespace) {
    var i, j, name, scope, list = namespace.split('.');
    scope = window;
    j = list.length;
    for (i = 0; i < j; i++) {
      name = list[i];
      if (!scope[name]) scope[name] = {};
      scope = scope[name];
    }
    return scope;
  },
  /**
   * 判断指定命名空间是否存在。如果存在返回true，否则返回false。
   * @param {String} namespace 必须参数说明。
   * @param {Object} [scope] 根命名空间，默认为window。
   * @return {Boolean} true存在，false不存在。
   */
  hasNS: function(namespace, scope) {
    var i, j, name, list = namespace.split('.');
    if (!scope)
      scope = window;
    j = list.length;
    for (i = 0; i < j; i++) {
      name = list[i];
      if (!scope[name]) return false;
      scope = scope[name];
    }
    return true;
  },
  /**
   * 记录用于TabPanel标签页和TreePanel节点的导航的位置。
   * @param {Component} comp TabPanel或TreePanel对象。
   */
  recordActivity: function(comp) {
    if (comp.stopRecNav)
      return;
    var item;
    if (Ext.isTouch) {
      item = comp.getActiveItem(); //容器
      if (item) {
        item = item.id;
        if (comp.backList[comp.backList.length - 1] == item)
          return; //异常动画效果时避免重复push
      } else
        return;
    } else if (comp instanceof Ext.tab.Panel) {
      item = comp.getActiveTab(); //标签页
      if (item)
        item = item.id;
      else
        return;
    } else {
      item = comp.getSelection()[0]; //节点
      if (item)
        item = item.getPath('text', '\n');
      else
        return;
    }
    if (comp.backList.length > 49)
      comp.backList.splice(0, 1);
    comp.backList.push(item);
  },
  /**
   * 根据指定项转到对应的TreePanel节点或TabPanel标签页。
   * @param {Component} comp 需要导航组件对象。
   * @param {Object} item 选项卡或节点。
   * @return {Boolean} 是否导航成功，true成功，false失败。
   */
  navigate: function(comp, item, isBack) {
    if (Ext.isTouch) {
      item = Ext.getCmp(item);
      if (item)
        comp.setActiveItem(item);
      else
        return false;
    } else
    if (comp instanceof Ext.tree.Panel) {
      comp.selectPath(item, 'text', '\n');
    } else {
      item = Ext.getCmp(item);
      if (item)
        comp.setActiveTab(item);
      else
        return false;
    }
    return true;
  },
  /**
   * 依次返回到上次位置。
   */
  back: function(comp) {
    if (comp.backList.length < 2)
      return;
    var item = comp.backList.pop();
    if (item) {
      if (comp.forwardList.length > 49)
        comp.forwardList.splice(0, 1);
      comp.forwardList.push(item);
    } else return;
    comp.stopRecNav = true;
    while (comp.backList.length > 0 && !Wb.navigate(comp, comp.backList[comp.backList.length - 1], true)) {
      comp.backList.pop();
    }
    comp.stopRecNav = false;
  },
  /**
   * 依次前进到返回前的位置。
   */
  forward: function(comp) {
    var item;
    comp.stopRecNav = true;
    while ((item = comp.forwardList.pop())) {
      if (Wb.navigate(comp, item, false))
        break;
    }
    comp.stopRecNav = false;
    if (item) {
      if (comp.backList.length > 49)
        comp.backList.splice(0, 1);
      comp.backList.push(item);
    }
  },
  /**
   * 设置对TabPanel和TreePanel的导航操作，导航操作可方便后退和前进到上次位置。
   * @param {Component} comp 需要设计导航的对象，为TabPanel或TreePanel对象。
   * @param {Button} backBtn 后退按钮。
   * @param {Button} forwardBtn 前进按钮。
   */
  setNavigate: function(comp, backBtn, forwardBtn) {
    comp.backList = [];
    comp.forwardList = [];
    if (Ext.isTouch) {
      Wb.recordActivity(comp);
      comp.on('activeitemchange', function() {
        var me = this;
        Wb.recordActivity(me);
      });
    } else if (comp instanceof Ext.tree.Panel) {
      comp.mon(comp, 'selectionchange', function() {
        var me = this;
        Wb.recordActivity(me);
      });
    } else {
      comp.mon(comp, 'tabchange', function() {
        var me = this;
        Wb.recordActivity(me);
      });
    }
    backBtn.navComp = comp;
    if (Ext.isTouch) {
      backBtn.on('tap', function(button) {
        Wb.back(button.navComp);
      });
      forwardBtn.navComp = comp;
      forwardBtn.on('tap', function(button) {
        Wb.forward(button.navComp);
      });
    } else {
      backBtn.mon(backBtn, 'click', function(button) {
        Wb.back(button.navComp);
      });
      forwardBtn.navComp = comp;
      forwardBtn.mon(forwardBtn, 'click', function(button) {
        Wb.forward(button.navComp);
      });
    }
  },
  checkCntr: function(wl_cntr) {
    var wl_asc;
    var p1 = 0;
    var p2 = 0;
    var j = 0.5;
    var jt = 0;
    if (wl_cntr.length < 11) {
      return 0;
    } else if (wl_cntr.substr(3, 1) != 'U') {
      return 0;
    } else {
      for (var i = 0; i < 10; ++i) {
        wl_asc = wl_cntr.substr(i, 1).charCodeAt();
        j = j * 2;
        if (wl_asc > 64) {
          p1 = wl_asc - 55;
          if (p1 > 10) {
            p1 += 1;
          };
          if (p1 > 21) {
            p1 += 1;
          };
          if (p1 > 32) {
            p1 += 1;
          };
        } else {
          p1 = wl_cntr.substr(i, 1);
        }
        jt = jt + p1 * j;
        p1 = 0;
      }
      p2 = jt % 11;
      if (p2 == 10) {
        p2 = 0;
      };
      if (p2 != wl_cntr.substr(10, 1)) {
        return 0;
      } else {
        return 1;
      }
    }
  },
  S4: function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  },
  guid: function() {
    return (Wb.S4() + Wb.S4() + "-" + Wb.S4() + "-" + Wb.S4() + "-" + Wb.S4() + "-" + Wb.S4() + Wb.S4() + Wb.S4());
  },
  customerJson: '',
  setCustomerJson: function(json) {

    if (json == '') {
      return;
    }
    customerJson = json;
  },
  getCustomerByCode: function(code) {
    return Wb.kv(code, customerJson);
  },
  /**
   * 加载iframe 硕正报表
   * @param {Component} comp 需要设计导航的对象，为TabPanel或TreePanel对象。
   * @param {Button} type 类型。
   * @param {Button} forwardBtn 前进按钮。
   */
  addSupcanIframe: function(comp, type, url, load) {
    var id = Wb.getId(); //'&url='+url+
    comp.update('<iframe scrolling="auto"  id="' + id + '" name ="' + id + '" frameborder="0" width="100%" height="100%" ' +
      '  src="supcan/supcanTemplate.jsp?type=' + type + '&url=' + url + '"></iframe>');
    var iframe = document.getElementById(id);
    if (iframe.attachEvent) {
      iframe.attachEvent("onload", function() {

      });
    } else {
      iframe.onload = function() {
        if (load != null)
          load(id);

      };
    }

    return id;
  },

  loadComboFilter: function(combo, filter, fn) {
    combo.store.load({
      params: filter,
      callback: function(r, options, success) {
        if (success) {
          fn();
        }
      }
    });

  },
  loadComboAdd: function(combo, objData, fn) {
    combo.store.load({
      callback: function(r, options, success) {
        if (success) {
          combo.getStore().insert(1, objData);
          fn();
        }
      }
    });

  },
  loadSupcanData: function(url, params) {
    var xml;
    Wb.request({
      url: url,
      async: false,
      params: params,
      success: function(resp) {

        xml = resp.responseText;
      }
    });
    return xml;
  },
  getSupcanMelu: function(AF, column, state) { //state false 返回第一行

    var length = AF.func("GetCurrentRows", ""),
      row;
    var m = [];

    if (!state) {
      row = AF.func("GetCurrentRow", i + " \r\n ");
      return AF.func("GetCellData", row + " \r\n " + column);
    } else {
      for (var i = 0; i < length; i++) {
        row = AF.func("GetCurrentRow", i + " \r\n ");
        m.push(AF.func("GetCellData", row + " \r\n " + column));
      }
      return m;
    }
  },
  getSupcanMeluStr: function(AF, column) {
    var length = AF.func("GetCurrentRows", ""),
      row;
    var ms = "";
    for (var i = 0; i < length; i++) {
      row = AF.func("GetCurrentRow", i + " \r\n ");
      if (i > 0)
        ms += ",";
      ms += AF.func("GetCellData", row + " \r\n " + column);
    }
    return ms;
  },
  setSupcanMelu: function(AF, column, value, fieldValue) {
    var length = AF.func("GetCurrentRows", ""),
      row;
    for (var i = 0; i < length; i++) {
      row = AF.func("GetCurrentRow", i + " \r\n ");
      if (fieldValue == null)
        AF.func("SetCellData", row + " \r\n " + column + " \r\n " + value + " \r\n 0");
      else
        AF.func("SetCellDataText", row + " \r\n " + column + " \r\n " + value + " \r\n " + fieldValue + "");
    }
  },
  moreSupcanSelect: function(AF, p2) {
    Wb.run({
      url: 'm?xwl=system/common/report/moreSupcanWin',
      success: function(appOld) {
        var win = new Ext.window.Window(appOld._moreWin); //_window1为配置对象，window1为实例
        var dataArray = new Array();
        for (var col = AF.func("GetNextVisibleCol", ""), column; col != ""; col = AF.func("GetNextValidCol", col)) {
          column = AF.func("GetColTitle", col);
          dataArray.push({
            "K": col,
            "V": column
          });
        }
        var store = Ext.create('Ext.data.Store', {
          storeId: 'store',
          fields: ['K', "V"],
          data: dataArray
        });
        var vartextarea2 = Ext.create('Ext.form.ComboBox', { //字段名
          id: 'fileldName',
          store: store,
          queryMode: 'local',
          displayField: 'V',
          fieldLabel: '过滤列',
          valueField: 'K',
          itemId: 'fileldName',
          renderTo: Ext.getBody(),
          appScope: appOld,
          width: 240,
          height: '22px',
          x: 20,
          y: 6,
          name: 'fileldName'
        });
        win.show();
        appOld.morePanel.add(vartextarea2);
        appOld.fileldValue.focus(true, true);
        win.mon(win, 'ok',
          function() {
            var strType = AF.func("GetColProp", appOld.fileldName.getValue() + " \r\n datatype");
            if (strType == 'date' || strType == 'datetime ')
              var filterStr = appOld.fileldName.getValue() + "=FormatDate('" + appOld.fileldValue.getValue() + "', 'YYYY.MM.DD')";
            else var filterStr = "indexOf(" + appOld.fileldName.getValue() + ", '" + appOld.fileldValue.getValue() + "')>=0";
            AF.func("Filter", filterStr);
          });
      }
    });




    //         Wb.run({
    //           url: 'm?xwl=system/common/report/moreFile',
    //           success: function(appOld) {
    //             var win = new Ext.window.Window(appOld._moreWin); //_window1为配置对象，window1为实例
    //             win.show();
    //             appOld.fileldName.setValue(p2);
    //             appOld.fileldName.focus(true, true);
    //             win.mon(win, 'ok',
    //               function() {
    //                   var strType = AF.func("GetColProp", p2 + " \r\n datatype");
    //                 if (strType == 'date' || strType == 'datetime ')
    //                   var filterStr = appOld.fileldName.getValue() + "=FormatDate('" + appOld.fileldValue.getValue() + "', 'YYYY.MM.DD')";
    //                 else var filterStr = "indexOf(" + appOld.fileldName.getValue() + ", " + appOld.fileldValue.getValue() + ")>=0";
    //                   AF.func("Filter", filterStr);
    //               });
    //           }
    //       });

  },
  printC: function(result, LODOP, tenancyid) {
    //=================头部分==================
    LODOP.ADD_PRINT_TEXT(60, 85, 280, 25, "中山港航集团股份有限公司"); //表格名称
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 16);
    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
    var MT = '';
    if (tenancyid == 'ZSG')
      MT = '中山港';
    else if (tenancyid == 'XLG')
      MT = '小榄港';
    else if (tenancyid == 'SWG')
      MT = '神湾港';

    LODOP.ADD_PRINT_TEXT(85, 87, 280, 25, MT + "国际货柜码头货物运单"); //表格名称
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 14);
    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
    LODOP.ADD_PRINT_BARCODE(45, 790, 140, 50, "Code39", result.bill[0].BILL_NO); //条形码
    LODOP.ADD_PRINT_TEXT(105, 670, 360, 25, "装运单号：" + result.bill[0].BILL_NO); //装运单号
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 16);
    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
    //================最外侧矩形================
    //参数说明,距离上边像素1,距离做左边像素1,距离上边像素2,距离左边像素2,线种类(0代表直线),线粗
    LODOP.ADD_PRINT_LINE(150, 30, 150, 1050, 0, 1); //最外侧矩形上边线
    LODOP.ADD_PRINT_LINE(150, 30, 750, 30, 0, 1); //最外侧矩形下边线
    LODOP.ADD_PRINT_LINE(750, 30, 750, 1050, 0, 1); //最外侧矩形左边线
    LODOP.ADD_PRINT_LINE(150, 1050, 750, 1050, 0, 1); //最外侧矩形右边线
    //================矩形内部结构==============
    LODOP.ADD_PRINT_LINE(190, 30, 190, 200, 0, 1); //发货人左侧横线
    LODOP.ADD_PRINT_LINE(190, 230, 190, 655, 0, 1); //发货人右侧横线
    LODOP.ADD_PRINT_LINE(190, 685, 190, 1050, 0, 1); //收货人右侧横线
    LODOP.ADD_PRINT_LINE(230, 30, 230, 1050, 0, 1); //发货人下方横线
    LODOP.ADD_PRINT_LINE(270, 30, 270, 1050, 0, 1); //货物名称下方横线
    LODOP.ADD_PRINT_LINE(400, 30, 400, 540, 0, 1); //装船时间,船名等上方横线
    LODOP.ADD_PRINT_LINE(440, 30, 440, 200, 0, 1); //装船时间,船名等下方横线
    LODOP.ADD_PRINT_LINE(580, 30, 580, 540, 0, 1); //海关物监签章上方横线
    LODOP.ADD_PRINT_LINE(150, 100, 230, 100, 0, 1); //起运港右侧竖线
    LODOP.ADD_PRINT_LINE(150, 200, 750, 200, 0, 1); //发货人左侧竖线
    LODOP.ADD_PRINT_LINE(150, 230, 230, 230, 0, 1); //发货人右侧竖线
    LODOP.ADD_PRINT_LINE(150, 655, 270, 655, 0, 1); //收货人左侧竖线
    LODOP.ADD_PRINT_LINE(150, 685, 230, 685, 0, 1); //收货人右侧竖线
    LODOP.ADD_PRINT_LINE(230, 260, 400, 260, 0, 1); //件数右侧竖线
    LODOP.ADD_PRINT_LINE(230, 310, 400, 310, 0, 1); //包装右侧竖线
    LODOP.ADD_PRINT_LINE(230, 395, 400, 395, 0, 1); //体积右侧竖线
    LODOP.ADD_PRINT_LINE(190, 480, 400, 480, 0, 1); //货物毛重右侧竖线
    LODOP.ADD_PRINT_LINE(230, 540, 750, 540, 0, 1); //唛头右侧竖线
    LODOP.ADD_PRINT_LINE(230, 700, 270, 700, 0, 1); //规格右侧竖线
    LODOP.ADD_PRINT_LINE(230, 795, 270, 795, 0, 1); //封条号码右侧竖线
    LODOP.ADD_PRINT_LINE(190, 900, 270, 900, 0, 1); //集装箱号码右侧竖线
    LODOP.ADD_PRINT_LINE(230, 950, 270, 950, 0, 1); //规格右侧竖线
    LODOP.ADD_PRINT_LINE(400, 370, 750, 370, 0, 1); //船公司签章右侧竖线
    //=================内容================
    LODOP.ADD_PRINT_TEXT(160, 38, 100, 25, "起运港");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(157, 207, 25, 100, "发货人");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(160, 238, 100, 25, "全称：");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(157, 662, 25, 100, "收货人");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(160, 693, 100, 25, "全称：");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(200, 38, 100, 25, "目的港");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(200, 238, 100, 25, "地址：");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(200, 485, 100, 25, "电话：");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(200, 693, 100, 25, "地址：");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(200, 905, 100, 25, "电话：");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(240, 60, 100, 25, "货物名称");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(240, 210, 100, 25, "件数");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(240, 265, 100, 25, "包装");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(232, 330, 100, 25, "体 积");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(250, 311, 100, 25, "（立方米）");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(232, 403, 100, 25, "货物毛重");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(250, 403, 100, 25, "（公斤）");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(232, 488, 100, 25, "唛头/");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(250, 485, 100, 25, "合同号");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(240, 555, 100, 25, "集装箱号码");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(240, 660, 100, 25, "规格");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(240, 712, 100, 25, "封条号码");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(240, 805, 100, 25, "集装箱号码");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(240, 910, 100, 25, "规格");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(240, 965, 100, 25, "封条号码");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(405, 40, 120, 60, "装船时间、船名、地点、箱量");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
    LODOP.ADD_PRINT_TEXT(445, 42, 100, 25, "船名：");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 9);
    LODOP.ADD_PRINT_TEXT(458, 42, 100, 25, "日期：");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 9);
    LODOP.ADD_PRINT_TEXT(471, 42, 100, 25, "泊：");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 9);
    LODOP.ADD_PRINT_TEXT(484, 42, 100, 25, "箱量：");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 9);
    //     LODOP.ADD_PRINT_TEXT(484, 90, 100, 25, " × 20＇");
    //     LODOP.SET_PRINT_STYLEA(0, "FontSize", 9);
    //     LODOP.ADD_PRINT_TEXT(497, 90, 100, 25, " × 40＇");
    //     LODOP.SET_PRINT_STYLEA(0, "FontSize", 9);
    //     LODOP.ADD_PRINT_TEXT(510, 90, 100, 25, " × 45＇");
    //     LODOP.SET_PRINT_STYLEA(0, "FontSize", 9);
    LODOP.ADD_PRINT_TEXT(523, 42, 100, 25, "总柜数：");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 9);
    LODOP.ADD_PRINT_TEXT(415, 215, 100, 25, "集装箱签到");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(415, 385, 120, 25, "船务公司签章");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(595, 45, 120, 25, "报关信息");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(620, 42, 100, 25, "运输工具号：");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 9);
    LODOP.ADD_PRINT_TEXT(635, 42, 100, 25, "航次号：");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 9);
    LODOP.ADD_PRINT_TEXT(595, 215, 100, 25, "检验检疫章");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(595, 385, 100, 25, "海关签章");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    //=================数据================
    LODOP.ADD_PRINT_TEXT(160, 110, 100, 25, Wb.kv(result.bill[0].POL, app.port)); //起运港
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(160, 290, 320, 25, result.bill[0].SHIPPER); //发货人全称
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(160, 745, 320, 25, result.bill[0].CONSIGNEE); //收货人全称
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(200, 110, 100, 25, Wb.kv(result.bill[0].SPOD, app.port)); //目的港
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(200, 290, 100, 25, result.bill[0].CONTRACT_ADDRESS); //发货人地址
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(200, 537, 100, 25, result.bill[0].NOTIFIER_PHONE); //发货人电话
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(200, 745, 100, 25, result.bill[0].NOTIFIER_ADDRESS); //收货人地址
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(200, 957, 100, 25, result.bill[0].CONTRACT_PHONE); //收货人电话
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(285, 45, 100, 25, result.bill[0].GOODS_NOTES); //货物
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(285, 205, 100, 25, result.bill[0].PIECES); //件数
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(285, 265, 100, 25, Wb.kv(result.bill[0].PKG, app.pkg)); //包装
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(285, 315, 100, 25, result.bill[0].VOLUME); //体积
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(285, 400, 100, 25, result.bill[0].WEIGHT); //货物毛重
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(285, 485, 100, 25, ""); //合同号*******************************************************
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
    LODOP.ADD_PRINT_TEXT(445, 80, 100, 25, result.bill[0].VESSEL_NAME); //船名
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 9);
    LODOP.ADD_PRINT_TEXT(458, 80, 100, 25, result.bill[0].CREATED_ON.substring(0, 10)); //日期
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 9);
    LODOP.ADD_PRINT_TEXT(471, 70, 100, 25, Wb.kv(result.bill[0].POD, app.port)); //泊
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 9);
    LODOP.ADD_PRINT_TEXT(484, 80, 100, 25, result.bill[0].CNTR20); //20箱量
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 9);
    LODOP.ADD_PRINT_TEXT(497, 80, 100, 25, result.bill[0].CNTR40); //40箱量
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 9);
    LODOP.ADD_PRINT_TEXT(510, 80, 100, 25, result.bill[0].CNTR45); //45箱量
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 9);
    LODOP.ADD_PRINT_TEXT(523, 90, 100, 25, result.csum[0].CNTR_COUNT); //总柜数
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 9);
    LODOP.ADD_PRINT_TEXT(620, 110, 100, 25, result.bill[0].EDI_CALL_SIGN); //运输工具号
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 9);
    LODOP.ADD_PRINT_TEXT(635, 90, 100, 25, result.bill[0].LOB_VYG); //航次号
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 9);
    //===========循环集装箱===========
    //集装箱双数
    if (result.cntr.length % 2 == 0 && result.cntr.length > 0) {
      //左边
      LODOP.ADD_PRINT_LINE(270, 655, 270 + result.cntr.length / 2 * 25, 655, 0, 1); //集装箱号码右侧竖线
      LODOP.ADD_PRINT_LINE(270, 700, 270 + result.cntr.length / 2 * 25, 700, 0, 1); //规格右侧竖线
      LODOP.ADD_PRINT_LINE(270, 795, 270 + result.cntr.length / 2 * 25, 795, 0, 1); //封条号码右侧竖线
      for (var i = 0; i < result.cntr.length / 2; i++) {
        LODOP.ADD_PRINT_LINE(270 + (i + 1) * 25, 540, 270 + (i + 1) * 25, 795, 0, 1); //集装箱号码下方横线
        LODOP.ADD_PRINT_TEXT(273 + i * 25, 550, 120, 25, result.cntr[i].CNTR); //集装箱号码
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
        LODOP.ADD_PRINT_TEXT(273 + i * 25, 660, 120, 25, result.cntr[i].CNTR_SIZE); //规格
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
        LODOP.ADD_PRINT_TEXT(273 + i * 25, 705, 100, 25, result.cntr[i].SEAL_NO); //封条
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
        LODOP.SET_PRINT_STYLEA(0, "LineSpacing", -3);
      }
      //右边
      LODOP.ADD_PRINT_LINE(270, 900, 270 + result.cntr.length / 2 * 25, 900, 0, 1); //集装箱号码右侧竖线
      LODOP.ADD_PRINT_LINE(270, 950, 270 + result.cntr.length / 2 * 25, 950, 0, 1); //规格右侧竖线
      for (var i = result.cntr.length / 2; i < result.cntr.length; i++) {
        LODOP.ADD_PRINT_LINE(270 + ((i + 1) - result.cntr.length / 2) * 25, 795, 270 + ((i + 1) - result.cntr.length / 2) * 25, 1050, 0, 1); //集装箱号码下方横线
        LODOP.ADD_PRINT_TEXT(273 + (i - result.cntr.length / 2) * 25, 799, 120, 25, result.cntr[i].CNTR); //集装箱号码
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
        LODOP.ADD_PRINT_TEXT(273 + (i - result.cntr.length / 2) * 25, 907, 120, 25, result.cntr[i].CNTR_SIZE); //规格
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
        LODOP.ADD_PRINT_TEXT(273 + (i - result.cntr.length / 2) * 25, 955, 100, 25, result.cntr[i].SEAL_NO); //封条
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
        LODOP.SET_PRINT_STYLEA(0, "LineSpacing", -3);
      }
    }
    //集装箱单数
    if (result.cntr.length % 2 == 1) {
      if (result.cntr.length == 1) {
        LODOP.ADD_PRINT_LINE(270, 655, 295, 655, 0, 1); //集装箱号码右侧竖线
        LODOP.ADD_PRINT_LINE(270, 700, 295, 700, 0, 1); //规格右侧竖线
        LODOP.ADD_PRINT_LINE(270, 795, 295, 795, 0, 1); //封条号码右侧竖线
        LODOP.ADD_PRINT_LINE(295, 540, 295, 795, 0, 1); //集装箱号码下方横线
        LODOP.ADD_PRINT_TEXT(273, 550, 120, 25, result.cntr[0].CNTR); //集装箱号码
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
        LODOP.ADD_PRINT_TEXT(273, 660, 120, 25, result.cntr[0].CNTR_SIZE); //规格
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
        LODOP.ADD_PRINT_TEXT(273, 705, 100, 25, result.cntr[0].SEAL_NO); //封条
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
        LODOP.SET_PRINT_STYLEA(0, "LineSpacing", -3);
      }
      if (result.cntr.length > 1) {
        //左边
        LODOP.ADD_PRINT_LINE(270, 655, 270 + (parseInt(result.cntr.length / 2) + 1) * 25, 655, 0, 1); //集装箱号码右侧竖线
        LODOP.ADD_PRINT_LINE(270, 700, 270 + (parseInt(result.cntr.length / 2) + 1) * 25, 700, 0, 1); //规格右侧竖线
        LODOP.ADD_PRINT_LINE(270, 795, 270 + (parseInt(result.cntr.length / 2) + 1) * 25, 795, 0, 1); //封条号码右侧竖线
        for (var i = 0; i < parseInt(result.cntr.length / 2) + 1; i++) {
          LODOP.ADD_PRINT_LINE(270 + (i + 1) * 25, 540, 270 + (i + 1) * 25, 795, 0, 1); //集装箱号码下方横线
          LODOP.ADD_PRINT_TEXT(273 + i * 25, 550, 120, 25, result.cntr[i].CNTR); //集装箱号码
          LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
          LODOP.ADD_PRINT_TEXT(273 + i * 25, 660, 120, 25, result.cntr[i].CNTR_SIZE); //规格
          LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
          LODOP.ADD_PRINT_TEXT(273 + i * 25, 705, 100, 25, result.cntr[0].SEAL_NO); //封条
          LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
          LODOP.SET_PRINT_STYLEA(0, "LineSpacing", -3);
        }
        //右边
        LODOP.ADD_PRINT_LINE(270, 900, 270 + parseInt(result.cntr.length / 2) * 25, 900, 0, 1); //集装箱号码右侧竖线
        LODOP.ADD_PRINT_LINE(270, 950, 270 + parseInt(result.cntr.length / 2) * 25, 950, 0, 1); //规格右侧竖线
        for (var i = parseInt(result.cntr.length / 2) + 1; i < result.cntr.length; i++) {
          LODOP.ADD_PRINT_LINE(270 + (i - parseInt(result.cntr.length / 2)) * 25, 795, 270 + (i - parseInt(result.cntr.length / 2)) * 25, 1050, 0, 1); //集装箱号码下方横线
          LODOP.ADD_PRINT_TEXT(273 + (i - parseInt(result.cntr.length / 2) - 1) * 25, 799, 120, 25, result.cntr[i].CNTR); //集装箱号码
          LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
          LODOP.ADD_PRINT_TEXT(273 + (i - parseInt(result.cntr.length / 2) - 1) * 25, 907, 120, 25, result.cntr[i].CNTR_SIZE); //规格
          LODOP.SET_PRINT_STYLEA(0, "FontSize", 13);
          LODOP.ADD_PRINT_TEXT(273 + (i - result.cntr.length / 2) * 25, 955, 100, 25, result.cntr[i].SEAL_NO); //封条
          LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
          LODOP.SET_PRINT_STYLEA(0, "LineSpacing", -3);
        }
      }
    }
  }
};

// if(window.Ext){
// Ext.define('Ext.ux.form.MonthField', {
//   extend: 'Ext.form.field.Picker',
//   alias: 'widget.monthfield',
//   //requires: ['Ext.picker.Date'],
//   //alternateClassName: ['Ext.form.DateField', 'Ext.form.Date'],


//   format: "Y-m",

//   altFormats: "m/y|m/Y|m-y|m-Y|my|mY|y/m|Y/m|y-m|Y-m|ym|Ym",

//   //disabledDaysText: "Disabled",

//   //disabledDatesText: "Disabled",

//   //minText: "The date in this field must be equal to or after {0}",

//   //maxText: "The date in this field must be equal to or before {0}",

//   //invalidText: "{0} is not a valid date - it must be in the format {1}",

//   triggerCls: Ext.baseCSSPrefix + 'form-date-trigger',

//   //showToday: true,

//   //initTime: '12',

//   //initTimeFormat: 'H',

//   matchFieldWidth: false,

//   startDay: new Date(),

//   initComponent: function () {
//     var me = this;


//     me.disabledDatesRE = null;

//     me.callParent();
//   },

//   initValue: function () {
//     var me = this,
//         value = me.value;

//     if (Ext.isString(value)) {
//       me.value = Ext.Date.parse(value, this.format);
//     }
//     if (me.value)
//       me.startDay = me.value;
//     me.callParent();
//   },

//   rawToValue: function (rawValue) {
//     return Ext.Date.parse(rawValue, this.format) || rawValue || null;
//   },

//   valueToRaw: function (value) {
//     return this.formatDate(value);
//   },



//   formatDate: function (date) {
//     return Ext.isDate(date) ? Ext.Date.dateFormat(date, this.format) : date;
//   },
//   createPicker: function () {
//     var me = this,
//         format = Ext.String.format;

//     return Ext.create('Ext.picker.Month', {
//       //renderTo: me.el,
//       pickerField: me,
//       ownerCt: me.ownerCt,
//       renderTo: document.body,
//       floating: true,
//       shadow: false,
//       focusOnShow: true,
//       listeners: {
//         scope: me,
//         cancelclick: me.onCancelClick,
//         okclick: me.onOkClick,
//         yeardblclick: me.onOkClick,
//         monthdblclick: me.onOkClick
//       }
//     });
//   },

//   onExpand: function () {
//     //this.picker.show();
//     this.picker.setValue(this.startDay);
//     //

//   },

//   //    onCollapse: function () {
//   //        this.focus(false, 60);
//   //    },

//   onOkClick: function (picker, value) {
//     var me = this,
//         month = value[0],
//         year = value[1],
//         date = new Date(year, month, 1);
//     me.startDay = date;
//     me.setValue(date);
//     this.picker.hide();
//     //this.blur();
//   },

//   onCancelClick: function () {
//     this.picker.hide();
//     //this.blur();
//   }

// });
// }