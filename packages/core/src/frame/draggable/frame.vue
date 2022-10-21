<template>
	<Inner
		ref="inner"
		v-model:guides="guides"
		:show-ruler="showRuler"
		:show-zoom-bar="showZoomBar"
		:scroll-left="scrollLeft"
		:scroll-top="scrollTop"
		:frame-w="width"
		:frame-h="height"
		:client-w="clientW"
		:client-h="clientH"
		:zoom-bar-h="zoomBarH"
		:scale="scale"
		:border-size="borderSize"
		:scroller-size="scrollerSize"
		:theme="theme"
		:class="classes"
		class="vm-frame-draggable" 
		@client-resize="handleClientResize" 
	>
		<template #content>
			<Scroller 
				ref="wrapper" 
				class="vm-frame-draggable__wrapper" 
				:style="wrapperStyle"
				@scroll="handleScroll"
			>
				<!-- 用于失焦用 -->
				<div ref="deactivated" />
				<Selection 
					:client-w="clientW" 
					:client-h="clientH" 
					:border-size="borderSize"
					@selection="handleSelection" 
				/>
				<div :style="scrollStyle">
					<!-- 以上仅辅助Frame，所以frameStyle作用在content上 -->
					<div ref="header" :style="scaleStyle">
						<slot name="frame-header" />
					</div>
					
					<div
						ref="content"
						:style="[contentStyle, frameStyle]"
						class="vm-frame-draggable__content"
						style="position: relative;"
						@dragover.prevent
						@drop="handleDrop"
					>
						<GridLines v-if="showLines" :width="width" :height="height" :grid="[10, 10]" />
						<AlignLines v-if="showLines" :data-source="dataSource" :editor="editor" />
						<!-- prevent为true用于点击时可以触发输入框的失焦 -->
						<Drag
							v-for="(it, index) in dataSource"
							ref="draggable"
							:key="it.id"
							v-model:x="it.x"
							v-model:y="it.y"
							v-model:z="it.z"
							v-model:w="it.w"
							v-model:h="it.h"
							v-model:r="it.r"
							:module="it.module"
							:parent="it.parent"
							:disabled="it.disabled || !!selections[it.id]"
							:handles="it.handles"
							:min-w="it.minW"
							:min-h="it.minH"
							:scale="scale"
							:grid="it.grid"
							:guides="guides"
							:offset="[scrollLeft || 0, scrollTop || 0]"
							:active="it.active"
							:restrain="it.restrain"
							:closeable="it.closeable || typeof it.closeable === 'undefined'"
							:draggable="it.draggable || typeof it.draggable === 'undefined'"
							:rotatable="it.rotatable || typeof it.rotatable === 'undefined'"
							:resizable="it.resizable || typeof it.resizable === 'undefined'"
							:prevent="false"
							@delete="$parent.remove(it, true)"
							@activated="e => handleActivated(e, it)"
							@deactivated="e => handleDeactivated(e, it)"
							@dragging="handleDragging(it)"
							@resizing="$emit('resizing', it)"
							@rotating="$emit('rotating', it)"
							@resize-end="$emit('resize-end', it)"
							@drag-end="handleDragEnd(it)"
							@end="e => handleEnd(e, it, index)"
							@contextmenu.prevent="handleShowMenu($event, it)"
						>
							<template v-if="it.module !== SELECTION_MODULE">
								<!-- vm-type让组件内部处理如何渲染或其他操作 -->
								<component
									:is="modules[it.module].Viewer" 
									:index="index"
									:vm="vm"
									v-bind="it"
									:scale="scale"
									@change="e => handleAttrChange(e, it)"
								/>
							</template>
							<template v-else>
								<!-- 组合拖拽 -->
								<div style="width: 100%; height: 100%;" />
							</template>
						</Drag>
					</div>
					<div :style="[scaleStyle, footerStyle]">
						<slot name="frame-footer" />
					</div>
				</div>
			</Scroller>
		</template>
		<template #content-extra>
			<Thumbnail
				v-if="showThumbnail"
				:data-source="dataSource"
				:scale="scale"
				:frame-w="width"
				:frame-h="height"
				:client-w="clientW"
				:client-h="clientH"
				:scroll-left="scrollLeft"
				:scroll-top="scrollTop"
				:scroller-size="scrollerSize"
				:border-size="borderSize"
				:class="classes"
				:theme="theme"
				@scroll="handleScrollThumbnail"
			/>
		</template>	
		<template #footer>
			<ZoomBar
				v-if="showZoomBar"
				v-model:scale="scale"
				:border-size="borderSize"
				:h="zoomBarH"
				:frame-w="width"
				:frame-h="height"
				:client-w="clientW"
				:client-h="clientH"
				:class="classes"
				:theme="theme"
			/>
		</template>
	</Inner>
