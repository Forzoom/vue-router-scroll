function isUndef(v) {
    return v === null || v === undefined;
}

// 判断是否支持popstate
const supportPopState = 'onpopstate' in window;
const isProduction = process.env.NODE_ENV === 'production';
let tempPosition = {}; // 临时位置存储
const position = {}; // 位置存储

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
 * 删除position
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

export default {
    /**
     * 注册过程
     *
     * @param {} Vue
     * @param {} router 路由对象
     */
    install(Vue, router) {
        if (this.installed) {
            return;
        }
        this.installed = true;

        if (supportPopState) {
            console.log('[scroll-position] support onpopstate, start work');

            window.addEventListener('popstate', function() {
                const name = router.history.current.name;
                if (!isProduction) {
                    console.log('[scroll] pop ', name, '->', window.scrollY);
                }
                tempPosition[name] = window.scrollY;
            });

            // 注册save
            router.beforeEach(function saveScrollPosition(to, from, next) {
                if (!isProduction) {
                    console.log('[scroll] before', from.name, window.scrollY);
                }
                const name = from.name;
                const tempPosition = getTempPosition(name);
                if (isUndef(tempPosition)) {
                    setPosition(from.name, window.scrollY);
                } else {
                    confirmPosition(from.name);
                }
                next();
            });

            // 注册restore
            router.afterEach(function restoreScrollPosition(to, from) {
                // console.log('after');
                if (!isUndef(to.name)) {
                    const position = getPosition(to.name);
                    if (!isUndef(position)) {
                        Vue.nextTick(function() {
                            if (!isProduction) {
                                console.log('[scroll] restore', position);
                            }
                            window.scroll(0, position);
                            removePosition(to.name);
                            clearTempPosition();
                        });
                    }
                }
            });
        } else {
            console.log('[scroll-position] not support onpopstate, stop work');
        }
    },
};