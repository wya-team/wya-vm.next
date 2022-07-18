<template>
	<div class="vm-assist-preview">
		<div style="position: relative;">
			<div 
				v-for="(it, index) in dataSource" 
				:key="it.id" 
				:style="isDraggable ? { 
					position: 'absolute', 
					width: `${it.w ? `${it.w * scale}px` : 'auto' }`, 
					height: `${it.h ? `${it.h * scale}px` : 'auto' }`, 
					borderRadius: `${it.borderRadius ? `${it.borderRadius * scale}px` : 'inherit' }`, 
					left: `${it.x * scale}px`, 
					top: `${it.y * scale}px`, 
					transform: `rotate(${it.r}deg)`
				} : {} "
				@click.alt.exact="handleClick(it.id)"
			>
				<template v-if="it.module !== SELECTION_MODULE">
					<!-- vm-type让组件内部处理如何渲染或其他操作 -->
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
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { SELECTION_MODULE } from '../../utils/constants';

const props = defineProps({
	dataSource: Array,
	mode: {
		type: String,
		default: 'draggable'
	},
	frameW: Number,
	modules: Object
});

const vm = ref({
	type: 'preview'
});

const isDraggable = computed(() => {
	return props.mode === 'draggable';
});

const scale = computed(() => {
	return typeof props.frameW === 'undefined' 
		? 1 
		: window.innerWidth / props.frameW;
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
