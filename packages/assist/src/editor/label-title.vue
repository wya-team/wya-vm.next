<template>
	<div class="vm-editor-label-title">
		{{ label }}
	</div>
</template>
<script setup>
defineProps({
	label: {
		type: String,
		default: ''
	}
});
</script>
<style lang="scss">

$block: vm-editor-label-title;
$c51: #515151;
@include block($block) {
	font-size: 12px;
	color: $c51;
	line-height: 22px;
}
</style>
