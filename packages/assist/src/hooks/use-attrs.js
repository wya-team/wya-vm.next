import {
	getCurrentInstance,
	reactive,
	shallowRef,
	watchEffect
} from 'vue';

// 让attrs变为响应式, 且可修改
// 解决使用v-model会提示它是个readonly, 不使用v-model就可不用此方式， 因为修改数值始终通过change事件 -->
export const useAttrs = (instance, returnType) => {
	instance = instance || getCurrentInstance();
	const attrs = returnType != 'reactive' ? shallowRef({}) : reactive({});
	instance.attrs = reactive(instance.attrs);

	watchEffect(() => {
		const res = Object.entries(instance.attrs)
			.reduce((pre, [key, val]) => {
				pre[key] = val;
				return pre;
			}, {});

		// 这里不用reactive, 确保值返回永远是最后一个完整的attrs，如果attrs里删了属性，用reactive需要额外处理
		if (returnType != 'reactive') {
			attrs.value = res;
		} else {
			Object.assign(attrs, res);
		}
	});

	// 注意这是一个ref
	return attrs;
};
