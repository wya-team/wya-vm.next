<template>
	<svg 
		class="vm-selection" 
		xmlns="http://www.w3.org/2000/svg"
		:style="[wrapperStyle, zIndexStyle]" 
		@mousedown.left="handleMouseDown"
	>
		<path 
			fill="none" 
			stroke="#5495F6"
			:d="d" 
			stroke-dasharray="5, 2"
			stroke-width="1"
			shape-rendering="crispEdges"
		/>
	</svg>
</template>
<script setup>
import { onMounted, ref, getCurrentInstance, computed } from 'vue';
import { Clipboard } from '@wya/vc';

const emit = defineEmits(['selection']);
const props = defineProps({
	clientW: {
		type: Number,
		default: 0
	},
	clientH: {
		type: Number,
		default: 0
	},
	borderSize: {
		type: Object,
		default: () => ({
			top: 0,
			left: 0
		})
	}
});

const instance = getCurrentInstance();

const startX = ref(0);
const startY = ref(0);
const moveX = ref(0);
const moveY = ref(0);

const offsetX = ref(0);
const offsetY = ref(0);

const dragging = ref(false);

/**
 * 刻度的宽度
 */
const wrapperStyle = computed(() => {
	const { clientW, clientH, borderSize } = props;
	return {
		width: `${clientW}px`,
		height: `${clientH}px`,
		top: `${borderSize.top}px`,
		left: `${borderSize.left}px`,
	};
});
const zIndexStyle = computed(() => {
	return {
		zIndex: dragging.value ? 2 : 1
	};
});
/**
 * https://www.w3school.com.cn/svg/svg_path.asp
 * 它开始于位置 M 坐标，到达位置 L，然后从那里开始到 L，最后在 L 关闭路径。
 */
const d = computed(() => {
	return `M ${startX.value},${startY.value} L ${startX.value},${moveY.value} L ${moveX.value},${moveY.value} L ${moveX.value},${startY.value} z`;
});


const operateDOMEvents = (type) => {
	let fn = type === 'add'
		? document.documentElement.addEventListener
		: document.documentElement.removeEventListener;

	fn('mouseup', handleMouseUp);
	fn('mousemove', handleMouseMove);
};

/**
 * 外部可以模拟实现选区: 如page模块的viewer的空白区域
 * document
 * 	.querySelector('.vm-selection')
 * 	.dispatchEvent(new MouseEvent('mousedown', e));
 *
 * @param {object } e ~
 */
const handleMouseDown = (e) => {
	Clipboard.clearSelection();
	dragging.value = true;
	startX.value = e.clientX - offsetX.value;
	startY.value = e.clientY - offsetY.value;

	moveX.value = startX.value;
	moveY.value = startY.value;

	operateDOMEvents('add');
};

const handleMouseMove = (e) => {
	moveX.value = e.clientX - offsetX.value;
	moveY.value = e.clientY - offsetY.value;
};

const handleMouseUp = () => {
	Clipboard.clearSelection();
	dragging.value = false;
	operateDOMEvents('remove');

	let x = startX.value > moveX.value ? moveX.value : startX.value;
	let y = startY.value > moveY.value ? moveY.value : startY.value;
	let w = Math.abs(startX.value - moveX.value);
	let h = Math.abs(startY.value - moveY.value);
	// 初始位置，宽高
	emit('selection', {
		x,
		y,
		w,
		h
	});
	startX.value = 0;
	startY.value = 0;
	moveX.value = 0;
	moveY.value = 0;
};

onMounted(() => {
	offsetX.value = instance.vnode.el.getBoundingClientRect().x;
	offsetY.value = instance.vnode.el.getBoundingClientRect().y;
});

</script>
<style lang="scss">
@import "../../style/index.scss";

.vm-selection {
	position: absolute;
}
</style>