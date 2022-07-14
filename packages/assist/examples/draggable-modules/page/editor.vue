<template>
	<div style="display: flex; flex-direction: column;">
		<div style="padding: 20px;">
			<span>屏幕大小：</span>
			<!-- 使用v-model会提示它是个readonly, 尽量不使用v-model, 这里直接改成呢个model-value是一样的， 因为修改数值始终通过change事件 -->
			<InputNumber
				:model-value="$attrs.w"
				style="width: 88px; margin-right: 23px;"
				@input="e => handleChange(e, 'w')"
			/>

			<!-- 这个与$attrs不同，它修改不会报提示 -->
			<InputNumber
				v-model="attrs.h"
				style="width: 88px;"
				@input="e => handleChange(e, 'h')"
			/>
		</div>
	</div>
</template>

<script setup>
import { InputNumber } from '@wya/vc';
import { useAttrs } from '../../../src/hooks';

const attrs = useAttrs();
const emit = defineEmits(['change']);

const handleChange = (v, key) => {
	emit('change', { [key]: v });
};
</script>

<style lang="scss">
</style>
