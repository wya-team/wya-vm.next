import { inject, computed, getCurrentInstance, useAttrs } from 'vue';

// 同类型模块的索引值
export const useReuildIndex = (opts) => {
	const { prefix = 'q-' } = opts;
	const regex = new RegExp(`^${prefix}`);

	const { getData } = inject('@wya/vm');
	const { props } = getCurrentInstance();
	const attrs = useAttrs();

	const index = computed(() => {
		return typeof props.index !== 'undefined' ? props.index : attrs.index;
	});
	const v = computed(() => {
		const data = getData();
		if (typeof props.index === 'undefined') return '';
		return Array.from({ length: index }).reduce((pre, cur, $index) => {
			if (!regex.test(data[$index].module)) {
				pre--;
			}
			return pre;
		}, props.index) + 1;
	});

	return v;
};