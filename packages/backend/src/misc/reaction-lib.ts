/* eslint-disable key-spacing */
import { emojiRegex } from './emoji-regex.js';
import { fetchMeta } from './fetch-meta.js';
import { Emojis } from '@/models/index.js';
import { toPunyNullable } from './convert-host.js';
import { IsNull } from 'typeorm';

const legacies: Record<string, string> = {
	'like':     '👍',
	'love':     '❤', // ここに記述する場合は異体字セレクタを入れない
	'laugh':    '😆',
	'hmm':      '🤔',
	'surprise': '😮',
	'congrats': '🎉',
	'angry':    '💢',
	'confused': '😥',
	'rip':      '😇',
	'pudding':  '🍮',
	'star':     '⭐',
};

export async function getFallbackReaction(): Promise<string> {
	return '⭐';
}

export function convertLegacyReactions(reactions: Record<string, number>) {
	const _reactions = {} as Record<string, number>;

	for (const reaction of Object.keys(reactions)) {
		if (reactions[reaction] <= 0) continue;

		if (Object.keys(legacies).includes(reaction)) {
			if (_reactions[legacies[reaction]]) {
				_reactions[legacies[reaction]] += reactions[reaction];
			} else {
				_reactions[legacies[reaction]] = reactions[reaction];
			}
		} else {
			if (_reactions[reaction]) {
				_reactions[reaction] += reactions[reaction];
			} else {
				_reactions[reaction] = reactions[reaction];
			}
		}
	}

	const _reactions2 = {} as Record<string, number>;

	for (const reaction of Object.keys(_reactions)) {
		_reactions2[decodeReaction(reaction).reaction] = _reactions[reaction];
	}

	return _reactions2;
}

export async function toDbReaction(reaction?: string | null, reacterHost?: string | null): Promise<string> {
	return await getFallbackReaction();
}

type DecodedReaction = {
	/**
	 * リアクション名 (Unicode Emoji or ':name@hostname' or ':name@.')
	 */
	reaction: string;

	/**
	 * name (カスタム絵文字の場合name, Emojiクエリに使う)
	 */
	name?: string;

	/**
	 * host (カスタム絵文字の場合host, Emojiクエリに使う)
	 */
	host?: string | null;
};

export function decodeReaction(str: string): DecodedReaction {
	const custom = str.match(/^:([\w+-]+)(?:@([\w.-]+))?:$/);

	if (custom) {
		const name = custom[1];
		const host = custom[2] || null;

		return {
			reaction: `:${name}@${host || '.'}:`,	// ローカル分は@以降を省略するのではなく.にする
			name,
			host,
		};
	}

	return {
		reaction: str,
		name: undefined,
		host: undefined,
	};
}

export function convertLegacyReaction(reaction: string): string {
	reaction = decodeReaction(reaction).reaction;
	if (Object.keys(legacies).includes(reaction)) return legacies[reaction];
	return reaction;
}
