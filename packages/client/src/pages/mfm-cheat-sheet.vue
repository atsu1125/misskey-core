<template>
<MkStickyContainer>
	<template #header><MkPageHeader/></template>
	<MkSpacer :content-max="800">
		<div class="mwysmxbg">
			<div>{{ i18n.ts._mfm.intro }}</div>
			<div class="section _block">
				<div class="title">{{ i18n.ts._mfm.mention }}</div>
				<div class="content">
					<p>{{ i18n.ts._mfm.mentionDescription }}</p>
					<div class="preview">
						<Mfm :text="preview_mention"/>
						<MkTextarea v-model="preview_mention"><template #label>MFM</template></MkTextarea>
					</div>
				</div>
			</div>
			<div class="section _block">
				<div class="title">{{ i18n.ts._mfm.hashtag }}</div>
				<div class="content">
					<p>{{ i18n.ts._mfm.hashtagDescription }}</p>
					<div class="preview">
						<Mfm :text="preview_hashtag"/>
						<MkTextarea v-model="preview_hashtag"><template #label>MFM</template></MkTextarea>
					</div>
				</div>
			</div>
			<div class="section _block">
				<div class="title">{{ i18n.ts._mfm.url }}</div>
				<div class="content">
					<p>{{ i18n.ts._mfm.urlDescription }}</p>
					<div class="preview">
						<Mfm :text="preview_url"/>
						<MkTextarea v-model="preview_url"><template #label>MFM</template></MkTextarea>
					</div>
				</div>
			</div>
			<div class="section _block">
				<div class="title">{{ i18n.ts._mfm.link }}</div>
				<div class="content">
					<p>{{ i18n.ts._mfm.linkDescription }}</p>
					<div class="preview">
						<Mfm :text="preview_link"/>
						<MkTextarea v-model="preview_link"><template #label>MFM</template></MkTextarea>
					</div>
				</div>
			</div>
			<div class="section _block">
				<div class="title">{{ i18n.ts._mfm.emoji }}</div>
				<div class="content">
					<p>{{ i18n.ts._mfm.emojiDescription }}</p>
					<div class="preview">
						<Mfm :text="preview_emoji"/>
						<MkTextarea v-model="preview_emoji"><template #label>MFM</template></MkTextarea>
					</div>
				</div>
			</div>
			<div class="section _block">
				<div class="title">{{ i18n.ts._mfm.bold }}</div>
				<div class="content">
					<p>{{ i18n.ts._mfm.boldDescription }}</p>
					<div class="preview">
						<Mfm :text="preview_bold"/>
						<MkTextarea v-model="preview_bold"><template #label>MFM</template></MkTextarea>
					</div>
				</div>
			</div>
			<div class="section _block">
				<div class="title">{{ i18n.ts._mfm.small }}</div>
				<div class="content">
					<p>{{ i18n.ts._mfm.smallDescription }}</p>
					<div class="preview">
						<Mfm :text="preview_small"/>
						<MkTextarea v-model="preview_small"><template #label>MFM</template></MkTextarea>
					</div>
				</div>
			</div>
			<div class="section _block">
				<div class="title">{{ i18n.ts._mfm.quote }}</div>
				<div class="content">
					<p>{{ i18n.ts._mfm.quoteDescription }}</p>
					<div class="preview">
						<Mfm :text="preview_quote"/>
						<MkTextarea v-model="preview_quote"><template #label>MFM</template></MkTextarea>
					</div>
				</div>
			</div>
			<div class="section _block">
				<div class="title">{{ i18n.ts._mfm.center }}</div>
				<div class="content">
					<p>{{ i18n.ts._mfm.centerDescription }}</p>
					<div class="preview">
						<Mfm :text="preview_center"/>
						<MkTextarea v-model="preview_center"><template #label>MFM</template></MkTextarea>
					</div>
				</div>
			</div>
			<div class="section _block">
				<div class="title">{{ i18n.ts._mfm.inlineCode }}</div>
				<div class="content">
					<p>{{ i18n.ts._mfm.inlineCodeDescription }}</p>
					<div class="preview">
						<Mfm :text="preview_inlineCode"/>
						<MkTextarea v-model="preview_inlineCode"><template #label>MFM</template></MkTextarea>
					</div>
				</div>
			</div>
			<div class="section _block">
				<div class="title">{{ i18n.ts._mfm.blockCode }}</div>
				<div class="content">
					<p>{{ i18n.ts._mfm.blockCodeDescription }}</p>
					<div class="preview">
						<Mfm :text="preview_blockCode"/>
						<MkTextarea v-model="preview_blockCode"><template #label>MFM</template></MkTextarea>
					</div>
				</div>
			</div>
			<div class="section _block">
				<div class="title">{{ i18n.ts._mfm.inlineMath }}</div>
				<div class="content">
					<p>{{ i18n.ts._mfm.inlineMathDescription }}</p>
					<div class="preview">
						<Mfm :text="preview_inlineMath"/>
						<MkTextarea v-model="preview_inlineMath"><template #label>MFM</template></MkTextarea>
					</div>
				</div>
			</div>
			<!-- deprecated
		<div class="section _block">
			<div class="title">{{ i18n.ts._mfm.search }}</div>
			<div class="content">
				<p>{{ i18n.ts._mfm.searchDescription }}</p>
				<div class="preview">
					<Mfm :text="preview_search"/>
					<MkTextarea v-model="preview_search"><template #label>MFM</template></MkTextarea>
				</div>
			</div>
		</div>
		-->
			<div class="section _block">
				<div class="title">{{ i18n.ts._mfm.plain }}</div>
				<div class="content">
					<p>{{ i18n.ts._mfm.plainDescription }}</p>
					<div class="preview">
						<Mfm :text="preview_plain"/>
						<MkTextarea v-model="preview_plain"><span>MFM</span></MkTextarea>
					</div>
				</div>
			</div>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { defineComponent } from 'vue';
