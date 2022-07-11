<template>
	<div
		:style="style"
		:draggable="draggable"
		@dragstart="draggable && handleStart($event)"
	>
		<slot />
	</div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
	draggable: {
		type: Boolean,
		default: true
	},
	/**
	 * 模块名
	 */
	module: {
		type: String,
		required: true
	},

	/**
	 * data函数时使用
	 */
	transferData: {
		type: [Object, Array, String, Number, Boolean],
		default: undefined
	},

	// 从组件控件拖入到视图时识别的 start-> setData 和 enter -> getData
	transferKey: {
		type: String,
		default: "@wya/vm"
	}

});

const style = computed(() => {
	return props.draggable 
		? { cursor: 'move' }
		: {};
});

const handleStart = (e) => {
	e.dataTransfer.setData(
		props.transferKey, 
		JSON.stringify({
			module: props.module,
			data: props.transferData
		})
	);
};
</script>
