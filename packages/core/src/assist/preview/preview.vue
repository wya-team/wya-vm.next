<template>
	<div class="vm-assist-preview" :style="[frameSizeStyle]" style=" overflow: hidden;">
		<div :style="{ zoom: isDraggable ? scale : 1 }">
			<div style="position: relative;">
				<div 
					v-for="(it, index) in dataSource" 
					:key="it.id" 
					:style="isDraggable ? { 
						position: 'absolute', 
						width: `${it.w ? `${it.w}px` : 'auto' }`, 
						height: `${it.h ? `${it.h}px` : 'auto' }`, 
						borderRadius: `${it.borderRadius ? `${it.borderRadius}px` : 'inherit' }`, 
						left: `${it.x}px`, 
						top: `${it.y}px`, 
						transform: `rotate(${it.r}deg)`
					} : {} "
					@click.alt.exact="handleClick(it.id)"
				>
					<template v-if="it.module !== SELECTION_MODULE">
						<!-- vm.type vm.scale让组件内部处理如何渲染或其他操作 -->
						<component
							:is="modulesMap[it.module].Viewer" 
							v-bind="it"
							:vm="vm"
							:index="index"
						/>
					</template>
					<template v-else>
						<!-- 组合拖拽 -->
						<div />
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { SELECTION_MODULE, PAGE_MOULE } from '../../utils/constants';

const props = defineProps({
	dataSource: Array,
	mode: {
		type: String,
		default: 'draggable'
	},

	/**
	 * 表示预览时最大的窗口大小, 但放大后，相应的值也需要放大
	 * zoom 不作用于html2canvas(如果有, https://html2canvas.hertzen.com/features)
	 */
	width: {
		type: [Number, String],
		default: ''
	},

	/**
	 * 这个表示的dataSource中的数据是基于frameW编辑出来的
	 * 这样才可以做到全屏预览时等比放大
	 */
	frameW: Number,
	modules: Object
});

const isDraggable = computed(() => {
	return props.mode === 'draggable';
});

const scale = computed(() => {
	return !props.frameW || typeof props.frameW === 'undefined' 
		? 1 
		: ((!isNaN(props.width) && props.width) || window.innerWidth) / props.frameW;
});

const vm = computed(() => {
	return {
		type: 'preview',
		scale: scale.value
	};
});

const frameSizeStyle = computed(() => {
	if (!isDraggable.value) return {};
	const it = props.dataSource.find(i => i.module === PAGE_MOULE) || {};
	return {
		width: `${it.w ? `${it.w * scale.value}px!important` : 'auto'}`, 
		height: `${it.h ? `${it.h * scale.value}px!important` : 'auto'}`
	};
});

const modulesMap = computed(() => {
	return Array.isArray(props.modules) 
		? props.modules.reduce((pre, cur) => {
			pre[cur.module] = cur;
			return pre;
		}, {})
		: props.modules;
});

let isWatch = false;
let currentId = '';

// 用于debug
const handleClick = (id) => {
	currentId = currentId === id ? null : id;
	if (isWatch) return;

	isWatch = true;
	watch(
		() => props.dataSource, 
		(v) => {
			if (!currentId) return;

			console.log('\n----');
			console.log(new RegExp(new Date().toString()));
			console.log(JSON.parse(JSON.stringify(v.find(i => i.id === this.currentId))));
			console.log('----\n\n');

		}, 
		{ deep: true, immediate: true }
	);
};
</script>
