import { computed, ref, reactive } from 'vue';
import { $i } from './account';
import { search } from '@/scripts/search';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { ui } from '@/config';
import { unisonReload } from '@/scripts/unison-reload';

export const navbarItemDef = reactive({
	notifications: {
		title: 'notifications',
		icon: 'fas fa-bell',
		show: computed(() => $i != null),
		indicated: computed(() => $i != null && $i.hasUnreadNotification),
		to: '/my/notifications',
	},
	drive: {
		title: 'drive',
		icon: 'fas fa-cloud',
		show: computed(() => $i != null),
		to: '/my/drive',
	},
	followRequests: {
		title: 'followRequests',
		icon: 'fas fa-user-clock',
		show: computed(() => $i != null && ($i.isLocked || $i.hasPendingReceivedFollowRequest)),
		indicated: computed(() => $i != null && $i.hasPendingReceivedFollowRequest),
		to: '/my/follow-requests',
	},
	explore: {
		title: 'explore',
		icon: 'fas fa-hashtag',
		to: '/explore',
	},
	announcements: {
		title: 'announcements',
		icon: 'fas fa-broadcast-tower',
		indicated: computed(() => $i != null && $i.hasUnreadAnnouncement),
		to: '/announcements',
	},
	search: {
		title: 'search',
		icon: 'fas fa-search',
		action: () => search(),
	},
	lists: {
		title: 'lists',
		icon: 'fas fa-list-ul',
		show: computed(() => $i != null),
		to: '/my/lists',
	},
	favorites: {
		title: 'favorites',
		icon: 'fas fa-star',
		show: computed(() => $i != null),
		to: '/my/favorites',
	},
	ui: {
		title: 'switchUi',
		icon: 'fas fa-columns',
		action: (ev) => {
			os.popupMenu([{
				text: i18n.ts.default,
				active: ui === 'default' || ui === null,
				action: () => {
					localStorage.setItem('ui', 'default');
					unisonReload();
				},
			}, {
				text: i18n.ts.deck,
				active: ui === 'deck',
				action: () => {
					localStorage.setItem('ui', 'deck');
					unisonReload();
				},
			}, {
				text: i18n.ts.classic,
				active: ui === 'classic',
				action: () => {
					localStorage.setItem('ui', 'classic');
					unisonReload();
				},
			}], ev.currentTarget ?? ev.target);
		},
	},
	reload: {
		title: 'reload',
		icon: 'fas fa-refresh',
		action: (ev) => {
			location.reload();
		},
	},
});
