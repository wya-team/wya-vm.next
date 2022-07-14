<template>
	<div style="display: flex; flex-direction: column;" class="v-x">
		<div>w: <input :value="$attrs.w" @input="handleChange($event, 'w')"></div>
		<div>h: <input :value="$attrs.h" @input="handleChange($event, 'h')"></div>
		<div>x: <input :value="$attrs.x" @input="handleChange($event, 'x')"></div>
		<div>y: <input :value="$attrs.y" @input="handleChange($event, 'y')"></div>
		<div>z: <input :value="$attrs.z" @input="handleChange($event, 'z')"></div>
		<div>r: <input :value="$attrs.r" @input="handleChange($event, 'r')"></div>
		<div>name: <input :value="$attrs.name" @input="handleChange($event, 'name')"></div>
	</div>
</template>

<script setup>
const emit = defineEmits(['change']);
const handleChange = (e, key) => {
	emit('change', { [key]: e.target.value });
};
</script>

<style lang="scss">
.v-x {
	input {
		margin: 10px;
		border: 1px solid #000;
	}
}
</style>
