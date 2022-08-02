export { kebabCase, isEqualWith, cloneDeep, throttle, debounce } from 'lodash';
export { $ } from '@wya/utils';

// 判断是否存在
export const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key);

/**
 * getUid
 * 时间戳是有必要的
 */
const now = +(new Date());
let index = 0;
export const getUid = (name) => `vm${name ? `-${name}` : ''}-${now}${++index}`;

/**
 * 判断是否是NaN
 */
/* eslint-disable no-self-compare */
export const valueIsNaN = v => v !== v;

const rect2position = (rect) => ({
	left: rect.x,
	right: rect.x + rect.w,
	top: rect.y,
	bottom: rect.y + rect.h
});

export const allowSelection = (a, b) => {
	const R1 = rect2position(a);
	const R2 = rect2position(b);

	return !(
		(R1.right < R2.left)
		|| (R1.bottom < R2.top)
		|| (R2.right < R1.left)
		|| (R2.bottom < R1.top)
	);
};

export const getValidChanged = (target) => {
	const changed = {};
	for (let key in target) {
		let val = target[key];

		['x', 'y', 'z', 'r', 'w', 'h'].includes(key) && (val = Number(val));

		if (hasOwn(target, key) && !valueIsNaN(val)) {
			changed[key] = val;
		}
	}
};

export const Mixins = (cls, ...list) => {
	cls.prototype.onReady = cls.prototype.onReady ? [cls.prototype.onReady] : [];
	for (let _cl of list) {
		for (let key of Object.getOwnPropertyNames(_cl.prototype)) {
			if (key === 'onReady') {
				cls.prototype[key].push(_cl.prototype[key]);
			} else {
				cls.prototype[key] = _cl.prototype[key];
			}
		}
	}
	return cls;
};