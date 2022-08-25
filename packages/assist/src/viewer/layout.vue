<template>
	<div class="vm-viewer-layout" :style="wrapperStyle">
		<div :style="contentStyle">
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
	wrapper: {
		type: [String, Array, Object],
		default: ''
	},
	content: {
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

const wrapperStyle = computed(() => {
	if (props.wrapper) return props.wrapper;
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

const contentStyle = computed(() => {
	if (props.content) return props.content;
	let { backgroundColor, backgroundImage, backgroundSize, borderRadius } = selfAttrs.value;
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
	
	return {
		background: `${backgroundColor}`,
		backgroundImage: backgroundImage 
			? `url(${backgroundImage})`
			: undefined,
		backgroundSize,
		borderRadius: !currentInner.value ? `${borderRadius}px` : undefined,
		overflow: 'hidden'
	};
});
</script>
