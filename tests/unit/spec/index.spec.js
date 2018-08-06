Vue.use(VueRouter);

describe('#vue-router-scroll', function() {
	it('#basic', function() {
		var redirect = true;

		var router = new VueRouter({
			routes: [
				{
					path: '/test1',
					meta: {
						title: '测试1',
						scrollBehavior: 'restore',
					},
					component: {
						template: '<div id="test1" style="height: 2000px"></div>',
						mounted: function() {
							if (!redirect) {
								console.log('target1', window.scrollY);
								expect(window.scrollY).to.equal(200);
								return;
							}
							window.scroll(0, 200);
							redirect = false;
							this.$router.push('/test2');
						},
					},
				},
				{
					path: '/test2',
					component: {
						template: '<div id="test2" style="height: 2000px"></div>',
						mounted: function() {
							this.$router.push('/test1');
						},
					},
				}
			],
		});
		Vue.use(VueRouterScroll, {
			router: router,
		});

		var rootElement = document.createElement('div');
		rootElement.id = "app";
		document.body.appendChild(rootElement);

		var app = new Vue({
			el: '#app',
			router: router,
			template: '<div id="app"><router-view></router-view></div>',
		});

		router.push('/test1');
	});
});