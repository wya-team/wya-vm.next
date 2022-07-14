<template>
	<div class="vm-editor-color">
		<ColorPicker v-model="currentValue" :alpha="alpha" @change="handleSelect" />
		<div class="vm-editor-color__reset" @click="handleReset">
			重置
		</div>
	</div>
</template>
<script setup>
import { watch, ref } from 'vue';
import { ColorPicker } from '@wya/vc';

const emit = defineEmits(['change', 'update:modelValue']);
const props = defineProps({
	color: String,
	alpha: {
		type: Boolean,
		default: false,
	},
	default: String
});

const currentValue = ref('');

const sync = () => {
	emit('update:modelValue', currentValue.value);
	emit('change', currentValue.value);
};

const handleSelect = () => {
	sync();
};

const handleReset = () => {
	currentValue.value = props.default;
	sync();
};

watch(
	() => props.color,
	(v) => {
		if (currentValue.value !== v) {
			currentValue.value = v;
		}
	},
	{
		immediate: true,
	}
);
</script>
<style lang="scss">

$block: vm-editor-color;
$c54: #5495F6;
@include block($block) {
	display: flex;
	justify-content: flex-start;
	align-items: center;
	@include element(reset){
		cursor: pointer;
		margin-left: 10px;
		display: inline-block;
		padding:2px;
		width: 30px;
		height: 32px;
		line-height: 32px;
		text-align: center;
		color: $c54;
		font-size: 12px;
	}
}
</style>
