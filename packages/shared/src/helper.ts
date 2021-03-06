import { DEBUG } from './constants';

/**
 * 是否符合条件
 * 
 * @param {object} el ~
 * @param {object} exceptions ~
 * 	{
 * 		id, 
 * 		tagName, 
 * 		className, 
 * 		...HTMLElement
 * 	}
 * @returns {boolean} ~
 */
export const eleInRegExp = (el, exceptions) => {
	for (let i in exceptions) {
		if (exceptions[i].test(el[i])) {
			return true;
		}
	}
	return false;
};

/**
 * 判断浏览器是否支持passive, 默认preventDefault无效
 */
export const isPassiveSupported = (() => {
	let status = false;
	try {
		let opts = Object.defineProperty({}, "passive", {
			get() {
				status = true;
				return;
			}
		});
		// @ts-ignore
		window.addEventListener('test', null, opts);
	} catch (err) {
		console.log(err);
	}
	return status;
})();

export const Logger = {
	...console,
	debug: (...rest) => {
		DEBUG && console.log(`%c [@wya/vm]`, 'color: red; font-weight: bold', ...rest);
	}
};