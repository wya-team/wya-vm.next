<template>
	<div class="vm-thumbnail vm-hack-editor">
		<div style="position: relative;">
			<canvas
				ref="canvas"
				:width="width"
				:height="height"
			/>
			<div
				:style="visibleStyle"
				class="vm-thumbnail__visible"
				@mousedown="handleMouseDown"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, watch, onBeforeMount, onUnmounted, onMounted } from 'vue';
import { Clipboard } from '@wya/vc';
import { debounce } from '../../utils/helper';
import { SELECTION_MODULE, PAGE_MOULE } from '../../utils/constants';

const emit = defineEmits(['scroll']);
const props = defineProps({
	dataSource: {
		type: Array,
		default() {
			return [];
		}
	},

	scale: {
		type: Number,
		default: 1
	},

	frameW: {
		type: Number,
		default: 0
	},

	frameH: {
		type: Number,
		default: 0
	},

	clientW: {
		type: Number,
		default: 0
	},

	clientH: {
		type: Number,
		default: 0
	},

	scrollTop: {
		type: Number,
		default: 0
	},

	scrollLeft: {
		type: Number,
		default: 0
	},
	theme: String,
	borderSize: {
		type: Object,
		default() {
			return {
				top: 0,
				left: 0,
				bottom: 0,
				right: 0
			};
		}
	},
	scrollerSize: {
		type: Number,
		default: 0
	}
});

const width = ref(192);
const height = ref(108);
const canvas = ref();
const isMounted = ref(false);

const shrink = computed(() => {
	const { frameW, frameH, borderSize } = props;
	return Math.max(
		(frameW + borderSize.left + borderSize.right) / width.value,
		(frameH + borderSize.top + borderSize.bottom) / height.value
	);
});
const visibleStyle = computed(() => {
	const { clientW, clientH, scale, scrollLeft, scrollTop } = props;

	let visibleW = Math.min(clientW / shrink.value / scale, width.value);
	let visibleH = Math.min(clientH / shrink.value / scale, height.value);
	let left = scrollLeft / shrink.value / scale;
	let top = scrollTop / shrink.value / scale;

	return {
		width: `${visibleW}px`,
		height: `${visibleH}px`,
		left: `${left + visibleW > width.value ? width.value - visibleW : left}px`,
		top: `${top + visibleH > height.value ? height.value - visibleH : top}px`
	};
});
const maxScrollLeft = computed(() => {
	const { frameW, clientW, borderSize, scale, scrollerSize } = props;
	return frameW * scale - clientW + borderSize.left + borderSize.right + scrollerSize;
});
const maxScrollTop = computed(() => {
	const { frameH, clientH, borderSize, scale, scrollerSize } = props;
	return frameH * scale - clientH + borderSize.top + borderSize.bottom + scrollerSize;
});

onBeforeMount(() => {
	let watchArr = [
		'dataSource',
		'frameW', 
		'frameH', 
		'scale', 
		'clientW', 
		'clientH',
		'theme'
	];
	let hook = debounce(repaint, 50);

	watchArr.forEach(item => watch(() => props[item], hook, { deep: true }));
});

const repaint = () => {
	if (!canvas.value) return;
	let ctx = canvas.value.getContext('2d');

	// 重设高度，清空画布
	canvas.value.height = canvas.value.height; // eslint-disable-line

	ctx.beginPath();
	ctx.translate(40 / shrink.value, 40 / shrink.value);
	ctx.save();
	props.dataSource.forEach(item => {
		if (item.module === PAGE_MOULE || item.module === SELECTION_MODULE) return;

		let { x, y, w, h, r } = item;
		ctx.translate(
			(x + w / 2) / shrink.value,
			(y + h / 2) / shrink.value
		);
		ctx.fillStyle = '#DBDBDB';
		ctx.rotate((r * Math.PI) / 180);
		ctx.fillRect(
			(-w / 2) / shrink.value,
			(-h / 2) / shrink.value,
			w / shrink.value,
			h / shrink.value
		);
		ctx.restore();
		ctx.save();
	});
};

const operateDOMEvents = (type) => {
	let fn = (
		type === 'add' 
			? document.documentElement.addEventListener 
			: document.documentElement.removeEventListener
	).bind(document.documentElement);

	fn('mouseup', handleMouseUp);
	fn('mousemove', handleMouseMove);
};
let lastMouseX;
let lastMouseY;
const handleMouseDown = (e) => {
	Clipboard.clearSelection();
	
	lastMouseX = e.clientX;
	lastMouseY = e.clientY;

	operateDOMEvents('add');
};

const handleMouseMove = (e) => {
	const { scrollLeft, scrollTop, scale } = props;
	let mouseX = e.clientX;
	let mouseY = e.clientY;
	let diffX = mouseX - lastMouseX;
	let diffY = mouseY - lastMouseY;

	lastMouseX = mouseX;
	lastMouseY = mouseY;

	let x = scrollLeft + diffX * shrink.value * scale;
	let y = scrollTop + diffY * shrink.value * scale;

	x > maxScrollLeft.value && (x = maxScrollLeft.value);
	y > maxScrollTop.value && (y = maxScrollTop.value);

	// maxScrollLeft / maxScrollTop 自适应下宽度不够, 计算为零
	x < 0 && (x = 0);
	y < 0 && (y = 0);

	emit('scroll', x, y);
};

const handleMouseUp = () => {
	Clipboard.clearSelection();
	operateDOMEvents('remove');
};

onMounted(() => {
	isMounted.value = true;
	repaint();
});

onUnmounted(() => {
	operateDOMEvents('remove');
});
</script>

<style lang="scss">
@import "../../style/index.scss";

$block: vm-thumbnail;

@include block($block) {
	position: absolute;
	right: 10px;
	bottom: 50px;
	z-index: 2;
	background: $theme-light-bg;
	border: 1px solid $primary;

	@include element(visible) {
		position: absolute;
		z-index: 2;
		cursor: move;
		background: rgba(68, 68, 68, 0.5);
		border: 1px solid #dbdbdb;
	}
}
</style>
