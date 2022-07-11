<template>
	<div
		:style="coord"
		:class="!draggable ? 'vm-draggable-disabled' : ''"
		class="vm-draggable"
		@mousedown="handleContainerDown"
		@touchstart.stop="handleContainerDown"
	>
		<div :style="style" :class="{ 'is-events-none': isChanging }">
			<slot :style="style" />
		</div>
		<!-- handle -->
		<div
			v-if="(active || isActive) && (closeable || realHandles.length > 0)"
			:class="{ 'is-disabled': disabled, 'is-active': (active || isActive) }"
			:style="style"
			class="vm-draggable__handles"
		>
			<!-- 此处使用stop，阻止冒泡，如果active为true, 设置激活状态通过模拟方式 -->
			<template v-for="item in realHandles">
				<div
					v-if="!disabled"
					:key="item"
					:class="`is-${item}`"
					class="vm-draggable__handle"
					@mousedown.left.stop="handleDown($event, item)"
					@touchstart.stop="handleDown($event, item)"
				/>
			</template>
			<div v-if="rotatable && isRotating" :style="{ width }" class="vm-draggable__rotate" />
			<!-- delete -->
			<p v-if="closeable" class="vm-draggable__delete" @click="$emit('delete')">
				✕
			</p>
		</div>

		<!-- 位置不会改变的 -->
		<!-- grid for rotate -->
		<template v-if="isRotating">
			<div :style="{ width }" class="vm-draggable__rotate--deg is-0" />
			<div :style="{ width }" class="vm-draggable__rotate--deg is-45" />
			<div :style="{ width }" class="vm-draggable__rotate--deg is-90" />
			<div :style="{ width }" class="vm-draggable__rotate--deg is-135" />
			<div class="vm-draggable__rotate--tip">
				{{ r }} °
			</div>
		</template>
	</div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, getCurrentInstance } from 'vue';
import { usePressShiftStatus } from './shared-hooks.ts';
import { isPassiveSupported, eleInRegExp } from './utils.ts';

const emit = defineEmits([
	'delete',
	'resizing',
	'activated',
	'deactivated',
	'resizing',
	'rotating',
	'dragging',
	'rotate-end',
	'resize-end',
	'drag-end',
	'end',

	'update:x',
	'update:y',
	'update:z',
	'update:w',
	'update:r'
]);

const props = defineProps({
	handles: {
		type: Array,
		default: () => (['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-right', 'bottom-left', 'rotate'])
	},
	// 宽度
	w: {
		type: Number,
		default: 0,
		validator: val => val >= 0
	},
	// 高度
	h: {
		type: Number,
		default: 0,
		validator: val => val >= 0
	},
	// 选择角度
	r: {
		type: Number,
		default: 0
	},
	// 最小宽度
	minW: {
		type: Number,
		default: 36,
		validator: val => val > 0
	},
	// 最小高度
	minH: {
		type: Number,
		default: 36,
		validator: val => val > 0
	},
	// 距父元素左上角X轴偏移量
	x: {
		type: Number,
		default: 0
	},
	// 距父元素左上角Y轴偏移量
	y: {
		type: Number,
		default: 0
	},
	// zIndex
	z: {
		type: Number,
		default: 1
	},
	scale: {
		type: Number,
		default: 1
	},
	grid: {
		type: Array,
		default: () => {
			return [1, 1];
		}
	},

	guides: {
		type: Array,
		default() {
			return [[], []];
		}
	},

	// 约束组件大小
	restrain: {
		type: Number,
		default: 0
	},
	parent: {
		type: Boolean,
		default: false
	},

	// 在入口文件下，才会去判断editorRegExp，如弹层不会判断让其失去激活状态（除非配置）
	entryRegExp: {
		type: Object,
		default: () => ({
			className: /vm-hack-entry/,
			id: /^(app|pages)$/
		})
	},

	editorRegExp: {
		type: Object,
		default: () => ({
			className: /vm-hack-editor/
		})
	},

	/**
	 * 是否屏蔽默认事件
	 */
	prevent: {
		type: Boolean,
		default: true
	},
	preventRegExp: {
		type: Object,
		default: () => ({
			tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|OPTION)$/,
			className: /vm-hack-pevent/,
		})
	},

	module: {
		type: String,
	},

	disabled: {
		type: Boolean,
		default: false
	},

	closeable: {
		type: Boolean,
		default: false
	},

	draggable: {
		type: Boolean,
		default: true
	},

	resizable: {
		type: Boolean,
		default: true
	},

	rotatable: {
		type: Boolean,
		default: true
	},

	// 激活状态， 特殊需求
	active: {
		type: Boolean,
		default: false
	},

	offset: {
		type: Array,
		default() {
			return [0, 0];
		}
	}
});

