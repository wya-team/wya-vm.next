<template>
	<div
		:draggable="draggable && !disabled"
		:class="!draggable ? 'vm-sortable-disabled' : ''"
		class="vm-sortable"
		@click="handleClick"
		@dragstart="handleDragStart"
		@dragenter="handleDragEnter"
		@dragleave="handleDragLeave"
		@dragover.prevent
		@dragend="handleDragEnd"
		@mouseenter="isHover = true"
		@mouseleave="isHover = false"
	>
		<div style="pointer-events: none;">
			<slot />
		</div>
		<!-- handle -->
		<div
			v-if="isActive || isHover"
			:class="{
				'is-disabled': disabled,
				'is-active': true
			}"
			class="vm-sortable__handle"
		/>
		<p
			v-if="closeable && (isActive || isHover)"
			class="vm-sortable__delete"
			@click="$emit('delete')"
		>
			✕
		</p>

		<p
			v-if="showHighlight && isHighlight"
			ref="highlight"
			class="vm-sortable__highlight"
		>
			释放鼠标将模块添加到此处
		</p>
	</div>
</template>

<script setup>
import { getCurrentInstance, ref, computed, onUnmounted } from 'vue';
import { isPassiveSupported, eleInRegExp } from '@wya/vm-shared';
import { useCurrentDrag } from './shared-hooks';

const emit = defineEmits([
	'delete',
	'activated',
	'deactivated',
	'sorting',
	'highlight-change',
	'sort-end'
]);
const props = defineProps({
	// 当前排序数组的索引值，非order
	index: {
		type: [Number, String],
		required: true
	},
	// 用于getData/setData
	transferKey: {
		type: String,
		default: '@wya/vm'
	},
	disabled: {
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
	closeable: {
		type: Boolean,
		default: false
	},
	draggable: {
		type: Boolean,
		default: true
	},
	showHighlight: {
		type: Boolean,
		default: true
	}
});

const doc = document.documentElement;
let [currentDrag, setCurrentDrag] = useCurrentDrag();
const instance = getCurrentInstance();

const isActive = ref(false);
const isHover = ref(false);
const isHighlight = ref(false);
const highlight = ref(null);

// 组件捕获阶段执行
const eventOpts = !isPassiveSupported || { capture: true, passive: true };

const operateDOMEvents = (type) => {
	let fn = type === 'add' ? doc.addEventListener : doc.removeEventListener;

	fn('mousedown', handleDeselect, eventOpts);
};

/**
 * 模拟设置Active状态
 */
const setActived = () => {
	handleClick();
};

// 组件被按下事件
const handleClick = (e = {}) => {
	// 去除默认事件
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
			// 绑定事件
			operateDOMEvents('add');

			isActive.value = true;
			emit('activated', e);
		}
	}
};

// 取消选择事件
const handleDeselect = (e) => {
	const target = e.target || e.srcElement; // body不要带上class, 否则会存在问题

	let path = e.path || (e.composedPath && e.composedPath()) || [];

	// 是否是入口下的元素，如果不是，就意味着可能是弹层（避免销毁）
	let isInline = path.some(item => eleInRegExp(item, props.entryRegExp));

	if (
		isInline
		&& !instance.vnode.el.contains(target)
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

// 拖拽开始
const handleDragStart = (e) => {
	// 定义拖动数据 - 拖到别的输入框展示的内容
	e.dataTransfer.setData(props.transferKey, props.index);

	// 拖放效果
	e.dataTransfer.effectAllowed = "move";

	setCurrentDrag(e.target);

	currentDrag.value.__START_INDEX__ = props.index;
	currentDrag.value.__END_INDEX__ = props.index;
	currentDrag.value.__DRAGGABLE__ = props.draggable;

	e.target.style.opacity = 0;
};

let timer;

// 拖拽元素进入目标元素头上的时候
const handleDragEnter = (e) => {
	if (props.draggable && currentDrag.value && currentDrag.value.__DRAGGABLE__ && e.target != currentDrag.value) { // 排序
		if (props.index != currentDrag.value.__END_INDEX__) {
			if (timer) return;
			timer = setTimeout(() => {
				timer = null;
			}, 500);

			emit('sorting', [currentDrag.value.__END_INDEX__, props.index]);
			currentDrag.value.__END_INDEX__ = props.index;
		}
	} else if (!currentDrag.value) { // 处理高亮
		isHighlight.value = true;
		emit('highlight-change', true);
	}
};

// 拖拽离开
const handleDragLeave = (e) => {
	if (highlight.value === e.fromElement) return;

	isHighlight.value = false;
	emit('highlight-change', false);
};

// 拖拽结束
const handleDragEnd = (e) => {
	e.dataTransfer.clearData(props.transferKey);

	e.target.style.opacity = 1;

	if (currentDrag) {
		emit('sort-end', [currentDrag.value.__START_INDEX__, currentDrag.value.__END_INDEX__]);
	}

	setCurrentDrag(null);
};

onUnmounted(() => {
	operateDOMEvents('remove');
});


defineExpose({
	index: computed(() => props.index),
	isHighlight,
	setActived
});

</script>

<style lang="scss">
.vm-sortable {
	position: relative;
	padding: 0;
	box-sizing: border-box;
	transition: opacity 0.5s; /* 目的是让拖拽的那个元素保持不透明， 文档流里透明 */
	user-select: none;

	&:hover {
		cursor: move;
	}

	.vm-sortable__handle {
		&.is-active {
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			z-index: 2;
			padding: 0;
			border: 1px dotted #5495f6;

			/* cursor: move; */
		}
	}

	&.is-disabled {
		cursor: no-drop;
	}
}

.vm-sortable-disabled {
	&:hover {
		cursor: default;
	}
}

.vm-sortable__delete {
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

.vm-sortable__highlight {
	display: flex;
	height: 55px;
	color: #5495f6;
	background: #e7f4ff;
	border: 1px dotted #5495f6;
	align-items: center;
	justify-content: center;
}

</style>
