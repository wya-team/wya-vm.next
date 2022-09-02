<template>
	<div class="vm-basic-area-editor">
		<div
			class="vm-basic-arer-editor__content"
			style="padding-top: 20px; padding-left: 10px;"
		>
			<Button
				:disabled="!$attrs.src"
				type="primary"
				@click="handleClick"
			>
				绘制热区
			</Button>
		</div>
	</div>
</template>
<script setup>
import { useAttrs } from 'vue';
import { Button } from '@wya/vc';
import { cloneDeep } from 'lodash';
import { Paint } from "./popup";

const attrs = useAttrs();
const emit = defineEmits(['change']);

const positionTransform = (list, old = 500, now = 375) => {
	return cloneDeep(list).map(item => {
		item.x = (item.x / old) * now;
		item.y = (item.y / old) * now;
		item.w = (item.w / old) * now;
		item.h = (item.h / old) * now;
		return item;
	});
};

const handleClick = async () => {
	const res = await Paint.popup({
		src: attrs.src,
		list: positionTransform(attrs.list, 375, 500)
	});

	emit('change', { list: positionTransform(res) });
};
</script>

<style lang="scss">
</style>
