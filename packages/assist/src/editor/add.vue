<template>
	<div class="vm-editor-add">
		<SortList
			:model-value="currentValue"
			:mask="false"
			:value-key="valueKey"
			v-bind="$attrs"
			class="vm-editor-add__sorts"
			@change="handleChange"
		>
			<template #default="{ it, index }">
				<div class="vm-editor-add__item">
					<Icon
						v-if="typeof it.closeable === 'undefined' || it.closeable"
						type="error"
						class="vm-editor-add__close"
						@click="handleDelete(index)"
					/>
					<slot :it="it" :index="index" />
				</div>
			</template>
		</SortList>
		<div
			v-if="max === 0 || modelValue.length < max"
			class="vm-editor-add__btn"
			@click="handleAdd"
		>
			<div class="vm-editor-add__btn--operate">
				<Icon
					type="plus"
					style="position: relative; top: -1px;"
				/>
				<span>{{ addText }}</span>
			</div>
			<span 
				v-if="tip" 
				class="vm-editor-add__btn--tip"
			>{{ tip }}</span>
		</div>
	</div>
</template>
<script setup>
import { watch, ref } from 'vue';
import { Icon, SortList } from '@wya/vc';

const emit = defineEmits(['change', 'add', 'update:modelValue']);
const props = defineProps({
	modelValue: {
		type: Array,
		default: () => ([])
	},
	addText: {
		type: String,
		default: '添加选项'
	},
	tip: {
		type: String,
		default: ''
	},

	// max为0时可以无限选择
	max: {
		type: Number,
		default: 0
	},

	// max为0时可以无限选择
	valueKey: {
		type: String,
		default: '_id'
	},
});

const currentValue = ref([]);

const sync = () => {
	emit('update:modelValue', currentValue.value);
	emit('change', currentValue.value);
};
const handleDelete = (index) => {
	currentValue.value.splice(index, 1);
	
	sync();
};

const handleAdd = () => {
	emit('add', currentValue.value);
};

const handleChange = (v) => {
	currentValue.value = v;
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
$block: vm-editor-add;

@include block($block) {
	@include element(sorts) {
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
	}
	@include element(item) {
		/* height: 83px; */
		border: 1px dashed #e8e8e8;
		padding: 10px;
		margin-right: 10px;
		position: relative;
		display: flex;

		/* 避免被SortList覆盖 */
		text-align: left !important;
	}
	@include element(close) {
		position: absolute;
		right: -8px;
		top: -8px;
		color: #999;
		font-size: 16px;
		z-index: 999;
		cursor: pointer;
	}
	@include element(btn) {
		margin: 15px 20px 0 10px;;
		padding: 8px 0;

		border: 1px dashed #e8e8e8;
		background: #F8F8F8;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		cursor: pointer;

		@include modifier(operate) {
			color: #5495F6;
		}
	}
}
</style>
