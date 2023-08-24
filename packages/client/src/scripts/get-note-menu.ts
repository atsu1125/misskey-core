import { defineAsyncComponent, Ref, inject } from 'vue';
import * as misskey from 'misskey-js';
import { pleaseLogin } from './please-login';
import { $i } from '@/account';
import { i18n } from '@/i18n';
import { instance } from '@/instance';
import * as os from '@/os';
import copyToClipboard from '@/scripts/copy-to-clipboard';
import { url } from '@/config';
import { noteActions } from '@/store';
import { defaultStore } from '@/store';

export function getNoteMenu(props: {
	note: misskey.entities.Note;
	menuButton: Ref<HTMLElement>;
	translation: Ref<any>;
	translating: Ref<boolean>;
	isDeleted: Ref<boolean>;
	currentClipPage?: Ref<misskey.entities.Clip>;
}) {
	const isRenote = (
		props.note.renote != null &&
		props.note.text == null &&
		props.note.fileIds.length === 0 &&
		props.note.poll == null
	);

	const appearNote = isRenote ? props.note.renote as misskey.entities.Note : props.note;

	const enableSudo = defaultStore.state.enableSudo;

	function del(): void {
		os.confirm({
			type: 'warning',
			text: (appearNote.userId == $i.id) ? i18n.ts.noteDeleteConfirm : i18n.ts.noteDeleteAsAdminConfirm,
		}).then(({ canceled }) => {
			if (canceled) return;

			os.api('notes/delete', {
				noteId: appearNote.id,
			});
		});
	}

	function delEdit(): void {
		os.confirm({
			type: 'warning',
			text: i18n.ts.deleteAndEditConfirm,
		}).then(({ canceled }) => {
			if (canceled) return;

			os.api('notes/delete', {
				noteId: appearNote.id,
			});

			os.post({ initialNote: appearNote, renote: appearNote.renote, reply: appearNote.reply });
		});
	}

	function toggleFavorite(favorite: boolean): void {
		os.apiWithDialog(favorite ? 'notes/favorites/create' : 'notes/favorites/delete', {
			noteId: appearNote.id,
		});
	}

	function toggleThreadMute(mute: boolean): void {
		os.apiWithDialog(mute ? 'notes/thread-muting/create' : 'notes/thread-muting/delete', {
			noteId: appearNote.id,
		});
	}

	function copyContent(): void {
		copyToClipboard(appearNote.text);
		os.success();
	}

	function copyLink(): void {
		copyToClipboard(`${url}/notes/${appearNote.id}`);
		os.success();
	}

	function togglePin(pin: boolean): void {
		os.apiWithDialog(pin ? 'i/pin' : 'i/unpin', {
			noteId: appearNote.id,
		}, undefined, null, res => {
			if (res.id === '72dab508-c64d-498f-8740-a8eec1ba385a') {
				os.alert({
					type: 'error',
					text: i18n.ts.pinLimitExceeded,
				});
			}
		});
	}

	async function promote(): Promise<void> {
		const { canceled, result: days } = await os.inputNumber({
			title: i18n.ts.numberOfDays,
		});

		if (canceled) return;

		os.apiWithDialog('admin/promo/create', {
			noteId: appearNote.id,
			expiresAt: Date.now() + (86400000 * days),
		});
	}

	function share(): void {
		navigator.share({
			title: i18n.t('noteOf', { user: appearNote.user.name }),
			text: appearNote.text,
			url: `${url}/notes/${appearNote.id}`,
		});
	}

	async function translate(): Promise<void> {
		if (props.translation.value != null) return;
		props.translating.value = true;
		const res = await os.api('notes/translate', {
			noteId: appearNote.id,
			targetLang: localStorage.getItem('lang') || navigator.language,
		});
		props.translating.value = false;
		props.translation.value = res;
	}

	let menu;
	if ($i) {
		const statePromise = os.api('notes/state', {
			noteId: appearNote.id,
		});

		menu = [
			{
				icon: 'fas fa-copy',
				text: i18n.ts.copyContent,
				action: copyContent,
			}, {
				icon: 'fas fa-link',
				text: i18n.ts.copyLink,
				action: copyLink,
			}, (appearNote.url || appearNote.uri) ? {
				icon: 'fas fa-external-link-square-alt',
				text: i18n.ts.showOnRemote,
				action: () => {
					window.open(appearNote.url || appearNote.uri, '_blank');
				},
			} : undefined,
			{
				icon: 'fas fa-share-alt',
				text: i18n.ts.share,
				action: share,
			},
			instance.translatorAvailable ? {
				icon: 'fas fa-language',
				text: i18n.ts.translate,
				action: translate,
			} : undefined,
			null,
			statePromise.then(state => state.isFavorited ? {
				icon: 'fas fa-star',
				text: i18n.ts.unfavorite,
				action: () => toggleFavorite(false),
			} : {
				icon: 'fas fa-star',
				text: i18n.ts.favorite,
				action: () => toggleFavorite(true),
			}),
			statePromise.then(state => state.isMutedThread ? {
				icon: 'fas fa-comment-slash',
				text: i18n.ts.unmuteThread,
				action: () => toggleThreadMute(false),
			} : {
				icon: 'fas fa-comment-slash',
				text: i18n.ts.muteThread,
				action: () => toggleThreadMute(true),
			}),
			appearNote.userId === $i.id ? ($i.pinnedNoteIds || []).includes(appearNote.id) ? {
				icon: 'fas fa-thumbtack',
				text: i18n.ts.unpin,
				action: () => togglePin(false),
			} : {
				icon: 'fas fa-thumbtack',
				text: i18n.ts.pin,
				action: () => togglePin(true),
			} : undefined,
			/*
		...($i.isModerator || $i.isAdmin ? [
			null,
			{
				icon: 'fas fa-bullhorn',
				text: i18n.ts.promote,
				action: promote
			}]
			: []
		),*/
			...(appearNote.userId !== $i.id ? [
				null,
				{
					icon: 'fas fa-exclamation-circle',
					text: i18n.ts.reportAbuse,
					action: () => {
						const u = appearNote.url || appearNote.uri || `${url}/notes/${appearNote.id}`;
						os.popup(defineAsyncComponent(() => import('@/components/MkAbuseReportWindow.vue')), {
							user: appearNote.user,
							initialComment: `Note: ${u}\n-----\n`,
						}, {}, 'closed');
					},
				}]
			: []
			),
			...(appearNote.userId === $i.id || (($i.isModerator || $i.isAdmin) && enableSudo) ? [
				null,
				appearNote.userId === $i.id ? {
					icon: 'fas fa-edit',
					text: i18n.ts.deleteAndEdit,
					action: delEdit,
				} : undefined,
				{
					icon: 'fas fa-trash-alt',
					text: (appearNote.userId == $i.id) ? i18n.ts.delete : i18n.ts.deleteAsAdmin,
					danger: true,
					action: del,
				}]
			: []
			)]
		.filter(x => x !== undefined);
	} else {
		menu = [{
			icon: 'fas fa-copy',
			text: i18n.ts.copyContent,
			action: copyContent,
		}, {
			icon: 'fas fa-link',
			text: i18n.ts.copyLink,
			action: copyLink,
		}, (appearNote.url || appearNote.uri) ? {
			icon: 'fas fa-external-link-square-alt',
			text: i18n.ts.showOnRemote,
			action: () => {
				window.open(appearNote.url || appearNote.uri, '_blank');
			},
		} : undefined]
		.filter(x => x !== undefined);
	}

	if (noteActions.length > 0) {
		menu = menu.concat([null, ...noteActions.map(action => ({
			icon: 'fas fa-plug',
			text: action.title,
			action: () => {
				action.handler(appearNote);
			},
		}))]);
	}

	return menu;
}
