import { CacheableRemoteUser } from '@/models/entities/user.js';
import { ILike, getApId } from '../type.js';
import create from '@/services/note/reaction/create.js';
import { fetchNote, extractEmojis } from '../models/note.js';
import { extractDbHost, isSelfHost } from '@/misc/convert-host.js';

export default async (actor: CacheableRemoteUser, activity: ILike) => {
	const targetUri = getApId(activity.object);

	const host = extractDbHost(targetUri);
	if (!isSelfHost(host)) {
		return `skip: ignore foreign Like`;
	}

	const note = await fetchNote(targetUri);
	if (!note) return `skip: target note not found ${targetUri}`;

	await extractEmojis(activity.tag || [], actor.host).catch(() => null);

	return await create(actor, note, activity.content || activity.name).catch(e => {
		if (e.id === '51c42bb4-931a-456b-bff7-e5a8a70dd298') {
			return 'skip: already reacted';
		} else {
			throw e;
		}
	}).then(() => 'ok');
};
