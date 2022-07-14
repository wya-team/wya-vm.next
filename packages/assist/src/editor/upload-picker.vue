<template>
	<div class="vm-editor-upload-picker">
		<UploadPicker
			ref="upload-picker"
			v-model="currentValue"
			:max="max"
			:upload-options="uploadOptions"
			@change="handleChange"
			@error="handleError"
		/>
		<p class="vm-editor-upload-picker__tip">
			{{ tip }}
		</p>
	</div>
</template>
<script setup>
import { watch, ref } from 'vue';
import { UploadPicker } from '@wya/vc';

const props = defineProps({
	modelValue: {
		type: Array,
		default: () => []
	},
	uploadOptions: {
		type: Object,
		default: () => {
			return {
				multiple: false
			};
		}
	},
	max: {
		type: Number,
		default: 1
	},
	tip: {
		type: String,
		default: ''
	}
});

const currentValue = ref([]);

const sync = () => {
	emit('update:modelValue', currentValue.value);
	emit('change', currentValue.value);
};

const handleError = (error) => {
	console.log(error);
};

const handleChange = () => {
	sync();
};
watch(
	() => props.modelValue,
	(v) => {
		if (currentValue.value !== v) {
			currentValue.value = v;

			// if (v.length && oldV.length) {
			// 	setTimeout(() => {
			// 		uploadPicker.reset(this.currentValue);
			// 	}, 0);
			// }
		}
	},
	{
		immediate: true,
	}
);
</script>
<style lang="scss">

$block: vm-editor-upload-picker;
$c51: #515151;
@include block($block) {
	@include element(tip){
		font-size: 12px;
		color: #999999;
	}
}
</style>
