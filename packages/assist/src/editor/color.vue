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
	modelValue: String,
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
	() => props.modelValue,
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
$c54: #5495f6;

@include block($block) {
	display: flex;
	justify-content: flex-start;
	align-items: center;

	@include element(reset) {
		display: inline-block;
		width: 30px;
		height: 32px;
		padding: 2px;
		margin-left: 10px;
		font-size: 12px;
		line-height: 32px;
		color: $c54;
		text-align: center;
		cursor: pointer;
	}
}
</style>
