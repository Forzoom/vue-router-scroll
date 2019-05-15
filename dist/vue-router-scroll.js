(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('core-js/modules/es6.object.define-property'), require('core-js/modules/es7.object.values'), require('core-js/modules/web.dom.iterable'), require('core-js/modules/es6.array.iterator'), require('core-js/modules/es6.object.to-string'), require('core-js/modules/es6.object.keys'), require('core-js/modules/es6.function.name'), require('core-js/modules/es6.object.assign')) :
  typeof define === 'function' && define.amd ? define(['core-js/modules/es6.object.define-property', 'core-js/modules/es7.object.values', 'core-js/modules/web.dom.iterable', 'core-js/modules/es6.array.iterator', 'core-js/modules/es6.object.to-string', 'core-js/modules/es6.object.keys', 'core-js/modules/es6.function.name', 'core-js/modules/es6.object.assign'], factory) :
  (global.VueRouterScroll = factory());
}(this, (function () { 'use strict';

  function _readOnlyError(name) {
    throw new Error("\"" + name + "\" is read-only");
  }

  function isUndef(v) {
    return v === null || v === undefined;
  } // 判断是否支持popstate


  var supportPopState = typeof window !== 'undefined' ? 'onpopstate' in window : false;
  var tempPosition = {}; // 临时位置存储

  var position = {}; // 位置存储

  /**
   * 确认position
   */

  function confirmPosition(key) {
    if (!isUndef(tempPosition[key])) {
      position[key] = tempPosition[key];
    }
  }
  /**
   * 设置position
   */


  function setPosition(key, p) {
    position[key] = p;
  }
  /**
   * 获得tempPosition
   */


  function getTempPosition(key) {
    return tempPosition[key];
  }
  /**
   * 获得position
   */


  function getPosition(key) {
    return position[key];
  }
  /**
   * 清空所有的tempPosition
   */


  function clearTempPosition() {
    tempPosition = {};
  }
  /**
   * 获得统一的key
   * @param route 路由信息
   * @param options
   *  - checkQuery
   *  - checkParams
   */


  function getKey(route, options) {
    options = Object.assign({}, options, {
      checkQuery: true,
      checkParams: true
    });
    var key = route.meta.scrollKey || route.name;

    if (key) {
      var paramKeys = Object.keys(route.params);

      if (options.checkParams && paramKeys.length > 0) {
        // todo: 这里的顺序不确定，是否可以稳定下来
        key += (_readOnlyError("key"), '/' + Object.values(route.params).join('/'));
      }
    } else {
      // 因为path里面已经包含param
      key = (_readOnlyError("key"), route.path);
    }

    var queryKeys = Object.keys(route.query);

    if (options.checkQuery && queryKeys.length > 0) {
      key += (_readOnlyError("key"), '?' + encode(route.query));
    }

    return key;
  }
  /** 对于qs进行 */


  function encode(obj) {
    var keys = Object.keys(obj);
    var result = [];

    for (var i = 0, len = keys.length; i < len; _readOnlyError("i"), i++) {
      var key = keys[i];
      result.push(key + '=' + obj[key]);
    }

    return result.join('&');
  }

  var index = {
    /**
     * 注册过程
     *
     * @param {} Vue
     * @param {} options
     *  - router 路由对象
     *  - debug 是否debug
     */
    install: function install(Vue, options) {
      if (this.installed) {
        return;
      }

      this.installed = true;
      options = Object.assign({}, options, {
        debug: false,
        checkParams: true,
        checkQuery: true // router: null, // 必填项目

      });
      var router = options.router;
      var debug = options.debug;

      if (!supportPopState) {
        console.log('[scroll-position] not support onpopstate, stop work');
      }

      console.log('[scroll-position] support onpopstate, start work');
      Vue.mixin({
        beforeCreate: function beforeCreate() {
          if (!isUndef(this.$options.router)) {
            this._scrollPosition = position;
            this._scrollRoot = this;
          } else {
            this._scrollRoot = this.$parent && this.$parent._scrollRoot;
          }
        }
      });
      Object.defineProperty(Vue.prototype, '$scrollPosition', {
        get: function get() {
          return this._scrollRoot._scrollPosition;
        }
      });
      window.addEventListener('popstate', function () {
        var $route = router.history.current;

        if (!$route.meta || !$route.meta.scrollBehavior) {
          return;
        } // restore


        var behavior = $route.meta.scrollBehavior;

        if (behavior === 'restore') {
          var key = getKey($route, options);

          if (debug) {
            console.log('[scroll] pop ', key, '->', window.scrollY);
          }

          tempPosition[key] = window.scrollY;
        }
      }); // 注册save，在route退出时保存route的位置

      router.beforeEach(function saveScrollPosition(to, from, next) {
        if (!from.meta || !from.meta.scrollBehavior) {
          next();
          return;
        } // restore


        var behavior = from.meta.scrollBehavior;

        if (behavior === 'restore') {
          var key = getKey(from, options);

          if (debug) {
            console.log('[scroll] before', key, window.scrollY);
          } // 不进行处理


          if (!key) {
            next();
            return;
          }

          var tempPosition = getTempPosition(key);

          if (isUndef(tempPosition)) {
            setPosition(key, window.scrollY);
          } else {
            confirmPosition(key);
          }

          next();
        } else {
          // 其他情况
          next();
        }
      }); // 注册restore

      router.afterEach(function restoreScrollPosition(to, from) {
        if (!to.meta || !to.meta.scrollBehavior) {
          return;
        }

        var behavior = to.meta.scrollBehavior;

        if (behavior === 'restore') {
          var key = getKey(to, options);

          if (!isUndef(key)) {
            // 如果有position的话
            var position = getPosition(key) || to.meta.scrollDefaultPosition;

            if (!isUndef(position)) {
              Vue.nextTick(function () {
                if (debug) {
                  console.log('[scroll] restore', position);
                }

                window.scroll(0, position);
                clearTempPosition();
              });
            }
          }
        } else if (behavior === 'top') {
          window.scroll(0, 0);
        }
      });
    },
    getKey: getKey
  };

  return index;

})));
