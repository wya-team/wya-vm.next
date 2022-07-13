const os = require('os');
const fs = require('fs-extra');
const { resolve } = require('path');

exports.host = (() => {
	const ips = [];
	const ntwk = os.networkInterfaces();
	for (const k in ntwk) {
		for (let i = 0; i < ntwk[k].length; i++) {
			const _add = ntwk[k][i].address;
			if (_add && _add.split('.').length == 4 && !ntwk[k][i].internal && ntwk[k][i].family == 'IPv4') {
				ips.push(ntwk[k][i].address);
			}
		}
	}
	return ips[0] || 'localhost';
})();

const nms = [
	resolve(__dirname, '../node_modules'),
	resolve(process.cwd(), './node_modules')
	// ...module.paths
];

exports.resolvePackage = (source, options) => {
	let $path = nms.find(i => fs.pathExistsSync(resolve(i, source)));

	if (!$path) {
		throw new Error(`@wya/vue-scaffold: 未找到${source}`);
	}

	let fullPath = resolve($path, source);

	return options.read ? fs.readFileSync(fullPath) : fullPath;
};