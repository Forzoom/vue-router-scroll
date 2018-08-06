const replace = require('rollup-plugin-replace');

module.exports = exports = [
    {
        input: './src/index.js',
        output: {
            file: './dist/vue-router-scroll.esm.js',
            format: 'es',
        },
        plugins: [
            replace({
                'process.env.NODE_ENV': JSON.stringify('production'),
            }),
        ],
    },
    {
        input: './src/index.js',
        output: {
            file: './dist/vue-router-scroll.cjs.js',
            format: 'cjs',
        },
        plugins: [
            replace({
                'process.env.NODE_ENV': JSON.stringify('production'),
            }),
        ],
    },
    {
        input: './src/index.js',
        output: {
            file: './dist/vue-router-scroll.js',
            format: 'umd',
            name: 'VueRouterScroll',
        },
        plugins: [
            replace({
                'process.env.NODE_ENV': JSON.stringify('production'),
            }),
        ],
    },
];