</template>

<script setup>
import { ref, nextTick, computed, getCurrentInstance } from 'vue';
import { Drag } from '@wya/vm-drag';
import { Logger } from '@wya/vm-shared';
import { Scroller } from '@wya/vc';
import GridLines from './grid-lines.vue';
import AlignLines from './align-lines.vue';
import Inner from './inner.vue';
import ZoomBar from './zoom-bar.vue';
import Thumbnail from './thumbnail.vue';
import Selection from './selection.vue';
import RightMenu from './right-menu';
import { getInstance } from '../../utils/get-instance';
import { getUid, cloneDeep, getValidChanged, allowSelection } from '../../utils/helper';
import { WIDGET_TO_FRAME, PAGE_MOULE, RIGHT_MENU_MAP, SELECTION_MODULE } from '../../utils/constants';

const { TOP, BOTTOM, UP, DOWN, DELETE, SELECTION, LOCK, COPY, PASTE } = RIGHT_MENU_MAP;

const emit = defineEmits([
	'resizing',
	'rotating',
	'resize-end',
	'error',
	'change',
	'error',
	'change',
	'activated',
	'deactivated',
	'dragging',
	'change',
	'drag-end'
]);

const props = defineProps({
	width: {
		type: Number,
		validator: v => v > 0,
	},
	height: {
		type: Number,
		validator: v => v > 0,
	},
	dataSource: Array,
	editor: Object,
	frameStyle: Object,
	showLines: {
		type: Boolean,
		default: true
	},
	showRuler: {
		type: Boolean,
		default: true
	},
	showZoomBar: {
		type: Boolean,
		default: true
	},
	showThumbnail: {
		type: Boolean,
		default: true
	},
	theme: String,
	modules: Object
});

const instance = getCurrentInstance();
const combo = getInstance('combo', 'VMComboId');

const vm = ref({
	type: 'frame',
	getInstance: () => instance
});

const scrollLeft = ref(0);
const scrollTop = ref(0);
const scale = ref(1);

const wrapper = ref();
const content = ref();
const header = ref();
const deactivated = ref();
const draggable = ref([]);

// 容器的宽高
const clientW = ref(0);
const clientH = ref(0);

// 参考线
const guides = ref([], []);

// 悬浮的滚动条为0, 如果不使用vc-scroller，需要额外设置
const scrollerSize = ref(0);

// 四周留白
const borderSize = computed(() => {
	let size = props.showRuler ? 20 : 0;
	return {
		top: size,
		left: size,
		bottom: size,
		right: size
	};
});

// zoomBarH的高度
const zoomBarH = computed(() => {
	return props.showZoomBar ? 40 : 0;
});

/**
 * 确保宽度不够时，滚动条的位置始终靠最右边与底部
 */
const wrapperStyle = computed(() => {
	const { top, left } = borderSize.value;
	return {
		paddingTop: `${top}px`,
		paddingLeft: `${left}px`,
	};
});

/**
 * 滚动区域大小，要加入最右边的宽度和底部的高度
 */
const scrollStyle = computed(() => {
	const { bottom, right } = borderSize.value;
	return {
		width: `${Math.max(clientW.value - right, props.width * scale.value + right)}px`,
		height: `${props.height * scale.value + bottom}px`
	};
});

