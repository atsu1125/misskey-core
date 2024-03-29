<template>
<XColumn :menu="menu" :column="column" :is-stacked="isStacked" :indicated="indicated" @change-active-state="onChangeActiveState" @parent-focus="$event => emit('parent-focus', $event)">
	<template #header>
		<i v-if="column.tl === 'home'" class="fas fa-home"></i>
		<i v-else-if="column.tl === 'local'" class="fas fa-comments"></i>
		<i v-else-if="column.tl === 'media'" class="fas fa-camera"></i>
		<i v-else-if="column.tl === 'global'" class="fas fa-globe"></i>
		<span style="margin-left: 8px;">{{ column.name }}</span>
	</template>

	<div v-if="disabled || (column.tl === 'local' && !enableLTL) || (column.tl === 'media' && (!enableMTL || !enableLTL)) || (column.tl === 'global' && !enableGTL)" class="iwaalbte">
		<p>
			<i class="fas fa-minus-circle"></i>
			{{ i18n.ts.disabledTimelineTitle }}
		</p>
		<p class="desc">{{ i18n.ts.disabledTimelineDescription }}</p>
	</div>
	<XTimeline v-else-if="column.tl" ref="timeline" :key="column.tl" :src="column.tl" @after="() => emit('loaded')" @queue="queueUpdated" @note="onNote"/>
</XColumn>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import XColumn from './column.vue';
import { removeColumn, updateColumn, Column } from './deck-store';
import XTimeline from '@/components/MkTimeline.vue';
import * as os from '@/os';
import { $i } from '@/account';
import { instance } from '@/instance';
import { i18n } from '@/i18n';
import { defaultStore } from '@/store';

const props = defineProps<{
	column: Column;
	isStacked: boolean;
}>();

const emit = defineEmits<{
	(ev: 'loaded'): void;
	(ev: 'parent-focus', direction: 'up' | 'down' | 'left' | 'right'): void;
}>();

let disabled = $ref(false);
let indicated = $ref(false);
let columnActive = $ref(true);
let enableMTL = $ref(false);
let enableLTL = $ref(false);
let enableGTL = $ref(false);

onMounted(() => {
	if (props.column.tl == null) {
		setType();
	} else if ($i) {
		disabled = !$i.isModerator && !$i.isAdmin && (
			instance.disableLocalTimeline && ['local', 'media'].includes(props.column.tl) ||
			instance.disableGlobalTimeline && ['global'].includes(props.column.tl));
	}
	enableLTL = defaultStore.state.enableLTL;
	enableMTL = defaultStore.state.enableMTL;
	enableGTL = defaultStore.state.enableGTL;
});

async function setType() {
	const { canceled, result: src } = await os.select({
		title: i18n.ts.timeline,
		items: [{
			value: 'home' as const, text: i18n.ts._timelines.home,
		}, {
			value: 'local' as const, text: i18n.ts._timelines.local,
		}, {
			value: 'media' as const, text: i18n.ts._timelines.media,
		}, {
			value: 'global' as const, text: i18n.ts._timelines.global,
		}],
	});
	if (canceled) {
		if (props.column.tl == null) {
			removeColumn(props.column.id);
		}
		return;
	}
	updateColumn(props.column.id, {
		tl: src,
	});
}

function queueUpdated(q) {
	if (columnActive) {
		indicated = q !== 0;
	}
}

function onNote() {
	if (!columnActive) {
		indicated = true;
	}
}

function onChangeActiveState(state) {
	columnActive = state;

	if (columnActive) {
		indicated = false;
	}
}

const menu = [{
	icon: 'fas fa-pencil-alt',
	text: i18n.ts.timeline,
	action: setType,
}];
</script>

<style lang="scss" scoped>
.iwaalbte {
	text-align: center;

	> p {
		margin: 16px;

		&.desc {
			font-size: 14px;
		}
	}
}
</style>
