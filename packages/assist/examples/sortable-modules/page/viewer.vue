<template>
	<div class="vm-basic-page-viewer" />
</template>

<script setup>
import { onMounted, watch } from 'vue';

const props = defineProps({
	id: String,
	title: [Object, String],
	backgroundColor: String,
	backgroundType: Number,
	backgroundImage: {
		type: Array,
		default: () => []
	},
	vm: {
		type: Object,
		default: () => ({})
	}
});

let page;
const getPage = () => {
	return new Promise((resolve) => {
		if (!page) {
			if (props.vm.type === 'frame') { // 所有页面编辑状态
				page = document.querySelector('.vm-frame-sortable__wrapper');
			} else { // 覆盖页展示及预览状态
				page = document.querySelector('.vm-assist-preview');
			}
		}
		resolve();
	});
};

watch(
	() => props.backgroundType,
	(v) => {
		getPage().then(() => {
			if (v == 1) {
				page && (page.style.backgroundImage = 'none');
				page && (page.style.backgroundColor = props.backgroundColor);
			} else {
				page && (page.style.backgroundColor = 'transparent');
				page && (page.style.backgroundImage = `url('${props.backgroundImage[0]}')`);
				page && (page.style.backgroundRepeat = `no-repeat`);
				page && (page.style.backgroundSize = `cover`);
			}
		});
	},
	{
		immediate: true
	}
);

watch(
	() => props.backgroundColor,
	(v) => {
		getPage().then(() => {
			page && (page.style.backgroundColor = v);
		});
	},
	{
		immediate: true
	}
);

watch(
	() => props.backgroundType,
	(v) => {
		if (props.backgroundType == 1) return;
		getPage().then(() => {
			page && (page.style.backgroundImage = `url('${v && v[0]}')`);
		});
	},
	{
		immediate: true
	}
);

onMounted(() => getPage());
</script>

<style lang="scss">
$block: vm-basic-page-viewer;

@include block($block) {
	width: 100%;
	height: 100%;
}

</style>
