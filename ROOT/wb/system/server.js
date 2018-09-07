/**
 * @class ServerScript.Wb
 *
 * ServerScript Wb 提供了服务器端的JavaScript方法库，以方便使用JavaScript语法进行后台的Java编程。
 */
var Base = com.wb.common.Base,
  StringBuilder = java.lang.StringBuilder,
  File = java.io.File,
  HashMap = java.util.HashMap,
  Console = com.wb.tool.Console,
  JavaString = java.lang.String,
  Integer = java.lang.Integer,
  Double = java.lang.Double,
  JavaDate = java.util.Date,
  Resource = com.wb.common.Resource,
  Str = com.wb.common.Str,
  Value = com.wb.common.Value,
  Var = com.wb.common.Var,
  Encrypter = com.wb.tool.Encrypter,
  DateUtil = com.wb.util.DateUtil,
  DbUtil = com.wb.util.DbUtil,
  FileUtil = com.wb.util.FileUtil,
  JsonUtil = com.wb.util.JsonUtil,
  LogUtil = com.wb.util.LogUtil,
  SortUtil = com.wb.util.SortUtil,
  StringUtil = com.wb.util.StringUtil,
  SysUtil = com.wb.util.SysUtil,
  WebUtil = com.wb.util.WebUtil,
  ZipUtil = com.wb.util.ZipUtil,
  JSONArray = org.json.JSONArray,
  JSONObject = org.json.JSONObject,
  Flow = com.wb.tool.Flow,
  IOUtils = org.apache.commons.io.IOUtils,
  RabbitClient = com.ag.util.RabbitClient,
  Wb = {
    /**
     * @method sleep
     * Thread.sleep方法的别名。当前线程暂停执行指定数量的毫秒。
     * @param {long} millis 暂停毫秒数。
     */
    sleep: java.lang.Thread.sleep,
    /**
     * 获取带局部变量request和response的操作对象。app在整个请求周期内共享。
     * @param {HttpServletRequest} request 请求对象。
     * @param {HttpServletResponse} response 响应对象。
     * @return {Object} 操作对象。
     */
    getApp: function(request, response) {
      var app = request.getAttribute('sys.app');
      if (app) return app;
      //start app
      /**
       * @class ServerScript.app
       *
       * ServerScript app是HttpServletRequest和HttpServletResponse关联的服务器端的JavaScript方法库。
       */
      app = {
          /**
           * 框架自定义方法
           * @param beanname
           * @param methodname
           *
           * @returns {*}
           */
          rundomain: function(beanname,methodname) {
              var domain=new com.ag.base.BeanMange();
              Wb.apply(domain, {
                  request: request,
                  response:response,
                  bean: beanname,
                  method:methodname
              });
              return domain.execute();

          },
        sendMessage: function(queueName, jsObject) {
          var client = new RabbitClient();
          if (!client.open()) {
            app.send(client.getLastError());
            return;
          }
          try {
            if (Wb.isArray(jsObject)) {
              for (var i = 0; i < jsObject.length; i++) {
                client.send(queueName, jsObject[i]);
              }
            } else {
              client.send(queueName, jsObject);

            }
          } catch (e) {
            app.send(e);
          } finally {
            client.close();
          }



        },
        /**
         * 向当前用户的浏览器控制台中输出指定对象的日志信息。
         * @param {Object} object 打印的对象。
         */
        log: function(object) {
          Console.print(request, Wb.encode(object), 'log', true);
        },
        /**
         * 向当前用户的浏览器控制台中输出指定对象的提示信息。
         * @param {Object} object 打印的对象。
         */
        info: function(object) {
          Console.print(request, Wb.encode(object), 'info', true);
        },
        /**
         * 向当前用户的浏览器控制台中输出指定对象的警告信息。
         * @param {HttpServletRequest} request 请求对象。该请求对象用于关联到对应用户。
         * @param {Object} object 打印的对象。
         */
        warn: function(object) {
          Console.print(request, Wb.encode(object), 'warn', true);
        },
        /**
         * 向当前用户的浏览器控制台中输出指定对象的错误信息。
         * @param {Object} object 打印的对象。
         */
        error: function(object) {
          Console.print(request, Wb.encode(object), 'error', true);
        },
        /**
         * 向当前用户的客户端发送指定对象。
         * @param {Object} object 发送的对象。
         * @param {Boolean} [successful] 是否成功标识。如果指定该参数将采用JSON格式封装，该模式仅适用于文件上传模式的数据发送。
         */
        send: function(object, successful) {
          if (Wb.isObject(object) || Wb.isArray(object))
            object = Wb.encode(object);
          if (successful === undefined && WebUtil.jsonResponse(request) && Wb.isString(object))
            successful = true; //upload模式的json格式响应
          if (successful === undefined)
            WebUtil.send(response, object);
          else
            WebUtil.send(response, object, successful);
        },
        /**
         * 获取指定文件控件的单个或多个文件。
         * @param {String} fieldName 文件控件名称。
         * @return {Object[]} 获取的文件数据[{stream:输入流,name:文件名称,size:文件长度},...]，如果未找到返回空数组。
         */
        getFiles: function(fieldName) {
          var files = [],
            index = '',
            prefix = '',
            data;

          function getData(name) {
            var file = request.getAttribute(name);
            if (file instanceof java.io.InputStream)
              return {
                stream: file,
                name: request.getAttribute(name + '__name'),
                size: request.getAttribute(name + '__size')
              };
            else
              return null;
          }

          while ((data = getData(fieldName + prefix + index))) {
            files.push(data);
            if (index === '') {
              index = 0;
              prefix = '@';
            }
            index++;
          }
          return files;
        },
        /**
         * 获取HttpServletRequest和HttpSession对象中指定名称的属性或参数。
         * 如果相同名称的属性或参数都存在则返回优先顺序最高的值。优先顺序依次为
         * HttpSession的attribute，HttpServletRequest的attribute和
         * HttpServletRequest的parameter。如果都不存在则返回null。
         * 如果name参数缺省，将返回所有值组成的对象。
         * @param {String} [name] 参数或属性或称。
         * @param {Boolean} [returnString] 如果获取单个参数，false返回原始对象值，true返回原始对象转换为字符串后的值。默认为false。
         * @return {Object} 请求对象的parameter和attribute中的值组成的对象。
         */
        get: function(name, returnString) {
          if (name === undefined) {
            //获取全部值
            var jo = WebUtil.fetch(request),
              result = {};
            jo.entrySet().forEach(function(e) {
              result[e.key] = e.value;
            });
            return result;
          } else {
            //获取单个值
            return returnString ? WebUtil.fetch(request, name) : WebUtil.fetchObject(request, name);
          }
        },
        /**
         * 获取指定名称的参数，并转换为布尔类型。
         * @param {String} name 参数名称。
         * @return {Boolean} 参数转换后的布尔值。
         */
        getBool: function(name) {
          return Wb.parseBool(app.get(name));
        },
        /**
         * 获取指定名称的参数，并转换为整数类型。
         * @param {String} name 参数名称。
         * @return {Integer} 参数转换后的整数值。
         */
        getInt: function(name) {
          return parseInt(app.get(name), 10);
        },
        /**
         * 获取指定名称的参数，并转换为浮点数类型。
         * @param {String} name 参数名称。
         * @return {Double} 参数转换后的浮点值。
         */
        getFloat: function(name) {
          return parseFloat(app.get(name));
        },
        /**
         * 获取指定名称的参数，并转换为日期类型。参数必须为有效日期格式的字符串。
         * @param {String} name 参数名称。
         * @return {Date} 参数转换后的日期值。
         */
        getDate: function(name) {
          return Wb.strToDate(app.get(name, true));
        },
        /**
         * 获取指定名称的参数，并转换为日期类型。参数必须为有效日期格式的字符串。
         * @param {String} name 参数名称。
         * @return {Date} 参数转换后的日期值。
         */
        getJavaDate: function(name) {
          return DateUtil.strToDate(app.get(name, true));
        },
        /**
         * 判断指定参数是否不为空。参数是指存储在session的attribute，request的attribute或parameter中的值。
         * @param {String} name 参数名称。
         * @return {Boolean} 如果参数存在且其值不为空则返回true，否则返回false。
         */
        has: function(name) {
          return !Wb.isEmpty(app.get(name, true));
        },
        /**
         * 遍历对象，并把对象中每个条目的值设置到request的attribute对象，attribute名称为对象中条目的名称。
         * 如果首个参数不是对象，将以第1个参数为名称，第2个参数为值，设置到attribute。
         * @param {Object} object 设置的对象。
         */
        set: function(object, val) {
          if (Wb.isObject(object)) {
            Wb.each(object, function(k, v) {
              request.setAttribute(k, v);
            });
          } else
            request.setAttribute(object, val);
        },
        /**
         * 判断当前请求对指定模块是否可以访问。
         * @param {String} path 模块路径或其捷径。
         * @return {Boolean} true可以访问，false不可以访问。
         */
        perm: function(path) {
          return com.wb.common.XwlBuffer.canAccess(request, path);
        },
        /**
         * 根据当前语言种类格式化字符串。
         * @param {String} format 模板字符串。
         * @param {String...} values 格式化填充的字符串内容列表。
         * @return {String} 格式化后的字符串。
         */
        format: function() {
          return Str.langFormat(request.getAttribute('sys.useLang'),
            arguments[0], [].slice.call(arguments, 1));
        },
        /**
         * 根据Str.lang为当前语言代码，获取langs中对应值组成的对象。
         * @param {Object} langs 按不同语言定义的值对象。
         * @return {Object} 根据当前语言提取值后组成的对象。
         */
        getLang: function(langs) {
          var list = {},
            lang = app.format('lang');
          Wb.each(langs, function(k, v) {
            list[k] = v[lang];
          });
          return list;
        },
        /**
         * 运行SQL语句，并获取返回结果对象。
         * @param {String} sql 运行的SQL语句。
         * @param {Object} [config] 配置对象。
         * @param {String} config.jndi 数据库连接jndi。
         * @param {String} config.arrayName 执行批处理时，指定数据源来自request中存储的该变量。
         * @param {JSONArray/Array/String} config.arrayData 执行批处理时，指定数据源来自该值。
         * @param {Boolean} config.batchUpdate 是否允许批处理操作。
         * @param {String} config.type  执行何种SQL操作，可为"query","update","execute","call"，默认为自动。
         * @param {String} config.transaction 执行何种数据库事务操作，可为"start","commit","none"。
         * @param {String} config.isolation 数据库事务隔离级别，可为"readCommitted","readUncommitted","repeatableRead","serializable"。
         * @param {Boolean} config.uniqueUpdate 指定插入、更改或删除记录操作是否有且只有1条。
         * @return {Object} 运行SQL语句获得的结果，可能值为结果集，影响记录数或输出参数结果Map。
         */
        run: function(sql, config) {
          var arrayData,
            query = new com.wb.tool.Query();
          if (config && config.arrayData) {
            arrayData = config.arrayData;
            if (!(arrayData instanceof JSONArray)) {
              if (Wb.isArray(arrayData))
                arrayData = Wb.reverse(arrayData);
              else
                arrayData = new JSONArray(arrayData);
              config.arrayData = arrayData;
            }
          }
          Wb.apply(query, {
            request: request,
            sql: sql
          }, config);
          var r = query.run();
          if (r instanceof java.sql.ResultSet) {
            return Ag.handerNull(r);
          }
          return r;
        },
        /**
         * 在模块内运行另外一个模块。主模块和子模块将共享request和response。
         * @param url 运行的模块url地址。
         */
        execute: function(url) {
          WebUtil.run(url, request, response);
        },
        /**
         * 从数据库获取数据，并输出指定格式的脚本、图片或流数据至客户端。
         * @param {String} sql sql语句。
         * @param {Object} [config] 配置参数对象，见DataProvider控件的使用。
         * @param {Boolean} [returnScript] 是否返回脚本，true返回生成的脚本，false直接输出，默认为false。
         & @return {String/undefined} 输出脚本或undefined。
         */
        output: function(sql, config, returnScript) {
          var configText, dp = new com.wb.controls.DpControl();
          dp.request = request;
          dp.response = response;
          if (config) {
            Wb.each(config, function(key, value) {
              if (Wb.isObject(value))
                value = Wb.encode(value);
              else value = String(value);
              config[key] = value;
            });
            configText = Wb.encode(config);
          } else
            configText = '{}';
          dp.configs = new JSONObject(configText);
          dp.configs.put('sql', sql);
          if (returnScript)
            return dp.getContent(false);
          else
            dp.create();
        },
        /**
         * 获取由SQL生成的数据对象。详见app.output方法的说明。
         * @param {String} sql sql语句。
         * @param {Object} [config] 配置参数对象，见DataProvider控件的使用。
         & @return {Object} 数据对象。
         */
        getData: function(sql, config) {
          return Wb.decode(app.output(sql, config, true));
        },
        /**
         * 执行上下文绑定的insert, update, delete数据库更新操作。
         * @param {Object} config 配置参数对象，见Updater控件的使用。
         */
        update: function(configs) {
          var updater = new com.wb.tool.Updater();

          Wb.apply(updater, {
            request: request,
            fieldsMap: configs.fieldsMap ? new JSONObject(Wb.encode(configs.fieldsMap)) : null
          }, configs);
          updater.run();
        }
      };
      //end app
      request.setAttribute('sys.app', app);
      return app;
    },
    /**
     * 把对象转换成以字符串形式表示的值。
     * @param {Object} object 转换的对象。
     * @return {String} 字符串形式表示的值。
     */
    toString: function(object) {
      return Object.prototype.toString.call(object);
    },
    /**
     * 判断是否是JS字符串。
     * @return {Boolean} true是，false不是。
     */
    isString: function(object) {
      return typeof object === 'string';
    },
    /**
     * 判断是否是JS数字。
     * @return {Boolean} true是，false不是。
     */
    isNumber: function(object) {
      return typeof object === 'number' && isFinite(object);
    },
    /**
     * 判断是否是JS对象。
     * @param {Object} object 判断的对象。
     * @return {Boolean} true是，false不是。
     */
    isObject: function(object) {
      return Wb.toString(object) === '[object Object]';
    },
    /**
     * 判断是否是JS数组或Java数组。
     * @param {Object} object 判断的对象。
     * @return {Boolean} true是，false不是。
     */
    isArray: function(object) {
      return Wb.toString(object) === '[object Array]' || SysUtil.isArray(object);
    },
    /**
     * 判断是否是JS日期。
     * @param {Object} object 判断的对象。
     * @return {Boolean} true是，false不是。
     */
    isDate: function(object) {
      return Wb.toString(object) === '[object Date]';
    },
    /**
     * 判断是否是JS布尔型。
     * @param {Object} object 判断的对象。
     * @return {Boolean} true是，false不是。
     */
    isBoolean: function(object) {
      return typeof object === 'boolean';
    },
    /**
     * 判断是否是JS函数。
     * @param {Object} object 判断的对象。
     * @return {Boolean} true是，false不是。
     */
    isFunction: function(object) {
      return typeof object === 'function';
    },
    /**
     * 把对象编码成字符串并返回使用双引号引用的该字符串（不包含双引号本身）。
     * @param {Object} object 需要编码和引用的对象。
     * @return {String} 编码并使用双引号引用后的字符串。
     */
    quote: function(object) {
      return StringUtil.text(Wb.encode(object));
    },
    /**
     * 遍历数组或对象的各个元素。
     * @param {Array/Object} data 遍历的数组或对象。
     * @param {Function} fn 每遍历一个元素所执行的回调方法。对于数组传递的参数为值和索引，对于对象传递的参数为名称和值。
     * 如果函数返回false，将中断遍历。
     * @param {Boolean} [reverse] 是否倒序遍历，仅适用于数组，默认为false。
     * @return {Boolean} true遍历完成，否则返回索引号（数组）或false（对象）。
     */
    each: function(data, fn, reverse) {
      if (!data)
        return;
      if (Wb.isArray(data)) {
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
     * 抛出Java Exception异常信息。
     * @param {String} message 异常信息。
     */
    error: function(message) {
      SysUtil.error(message);
    },
    /**
     * 判断值是否为空。如果值为null, undefined, 空串或数组长度为0，则为空。
     * @param {Object} value 需要判断的值，可以为字符串或数组等。
     * @return {Boolean} 如果为空则返回true，否则返回false。
     */
    isEmpty: function(value) {
      if (value === null || value === undefined)
        return true;
      return String(value).length === 0;
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
        if (array[i] == item)
          return i;
      return -1;
    },
    /**
     * 对指定值按指定格式转换为字符串。指定值可以是日期，数字，字符串或其他值。
     * @param {Object} value 需要格式化的值。如果该值为字符串表示格式化字符串使用的格式。
     * @param {String} [format] 格式。
     * @return {String} 格式化后的字符串。
     */
    format: function(value, format) {
      if (!value)
        return '';
      var isJsDate = Wb.isDate(value),
        isJavaDate = value instanceof JavaDate;

      if (isJsDate || isJavaDate) {
        if (isJsDate)
          value = new JavaDate(value.getTime());
        if (format)
          return DateUtil.format(value, format);
        else
          return DateUtil.format(value);
      } else if (Wb.isNumber(value)) {
        var decimalFormat = new java.text.DecimalFormat(format);
        decimalFormat.setRoundingMode(java.math.RoundingMode.HALF_UP);
        return decimalFormat.format(value);
      } else {
        return JavaString.format(value, [].slice.call(arguments, 1));
      }
    },
    /**
     * 对字符、数字、日期、对象和数组等进行编码，并转换为以字符串表示的值。
     * @param {Object} o 需要编码的值。
     * @return {String} 编码后的值。
     */
    encode: function(o) {
      var buf, addComma;
      if (o === null || o === undefined || Wb.isFunction(o)) {
        return 'null'; //Java无undefined类型，因此通一为null。
      } else if (typeof o == 'boolean') {
        return String(o);
      } else if (typeof o == 'number') {
        return isFinite(o) ? String(o) : 'null';
      } else if (Wb.isDate(o)) {
        return '"' + Wb.dateToStr(o) + '"';
      } else if (o instanceof JavaDate) {
        return '"' + DateUtil.dateToStr(o) + '"';
      } else if (Wb.isArray(o)) {
        buf = new StringBuilder('[');
        addComma = false;
        Wb.each(o, function(value) {
          if (addComma)
            buf.append(',');
          else
            addComma = true;
          buf.append(Wb.encode(value));
        });
        buf.append(']');
        return buf.toString();
      } else if (SysUtil.isIterable(o)) {
        buf = new StringBuilder('[');
        addComma = false;
        o.forEach(function(value) {
          if (addComma)
            buf.append(',');
          else
            addComma = true;
          buf.append(Wb.encode(value));
        });
        buf.append(']');
        return buf.toString();
      } else if (Wb.isObject(o)) {
        buf = new StringBuilder('{');
        addComma = false;
        Wb.each(o, function(name, value) {
          if (addComma)
            buf.append(',');
          else
            addComma = true;
          buf.append(StringUtil.quote(name));
          buf.append(':');
          buf.append(Wb.encode(value));
        });
        buf.append('}');
        return buf.toString();
      } else if (SysUtil.isMap(o)) {
        buf = new StringBuilder('{');
        addComma = false;
        o.entrySet().forEach(function(entry) {
          if (addComma)
            buf.append(',');
          else
            addComma = true;
          buf.append(StringUtil.quote(entry.key));
          buf.append(':');
          buf.append(Wb.encode(entry.value));
        });
        buf.append('}');
        return buf.toString();
      } else
        return StringUtil.encode(o);
    },
    /**
     * 对以字符串形式表示的值进行解码，并转换为与之对应的值。
     * @param {String} s 需要解码的值。
     * @param {Boolean} [safe] 如果解码过程发生异常，true返回null，false抛出异常。默认为false。
     * @return {Object} 解码后的值。
     */
    decode: function(s, safe) {
      try {
        return eval('(' + s + ')');
      } catch (e) {
        if (safe)
          return null;
        throw e;
      }
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
     * 判断两个字符串是否相似。如果两个字符串为null,undefined或空串返回true，否则返回转换成JS小写字符串后进行比较的结果。
     * @param {Object} str1 比较的字符串1。
     * @param {Object} str2 比较的字符串2。
     * @return {Boolean} true相似，false不相似。
     */
    isSame: function(str1, str2) {
      var jsStr1, jsStr2;
      if (Wb.isEmpty(str1))
        jsStr1 = '';
      else
        jsStr1 = String(str1);
      if (Wb.isEmpty(str2))
        jsStr2 = '';
      else
        jsStr2 = String(str2);
      return jsStr1.toLowerCase() === jsStr2.toLowerCase();
    },
    /**
     * 判断两个字符串是否相等。如果两个字符串为null,undefined或空串返回true，否则返回转换成JS字符串后进行比较的结果。
     * @param {Object} str1 比较的字符串1。
     * @param {Object} str2 比较的字符串2。
     * @return {Boolean} true相等，false不相等。
     */
    isEqual: function(str1, str2) {
      var jsStr1, jsStr2;
      if (Wb.isEmpty(str1))
        jsStr1 = '';
      else
        jsStr1 = String(str1);
      if (Wb.isEmpty(str2))
        jsStr2 = '';
      else
        jsStr2 = String(str2);
      return jsStr1 === jsStr2;
    },
    /**
     * 把值解析为布尔型。如果值为false, 'false', 0, '0', null, undefined和空串返回false，其他值返回true。
     * 如果指定默认值，则当值为null或undefined时返回此默认值。
     * @param {Object} value 需要解析的值。
     * @param {Boolean} [defaultValue] 如果value为null或undefined，默认返回此值，未指定将返回false。
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
     * 判断值是否为不是null和undefined值。
     * @param {Object} value 任意值。
     * @return {Boolean} 如果值为null和undefined返回false，否则返回true。
     */
    isValue: function(value) {
      return value !== null && value !== undefined;
    },
    /**
     * 依次序合并所有参数值到一个新的数组，如果参数为数组将逐个进行合并。该方法不影响输入参数的值。
     * @param {Object...} values 需要合并的值。
     * @return {Array} 合并后的数组。如果没有合并项返回空数组。
     */
    merge: function() {
      //该方法用于替代concat方法
      var args = [].slice.call(arguments),
        items = [],
        arg, i, j;

      function eachItem(item) {
        items.push(item);
      }

      j = args.length;
      for (i = 0; i < j; i++) {
        arg = args[i];
        if (Wb.isArray(arg))
          arg.forEach(eachItem);
        else
          items.push(arg);
      }
      return items;
    },
    /**
     * 在指定对象中查找名称和值匹配的项。
     *
     * Example:
     *
     *     var item = Wb.find([{a: 123}, {a: 'abc'}], 'a', 'abc'); //返回{a: 'abc'}对象
     *
     * @param {Mixed} object 查找的对象。
     * @param {String} name 查找的名称。
     * @param {Object} value 查找的值。
     * @return {Object} 查找到的项。如果没有找到返回null。
     */
    find: function(object, name, value) {
      var result = null;
      Wb.each(object, function(item) {
        if (item[name] == value) {
          result = item;
          return false;
        }
      });
      return result;
    },
    /**
     * 把字符串转换成js Date格式。如果不能转换为日期返回null。
     * @param {String} string 需要转换成日期的字符串。
     * @return {Date} 转换后的日期或null。
     */
    strToDate: function(string) {
      if (Wb.isEmpty(string))
        return null;
      var date = new Date(Date.parse(string));
      if (date != 'Invalid Date')
        return date;
      else
        return null;
    },
    /**
     * 把日期对象转换成标准日期格式yyyy-MM-dd HH:mm:ss.f的字符串。如果日期为空或无效返回null。
     * @param {Date/JavaDate} date 需要转换成字符串的日期。
     * @return {String} 转换后的日期或null。
     */
    dateToStr: function(date) {
      if (date instanceof JavaDate)
        return DateUtil.dateToStr(date);
      else if (Wb.isDate(date))
        return Wb.format('%d-%02d-%02d %02d:%02d:%02d.%d', date.getFullYear(), date.getMonth(), date.getDate(),
          date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
      else return null;
    },
    /**
     * 从源对象复制一组属性到目录对象。
     * @param {Object} dest 目标对象。
     * @param {Object} source 源对象。
     * @param {String/String[]} names 复制的属性名称，以逗号分隔或数组。
     * @return {Object} 修改后的目标对象。
     */
    copyTo: function(dest, source, names) {
      if (Wb.isString(names))
        names = names.split(',');
      var name, i, j = names ? names.length : 0;

      for (i = 0; i < j; i++) {
        name = names[i];
        if (source.hasOwnProperty(name)) {
          dest[name] = source[name];
        }
      }
      return dest;
    },
    /**
     * 在JS和Java类型之间反转指定值类型，如果值为JS型则返回Java型，如果值为Java型则返回JS型。
     * @param {Object} value 需要反转类型的值。
     * @return {Object} 反转类型后的值。
     */
    reverse: function(value) {
      if (value instanceof JavaDate)
        return Wb.createDate(value.getTime());
      else if (Wb.isDate(value))
        return new JavaDate(value.getTime());
      else if (Wb.isObject(value))
        return Wb.toJSONObject(value);
      else if (Wb.isArray(value))
        return Wb.toJSONArray(value);
      else if (value instanceof JSONArray || value instanceof JSONObject)
        return Wb.decode(value.toString());
      else if (Wb.isArray(value))
        value = Java.to(value);
      else if (SysUtil.isArray(value))
        value = Java.from(value);
      else
        return value;
    },
    /**
     * 根据时间数字值获得日期类型值。
     * @param {Number} timeValue 时间数字值。
     * @return {Date} 日期值。
     */
    createDate: function(timeValue) {
      return new Date(Number(timeValue));
    },
    /**
     * 把config中的值复制到object中，defaults为config的默认值。
     * @param {Object} object 目标对象。
     * @param {Object} config 源对象。
     * @param {Object} [defaults] config的默认值对象。
     * @return {Object} object对象本身。
     */
    apply: function(object, config, defaults) {
      if (config) {
        Wb.each(config, function(key, value) {
          object[key] = value;
        });
      }
      if (defaults) {
        if (config)
          Wb.each(defaults, function(key, value) {
            if (!config.hasOwnProperty(key))
              object[key] = value;
          });
        else Wb.apply(object, defaults);
      }
      return object;
    },
    /**
     * 如果object中不存在相同名称的值，则把config中的值复制到object中。
     * @param {Object} object 目标对象。
     * @param {Object} config 源对象。
     * @return {Object} object对象本身。
     */
    applyIf: function(object, config) {
      if (config) {
        Wb.each(config, function(key, value) {
          if (!object.hasOwnProperty(key))
            object[key] = value;
        });
      }
      return object;
    },
    /**
     * 读取文件中的json对象或数组。
     * @param {File} file 文件。
     * @return {Object/Array} 对象或数组。
     */
    readJson: function(file) {
      return Wb.decode(FileUtil.readString(file));
    },
    /**
     * 把json对象或数组写到文件中。
     * @param {File} file 文件。
     * @param {Object/Array} json 对象或数组。
     */
    writeJson: function(file, json) {
      FileUtil.writeString(file, Wb.encode(json));
    },
    /**
     * 获取指定对象所有值组成的数组。
     * @param {Object} object 获取值的对象。
     * @return {Array} 对象中所有值组成的数组。
     */
    getValues: function(object) {
      var property, values = [];

      for (property in object) {
        if (object.hasOwnProperty(property)) {
          values.push(object[property]);
        }
      }
      return values;
    },
    /**
     * 获取文本的省略显示。超过指定长度的文本将以“...”替代。
     * @param {String} value 需要省略的文本。
     * @param {Number} length 文本显示的最大长度。
     * @return {String} 省略后显示的文本。
     */
    ellipsis: function(value, length, word) {
      value = String(value);
      if (value && value.length > length) {
        return value.substr(0, length - 3) + "...";
      }
      return value;
    },
    /**
     * 在指定值左边填补指定字符，使值总长度达到指定长度。
     * @param {Mixed} value 需要填补的值。
     * @param {Number} size 填补后的总长度。
     * @param {String} [character] 填补的字符，默认为'0'。
     * @return {String} 填补后的字符串值。
     */
    pad: function(value, size, character) {
      var result = String(value);
      character = character || '0';
      while (result.length < size) {
        result = character + result;
      }
      return result;
    },
    /**
     * 在指定值右边填补指定字符，使值总长度达到指定长度。
     * @param {Mixed} value 需要填补的值。
     * @param {Number} size 填补后的总长度。
     * @param {String} [character] 填补的字符，默认为'0'。
     * @return {String} 填补后的字符串值。
     */
    padRight: function(value, size, character) {
      var result = String(value);
      character = character || '0';
      while (result.length < size) {
        result += character;
      }
      return result;
    },
    /**
     * 获取Excel 2007+模板文件转换得到的Web脚本字符串。这些Web脚本字符串可应用于前端容器控件用于直接生成表单或报表。
     * @param {Object/JSONObject} params 参数对象。可以在Excel模板文件中被引用。
     * @param {String/File/InputStream} file Excel模板文件路径、文件对象或输入流。如果是文件路径基于Base.path。
     * @param {Number} [sheetIndex] 引用的模板文件中的Sheet索引号，默认为0。
     * @param {String} [align] 生成的表单对齐方式，有效值为left, center, right。
     * @return {String} 生成的HTML脚本。
     */
    getHtml: function(params, file, sheetIndex, align) {
      params = Wb.toJSONObject(params);
      if (Wb.isString(file))
        file = new File(Base.path, file);
      return com.wb.tool.ExcelForm.getHtml(params, file, sheetIndex || 0, align);
    },
    /**
     * 把数据导入到Excel模板文件中，并输出到指定的输出流中。
     * @param {Object/JSONObject} params 参数对象。可以在Excel模板文件中被引用。
     * @param {String/File/InputStream} file Excel模板文件路径、文件对象或输入流。如果是文件路径基于Base.path。
     * @param {OutputStream} outputStream 生成的Excel文件输出到该流中。
     * @param {Number} [sheetIndex] 引用的模板文件中的Sheet索引号，-1表示全部Sheet。默认为-1。
     */
    getExcel: function(params, file, outputStream, sheetIndex) {
      params = Wb.toJSONObject(params);
      if (Wb.isString(file))
        file = new File(Base.path, file);
      com.wb.tool.DataOutput.importToExcel(params, file, outputStream, sheetIndex === undefined ? -1 : sheetIndex);
    },
    /**
     * 把JS的Object对象转换为Java的JSONObject对象。如果参数不是Object对象，将直接返回此参数。
     * 如果object中的值为原始值，可以使用new JSONObject(object)替代。
     * @param {Object} object 需要转换的对象。
     * @return {JSONObject} 转换后的JSONObject对象或object参数原值。
     */
    toJSONObject: function(object) {
      if (Wb.isObject(object)) {
        var jo = new JSONObject();
        Wb.each(object, function(k, v) {
          if (v === null || v === undefined || Wb.isFunction(v))
            v = null;
          else if (Wb.isObject(v))
            v = Wb.toJSONObject(v);
          else if (Wb.isArray(v))
            v = Wb.toJSONArray(v);
          else if (Wb.isDate(v))
            v = new JavaDate(v.getTime());
          jo.put(k, v);
        });
        return jo;
      }
      return object;
    },
    /**
     * 把JS的Array对象转换为Java的JSONArray对象。如果参数不是Array对象，将直接返回此参数。
     * 如果array中的值为原始值，可以使用new JSONArray(array)替代。
     * @param {Array} array 需要转换的数组。
     * @return {JSONArray} 转换后的JSONArray对象或array参数原值。
     */
    toJSONArray: function(array) {
      if (Wb.isArray(array)) {
        var ja = new JSONArray();
        Wb.each(array, function(v) {
          if (v === null || v === undefined || Wb.isFunction(v))
            v = null;
          else if (Wb.isObject(v))
            v = Wb.toJSONObject(v);
          else if (Wb.isArray(v))
            v = Wb.toJSONArray(v);
          else if (Wb.isDate(v))
            v = new JavaDate(v.getTime());
          ja.put(v);
        });
        return ja;
      }
      return array;
    },
    /**
     * 获取结果集当前行所有字段名称和值组成的对象。
     * @param {ResultSet} rs 结果集。
     * @param {ResultSetMetaData} [meta] 结果集元数据，如果缺少该值，系统将动态生成。基于性能考虑如果多次调用该方法，请提供该参数。
     * @return {Object} 记录数据组成的对象
     */
    getRecord: function(resultSet, meta) {
      if (!meta)
        meta = resultSet.getMetaData();
      var i, j = meta.getColumnCount(),
        record = {},
        value;
      for (i = 0; i < j; i++) {
        value = DbUtil.getObject(resultSet, i + 1, meta.getColumnType(i + 1));
        record[DbUtil.getFieldName(meta.getColumnLabel(i + 1))] = value;
      }
      return record;
    },
    /**
     * 获取结果集所有行所有字段值组成的数组。数组内每一项为记录数据对象。
     * @param {ResultSet} rs 结果集。
     * @return {Array} 所有记录数据组成的数组。
     */
    getRecords: function(resultSet) {
      var meta = resultSet.getMetaData(),
        i, j = meta.getColumnCount(),
        fieldNames = [],
        fieldTypes = [],
        record, records = [],
        value;

      //获取字段名称列表
      for (i = 0; i < j; i++) {
        fieldNames.push(DbUtil.getFieldName(meta.getColumnLabel(i + 1)));
        fieldTypes.push(meta.getColumnType(i + 1));
      }
      while (resultSet.next()) {
        record = {};
        for (i = 0; i < j; i++) {
          value = DbUtil.getObject(resultSet, i + 1, fieldTypes[i]);
          record[fieldNames[i]] = value;
        }
        records.push(record);
      }
      return records;
    },
    /**
     * 获取对象数据中各个对象指定名称成员值组成的数组。
     * @param {Object[]} items 对象数组。
     * @param {String} name 对象中的成员名称。
     * @return {Array} 值组成的数组。
     */
    pluck: function(items, name) {
      var i, j = items.length,
        item, data = [];
      for (i = 0; i < j; i++) {
        item = items[i];
        data.push(item ? item[name] : null);
      }
      return data;
    },
    newClass: function(beanName) {
      var obj = com.ag.base.Reflect.newInstance();
      return obj.execute(beanName);

    }
  },
  Ag = {
    updateLock: new java.util.concurrent.locks.StampedLock(),//更新锁
    funLocks:{},//功能锁Map
    handerNull: function(rs) {
      if(!rs)
        return rs;
      var ResultSet = java.sql.ResultSet,
        InvocationHandler = java.lang.reflect.InvocationHandler,
        Proxy = java.lang.reflect.Proxy,
        meta = rs.getMetaData(),
        count = meta.getColumnCount(),
        cols,
        handler = new InvocationHandler({
          invoke: function(proxy, method, args) {
            var ret = method.invoke(rs, args || []); //执行原有逻辑
            if (method.getName().equals("getString") && !ret) //执行织入的逻辑，处理空串  
              return '';
            if (method.getName().equals("getObject") && !ret) //执行织入的逻辑，处理空串  
            {
              if (!cols) {
                cols = {};
                for (var i = 1; i <= count; ++i)
                  cols[meta.getColumnName(i)] = i;
              }
              var index = cols[args[0].toString().toUpperCase()] || args[0];
              var type = meta.getColumnType(index);
              if (DbUtil.isStringField(type) || DbUtil.isTextField(type))
                return '';
            }
            return ret;
          }
        });
      return Proxy.newProxyInstance(rs.getClass().getClassLoader(), rs.getClass().getInterfaces(), handler);
    },
    getResultSet: function(result, onlyRows) {
      var rows = [];
      var meta = result.getMetaData();
      var count = meta.getColumnCount();
      var cols = [];
      for (var i = 1; i <= count; ++i)
        cols.push(meta.getColumnName(i));

      function makeRow(obj, col) {
        var colObj = result.getObject(col);
        obj[col] = colObj instanceof Java.type("java.sql.ResultSet") ? Ag.getResultSet(Ag.handerNull(colObj), onlyRows) : colObj;
        return obj;
      }

      while (result.next()) {
        var row = cols.reduce(makeRow, {});
        rows.push(row);
      }
      return onlyRows ? rows : {
        metaData: {
          fields: cols
        },
        rows: rows
      };
    },

    getResultArray: function(result) {
      var rows = [];
      var meta = result.getMetaData();
      var count = meta.getColumnCount();
      var cols = [];
      for (var i = 1; i <= count; ++i)
        cols.push(meta.getColumnName(i));

      function makeRow(obj, col, idx) {
        var colObj = result.getObject(col);
        obj[idx] = colObj instanceof Java.type("java.sql.ResultSet") ? Ag.getResultArray(Ag.handerNull(colObj)) : colObj;
        return obj;
      }

      while (result.next()) {
        var row = cols.reduce(makeRow, []);
        rows.push(row);
      }
      return {
        cols: cols,
        rows: rows
      };
    },

    getResultObj: function(result) {
      var obj = {};

      function getValue(result, i) {
        var colObj = result.getObject(i);
        return colObj instanceof Java.type("java.sql.ResultSet") ? Ag.getResultObj(Ag.handerNull(colObj)) : colObj;
      }

      while (result.next()) {
        obj[result.getString(1)] = getValue(result, 2);
      }
      return obj;
    },
    boundToYardPosition: function(app, pos) {
      if (pos.length < 2)
        return pos;
      var area = pos.substr(0, 2);
      var bound = app.run("select beg_bay_no,beg_row_no,area_no from boundary_d where area_id = '1' and TENANCY_ID={?sys.TENANCY_ID?} and  boundary_no='" + area + "'");
      if (bound && bound.next()) {
        var areaNo = bound.getString('area_no');
        var begBay = bound.getInt('beg_bay_no');
        var begRow = bound.getInt('beg_row_no');
        var bayNo = pos.substr(2, 2);
        var rowNo = pos.substr(4, 2);
        var tierNo = pos.substr(6, 1);
        var newPos = areaNo;
        if (bayNo)
          newPos += Wb.pad(bayNo * 1 + begBay - 1, 2);
        if (rowNo)
          newPos += Wb.pad(rowNo * 1 + begRow - 1, 2);
        newPos += tierNo;
        return newPos;
      } else
        return pos;
    },
    getYardCfsMap: function(app) {
      var map;
      if (!map) {
        map = Ag.getResultObj(app.run("select cy_area_no,cfs_cod  from c_cy_area where tenancy_id={?sys.TENANCY_ID?}", {
          jndi: 'jdbc/basecode'
        }));
      }
      return map;
    }
  };
//# sourceURL=AgimtosSystem/src/main/webapp/wb/system/server.js