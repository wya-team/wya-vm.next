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
	</EditorLayout>
</template>

<script setup>
import {
	EditorRadio,
	EditorCell,
	EditorLayout,
	EditorSlider,
	EditorInput
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

const handleChange = (value, key) => {
	emit('change', { [key]: value });
};
</script>

<style lang="scss">
$block: vm-basic-TPL-editor;
@include block($block) {
	
}
</style>
