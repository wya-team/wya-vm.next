<template>
	<div v-if="currentValue.length > 0" class="vm-editor-sort-list">
		<div
			v-for="(item, i) in currentValue"
			:key="i"
			class="vm-editor-sort-list__content"
		>
			<p>{{ item.label }}</p>
			<div class="vm-editor-sort-list__select">
				<Radio
					v-model="item.show"
					:data-source="showList"
				/>
			</div>
			<div class="vm-editor-sort-list__form">
				<Input
					v-model="item.name"
					:maxlength="maxlength"
					:indicator="{ inline: true }"
					:bytes="item.bytes"
					placeholder="为空展示默认文案"
					class="vm-editor-sort-list__item"
				/>
				<div class="vm-editor-sort-list__sort-icon">
					<Icon
						v-if="i !== 0"
						type="triangle-up"
						@click="handleSort(i, true)"
					/>
					<Icon
						v-if="i !== currentValue.length -1"
						type="triangle-down"
						@click="handleSort(i)"
					/>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup>
import { watch, ref } from 'vue';
import { Input, Icon } from '@wya/vc';
import Radio from './radio.vue';

const emit = defineEmits(['change', 'update:modelValue']);
const props = defineProps({
	modelValue: {
		type: Array,
		default: () => []
	},
	maxlength: {
		type: Number,
		default: 6
	}
});

const showList = [
	{
		label: '显示',
		value: 1
	},
	{
		label: '隐藏',
		value: 0
	}
];

const currentValue = ref([]);

const sync = () => {
	emit('update:modelValue', currentValue.value);
	emit('change', currentValue.value);
};

const handleSort = (i, isUp) => {
	let changeIndex = isUp ? i - 1 : i + 1;
	currentValue.value.splice(
		i, 
		1, 
		...currentValue.value.splice(changeIndex, 1, currentValue.value[i])
	);

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

$block: vm-editor-sort-list;
$c51: #515151;
@include block($block) {
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	@include element(content) {
		margin-bottom: 12px;
		>p {
			font-size: 12px;
			color: $c51;
			line-height: 22px;
		}
		@include element(select) {
			margin-top: 6px;
		}
		@include element(form) {
			margin-top: 10px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			@include element(item) {
				width: 240px;
				display: flex;
				justify-content: space-between;
				align-items: center;
				border-radius: 4px;
				padding: 2px;
				font-size: 12px;
				color: #333;
			}
			@include element(sort-icon) {
				padding: 0 10px;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				align-items: center;
			}
		}

	}

}
</style>
