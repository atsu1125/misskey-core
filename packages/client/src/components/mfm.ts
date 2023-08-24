import { VNode, defineComponent, h } from 'vue';
import * as mfm from 'mfm-js';
import MkUrl from '@/components/global/MkUrl.vue';
import MkLink from '@/components/MkLink.vue';
import MkMention from '@/components/MkMention.vue';
import MkEmoji from '@/components/global/MkEmoji.vue';
import { concat } from '@/scripts/array';
import MkFormula from '@/components/MkFormula.vue';
import MkCode from '@/components/MkCode.vue';
import MkGoogle from '@/components/MkGoogle.vue';
import MkSparkle from '@/components/MkSparkle.vue';
import MkA from '@/components/global/MkA.vue';
import { host } from '@/config';
import { MFM_TAGS } from '@/scripts/mfm-tags';

export default defineComponent({
	props: {
		text: {
			type: String,
			required: true,
		},
		plain: {
			type: Boolean,
			default: false,
		},
		nowrap: {
			type: Boolean,
			default: false,
		},
		author: {
			type: Object,
			default: null,
		},
		i: {
			type: Object,
			default: null,
		},
		customEmojis: {
			required: false,
		},
		isNote: {
			type: Boolean,
			default: true,
		},
	},

	render() {
		if (this.text == null || this.text === '') return;

		const ast = (this.plain ? mfm.parseSimple : mfm.parse)(this.text, { fnNameList: MFM_TAGS });

		const validTime = (t: string | null | undefined) => {
			if (t == null) return null;
			return t.match(/^[0-9.]+s$/) ? t : null;
		};

		const genEl = (ast: mfm.MfmNode[]) => concat(ast.map((token): VNode[] => {
			switch (token.type) {
				case 'text': {
					const text = token.props.text.replace(/(\r\n|\n|\r)/g, '\n');

					if (!this.plain) {
						const res = [];
						for (const t of text.split('\n')) {
							res.push(h('br'));
							res.push(t);
						}
						res.shift();
						return res;
					} else {
						return [text.replace(/\n/g, ' ')];
					}
				}

				case 'bold': {
					return [h('b', genEl(token.children))];
				}

				case 'strike': {
					return [h('del', genEl(token.children))];
				}

				case 'italic': {
					return h('i', {
						style: 'font-style: oblique;',
					}, genEl(token.children));
				}

				case 'small': {
					return [h('small', {
						style: 'opacity: 0.7;',
					}, genEl(token.children))];
				}

				case 'center': {
					return [h('div', {
						style: 'text-align:center;',
					}, genEl(token.children))];
				}

				case 'url': {
					return [h(MkUrl, {
						key: Math.random(),
						url: token.props.url,
						rel: 'nofollow noopener',
					})];
				}

				case 'link': {
					return [h(MkLink, {
						key: Math.random(),
						url: token.props.url,
						rel: 'nofollow noopener',
					}, genEl(token.children))];
				}

				case 'mention': {
					return [h(MkMention, {
						key: Math.random(),
						host: (token.props.host == null && this.author && this.author.host != null ? this.author.host : token.props.host) || host,
						username: token.props.username,
					})];
				}

				case 'hashtag': {
					return [h(MkA, {
						key: Math.random(),
						to: this.isNote ? `/tags/${encodeURIComponent(token.props.hashtag)}` : `/explore/tags/${encodeURIComponent(token.props.hashtag)}`,
						style: 'color:var(--hashtag);',
					}, `#${token.props.hashtag}`)];
				}

				case 'blockCode': {
					return [h(MkCode, {
						key: Math.random(),
						code: token.props.code,
						lang: token.props.lang,
					})];
				}

				case 'inlineCode': {
					return [h(MkCode, {
						key: Math.random(),
						code: token.props.code,
						inline: true,
					})];
				}

				case 'quote': {
					if (!this.nowrap) {
						return [h('div', {
							class: 'quote',
						}, genEl(token.children))];
					} else {
						return [h('span', {
							class: 'quote',
						}, genEl(token.children))];
					}
				}

				case 'emojiCode': {
					return [h(MkEmoji, {
						key: Math.random(),
						emoji: `:${token.props.name}:`,
						customEmojis: this.customEmojis,
						normal: this.plain,
					})];
				}

				case 'unicodeEmoji': {
					return [h(MkEmoji, {
						key: Math.random(),
						emoji: token.props.emoji,
						customEmojis: this.customEmojis,
						normal: this.plain,
					})];
				}

				case 'mathInline': {
					return [h(MkFormula, {
						key: Math.random(),
						formula: token.props.formula,
						block: false,
					})];
				}

				case 'mathBlock': {
					return [h(MkFormula, {
						key: Math.random(),
						formula: token.props.formula,
						block: true,
					})];
				}

				case 'search': {
					return [h(MkGoogle, {
						key: Math.random(),
						q: token.props.query,
					})];
				}

				case 'plain': {
					return [h('span', genEl(token.children))];
				}

				default: {
					console.error('unrecognized ast type:', token.type);

					return [];
				}
			}
		}));

		// Parse ast to DOM
		return h('span', genEl(ast));
	},
});
