function isUndef(v) {
    return v === null || v === undefined;
}

// 判断是否支持popstate
var supportPopState = 'onpopstate' in window;
var isProduction = process.env.NODE_ENV === 'production';
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
 */
function getKey(route, options) {
    var key = route.meta.scrollKey || route.name;
    if (key) {
        const paramKeys = Object.keys(route.params);
        if (options.checkParams && paramKeys.length > 0) {
            key += ('/' + objectValues(route.params).join('/'));
        }
    } else {
        key = route.path;
    }
    
    const queryKeys = Object.keys(route.query);
    if (options.checkQuery && queryKeys.length > 0) {
        key += ('?' + encode(route.query));
    }

    return key;
}

function objectAssign(to, from) {
    var keys = Object.keys(from);
    for (var i = 0, len = keys.length; i < len; i++) {
        var key = keys[i];
        to[key] = from[key];
    }
}

function objectValues(obj) {
    var keys = Object.keys(obj);
    var values = [];
    for (var i = 0, len = keys.length; i < len; i++) {
        var key = keys[i];
        values[i] = obj[key];
    }
    return values;
}

function encode(obj) {
    var keys = Object.keys(obj);
    var result = '';
    for (var i = 0, len = keys.length; i < len; i++) {
        var key = keys[i];
        result += key + '=' + obj[key];
    }
    return result;
}

var index = {
    /**
     * 注册过程
     *
     * @param {} Vue
     * @param {} options
     *  - router 路由对象
     */
    install: function(Vue, options) {
        if (this.installed) {
            return;
        }
        this.installed = true;

        objectAssign(options, {
            checkParams: true,
            checkQuery: true,
        });
        var router = options.router;

        if (supportPopState) {
            console.log('[scroll-position] support onpopstate, start work');

            window.addEventListener('popstate', function() {
                var $route = router.history.current;
                if (!$route.meta || !$route.meta.scrollBehavior) {
                    return;
                }

                // restore
                var behavior = $route.meta.scrollBehavior;
                if (behavior === 'restore') {
                    var key = getKey($route, options);
                    if (!isProduction) {
                        console.log('[scroll] pop ', key, '->', window.scrollY);
                    }
                    tempPosition[key] = window.scrollY;
                }
            });

            // 注册save
            router.beforeEach(function saveScrollPosition(to, from, next) {
                if (!from.meta || !from.meta.scrollBehavior) {
                    next();
                    return;
                }

                // restore
                var behavior = from.meta.scrollBehavior;
                if (behavior === 'restore') {
                    var key = getKey(from, options);
                    if (!isProduction) {
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
                                if (!isProduction) {
                                    console.log('[scroll] restore', position);
                                }
                                window.scroll(0, position);
                                removePosition(key);
                                clearTempPosition();
                            });
                        }
                    }
                } else if (behavior === 'top') {
                    window.scroll(0, 0);
                }
            });
        } else {
            console.log('[scroll-position] not support onpopstate, stop work');
        }
    },
};

export default index;