const IS_SERVER = typeof window === 'undefined';
const doc = !IS_SERVER && document.documentElement;
const angleArr = [0, 45, 90, 135, 180, 225, 270, 315, 360];

const draggableEvents = {
	start: ['touchstart', 'mousedown'],
	move: ['touchmove', 'mousemove'],
	end: ['touchend', 'touchcancel', 'mouseup']
};

let isPressShift = usePressShiftStatus();

let parentX = 0;
let parentY = 0;
let parentW = 9999;
let parentH = 9999;
let mouseX = 0;
let mouseY = 0;
let lastMouseX = 0;
let lastMouseY = 0;

let handle = null;

// 组件捕获阶段执行
let eventOpts = !isPassiveSupported || { capture: true, passive: true };

// 改变前状态
let beforeStatus = null;

const instance = getCurrentInstance();
const isResizing = ref(false);
const isDraging = ref(false);
const isRotating = ref(false);
const isChanging = ref(false);
const isActive = ref(false);
const coord = computed(() => {
	return {
		left: props.x + 'px',
		top: props.y + 'px',
		zIndex: props.z
	};
});
const style = computed(() => {
	const w = props.w === 0 ? 'auto' : `${props.w}px`;
	const h = props.h === 0 ? 'auto' : `${props.h}px`;
	return {
		width: w,
		height: h,
		transform: `rotate(${props.r}deg)`
	};
});
const width = computed(() => {
	let num = Math.floor(
		Math.sqrt(props.w * props.w + props.h * props.h) * 1.15
	);
	return `${num}px`;
});
const realHandles = computed(() => {
	let handles = props.handles;

	if (!props.rotatable) {
		handles = handles.filter(i => i !== 'rotate');
	}

	if (!props.resizable) {
		handles = handles.filter(i => i === 'rotate');
	}

	return handles;
});

const sync = (opts) => {
	for (let key in opts) {
		if (props[key] != opts[key]) {
			!beforeStatus && (beforeStatus = {
				x: props.x,
				y: props.y,
				z: props.z,
				w: props.w,
				r: props.r
			});
			emit(`update:${key}`, opts[key]);
		}
	}
};

const calculation = () => {
	const { width: $width, height: $height } = instance.vnode.el.parentNode.getBoundingClientRect();
	if (!$width || !$height) {
		throw new Error('@wya/vm: 父层容器宽度计算异常');
	}

	// 原始高度
	parentW = $width / props.scale;
	parentH = $height / props.scale; // this.$el.parentNode.clientHeight

	if (props.w > parentW) {
		sync({ w: parentW });
	}
	if (props.h > parentH) {
		sync({ h: parentH });
	}
	if ((props.x + props.w) > parentW) {
		sync({ x: parentW - props.w });
	}
	if ((props.y + props.h) > parentH) {
		sync({ y: parentH - props.h });
	}
};

const operateDOMEvents = (type) => {
	let fn = type === 'add' ? doc.addEventListener : doc.removeEventListener;

	// 使用原生绑定 不区分移动端还是桌面端
	draggableEvents.start.forEach(eventName => {
		fn(eventName, handleDeselect, eventOpts);
	});
	draggableEvents.move.forEach(eventName => {
		fn(eventName, handleMove, eventOpts);
	});
	draggableEvents.end.forEach(eventName => {
		fn(eventName, handleUp, eventOpts);
	});
};

const getAngle = (center, last) => {
	let diffX = last[0] - center[0];
	let diffY = last[1] - center[1];
	/**
	 * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
	 * -180 <= c < 180
	 */
	let c = (360 * Math.atan2(diffY, diffX)) / (2 * Math.PI);
	c = c > 90
		? (450 - c) // 第4
		: 90 - c; // 第1，2，3象限
	return Math.floor(c);
};

const getRestrain = (num) => {
	const restrain = props.restrain;
	return (num / restrain).toFixed(0) * restrain;
};

const getPositionByEvent = (e) => {
	const mousePositionX = e.targetTouches
		? e.targetTouches[0].pageX
		: e.clientX;
	const mousePositionY = e.targetTouches
		? e.targetTouches[0].pageY
		: e.clientY;
	return {
		mousePositionX: mousePositionX || 0,
		mousePositionY: mousePositionY || 0
	};
};


