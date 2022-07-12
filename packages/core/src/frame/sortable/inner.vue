<template>
	<div class="vm-frame-sortable--inner">
		<slot name="content" />
	</div>
</template>

<script setup>
defineProps({
	hasPage: Boolean
});
</script>

<style lang="scss">
@import "../../style/index.scss";

$block: vm-frame-sortable--inner;

@include block($block) {
	position: relative;
	display: flex;
	overflow: auto;
	flex: 1;
	align-items: center;
	justify-content: center;
}
</style>