import MkTextarea from '@/components/form/textarea.vue';
import { definePageMetadata } from '@/scripts/page-metadata';
import { i18n } from '@/i18n';
import { instance } from '@/instance';

let preview_mention = $ref('@example');
let preview_hashtag = $ref('#test');
let preview_url = $ref('https://example.com');
let preview_link = $ref(`[${i18n.ts._mfm.dummy}](https://example.com)`);
let preview_emoji = $ref(instance.emojis.length ? `:${instance.emojis[0].name}:` : ':emojiname:');
let preview_bold = $ref(`**${i18n.ts._mfm.dummy}**`);
let preview_small = $ref(`<small>${i18n.ts._mfm.dummy}</small>`);
let preview_center = $ref(`<center>${i18n.ts._mfm.dummy}</center>`);
let preview_inlineCode = $ref('`<: "Hello, world!"`');
let preview_blockCode = $ref('```\n~ (#i, 100) {\n\t<: ? ((i % 15) = 0) "FizzBuzz"\n\t\t.? ((i % 3) = 0) "Fizz"\n\t\t.? ((i % 5) = 0) "Buzz"\n\t\t. i\n}\n```');
let preview_inlineMath = $ref('\\(x= \\frac{-b\' \\pm \\sqrt{(b\')^2-ac}}{a}\\)');
let preview_quote = $ref(`> ${i18n.ts._mfm.dummy}`);
let preview_search = $ref(`${i18n.ts._mfm.dummy} 検索`);
let preview_jelly = $ref('$[jelly 🍮] $[jelly.speed=5s 🍮]');
let preview_tada = $ref('$[tada 🍮] $[tada.speed=5s 🍮]');
let preview_jump = $ref('$[jump 🍮] $[jump.speed=5s 🍮]');
let preview_bounce = $ref('$[bounce 🍮] $[bounce.speed=5s 🍮]');
let preview_shake = $ref('$[shake 🍮] $[shake.speed=5s 🍮]');
let preview_twitch = $ref('$[twitch 🍮] $[twitch.speed=5s 🍮]');
let preview_spin = $ref('$[spin 🍮] $[spin.left 🍮] $[spin.alternate 🍮]\n$[spin.x 🍮] $[spin.x,left 🍮] $[spin.x,alternate 🍮]\n$[spin.y 🍮] $[spin.y,left 🍮] $[spin.y,alternate 🍮]\n\n$[spin.speed=5s 🍮]');
let preview_flip = $ref(`$[flip ${i18n.ts._mfm.dummy}]\n$[flip.v ${i18n.ts._mfm.dummy}]\n$[flip.h,v ${i18n.ts._mfm.dummy}]`);
let preview_font = $ref(`$[font.serif ${i18n.ts._mfm.dummy}]\n$[font.monospace ${i18n.ts._mfm.dummy}]\n$[font.cursive ${i18n.ts._mfm.dummy}]\n$[font.fantasy ${i18n.ts._mfm.dummy}]`);
let preview_x2 = $ref('$[x2 🍮]');
let preview_x3 = $ref('$[x3 🍮]');
let preview_x4 = $ref('$[x4 🍮]');
let preview_blur = $ref(`$[blur ${i18n.ts._mfm.dummy}]`);
let preview_rainbow = $ref('$[rainbow 🍮] $[rainbow.speed=5s 🍮]');
let preview_sparkle = $ref('$[sparkle 🍮]');
let preview_rotate = $ref('$[rotate 🍮]');
let preview_plain = $ref('<plain>**bold** @mention #hashtag `code` $[x2 🍮]</plain>');

definePageMetadata({
	title: i18n.ts._mfm.cheatSheet,
	icon: 'fas fa-question-circle',
});
</script>

<style lang="scss" scoped>
.mwysmxbg {
	background: var(--bg);

	> .section {
		> .title {
			position: sticky;
			z-index: 1;
			top: var(--stickyTop, 0px);
			padding: 16px;
			font-weight: bold;
			-webkit-backdrop-filter: var(--blur, blur(10px));
			backdrop-filter: var(--blur, blur(10px));
			background-color: var(--X16);
		}

		> .content {
			> p {
				margin: 0;
				padding: 16px;
			}

			> .preview {
				border-top: solid 0.5px var(--divider);
				padding: 16px;
			}
		}
	}
}
</style>
