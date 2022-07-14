<template>
	<ViewerLayout class="vm-basic-TPL-viewer">
		{{ id }} : {{ content || '请在右侧输入内容' }}
	</ViewerLayout>
</template>

<script setup>
import { ViewerLayout } from "../../../src/viewer";

defineProps({
	id: String,
	content: String,
});
</script>

<style lang="scss">
$block: vm-basic-TPL-viewer;

@include block($block) {
	
}
</style>