/**
 * 组件被按下事件
 * 
 * @param {object} e ~
 */
const handleContainerDown = (e = {}) => {
	props.prevent
		&& e.preventDefault
		&& !eleInRegExp(e.target, props.preventRegExp)
		&& e.preventDefault();

	// 判断是否支持拖动
	if (props.disabled) return;
	const target = e.target || e.srcElement;
	// 确保事件发生在组件内部
	if (!target || instance.vnode.el.contains(target)) {
		if (!isActive.value) {
			const { mousePositionX, mousePositionY } = getPositionByEvent(e);

			lastMouseX = mousePositionX + doc.scrollLeft;
			lastMouseY = mousePositionY + doc.scrollTop;

			// 绑定事件
			operateDOMEvents('add');

			isActive.value = true;
			emit('activated', e);
		}
		props.draggable && (isDraging.value = true);
	}
};

// 取消选择事件
const handleDeselect = (e) => {
	const { mousePositionX, mousePositionY } = getPositionByEvent(e);

	mouseX = mousePositionX + doc.scrollLeft;
	mouseY = mousePositionY + doc.scrollTop;
	lastMouseX = mouseX;
	lastMouseY = mouseY;
	const target = e.target || e.srcElement; // body不要带上class, 否则会存在问题

	// 内部管理
	const regex = {
		className: /is-(top|right|bottom|left)(-(top|right|bottom|left)$|$)/
	};

	let path = e.path || (e.composedPath && e.composedPath()) || [];

	// 是否是入口下的元素，如果不是，就意味着可能是弹层（避免销毁）
	let isInline = path.some(item => eleInRegExp(item, props.entryRegExp));

	if (
		isInline
		&& !instance.vnode.el.contains(target)
		&& !eleInRegExp(target, regex)
		&& (!path.some(item => eleInRegExp(item, props.editorRegExp)))
	) {
		if (isActive.value) {
			// 解绑
			operateDOMEvents('remove');

			isActive.value = false;
			emit('deactivated', e);
		}
	}
};

// 拖动点按下事件
const handleDown = (e, $handle) => {
	props.prevent
		&& e.preventDefault
		&& !eleInRegExp(e.target, props.preventRegExp)
		&& e.preventDefault();

	// 将handle设置为当前元素
	handle = $handle;
	if ($handle === 'rotate') {
		props.rotatable && (isRotating.value = true);
	} else {
		props.resizable && (isResizing.value = true);
	}
};

