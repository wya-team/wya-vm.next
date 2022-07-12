<template>
	<div class="vm-zoom-bar vm-hack-editor" :style="{ height: `${h}px` }">
		<div class="vm-zoom-bar__wrapper">
			<Select
				v-model="currentScale"
				:placeholder="currentPlaceholder"
				:portal-class-name="['vm-zoom-bar__select', { 'is-dark': theme === 'dark' }]"
				:data-source="options"
				style="width: 75px;"
				@change="handleChangeScale"
			/>
			<Slider
				v-model="currentScale"
				:step="0.01"
				:min="0.5"
				:max="2"
				:formatter="v => (v * 100).toFixed(0) + '%'"
				style="width: 160px; margin-right: 15px; margin-left: 16px;"
				@change="handleChangeScale"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { Slider, Select } from '@wya/vc';
import { getInstance } from '../../utils/get-instance';

const OPTIONS = [
	{
		label: '10%',
		value: 0.1
	},
	{
		label: '50%',
		value: 0.5
	},
	{
		label: '100%',
		value: 1
	},
	{
		label: '150%',
		value: 1.5
	},
	{
		label: '200%',
		value: 2
	}
];

const emit = defineEmits(['change', 'update:scale']);
const props = defineProps({
	scale: {
		type: Number,
		default: 1
	},
	theme: String,

	h: {
		type: Number,
		default: 0
	},

	frameW: {
		type: Number,
		default: 0
	},

	frameH: {
		type: Number,
		default: 0
	},

	clientW: {
		type: Number,
		default: 0
	},

	clientH: {
		type: Number,
		default: 0
	},

	borderSize: {
		type: Object,
		default() {
			return {
				top: 0,
				left: 0,
				bottom: 0,
				right: 0
			};
		}
	}
});

const currentScale = ref(1);
const currentPlaceholder = ref('');
const combo = getInstance('combo', 'VMComboId');

const autoScale = computed(() => {
	let { frameW, frameH, clientW, clientH, borderSize } = props;
	
	if (!frameW 
		|| !frameH 
		|| !clientW 
		|| !clientH
	) {
		return 1;
	}

	return Math.min(
		(clientW - borderSize.left - borderSize.right) / frameW, 
		(clientH - borderSize.top - borderSize.bottom) / frameH, 
		1
	);
});

const options = computed(() => {
	if (!autoScale.value 
		|| OPTIONS.some(i => i.value === autoScale.value)
	) {
		return OPTIONS;
	}

	return OPTIONS.concat([
		{
			label: '自适应',
			value: autoScale.value
		}
	]);
});

const handleChangeScale = () => {
	emit('update:scale', currentScale.value);
};


/**
 * pageEditor变化在store中有被调用
 * TODO: 去掉延迟
 * TODO: showRuler为false时，无效
 *
 * @param {number} delay ~
 */
const resetScale = (delay = 0) => {
	setTimeout(() => {
		currentScale.value = autoScale.value;
		emit('update:scale', currentScale.value);
	}, delay);
};

watch(
	() => props.scale,
	(v) => {
		currentScale.value = v;
		currentPlaceholder.value = (v * 100).toFixed(0) + '%';
	},
	{
		immediate: true,
	}
);

onMounted(() => {
	resetScale(0);

	// 特殊API
	combo && (combo.proxy.resetScale = resetScale);
});


</script>

<style lang="scss">
@import "../../style/index.scss";

$block: vm-zoom-bar;

@include block($block) {
	z-index: 2;
	background: $theme-light-zoom-bg;
	box-shadow: 0 -2px 10px 0 rgba(0, 0, 0, 0.08);

	@include element(wrapper) {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}
}
</style>
