<template>
	<div class="vm-editor-header">
		{{ title }}
	</div>
</template>
<script>
export default {
	name: 'vm-editor-header',
	props: {
		title: String
	}
};
</script>
<style lang="scss">

$block: vm-editor-header;

@include block($block) {
	width: 100%;
	font-size: 14px;
	padding: 20px 16px;
	color: #333;
	border-bottom: 1px solid #cdcdcd;
}
</style>
