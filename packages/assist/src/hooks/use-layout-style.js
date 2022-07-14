import { computed, getCurrentInstance, useAttrs } from 'vue';

// 同类型模块的索引值
export const useLayoutStyle = () => {
	const { props } = getCurrentInstance();
	const attrs = useAttrs();

	const states = computed(() => {
		return [
			'inner',
			'paddingVertical',
			'paddingHorizontal',
			'borderRadius',
			'backgroundType',
			'backgroundColor',
			'backgroundImage',
			'backgroundSize'
		].reduce((pre, key) => {
			pre[key] = typeof props[key] !== 'undefined' ? props[key] : attrs[key];
			return pre;
		}, {});
	});
	const v = computed(() => {
		const $props = states.value;
		return {
			wrapper: {
				padding: `${$props.paddingVertical}px ${$props.paddingHorizontal}px`,
				background: $props.inner ? `${$props.backgroundColor}` : 'transparent',
			},
			content: {
				background: `${$props.backgroundColor}`,
				backgroundImage: $props.backgroundImage && $props.backgroundImage[0] 
					? `url(${$props.backgroundImage[0]})`
					: undefined,
				backgroundSize: $props.backgroundSize,
				borderRadius: `${$props.borderRadius}px`,
				overflow: 'hidden'
			}
		};
	});

	return v;
};