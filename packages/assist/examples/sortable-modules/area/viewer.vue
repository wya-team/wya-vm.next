<template>
	<ViewerLayout class="vm-basic-area-viewer">
		<img
			:src="src"
			style="width: 100%;"
			class="vm-basic-area-viewer__bac"
		>
		<a
			v-for="(item, index) in formatterValue"
			:key="index"
			:style="[{
				height: `${item.h}px`,
				width: `${item.w}px`,
				left: `${item.x}px`,
				top: `${item.y}px`,
				'z-index': `${item.z}`,
				border: vm.type === 'frame' ? '1px dashed #5495F6' : 'none'
			}]"
			:to="item.path"
			class="vm-basic-area-viewer__item"
		>
			<div v-show="vm.type === 'frame'">
				<span style="padding: 1px 4px; color: #fff; white-space: nowrap; background: #5495f6;">
					热区{{ index + 1 }}
				</span>
			</div>
		</a>
	</ViewerLayout>
</template>

<script setup>
import { computed } from 'vue';
import { cloneDeep } from 'lodash';
import { ViewerLayout } from "../../../src/viewer";

const props = defineProps({
	src: String,
	list: Array,
	vm: {
		type: Object,
		default: () => ({})
	}
});

const formatterValue = computed(() => {
	let arr = cloneDeep(props.list);
	let screenW = props.vm.type === 'frame' ? 375 : window.innerWidth;
	return arr.map(item => {
		item.w = (item.w / 375) * screenW;
		item.h = (item.h / 375) * screenW;
		item.x = (item.x / 375) * screenW;
		item.y = (item.y / 375) * screenW;
		return item;
	});
});

</script>

<style lang="scss">
$block: vm-basic-area-viewer;

@include block($block) {
	position: relative;
	z-index: 0;
	background: #fff;

	@include element(item) {
		position: absolute;
		display: inline-block;
	}
}
</style>
