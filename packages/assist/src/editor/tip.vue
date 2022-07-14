<template>
	<div class="vm-editor-tip">
		{{ title || content || value }}
	</div>
</template>
<script setup>
defineProps({
	title: String,
	value: String,
	content: String,
});
</script>
<style lang="scss">

$block: vm-editor-tip;

@include block($block) {
	margin-top: 10px;
	margin-left: 14px;
	margin-right: 20px;
	color: #999;
	font-size: 12px;
}
</style>