/**
 * 内容区域
 */
const contentStyle = computed(() => {
	return {
		width: `${props.width}px`,
		height: `${props.height}px`,
		transform: `scale(${scale.value})`,
		transformOrigin: `0 0`,
	};
});

/**
 * header / footer 缩放
 *
 * zoom:，原来的h是一同缩放的
 * transform占位依旧是原来的width和height, 需要 originSize * scale.value
 */
const scaleStyle = computed(() => {
	return {
		zoom: scale.value,
	};
});

/**
 * 因为中间区域用了transform, 但没有改变height * scale, 所以footer用margin-top控制
 */
const footerStyle = computed(() => {
	return {
		marginTop: `${((scale.value - 1) * props.height) / scale.value}px`
	};
});

const classes = computed(() => {
	return {
		'is-dark': props.theme === 'dark'
	};
});

/**
 * 被选择的ids
 */
const selections = computed(() => {
	const { dataSource } = props;
	return dataSource.reduce((pre, cur) => {
		if (cur.module === SELECTION_MODULE) {
			cur.selections.forEach((id) => {
				pre[id] = dataSource.find(i => i.id === id);
			});
		}
		return pre;
	}, {});
});

let dragOriginal = {};
/**
 * 1. 自适应布局
 * 2. 滚动条最右侧显示（hackStyle）, 容易导致无限计划
 * tips: vm-combo, width 为auto时，会出现一直计算，直到width小于最大的width
 *
 * @param {number} w ~
 * @param {number} h ~
 */
const handleClientResize = (w, h) => {
	if (!wrapper.value) return;

	clientW.value = w; 
	clientH.value = h; 
};

// 不添加throttle，如：容易导致计算丢失（快速滚动下影响ruler）
const handleScroll = (e) => {
	scrollLeft.value = e.target.scrollLeft;
	scrollTop.value = e.target.scrollTop;
};

const handleScrollThumbnail = (x, y) => {
	scrollLeft.value = x;
	wrapper.value.setScrollLeft(x);

	scrollTop.value = y;
	wrapper.value.setScrollTop(y);
};

const handleDrop = (e) => {
	let result;
	let moduleData;
	try { moduleData = JSON.parse(e.dataTransfer.getData(WIDGET_TO_FRAME) || ''); } catch {}; // eslint-disable-line

	let { module, data: index } = moduleData || {};
	result = props.modules[module];

	// 不存在的模块
	if (!result) return;
	if (result.max && result.max <= props.dataSource.filter(i => i.module === module).length) {
		emit('error', {
			type: 'create',
			message: `当前模块最多只能创建${result.max}个`
		});
		return;
	}

	let { x, y } = content.value.getBoundingClientRect();

	let mouseX = e.pageX || e.clientX + document.documentElement.scrollLeft || 0;
	let mouseY = e.pageY || e.clientY + document.documentElement.scrollTop || 0;

	let id = getUid();
	let rowIndex = props.dataSource.length;

	let data = {
		...cloneDeep(
			typeof result.data === 'function'
				? result.data(index, props.dataSource)
				: result.data
		),
		module,
		id
	};


	// 不可拖拽的情况下
	if (!e.fake && (data.draggable || typeof data.draggable === 'undefined')) {
		data.x = Math.round((mouseX - x) / scale.value);
		data.y = Math.round((mouseY - y) / scale.value);
	} else {
		data.x = 0;
		data.y = 0;
	}

	let action = {
		type: 'CREATE',
		index: rowIndex,
		id,
		data
	};
	emit('change', action);

	// 新元素处于激活状态
	setActived(rowIndex);

	// 给外层fake时add用的
	return id;
};

/**
 * index因为都是最后一个插入
 * 所以不用像sortable/frame.vue一样做判断
 *
 * @param {number} index ~
 */
const setActived = (index) => {
	nextTick(() => {
		try {
			// 让当前编辑的元素触发`deactivated`，再选中actived
			deactivated.value.dispatchEvent(new Event('mousedown')); 
			draggable.value[index].setActived();
		} catch (e) {
			console.error(e);
		}
	});
};

