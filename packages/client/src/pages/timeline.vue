<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="src" :actions="headerActions" :tabs="headerTabs" :display-my-avatar="true"/></template>
	<MkSpacer :content-max="800">
		<div ref="rootEl" v-hotkey.global="keymap" class="cmuxhskf">
			<XTutorial v-if="$store.reactiveState.tutorial.value != -1" class="tutorial _block"/>
			<XPostForm v-if="$store.reactiveState.showFixedPostForm.value" class="post-form _block" fixed/>

			<div v-if="queue > 0" class="new"><button class="_buttonPrimary" @click="top()">{{ i18n.ts.newNoteRecived }}</button></div>
			<div>
				<div v-if="(src === 'local' && !isLocalTimelineAvailable) || (src === 'media' && !isMediaTimelineAvailable) || (src === 'global' && !isGlobalTimelineAvailable)" class="iwaalbte">
					<p>
						<i class="fas fa-minus-circle"></i>
						{{ i18n.ts.disabledTimelineTitle }}
					</p>
					<p class="desc">{{ i18n.ts.disabledTimelineDescription }}</p>
				</div>
				<div v-else class="tl _block">
					<XTimeline
						ref="tl" :key="src"
						class="tl"
						:src="src"
						:sound="true"
						@queue="queueUpdated"
					/>
				</div>
			</div>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, computed, watch } from 'vue';
import XTimeline from '@/components/MkTimeline.vue';
import XPostForm from '@/components/MkPostForm.vue';
import { scroll } from '@/scripts/scroll';
import * as os from '@/os';
import { defaultStore } from '@/store';
import { i18n } from '@/i18n';
import { instance } from '@/instance';
import { $i } from '@/account';
import { definePageMetadata } from '@/scripts/page-metadata';

const XTutorial = defineAsyncComponent(() => import('./timeline.tutorial.vue'));

const isMediaTimelineAvailable = (!instance.disableLocalTimeline || ($i != null && ($i.isModerator || $i.isAdmin))) && defaultStore.state.enableMTL && defaultStore.state.enableLTL;
const isLocalTimelineAvailable = (!instance.disableLocalTimeline || ($i != null && ($i.isModerator || $i.isAdmin))) && defaultStore.state.enableLTL;
const isGlobalTimelineAvailable = (!instance.disableGlobalTimeline || ($i != null && ($i.isModerator || $i.isAdmin))) && defaultStore.state.enableGTL;
const keymap = {
	't': focus,
};

const tlComponent = $ref<InstanceType<typeof XTimeline>>();
const rootEl = $ref<HTMLElement>();

let queue = $ref(0);
const src = $computed({ get: () => defaultStore.reactiveState.tl.value.src, set: (x) => saveSrc(x) });

watch ($$(src), () => queue = 0);

function queueUpdated(q: number): void {
	queue = q;
}

function top(): void {
	scroll(rootEl, { top: 0 });
}

async function chooseList(ev: MouseEvent): Promise<void> {
	const lists = await os.api('users/lists/list');
	const items = lists.map(list => ({
		type: 'link' as const,
		text: list.name,
		to: `/timeline/list/${list.id}`,
	}));
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

function saveSrc(newSrc: 'home' | 'local' | 'media' | 'global'): void {
	defaultStore.set('tl', {
		...defaultStore.state.tl,
		src: newSrc,
	});
}

function focus(): void {
	tlComponent.focus();
}

const headerActions = $computed(() => []);

const headerTabs = $computed(() => [{
	key: 'home',
	title: i18n.ts._timelines.home,
	icon: 'fas fa-home',
	iconOnly: true,
}, ...(isLocalTimelineAvailable ? [{
	key: 'local',
	title: i18n.ts._timelines.local,
	icon: 'fas fa-comments',
	iconOnly: true,
}, ...(isMediaTimelineAvailable ? [{
	key: 'media',
	title: i18n.ts._timelines.media,
	icon: 'fas fa-camera',
	iconOnly: true,
}] : [])] : []), ...(isGlobalTimelineAvailable ? [{
	key: 'global',
	title: i18n.ts._timelines.global,
	icon: 'fas fa-globe',
	iconOnly: true,
}] : []), {
	icon: 'fas fa-list-ul',
	title: i18n.ts.lists,
	iconOnly: true,
	onClick: chooseList,
}]);

definePageMetadata(computed(() => ({
	title: i18n.ts.timeline,
	icon: src === 'local' ? 'fas fa-comments' : src === 'global' ? 'fas fa-globe' : src === 'media' ? 'fas fa-camera' : 'fas fa-home',
})));
</script>

<style lang="scss" scoped>
.cmuxhskf {
	> .new {
		position: sticky;
		top: calc(var(--stickyTop, 0px) + 16px);
		z-index: 1000;
		width: 100%;

		> button {
			display: block;
			margin: var(--margin) auto 0 auto;
			padding: 8px 16px;
			border-radius: 32px;
		}
	}

	> .post-form {
		border-radius: var(--radius);
	}

	> .tl {
		background: var(--bg);
		border-radius: var(--radius);
		overflow: clip;
	}
}
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
