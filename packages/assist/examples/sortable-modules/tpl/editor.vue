<template>
	<EditorLayout title="TPL" class="vm-basic-TPL-editor">
		<EditorCell label="填充方式：" multiple>
			<EditorRadio
				:model-value="$attrs.inner"
				:data-source="paddingRadios"
				@change="v => handleChange(v, 'inner')"
			/>
		</EditorCell>
		<EditorCell label="上下边距：">
			<EditorSlider
				:model-value="$attrs.paddingVertical"
				@change="v => handleChange(v, 'paddingVertical')"
			/>
		</EditorCell>
		<EditorCell label="左右边距：">
			<EditorSlider
				:model-value="$attrs.paddingHorizontal"
				@change="v => handleChange(v, 'paddingHorizontal')"
			/>
		</EditorCell>
		<EditorCell label="圆角：">
			<EditorSlider
				:model-value="$attrs.borderRadius"
				@change="v => handleChange(v, 'borderRadius')"
			/>
		</EditorCell>

		<EditorCell label="内容：">
			<EditorInput
				:model-value="$attrs.content"
				@change="v => handleChange(v, 'content')"
			/>
		</EditorCell>
		<EditorCell :label-width="100" label="卡片背景：" multiple>
			<EditorRadio
				:model-value="$attrs.backgroundType"
				:data-source="radios"
				@change="v => handleChange(v, 'backgroundType')"
			/>
			<div style="margin-top: 10px;">
				<div v-show="$attrs.backgroundType == 1">
					<EditorColor
						:color="$attrs.backgroundColor"
						default="#fff"
						alpha
						@change="v => handleChange(v, 'backgroundColor')"
					/>
				</div>
				<div v-show="$attrs.backgroundType == 2">
					<EditorUploadPicker
						:model-value="$attrs.backgroundImage ? [$attrs.backgroundImage] : []"
						tips="建议宽度750像素"
						@change="v => handleChange(v[0], 'backgroundImage')"
					/>
				</div>
			</div>
		</EditorCell>
	</EditorLayout>
</template>

<script setup>
import {
	EditorRadio,
	EditorCell,
	EditorLayout,
	EditorSlider,
	EditorInput,
	EditorColor,
	EditorUploadPicker
} from "../../../src/editor";

const emit = defineEmits(['change']);
const paddingRadios = [
	{
		label: '外填充',
		value: 0,

	},
	{
		label: '内填充',
		value: 1,
	}
];
const radios = [
	{
		label: '纯色背景',
		value: 1,

	},
	{
		label: '自定义背景图',
		value: 2,
	}
];

const handleChange = (value, key) => {
	emit('change', { [key]: value });
};
</script>

<style lang="scss">
$block: vm-basic-tpl-editor;

@include block($block) {
	// any
}
</style>