const setActivedById = (id) => {
	setActived(props.dataSource.findIndex(i => i.id === id));
};

// 显示菜单
const handleShowMenu = async (e, it) => { 
	const { clipboardData } = combo.exposed;
	if (!clipboardData && it.module === PAGE_MOULE) return;

	try {
		const type = await RightMenu.popup({ 
			event: e, 
			dataSource: it, 
			filter: (i) => {
				if (it.module === PAGE_MOULE) {
					return [PASTE].includes(i);
				}
				if (it.module === SELECTION_MODULE) {
					return [TOP, BOTTOM, DELETE, SELECTION, LOCK, COPY, PASTE].includes(i);
				} else {
					return i !== SELECTION && (i !== PASTE || clipboardData);
				}
			} 
		});

		// 置底和置顶要额外处理
		if (it.module === SELECTION_MODULE && (type === TOP || type === BOTTOM)) {
			const oldSortIds = props.dataSource.map(i => i.id);
			const selfActionInvoke = () => {
				let action = selectMenu(type, it, false) || { type: 'DUMMY' };
				emit('change', {
					...action,
					revert: it.selections.length
				});
			};

			// 自己再置底，元素再置底
			type === BOTTOM && selfActionInvoke();
			
			// 根据z降序，相等则后面的z放在前面
			let $selections = props.dataSource
				.slice()
				.filter(v => it.selections.includes(v.id))
				.reverse()
				.sort((a, b) => b.z - a.z);

			(type === TOP ? $selections.reverse() : $selections).forEach(data => {
				let action = selectMenu(e, type, data, false) || { type: 'DUMMY' };
				emit('change', {
					...action,
					revert: it.selections.length
				});
			});

			// 元素先置顶，自己再置顶
			type === TOP && selfActionInvoke();

			// 置顶置底未发生变化
			if (
				oldSortIds.every((id, index) => props.dataSource[index].id === id)
			) {
				combo.exposed.store.removeHistory(it.selections.length + 1);

				emit('error', {
					type: 'menu',
					message: `您已经${type === TOP ? '置顶' : '置底'}, 无需操作`
				});
			}
			return;
		}

		selectMenu(e, type, it);
	} catch ($e) {
		$e && $e.message && console.log($e);
	}
};

/**
 * 右键查单选项 
 * TODO: 抽离 or 优化代码
 * 
 * @param {object} e 使用粘帖时的位置
 * @param {string} type 要选择的操作
 * @param {object} it 数据源
 * @param {boolean} invoke 表示是否需要emit执行, 否者返回action（目前只有涉及排序的返回action）
 * @returns {string} ~
 */
const selectMenu = (e, type, it, invoke = true) => {
	let changed;
	// 根据z降序，相等则后面的z放在前面
	let data = props.dataSource
		.slice()
		.filter(v => v.module !== PAGE_MOULE)
		.reverse()
		.sort((a, b) => b.z - a.z);
	let index = data.findIndex(v => v.id === it.id);

	if (type === DELETE && it.closeable === false) return;
	let action;
	switch (type) {
		case TOP:
			if (index === 0) return;
			changed = data[0];
			break;
		case BOTTOM:
			if (index === data.length - 1) return;
			changed = data[data.length - 1];
			break;
		case UP:
			if (index === 0) return;
			changed = data[index - 1];
			break;
		case DOWN:
			if (index === data.length - 1) return;
			changed = data[index + 1];
			break;
		// 删除：由其他执行
		case DELETE:
			action = { type: 'DELETE', id: it.id };
			if (!invoke) return action;
			combo.exposed.remove(it, true);
			return;
		// 取消选择：直接删除元素
		case SELECTION:
			action = { type: 'DELETE', id: it.id };
			if (!invoke) return action;
			emit('change', action);
			return;
		case LOCK: 
			action = { type: 'UPDATE', id: it.id, changed: { disabled: !it.disabled } };
			if (!invoke) return action;
			emit('change', action);
			return;
		case COPY: 
			combo.exposed.copy(it);
			return;
		case PASTE: {
			let { x, y } = content.value.getBoundingClientRect();

			let mouseX = e.pageX || e.clientX + document.documentElement.scrollLeft || 0;
			let mouseY = e.pageY || e.clientY + document.documentElement.scrollTop || 0;

			x = Math.round((mouseX - x) / scale.value);
			y = Math.round((mouseY - y) / scale.value);
			combo.exposed.paste({
				x,
				y
			});
			return;
		}
		default:
			return;
	}
	let current = props.dataSource.findIndex(v => v.id === it.id);
	let target = props.dataSource.findIndex(v => v.id === changed.id);

	action = {
		type: 'SORT',
		changed: [current, target],
		history: true,
	};

	if (!invoke) return action;
	emit('change', action);
};

