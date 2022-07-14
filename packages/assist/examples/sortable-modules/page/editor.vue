<template>
	<EditorLayout
		title="页面设置"
		class="vm-basic-page-editor"
	>
		<EditorCell v-if="$attrs.titleEditable == 1" label="页面标题：" multiple>
			<Input
				:model-value="$attrs.title"
				:indicator="{ inline: true }"
				:maxlength="10"
				@input="v => handleChange(v, 'title')"
			/>
		</EditorCell>

		<EditorCell label="页面背景：" multiple>
			<EditorRadio
				:model-value="$attrs.backgroundType"
				:data-source="radios"
				@change="v => handleChange(v, 'backgroundType')"
			/>
			<div style="margin-top: 10px">
				<div v-show="$attrs.backgroundType == 1">
					<EditorColor
						:color="$attrs.backgroundColor"
						default="#f2f2f2"
						alpha
						@change="v => handleChange(v, 'backgroundColor')"
					/>
				</div>
				<div v-show="$attrs.backgroundType == 2">
					<EditorUploadPicker
						:model-value="$attrs.backgroundImage"
						tips="建议宽度750像素"
						@change="handleImageChange"
					/>
				</div>
			</div>
		</EditorCell>
	</EditorLayout>
</template>

<script setup>
import { Input } from "@wya/vc";
import { EditorCell, EditorRadio, EditorLayout, EditorColor, EditorUploadPicker } from "../../../src/editor";
import { getImagesSize } from "../../../src/utils";

const emit = defineEmits(['change']);
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

const handleImageChange = async (value) => {
	handleChange(value, 'backgroundImage');
	const sizes = await getImagesSize(value);

	// 避免异步后被重置，不取闭包下的value
	const size = sizes[attrs.backgroundImage];
	if (size) {
		handleChange(size.width, 'imageWidth');
		handleChange(size.height, 'imageHeight');
	}
};
</script>

<style lang="scss">
$block: vm-basic-page-editor;
@include block($block) {
	@include element(divider){
		position: relative;
		top: -.06em;
		display: inline-block;
		width: 1px;
		height: .9em;
		margin: 0 4px;
		vertical-align: middle;
		box-sizing: border-box;
		padding: 0;
		font-size: 14px;
		font-variant: tabular-nums;
		line-height: 1.5;
		list-style: none;
		font-feature-settings: "tnum","tnum";
		background: #e8e8e8;
	}
}
</style>
