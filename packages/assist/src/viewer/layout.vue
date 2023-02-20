<template>
	<div class="vm-viewer-layout" :style="wrapperStyle$">
		<div :style="contentStyle$">
			<slot />
		</div>
	</div>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue';
import { useAttrs } from '../hooks/use-attrs';

const instance = getCurrentInstance();

const selfAttrs = useAttrs();
const parentAttrs = useAttrs(instance.parent);

const props = defineProps({
	inner: {
		type: [Boolean, Number],
		default: false
	},
	wrapperStyle: {
		type: [String, Array, Object],
		default: ''
	},
	contentStyle: {
		type: [String, Array, Object],
		default: ''
	}
});

const currentInner = computed(() => {
	const { inner: $$inner } = parentAttrs.value;
	const { inner: $inner } = selfAttrs.value;
	const { inner } = props;

	return $$inner || $inner || inner;
});

const wrapperStyle$ = computed(() => {
	if (props.wrapperStyle) return props.wrapperStyle;
	let { backgroundColor, paddingVertical, paddingHorizontal, borderRadius } = selfAttrs.value;
	let { 
		backgroundColor: $backgroundColor, 
		paddingVertical: $paddingVertical, 
		paddingHorizontal: $paddingHorizontal, 
		borderRadius: $borderRadius, 
	} = parentAttrs.value || {};
	
	backgroundColor = backgroundColor || $backgroundColor || 'transparent';
	paddingVertical = paddingVertical || $paddingVertical || 0;
	paddingHorizontal = paddingHorizontal || $paddingHorizontal || 0;
	borderRadius = borderRadius || $borderRadius || 0;
	
	return {
		padding: `${paddingVertical}px ${paddingHorizontal}px`,
		background: currentInner.value ? `${backgroundColor}` : 'transparent',
		borderRadius: currentInner.value ? `${borderRadius}px` : 'inherit',
	};
});

const contentStyle$ = computed(() => {
	if (props.contentStyle) return props.contentStyle;
	let { backgroundType, backgroundColor, backgroundImage, backgroundSize, borderRadius } = selfAttrs.value;
	let { 
		backgroundColor: $backgroundColor, 
		backgroundImage: $backgroundImage, 
		backgroundSize: $backgroundSize, 
		borderRadius: $borderRadius, 
	} = parentAttrs.value || {};
	
	backgroundColor = backgroundColor || $backgroundColor || 'transparent';
	backgroundImage = (Array.isArray(backgroundImage) ? backgroundImage[0] : backgroundImage) 
		|| (Array.isArray($backgroundImage) ? $backgroundImage[0] : backgroundImage) 
		|| '';
	backgroundSize = backgroundSize || $backgroundSize || 'cover';
	borderRadius = borderRadius || $borderRadius || 0;
	
	// 注意，如果有值，1表示纯色背景
	const allowBackgroundImage = (typeof backgroundType === 'undefined' || backgroundType !== 1) 
		&& backgroundImage;
	return {
		background: `${backgroundColor}`,
		backgroundImage: allowBackgroundImage 
			? `url(${backgroundImage})`
			: undefined,
		backgroundSize,
		borderRadius: !currentInner.value ? `${borderRadius}px` : undefined,
		overflow: 'hidden'
	};
});
</script>
