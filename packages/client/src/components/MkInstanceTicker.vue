<template>
<div v-tooltip="tooltip" class="hpaizdrt" :style="bg">
	<img v-if="instance.faviconUrl" class="icon" :src="instance.faviconUrl"/>
	<span class="name">{{ instance.name }}</span>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import { instanceName, version, software } from '@/config';
import { instance as Instance } from '@/instance';
import { getProxiedImageUrlNullable } from '@/scripts/media-proxy';

const props = defineProps<{
	instance?: {
		faviconUrl?: string
		name: string
		themeColor?: string
		softwareName?: string;
		softwareVersion?: string;
	}
}>();

// if no instance data is given, this is for the local instance
const instance = props.instance ?? {
	faviconUrl: getProxiedImageUrlNullable(Instance.iconUrl) ?? getProxiedImageUrlNullable(Instance.faviconUrl) ?? '/favicon.ico',
	name: instanceName,
	themeColor: (document.querySelector('meta[name="theme-color-orig"]') as HTMLMetaElement).content,
	softwareName: software,
	softwareVersion: version,
};

const tooltip = instance.softwareName == null || instance.softwareVersion == null
	? null
	: instance.softwareName + ' ' + instance.softwareVersion;

const themeColor = instance.themeColor ?? '#777777';

const bg = {
	background: `linear-gradient(90deg, ${themeColor}, ${themeColor}00)`,
};
</script>

<style lang="scss" scoped>
.hpaizdrt {
	$height: 1.1rem;

	height: $height;
	border-radius: 4px 0 0 4px;
	overflow: hidden;
	color: #fff;
	text-shadow: /* .866 ≈ sin(60deg) */
		1px 0 1px #000,
		.866px .5px 1px #000,
		.5px .866px 1px #000,
		0 1px 1px #000,
		-.5px .866px 1px #000,
		-.866px .5px 1px #000,
		-1px 0 1px #000,
		-.866px -.5px 1px #000,
		-.5px -.866px 1px #000,
		0 -1px 1px #000,
		.5px -.866px 1px #000,
		.866px -.5px 1px #000;

	> .icon {
		height: 100%;
	}

	> .name {
		margin-left: 4px;
		line-height: $height;
		font-size: 0.9em;
		vertical-align: top;
		font-weight: bold;
	}
}
</style>
