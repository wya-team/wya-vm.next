<template>
	<div class="vm-editor-input-number">
		<Input.Number
			v-model="currentValue"
			:max="max"
			:min="min"
			:step="step"
			:placeholder="placeholder"
			class="vm-editor-input-number__input"
			@change="handleChange"
		/>
	</div>
</template>
<script setup>
import { watch, ref } from 'vue';
import { Input } from '@wya/vc';

const emit = defineEmits(['change', 'update:modelValue']);
defineProps({
	value: [String, Number],
	min: {
		type: Number,
		default: 0,
	},
	max: {
		type: Number,
		default: 100,
	},
	step: {
		type: [Number, Boolean],
		default: 0, // 为0时不展示
	},
	placeholder: {
		type: String,
		default: '请输入'
	}
});

const currentValue = ref('');
const handleChange = () => {
	emit('update:modelValue', currentValue.value);
	emit('change', currentValue.value);
};
watch(
	() => props.value,
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

$block: vm-editor-input-number;
$c54: #5495F6;
$cb6: #b6b6b6;

@include block($block) {
	width: 240px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border: 1px solid $cb6;
	border-radius: 4px;
	padding: 2px;
	@include element(input) {
		font-size: 12px;
		color: #333;
	}
	> span {
		flex: 0 0 30px;
		padding: 0 2px;
		line-height: 24px;
		text-align: right;
		color: #AAAAAA;
		font-style: 12px;
	}
}
</style>
