<template>
	<div class="vm-editor-radio">
		<Radio.Group
			v-model="currentValue"
			:vertical="vertical"
			@change="handleChange"
		>
			<Radio
				v-for="(item, index) in dataSource"
				:key="index"
				:label="item.value"
			>
				<span>{{ item.label }}</span>
			</Radio>
		</Radio.Group>
	</div>
</template>
<script setup>
import { watch, ref } from 'vue';
import { Radio } from '@wya/vc';

const emit = defineEmits(['change', 'update:modelValue']);
const props = defineProps({
	dataSource: {
		type: Array,
		default: () => []
	},
	label: String,
	modelValue: [String, Number],
	 // 纵向排列模式
	vertical: {
		type: Boolean,
		default: false
	}
});
const currentValue = ref();
const handleChange = () => {
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

$block: vm-editor-radio;

@include block($block) {
	display: flex;
	align-items: center;
	line-height: 22px;
	.vc-radio {
		>span:last-child {
			display: inline-block;
			padding-right: 12px;
		}
	}
}
</style>