/**
 * 从Viewer传递出来
 * id, history 这是内部字段
 *
 * @param {object} opts ~
 * @param {object} originalData ~
 */
const handleAttrChange = (opts = {}, originalData = {}) => {
	if (typeof opts !== 'object') return;
	const { id, history, ...rest } = opts;
	const changed = getValidChanged(rest);

	emit('change', {
		type: 'UPDATE',
		id: id || originalData.id,
		changed,
		// 是否记录历史
		history
	});
};

// 多选选中
const handleSelection = (rect) => {
	const { dataSource } = props;
	const headerH = header.value ? header.value.clientHeight : 0;
	const $rect = {
		x: scrollLeft.value + (rect.x - borderSize.value.left) / scale.value,
		y: scrollTop.value + (rect.y - borderSize.value.top) / scale.value - headerH,
		w: rect.w / scale.value,
		h: rect.h / scale.value,
	};

	let { selections: $selections, selectionModules, disabledIds } = dataSource.reduce((pre, cur) => {
		if (
			!allowSelection(cur, $rect) 
			|| cur.module === PAGE_MOULE
		) return pre;
			
		if (cur.disabled && cur.module === SELECTION_MODULE) {
			pre.disabledIds.push(...cur.selections);
		} 

		if (cur.disabled) return pre;
		if (cur.module === SELECTION_MODULE) {
			pre.selectionModules.push(cur);
		} else {
			pre.selections.push(cur);
		}
		return pre;
	}, {
		selections: [],
		disabledIds: [],
		selectionModules: []
	});
	// 过滤不能选的ids
	$selections = $selections.filter(i => !disabledIds.includes(i.id));

	const selectionIds = $selections.map(i => i.id);

	// 如果选区内selectionIds已存在在selectionModules;直接选中
	for (let i = 0; i < selectionModules.length; i++) {
		if (selectionIds.every(id => selectionModules[i].selections.includes(id))) {
			setActivedById(selectionModules[i].id);
			return;
		}
	}

	// 当且只有一个元素未选中或有selectionModules在这个区域内
	if ($selections.length <= 1) {
		let rowIndex = 0;

		if ($selections.length) {
			rowIndex = dataSource.findIndex(i => i.id === $selections[0].id);
		}

		// 找到最上面一层
		if (selectionModules.length) {
			rowIndex = Math.max(
				rowIndex, 
				...selectionModules.map(i => dataSource.findIndex(j => j.id === i.id))
			);
		}

		// 激活状态
		rowIndex && setActived(rowIndex);
		return;
	}

	// 移除之前选区
	const actions = dataSource.reduce((pre, cur) => {
		if (cur.module !== SELECTION_MODULE || !selectionIds.some(id => cur.selections.includes(id))) return pre;
		pre.push({
			type: 'DELETE',
			id: cur.id
		});
		return pre;
	}, []);


	let id = getUid();
	const info = $selections.reduce((pre, cur) => {
		pre.xs.push(cur.x);
		pre.xws.push(cur.x + cur.w);
		pre.ys.push(cur.y);
		pre.yhs.push(cur.y + cur.h);
		pre.zs.push(cur.z);
		pre.parent && (pre.parent = cur.parent);
		return pre;
	}, {
		xs: [],
		xws: [],
		ys: [],
		yhs: [],
		zs: [],
		parent: true
	});
	let minX = Math.min(...info.xs);
	let maxX = Math.max(...info.xws);

	let minY = Math.min(...info.ys);
	let maxY = Math.max(...info.yhs);

	// 删除之前组合的
	actions.forEach(i => { i.revert = actions.length; emit('change', i); });

	let rowIndex = dataSource.length;
	let action = {
		type: 'CREATE',
		index: rowIndex,
		id,
		data: {
			x: minX,
			y: minY,
			w: maxX - minX,
			h: maxY - minY,
			z: Math.max(...info.zs),
			r: 0,

			parent: info.parent,
			rotatable: false,
			resizable: false,
			closeable: true,

			// 用于表示锁定
			disabled: false,
			active: false,

			// 内部分配字段
			selections: selectionIds,
			module: SELECTION_MODULE,
			id
		},
		revert: actions.length
	};

	emit('change', action);
	// 新元素处于激活状态
	setActived(rowIndex);
};