const handleMove = (e) => {
	const { mousePositionX, mousePositionY } = getPositionByEvent(e);
	mouseX = mousePositionX + doc.scrollLeft;
	mouseY = mousePositionY + doc.scrollTop;

	// x, y, w, h
	let elmX = parseInt(props.x, 10);
	let elmY = parseInt(props.y, 10);
	let elmW = parseInt(props.w, 10);
	let elmH = parseInt(props.h, 10);

	// 鼠标所在的轴xy坐标值
	let axisX = Math.round((mouseX - parentX + props.offset[0]) / props.scale);
	let axisY = Math.round((mouseY - parentY + props.offset[1]) / props.scale);
	let diffX = axisX - Math.round((lastMouseX - parentX + props.offset[0]) / props.scale);
	let diffY = axisY - Math.round((lastMouseY - parentY + props.offset[1]) / props.scale);
	lastMouseX = mouseX;
	lastMouseY = mouseY;
	if (isResizing.value) {
		if (handle.includes('top')) {
			if (elmY - axisY + elmH < props.minH) {
				axisY = elmY + elmH - props.minH;
			} else if (props.parent && axisY < 0) {
				axisY = 0;
			}
			elmH = elmY + elmH - axisY;
			elmY = axisY;
		}
		if (handle.includes('bottom')) {
			if (axisY - elmY < props.minH) {
				axisY = elmY + props.minH;
			} else if (props.parent && axisY > props.parentH) {
				axisY = Math.round(props.parentH);
			}
			elmH = axisY - elmY;
		}
		if (handle.includes('left')) {
			if (elmX - axisX + elmW < props.minW) {
				axisX = elmX + elmW - props.minW;
			} else if (props.parent && axisX < 0) {
				axisX = 0;
			}
			elmW = elmX + elmW - axisX;
			elmX = axisX;
		}
		if (handle.includes('right')) {
			if (axisX - elmX < props.minW) {
				axisX = elmX + props.minW;
			} else if (props.parent && axisX > props.parentW) {
				axisX = Math.round(props.parentW);
			}
			elmW = axisX - elmX;
		}
		// 控制一个方向
		if (isPressShift.value) { 
			elmH = (elmW / props.w) * props.h;
		}
		!props.disabled && sync({
			x: (Math.round(elmX / props.grid[0]) * props.grid[0]),
			y: (Math.round(elmY / props.grid[1]) * props.grid[1]),
			w: (Math.round(elmW / props.grid[0]) * props.grid[0]),
			h: (Math.round(elmH / props.grid[1]) * props.grid[1]),
		});
		emit('resizing');
	} else if (isRotating.value) {
		let angle = getAngle(
			[
				parentX + props.x * props.scale + (props.w / 2) * props.scale, 
				-(parentY + props.y * props.scale + (props.h / 2) * props.scale)
			],
			[
				lastMouseX + props.offset[0], 
				-(lastMouseY + props.offset[1])
			]
		);

		let criticalAngle = angleArr.find(item => Math.abs(item - angle) < 3);
		angle = typeof criticalAngle === 'number' ? criticalAngle : angle;

		!props.disabled && sync({
			r: angle === 360 ? 0 : angle
		});
		emit('rotating');
	} else if (isDraging.value) {

		// 找出可吸附的辅助线
		let leftline = props.guides[0] && props.guides[0].find(item => {
			return Math.abs(elmX + diffX - item) < 3;
		});
		let rightline = props.guides[0] && props.guides[0].find(item => {
			return Math.abs(elmX + diffX + elmW - item) < 2;
		});
		let topline = props.guides[1] && props.guides[1].find(item => {
			return Math.abs(elmY + diffY - item) < 3;
		});
		let bottomline = props.guides[1] && props.guides[1].find(item => {
			return Math.abs(elmY + diffY + elmH - item) < 2;
		});

		leftline && (diffX = leftline - elmX);
		rightline && (diffX = rightline - elmX - elmW);
		topline && (diffY = topline - elmY);
		bottomline && (diffY = bottomline - elmY - elmH);

		if (props.parent) {
			if (elmX + diffX < 0 || elmX + diffX + elmW > parentW) {
				diffX = 0;
			}
			if (elmY + diffY < 0 || elmY + diffY + elmH > parentH) {
				diffY = 0;
			}
		}
		elmX += diffX;
		elmY += diffY;

		!props.disabled && sync({
			x: (Math.round(elmX / props.grid[0]) * props.grid[0]),
			y: (Math.round(elmY / props.grid[1]) * props.grid[1]),
		});
		emit('dragging');
	}

	// 正在改变
	!isChanging.value
		&& (isRotating.value || isDraging.value || isResizing.value)
		&& (isChanging.value = true);

};

const handleUp = () => {
	isChanging.value = false;
	handle = null;
	// 约束
	const restrain = props.restrain;
	if (restrain && restrain > 0) {
		sync({
			x: getRestrain(props.x),
			y: getRestrain(props.y),
			w: getRestrain(props.w),
			h: getRestrain(props.h),
		});
	}
	if (isRotating.value) {
		isRotating.value = false;
		beforeStatus && emit('rotate-end');
	}
	if (isResizing.value) {
		isResizing.value = false;
		beforeStatus && emit('resize-end');
	}
	if (isDraging.value) {
		isDraging.value = false;
		beforeStatus && emit('drag-end');
	}
	if (beforeStatus) {
		emit('end', beforeStatus);
		beforeStatus = null;
	}
};

/**
 * 模拟设置isActive状态
 */
const setActived = () => {
	handleContainerDown();
	handleUp();
};

watch(
	() => props.active,
	(v) => {
		v && setActived();
	},
	{
		immediate: true
	}
);

onMounted(() => {
	if (props.w && props.minW > props.w) {
		sync({ w: props.minW });
	}
	if (props.h && props.minH > props.h) {
		sync({ h: props.minH });
	}

	nextTick(() => {
		const { x, y } = instance.vnode.el.parentNode.getBoundingClientRect();
		parentX = x + props.offset[0];
		parentY = y + props.offset[1];

		// 判断是否只能在父级元素中拖动
		props.parent && calculation();
		emit('resizing');
	});
});

onUnmounted(() => {
	operateDOMEvents('remove');
});

defineExpose({
	setActived
});
</script>

<style lang="scss">

$url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" style="font-size: 20px;"><text y="15">↻</text></svg>';

