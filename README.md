### Installation

npm install @forzoom/vue-router-scroll

### Usage

```javascript
	// index.js
	import router from './router/index.js';
	import VueRouterScroll from 'vue-router-scroll';

	Vue.use(VueRouterScroll, router);

	// router/index.js
	[
		{
			path: '/path/to/example',
			meta: {
				scrollBehavior: 'top', // top | restore
			},
			name: 'test',
			component: Component,
		},
	],
```

### Properties

1. scrollBehavior 进入页面时，控制显示的位置。允许的值包括`top`或者`restore`
	1. top: 每次都回到顶部
	1. restore: 回到上一次离开的位置

1. scrollDefaultPosition scrollBehavior = 'restore'时生效。进入页面时，如果没有可以用于展示的位置，可以使用该位置。

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