// 目标被激活
const handleActivated = (e, it) => {
	Logger.debug('activated', it.module);
	emit('activated', e, it);
	if (it.module === SELECTION_MODULE) {
		dragOriginal[it.id] = {
			x: it.x,
			y: it.y
		};
	}
};

// 目标失活
const handleDeactivated = (e, it) => {
	Logger.debug('deactivated', it.module);
	emit('deactivated', e, it);
};

// 目标被拖动
const handleDragging = (it) => {
	emit('dragging', it);
	if (it.module === SELECTION_MODULE) {
		const diffX = it.x - dragOriginal[it.id].x;
		const diffY = it.y - dragOriginal[it.id].y;

		(diffX || diffY) && it.selections && it.selections.forEach(id => {
			let { x, y } = selections.value[id];
			if (!dragOriginal[id]) {
				dragOriginal[id] = {
					x,
					y
				};
			}
			x = dragOriginal[id].x + diffX;
			y = dragOriginal[id].y + diffY;

			emit('change', {
				type: 'UPDATE',
				id,
				changed: {
					x,
					y
				},
				// 是否记录历史
				history: false
			});
		});
	}
};

// 目标拖动结束
const handleDragEnd = (it) => {
	Logger.debug('drag-end', it.module);
	emit('drag-end', it);
	if (it.module === SELECTION_MODULE) {
		dragOriginal = {};

		// 用于激活状态下再次拖拽
		dragOriginal[it.id] = {
			x: it.x,
			y: it.y
		};
	}
};


/**
 * 目标所有变化行为结束
 * 
 * @param {object} original 用于回到历史位置
 * @param {object} it ~
 * @param {number} index ~
 */
const handleEnd = (original, it, index) => {
	Logger.debug('end', it.module);
	let action = {
		type: 'UPDATE',
		id: it.id,
		index,
		original,
		revert: it.selections && it.selections.length,
	};
	emit('change', action);

	if (it.module === SELECTION_MODULE) {
		const diffX = it.x - original.x;
		const diffY = it.y - original.y;

		(diffX || diffY) && it.selections && it.selections.forEach(id => {
			let { x, y } = selections.value[id];
			emit('change', {
				type: 'UPDATE',
				id,
				revert: it.selections && it.selections.length,
				original: {
					x: x - diffX,
					y: y - diffY
				}
			});
		});
	}
};

defineExpose({
	el: instance.vnode.el,
	setActived,
	setActivedById,
	handleDrop
});
</script>

<style lang="scss">
@import "../../style/index.scss";

$block: vm-frame-draggable;

@include block($block) {
	@include element(wrapper) {
		height: 100%; /* 兼容无ruler模式 */

		/* overflow: auto; */

		/* hidden时考虑使用悬浮的滚动条 */

		/* @include scroller(); */
	}

	@include element(content) {
		position: relative;

		/* overflow: hidden; */
		z-index: 1;
		border: 1px solid $border;

		/* 不可缩小 */
		flex-shrink: 0;
	}
}
</style>
