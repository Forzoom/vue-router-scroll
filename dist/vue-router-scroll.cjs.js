'use strict';

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

var index = {
    /**
     * 注册过程
     *
     * @param {} Vue
     * @param {} router 路由对象
     */
    install: function(Vue, router) {
        if (this.installed) {
            return;
        }
        this.installed = true;

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
                    var key = $route.meta.scrollKey || $route.name || $route.path;
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
                    var key = from.meta.scrollKey || from.name || from.path;
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
                    var key = to.meta.scrollKey || to.name || to.path;
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

module.exports = index;
