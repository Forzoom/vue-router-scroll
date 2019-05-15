import { PluginFunction } from 'vue';

declare module '@forzoom/vue-router-scroll' {
    const install: PluginFunction<{router: any, checkParams: boolean}>;
    function getKey(route: any, options: any): string;
}

declare module 'vue/types/vue' {
	interface Vue {
		$scrollPosition: {
			[key: string]: number,
		};
	}
}