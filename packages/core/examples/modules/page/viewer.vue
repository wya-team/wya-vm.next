<template>
	<div 
		:style="[{ height: `100%`, width: `100%` }]"
		class="vm-basic-page-viewer"
		@mousedown.left="handleSelectionMouseDown"
	>
		<div 
			class="vm-basic-page-viewer__bottom" 
			@mousedown.left.stop="handleMouseDown(arguments[0], 'bottom')" 
		/>
		<div 
			class="vm-basic-page-viewer__right" 
			@mousedown.left.stop="handleMouseDown(arguments[0], 'right')" 
		/>

		<div 
			class="vm-basic-page-viewer__bottom-right" 
			@mousedown.left.stop="handleMouseDown(arguments[0], 'bottom-right')" 
		/>		
	</div>
</template>

<script setup>
const emit = defineEmits(['change']);
const props = defineProps({
	vm: {
		type: Object,
		default: () => ({})
	},
	id: String,
	x: Number,
	y: Number,
	z: Number,
	w: Number,
	h: Number,
	r: Number,
	scale: Number,
	name: [Number, String],
});
const operateDOMEvents = (type) => {
	let fn = type === 'add'
		? document.documentElement.addEventListener
		: document.documentElement.removeEventListener;

	fn('mouseup', handleMouseUp);
	fn('mousemove', handleMouseMove);
};

let startH;
let startW;
let startX;
let startY;
let handle;
let hasRecord;

const handleMouseDown = (e, $handle) => {
	startH = props.h;
	startW = props.w;

	startX = e.clientX;
	startY = e.clientY;

	handle = $handle;
	operateDOMEvents('add');

	hasRecord = false;
};

const handleMouseMove = (e) => {
	if (!hasRecord) {
		// 用于撤回操作
		emit('change', {
			w: props.w, 
			h: props.h, 
			history: true
		});
		hasRecord = true;
	}
	let x = (e.clientX - startX) / props.scale;
	let y = (e.clientY - startY) / props.scale;
	let el = document.querySelector('.vm-frame-draggable__wrapper');

	// TODO: 滚动
	if (handle.includes('bottom')) {
		emit('change', { h: startH + y, history: false });
		el.scrollTop = el.scrollHeight - el.clientHeight;
	}

	if (handle.includes('right')) {
		emit('change', { w: startW + x, history: false });
		el.scrollLeft = el.scrollWidth - el.clientWidth;
	}
};

const handleMouseUp = () => {
	// 用于撤回操作
	operateDOMEvents('remove');
};


const handleSelectionMouseDown = (e) => {
	e.stopPropagation(); // 阻止page被设置为activited

	const el = document.querySelector('.vm-selection');
	el && el.dispatchEvent(new MouseEvent('mousedown', e));
};

</script>

<style lang="scss">
$size: 4px;

.vm-basic-page-viewer {
	position: relative;

	&__bottom {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		cursor: ns-resize;
		border-bottom: $size solid transparent;
	}

	&__right {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		cursor: ew-resize;
		border-right: $size solid transparent;
	}

	&__bottom-right {
		position: absolute;
		right: 0;
		bottom: 0;
		width: $size * 4;
		height: $size * 4;
		cursor: nwse-resize;
	}
}
</style>
