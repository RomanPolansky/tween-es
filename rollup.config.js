import dts from 'rollup-plugin-dts'

export default [
	{
		input: '.tmp/Index.js',
		context: 'this',
		watch: { clearScreen: false },
		output: [
			{
				file: 'dist/tween-es.umd.js',
				name: 'TWEEN',
				format: 'umd',
				exports: 'named',
			},
			{
				file: 'dist/tween-es.amd.js',
				format: 'amd',
				exports: 'named',
			},
			{
				file: 'dist/tween-es.cjs.js',
				format: 'cjs',
				exports: 'named',
			},
			{
				file: 'dist/tween-es.esm.js',
				format: 'es',
				exports: 'named',
			},
		],
	},
	{
		input: './.tmp/Index.d.ts',
		watch: { clearScreen: false },
		output: [{ file: 'dist/tween-es.d.ts', format: 'es' }],
		plugins: [dts()],
	},
]
