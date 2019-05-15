function isUndef(v) {
    return v === null || v === undefined;
}

// 判断是否支持popstate
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
 * 删除position记录
 */
function removePosition(key) {
    position[key] = null;
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
        checkParams: true,
    })
    const key = route.meta.scrollKey || route.name;
    if (key) {
        const paramKeys = Object.keys(route.params);
        if (options.checkParams && paramKeys.length > 0) {
            // todo: 这里的顺序不确定，是否可以稳定下来
            key += ('/' + Object.values(route.params).join('/'));
        }
    } else {
        // 因为path里面已经包含param
        key = route.path;
    }
    
    const queryKeys = Object.keys(route.query);
    if (options.checkQuery && queryKeys.length > 0) {
        key += ('?' + encode(route.query));
    }

    return key;
}

/** 对于qs进行 */
function encode(obj) {
    const keys = Object.keys(obj);
    const result = [];
    for (const i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        result.push(key + '=' + obj[key]);
    }
    return result.join('&');
}

export default {
    /**
     * 注册过程
     *
     * @param {} Vue
     * @param {} options
     *  - router 路由对象
     *  - debug 是否debug
     */
    install(Vue, options) {
        if (this.installed) {
            return;
        }
        this.installed = true;

        options = Object.assign({}, options, {
            debug: false,
            checkParams: true,
            checkQuery: true,
            // router: null, // 必填项目
        });
        const router = options.router;
        const debug = options.debug;

        if (!supportPopState) {
            console.log('[scroll-position] not support onpopstate, stop work');
            
        }

        console.log('[scroll-position] support onpopstate, start work');
        Vue.mixin({
            beforeCreate: function() {
                if (!isUndef(this.$options.router)) {
                    this._scrollPosition = position;
                    this._scrollRoot = this;
                } else {
                    this._scrollRoot = (this.$parent && this.$parent._scrollRoot);
                }
            },
        });
        Object.defineProperty(Vue.prototype, '$scrollPosition', {
            get: function() {
                return this._scrollRoot._scrollPosition;
            }
        });

        window.addEventListener('popstate', function() {
            var $route = router.history.current;
            if (!$route.meta || !$route.meta.scrollBehavior) {
                return;
            }

            // restore
            var behavior = $route.meta.scrollBehavior;
            if (behavior === 'restore') {
                var key = getKey($route, options);
                if (debug) {
                    console.log('[scroll] pop ', key, '->', window.scrollY);
                }
                tempPosition[key] = window.scrollY;
            }
        });

        // 注册save，在route退出时保存route的位置
        router.beforeEach(function saveScrollPosition(to, from, next) {
            if (!from.meta || !from.meta.scrollBehavior) {
                next();
                return;
            }

            // restore
            var behavior = from.meta.scrollBehavior;
            if (behavior === 'restore') {
                var key = getKey(from, options);
                if (debug) {
                    console.log('[scroll] before', key, window.scrollY);
                }
                // 不进行处理
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
        });

        // 注册restore
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
                        Vue.nextTick(function() {
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
    getKey: getKey,
};