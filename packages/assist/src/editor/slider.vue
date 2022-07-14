<template>
	<div class="vm-editor-slider">
		<div class="vm-editor-slider__wrapper">
			<Slider
				:model-value="+currentValue"
				:step="step"
				:min="min"
				:max="max"
				@change="handleChange"
			/>
		</div>
		<div class="vm-editor-slider__content">
			<MInput.Number
				v-model="currentValue"
				:max="max"
				:min="min"
				:step="false"
				@change="handleChange"
			/>
		</div>
	</div>
</template>
<script setup>
import { ref, watch } from 'vue';
import { MInput, Slider } from '@wya/vc';

const emit = defineEmits(['change', 'update:modelValue']);
const props = defineProps({
	modelValue: {
		type: [Number, String],
		required: true
	},
	step: {
		type: Number,
		default: 1
	},
	min: {
		type: Number,
		default: 0
	},
	max: {
		type: Number,
		default: 30
	}
});

const currentValue = ref();
const handleChange = (v) => {
	currentValue.value = v;

	emit('update:modelValue', currentValue.value);
	emit('change', currentValue.value);
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

$block: vm-editor-slider;
$cb6: #b6b6b6;

@include block($block) {
	display: flex;
	justify-content: space-between;
	align-items: center;
	@include element(wrapper) {
		width: 190px;
		padding: 0 12px 0 0;
	}
	@include element(content) {
		width:52px;
		height: 28px;
		border: 1px solid $cb6;
		padding: 0 8px;
		border-radius: 4px;
	}

	.vcm-input__content input{
		font-size: 12px;
		height: 26px;
		line-height: 26px;
	}
}

</style>
