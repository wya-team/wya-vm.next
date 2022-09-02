<template>
	<div :style="[{ height: `${h ? `${h}px` : 'auto' }`, width: `${w ? `${w}px` : 'auto' }`, color: 'black' }]">
		<div style="padding: 1px 0 0 1px;">
			<span style="padding: 1px 4px; color: #fff; background: #5495f6;">
				热区{{ index + 1 }}
			</span>
		</div>
	</div>
</template>

<script setup>

defineProps({
	id: String,
	x: Number,
	y: Number,
	z: Number,
	w: Number,
	h: Number,
	r: Number,
	index: Number
});
</script>
