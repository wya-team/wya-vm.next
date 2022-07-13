<template>
	<Inner :has-page="hasPage" class="vm-frame-sortable">
		<template #content>
			<slot name="frame-header" />
			<div 
				:style="[style, frameStyle]" 
				class="vm-frame-sortable__wrapper"
				@scroll="handleScroll"
				@dragover.prevent
				@dragenter="handleDragEnter"
				@dragleave="handleDragLeave"
				@drop="handleDrop"
			>
				<transition-group tag="div" name="flip-list">
					<div v-for="(it, index) in dataSource" :key="it.id" class="vm-frame-sortable__item">
						<!-- prevent为true用于点击时可以触发输入框的失焦 -->
						<div :style="getItemStyle(it, index)">
							<Sort
								ref="sort"
								:index="index"
								:transfer-key="SORT_IN_FRAME"
								:disabled="it.disabled"
								:draggable="it.draggable || typeof it.draggable === 'undefined'"
								:closeable="it.closeable || typeof it.closeable === 'undefined'"
								:prevent="false"
								@activated="(e) => $emit('activated', e, it)"
								@deactivated="(e) => $emit('deactivated', e, it)"
								@delete="$emit('change', { type: 'delete', id: it.id })"
								@sorting="handleSorting"
								@sort-end="handleSortEnd"
							>
								<component 
									:is="modules[it.module].Viewer" 
									:index="index"
									:vm="vm"
									v-bind="it" 
									style="min-height: 3px;"
								/>
							</Sort>
						</div>
						<div v-if="it.placeholder" :style="{height: `${it.placeholder}px`}" />
					</div>
				</transition-group>
			</div>
			<slot name="frame-footer" />
		</template>
	</Inner>
</template>

<script setup>
import { ref, onUnmounted, nextTick, computed, getCurrentInstance } from 'vue';
import { Sort } from '@wya/vm-sort';
import Inner from './inner.vue';
import { getUid, cloneDeep } from '../../utils/helper';
import { SORT_IN_FRAME, WIDGET_TO_FRAME, PAGE_MOULE } from '../../utils/constants';

const emit = defineEmits([
	'activated',
	'deactivated',
	'change',
	'error',
	'sort-end'
]);
const props = defineProps({
	width: Number,
	height: Number,
	dataSource: Array,
	editor: Object,
	frameStyle: Object,
	modules: Object,
});

const instance = getCurrentInstance();
const sort = ref([]);
const dragWaiting = ref(false);
const scrollTop = ref(0);
const vm = ref({
	type: 'frame'
});

const style = computed(() => {
	const w = !props.width ? 'auto' : `${props.width}px`;
	const h = !props.height ? 'auto' : `${props.height}px`;
	return {
		width: w,
		height: h
	};
});
const hasPage = computed(() => {
	return props?.dataSource?.some(i => i.module === PAGE_MOULE);
});

const getItemStyle = (it, index) => {
	if (typeof it.wrapperStyle === 'function') {
		let params = {
			row: it,
			index,
			dataSource: props.dataSource,
			scrollTop: scrollTop.value,
			vm: vm.value
		};
		return it.wrapperStyle(params);
	}

	return it.wrapperStyle || {};
};

// 不添加throttle, 具体情况draggable frame
const handleScroll = (e) => {
	scrollTop.value = e.target.scrollTop;
};

/**
 * TODO：
 * 1. dragWaiting等待时，默认插入到最后一个
 * 2. 区分是widget还是内部排序
 */
const handleDragEnter = () => {
	timer = setTimeout(() => {
		dragWaiting.value = !sort.value || sort.value.every(i => i.highlight === false);
	}, 300);
};
const handleDragLeave = () => {
	clearTimeout(timer);
	dragWaiting.value = false;
};
const handleDrop = (e) => {
	clearTimeout(timer);
	dragWaiting.value = false;

	let rowIndex = props.dataSource.length;
	/**
	 * 清理高亮, 设置插入位置
	 */
	if (sort.value) {
		sort.value.forEach(($instance) => {
			if ($instance.highlight === true) {
				rowIndex = $instance.index + 1;
				$instance.highlight = false;
			}
		});
	}

	let { module, data: index } = JSON.parse(e.dataTransfer.getData(WIDGET_TO_FRAME)) || {};
	let result = props.modules[module];
	// 不存在的模块
	if (!result) return;

	if (result.max && result.max <= props.dataSource.filter(i => i.module === module).length) {
		emit('error', {
			type: 'create',
			msg: `当前模块最多只能创建${result.max}个`
		});
		return;
	}
	
	let id = getUid();

	let data = {
		...cloneDeep(
			typeof result.data === 'function' 
				? result.data(index, props.dataSource) 
				: result.data
		),
		module,
		id,
	};

	// 计算是否允许插入
	if (typeof result.insertion === 'function') {
		let allow = result.insertion(rowIndex, props.dataSource);

		if (!allow) {
			return;
		}
	}

	// 只能插入到第一个位置
	switch (result.insertion) {
		case 'first':
			rowIndex = 0;
			break;
		case 'last':
			rowIndex = props.dataSource.length;
			break;
		default:
			break;
	}

	emit('change', { 
		type: 'CREATE', 
		index: rowIndex,
		id,
		data
	});

	// 新元素处于激活状态
	setActived(rowIndex);
};

/**
 * refs.sort是递增的，和index无关
 *
 * @param {number} index ~
 */
const setActived = (index) => {
	nextTick(() => {
		try {
			let target = sort.value.find(i => i.index === index);
			target.setActived();
		} catch (e) {
			console.error(e);
		}
	});
};

const setActivedById = (id) => {
	setActived(props.dataSource.findIndex(i => i.id === id));
};

// 交换位置
const handleSorting = (v) => {
	emit('change', {
		type: 'SORT',
		changed: v,
		history: false
	});
};


const handleSortEnd = (v) => {
	emit('change', {
		type: 'SORT',
		original: v,
		history: true
	});

	emit('sort-end', v, props.dataSource);
};

let timer = null;
onUnmounted(() => {
	clearTimeout(timer);
});

defineExpose({
	el: instance.vnode.el,
	setActived,
	setActivedById,
	handleDrop
});
</script>

<style lang="scss">
@import "../../style/index.scss";

$block: vm-frame-sortable;

@include block($block) {
	display: flex;
	background: #f7f6fa;
	flex-direction: column;

	@include element(wrapper) {
		/* margin-left: 20px; */
		position: relative;
		overflow: auto;
		border: 1px solid $border;
		flex-shrink: 0;

		@include scroller();
	}

	@include element(item) {
		transition: all 0.5s;
	}
}

/* 开始消失/进入的元素 */
.flip-list-enter,
.flip-list-leave-to {
	opacity: 0;
}

.flip-list-leave-active {
	display: none;
}
</style>
