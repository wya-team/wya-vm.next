<template>
	<div style="display: flex; flex-direction: column;">
		<div style="padding: 20px;">
			<span>屏幕大小：</span>
			<InputNumber
				:model-value="$attrs.w"
				style="width: 88px; margin-right: 23px;"
				@input="e => handleChange(e, 'w')"
			/>
			<InputNumber
				v-model="$attrs.h"
				style="width: 88px;"
				@input="e => handleChange(e, 'h')"
			/>
		</div>
	</div>
</template>

<script setup>
import { InputNumber } from '@wya/vc';

const emit = defineEmits(['change']);

const handleChange = (v, key) => {
	emit('change', { [key]: v });
};
</script>

<style lang="scss">
</style>
