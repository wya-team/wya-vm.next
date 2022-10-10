<template>
	<div class="vm-editor-checkboxes">
		<Checkbox.Group
			v-model="currentValue"
			:class="column ? 'is-column' : ''"
			class="vm-editor-checkboxes__group"
			@change="handleChange"
		>
			<Checkbox
				v-for="(item, index) in dataSource"
				:key="index"
				:label="item.value"
				:disabled="item.disabled || false"
				class="vm-editor-checkboxes__item"
			>
				<span>{{ item.label }}</span>
			</Checkbox>
		</Checkbox.Group>
	</div>
</template>
<script setup>
import { watch, ref } from 'vue';
import { Checkbox } from '@wya/vc';

const emit = defineEmits(['change', 'update:modelValue']);
defineProps({
	dataSource: {
		type: Array,
		default: () => []
	},
	modelValue: {
		type: Array,
		default: () => []
	},
	column: {
		type: Boolean,
		default: false
	}
});

const currentValue = ref([]);
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

$block: vm-editor-checkboxes;

@include block($block) {
	@include element(group) {
		display: flex;

		@include element(item) {
			margin-right: 20px;

			>span:last-child {
				padding-left: 8px;
			}
		}

		@include when(column) {
			flex-direction: column;

			@include element(item) {
				margin-bottom: 15px;
			}
		}
	}
}
</style>
