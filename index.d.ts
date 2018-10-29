import { PluginFunction } from 'vue';

declare module '@forzoom/vue-router-scroll' {
    const install: PluginFunction<{router: any, checkParams: boolean}>
}