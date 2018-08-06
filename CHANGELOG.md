### Version

#### 0.0.1

1. 基础功能，保证在存在popstate情况下可以使用

#### 0.0.2 0.0.3

1. 优化代码，修复错误，无实质内容更新

#### 0.0.4

1. 添加scrollBehavior进行控制
1. 使用 scrollKey || route.name || route.path 替代 原本只检查 route.name 的情况

#### 0.1.0

1. 使用rollup替代webpack

#### 0.1.1

1. 添加scrollDefaultPosition用于控制默认的显示位置

#### 0.1.2

1. 添加对于params/query的检测

#### 0.1.3

1. 添加部分单元测试

##### Break Change

#### 0.1.2

1. options change from `Vue.use(VueRouteScroll, router)` to `Vue.use(VueRouteScroll, { router, checkParams: true, checkQuery: true, })`;