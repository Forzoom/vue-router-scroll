### Installation

npm install @forzoom/vue-router-scroll

### Usage

```javascript
	// index.js
	import router from './router/index.js';
	import VueRouterScroll from 'vue-router-scroll';

	Vue.use(VueRouterScroll, {
		router,
	});

	// router/index.js
	[
		{
			path: '/path/to/example',
			meta: {
				scrollBehavior: 'restore', // top | restore
				scrollDefaultPosition: '100', // window.scrollY = 100 by default
			},
			name: 'test',
			component: Component,
		},
	],
```

### Options

options

### router

VueRouter

Vue router instance

### checkParams

Boolean: true by default

whether check param as part of key or not

```javascript
	e.g.

	var route = {
		path: '/a/b/c',
	}

	Vue.use(VueRouteScroll, {
		router,
		checkParams: false,
	});
```

### checkQuery

Boolean: true by default

options in meta

#### scrollBehavior

进入页面时，控制显示的位置。允许的值包括`top`或者`restore`

|value|description|
|---|---|
|top|每次都回到顶部|
|restore|回到上一次离开的位置|

#### scrollDefaultPosition

scrollBehavior = 'restore'时生效。进入页面时，如果没有可以用于展示的位置，将会使用该位置展示页面。
例如设置为0的情况下，进入页面将默认显示页面顶部。