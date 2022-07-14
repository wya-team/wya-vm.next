<template>
	<div :class="{ 'is-select': isSelect }" class="vm-editor-input">
		<div :class="{ 'is-radio': radio }" class="vm-editor-input__label">
			<Checkbox
				v-if="checkbox"
				v-model="currentSelectValue"
				:true-value="trueValue"
				:false-value="falseValue"
				style="position: relative; top: -1px;"
				v-bind="checkboxOptions"
				@change="handleCheckChange"
			/>
			<Radio
				v-if="radio"
				v-model="currentSelectValue"
				:data-source="selects"
				style="flex: 1"
				@change="handleCheckChange"
			/>
			<span v-if="label" :style="[currentLabelStyle, labelStyle]">
				{{ label }}
			</span>
		</div>
		<Input
			v-model="currentInputValue"
			:maxlength="maxlength"
			:style="[currentInputStyle, inputStyle]"
			:indicator="indicator"
			clearable
			v-bind="inputOptions"
			@input="handleInputChange"
		/>
	</div>
</template>
<script setup>
import { watch, ref, computed } from 'vue';
import { Checkbox, Input } from '@wya/vc';
import Radio from './radio.vue';

const emit = defineEmits(['change', 'update:modelValue', 'select-change', 'input-change']);
const props = defineProps({
	modelValue: {
		type: [String, Array],
		default: ''
	},
	checkbox: {
		type: Boolean,
		default: false,
	},
	radio: {
		type: Boolean,
		default: false,
	},
	trueValue: {
		type: Number,
		default: 1,
	},
	falseValue: {
		type: Number,
		default: 0,
	},
	label: {
		type: String,
		default: ''
	},
	labelWidth: {
		type: Number,
		default: 0
	},
	labelStyle: Object,
	inputWidth: {
		type: Number,
		default: 240
	},
	inputStyle: Object,
	maxlength: {
		type: Number,
		default: 30
	},
	indicator: {
		type: [Boolean, Object],
		default: () => ({ inline: true })
	},
	checkboxOptions: Object,
	inputOptions: Object
});

const selects = [
	{
		label: '显示',
		value: 1
	},
	{
		label: '隐藏',
		value: 0
	}
];

const currentInputValue = ref('');
const currentSelectValue = ref(0);

const isSelect = computed(() => {
	return props.checkbox || props.radio || false;
});
const currentLabelStyle = computed(() => {
	const { checkbox, radio, labelWidth } = props;
	return {
		width: labelWidth ? `${labelWidth}px` : 'auto',
		textAlign: !checkbox && !radio ? 'right' : 'left',
	};
});
const currentInputStyle = computed(() => {
	const { inputWidth } = props;
	return {
		width: inputWidth ? `${inputWidth}px` : 'auto'
	};
});	


watch(
	() => props.modelValue,
	(v) => {
		if (!isSelect.value && typeof v === 'string') {
			currentInputValue.value = v;
		} else {
			currentInputValue.value = v[0];
			currentSelectValue.value = v[1];
		}
	},
	{
		immediate: true,
	}
);

const handleInputChange = (v) => {
	currentInputValue.value = v;
	const syncValue = isSelect.value ? [v, currentSelectValue.value] : v;

	emit('update:modelValue', syncValue);
	emit('change', syncValue);
	emit('input-change', v);
};

//  isSelect: true 下才有此回调
const handleCheckChange = (v) => {
	currentSelectValue.value = v;

	// ?
	const syncValue = [currentInputValue.value, v];
	emit('update:modelValue', syncValue);
	emit('change', syncValue);
	emit('select-change', currentInputValue.value);
};
</script>
<style lang="scss">

$block: vm-editor-input;

@include block($block) {
	position: relative;
	/* display: inline-block */;
	display: flex;

	@include element(label) {
		display: flex;
		align-items: center;
		@include when(radio) {
			flex-direction: row-reverse;
		}
	}

	@include when(select) {
		flex-direction: column;
	}
}
</style>