.vm-draggable {
	position: absolute;
	padding: 0;
	box-sizing: border-box;
	user-select: none;

	&:hover {
		cursor: move;
	}

	.is-events-none {
		pointer-events: none;
	}
	// 重复？
	.is-delete {
		position: absolute;
		right: 0;
		z-index: 300;
		width: 20px;
		color: white;
		text-align: center;
		background: #5495f6;
	}
}

.vm-draggable-disabled {
	&:hover {
		cursor: default;
	}
}

.vm-draggable__handles {
	&.is-active {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 2;
		padding: 0;
		border: 1px dotted #5495f6;
		// cursor: move;
		.vm-draggable__handle {
			display: block;
		}
	}

	&.is-disabled {
		border: 1px dotted #e96101;

		.handle-rotate {
			&::after {
				background: #e96101;
			}

			&::before {
				color: #e96101;
			}
		}
	}
}

.vm-draggable__handle {
	position: absolute;
	z-index: 999;
	display: none;
	box-sizing: border-box;

	&.is-left {
		position: absolute;
		top: 0;
		left: -5px;
		width: 5px;
		height: 100%;
		cursor: ew-resize;

		&:hover {
			background: linear-gradient(to right, rgba(255, 255, 255, 0), #3f51b5);
		}
	}

	&.is-right {
		position: absolute;
		top: 0;
		right: -5px;
		width: 5px;
		height: 100%;
		cursor: ew-resize;

		&:hover {
			background: linear-gradient(to left, rgba(255, 255, 255, 0), #3f51b5);
		}
	}

	&.is-top {
		position: absolute;
		top: -5px;
		left: 0;
		width: 100%;
		height: 5px;
		cursor: ns-resize;

		&:hover {
			background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #3f51b5);
		}
	}

	&.is-bottom {
		position: absolute;
		bottom: -5px;
		left: 0;
		width: 100%;
		height: 5px;
		cursor: ns-resize;

		&:hover {
			background: linear-gradient(to top, rgba(255, 255, 255, 0), #3f51b5);
		}
	}

	&.is-top-left {
		top: 0;
		left: 0;
		padding: 5px;
		cursor: nwse-resize;
	}

	&.is-bottom-left {
		bottom: 0;
		left: 0;
		padding: 5px;
		cursor: nesw-resize;
	}

	&.is-top-right {
		top: 0;
		right: 0;
		padding: 5px;
		cursor: nesw-resize;
	}

	&.is-bottom-right {
		right: 0;
		bottom: 0;
		padding: 5px;
		cursor: nwse-resize;
	}

	&.is-rotate {
		top: 0;
		left: 50%;
		display: flex !important;
		cursor: url($url) 10 10, default;
		transform: translate(-50%, -100%);
		flex-direction: column;
		align-items: center;
		justify-content: center;

		&::after {
			width: 1px;
			height: 10px;
			background: #5495f6;
			content: ' ';
		}

		&::before {
			color: #5495f6;
			content: '☐';
			transform: translateY(26%);
		}
	}
}

/**
 * rotate
 */
.vm-draggable__rotate {
	position: absolute;
	top: 50%;
	left: 50%;
	z-index: 2;
	width: 500px;
	background-color: #1fb6ff;
	border: 1px solid #1fb6ff;
	transform: translate(-50%, -50%) rotate(90deg);
}

.vm-draggable__rotate--deg {
	position: absolute;
	top: 50%;
	left: 50%;
	z-index: 2;
	width: 500px;
	border-top: 1px dashed #fff;
	border-bottom: 1px dashed #262626;
	opacity: 0.4;

	&.is-0 {
		transform: translate(-50%, -50%);
	}

	&.is-45 {
		transform: translate(-50%, -50%) rotate(45deg);
	}

	&.is-90 {
		transform: translate(-50%, -50%) rotate(90deg);
	}

	&.is-135 {
		transform: translate(-50%, -50%) rotate(135deg);
	}
}

.vm-draggable__rotate--tip {
	position: absolute;
	top: -50px;
	left: 60%;
	width: 40px;
	height: 16px;
	line-height: 16px;
	text-align: center;
	background-color: #fff;
	border: 1px solid #262626;
	border-radius: 8px;
}

.vm-draggable__delete {
	position: absolute;
	top: 0;
	right: 0;
	z-index: 300;
	width: 20px;
	color: white;
	text-align: center;
	cursor: pointer;
	background: #5495f6;
}

</style>
