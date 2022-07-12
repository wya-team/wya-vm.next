<template>
	<div :class="{ 'is-hide-border': !showRuler }" class="vm-frame-draggable--inner">
		<Ruler
			v-if="showRuler"
			ref="ruler"
			:scroll-left="scrollLeft"
			:scroll-top="scrollTop"
			:frame-w="frameW"
			:frame-h="frameH"
			:client-w="clientW"
			:client-h="clientH"
			:scale="scale"
			:guides="guides"
			:theme="theme"
			:border-size="borderSize"
			:scroller-size="scrollerSize"
			:style="{ height: `calc(100% - ${zoomBarH}px)` }"
			@guides-change="e => $emit('update:guides', e)"
		>
			<slot name="content" />
		</Ruler>
		<slot v-else name="content" />
		<slot name="content-extra" />
		<slot name="footer" />
	</div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, getCurrentInstance } from 'vue';
import { Utils } from '@wya/vc';
import Ruler from './ruler.vue';
import { throttle } from '../../utils/helper';

const { Resize } = Utils;
const emit = defineEmits(['update:guides', 'client-resize']);

const props = defineProps({
	showRuler: Boolean,
	showZoomBar: Boolean,
	zoomBarH: Number,
	scrollerSize: Number,
	scrollTop: Number,
	scrollLeft: Number,
	frameW: Number,
	frameH: Number,
	clientW: Number,
	clientH: Number,
	scale: Number,
	guides: Array,
	theme: String,
	borderSize: Object,
});

const ruler = ref();
const instance = getCurrentInstance();

const handleResize = throttle(function () {
	if (!instance.vnode.el) return;

	let offset = +(ruler.value && (ruler.value.guideSize));

	/**
	 * TDOO: 判断是否有滚动条
	 * offsetWidth包含滚动条
	 * clientWidth不包含滚动条;
	 * offsetWidth === clientWidth 时不含滚动条，不需要减去scrollerSize（合理些，未测试）
	 */
	let w = instance.vnode.el.offsetWidth - offset - props.scrollerSize;
	let h = instance.vnode.el.offsetHeight - offset - props.zoomBarH - props.scrollerSize;

	if (!w || !h) return;

	// 获得除rule内，zoom-bar上的控制操作空间
	emit(
		'client-resize', 
		w, 
		h,
	);
}, 50);

onMounted(() => {
	Resize.on(instance.vnode.el, handleResize);
});

onUnmounted(() => {
	Resize.off(instance.vnode.el, handleResize);
});

</script>

<style lang="scss">
@import "../../style/index.scss";

$block: vm-frame-draggable--inner;

@include block($block) {
	position: relative;
	display: flex;
	overflow: hidden;
	background: $theme-light-frame-bg;
	border-left: 1px solid #bdbdbd;
	flex: 1;
	flex-direction: column;

	@include when(hide-border) {
		border-right: none;
		border-left: none;
	}
}
</style>