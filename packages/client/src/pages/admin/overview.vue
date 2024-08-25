<template>
<MkSpacer :content-max="900">
	<div ref="rootEl" v-size="{ max: [740] }" class="edbbcaef">
		<div class="left">
			<div v-if="stats" class="container stats">
				<div class="title">Stats</div>
				<div class="body">
					<div class="number _panel">
						<div class="label">Users</div>
						<div class="value _monospace">
							{{ number(stats.originalUsersCount) }}
						</div>
					</div>
					<div class="number _panel">
						<div class="label">Notes</div>
						<div class="value _monospace">
							{{ number(stats.originalNotesCount) }}
						</div>
					</div>
					<div class="number _panel">
						<div class="label">Current Online Users</div>
						<div class="value _monospace">
							{{ number(onlineUsersCount) }}
						</div>
					</div>
				</div>
			</div>

			<div class="container queue">
				<div class="title">Job queue</div>
				<div class="body">
					<div class="chart deliver">
						<div class="title">Deliver</div>
						<XQueueChart :connection="queueStatsConnection" domain="deliver"/>
					</div>
					<div class="chart inbox">
						<div class="title">Inbox</div>
						<XQueueChart :connection="queueStatsConnection" domain="inbox"/>
					</div>
				</div>
			</div>

			<div class="container users">
				<div class="title">New users</div>
				<div v-if="newUsers" class="body">
					<XUser v-for="user in newUsers" :key="user.id" class="user" :user="user"/>
				</div>
			</div>

			<div class="container files">
				<div class="title">Recent files</div>
				<div class="body">
					<MkFileListForAdmin :pagination="filesPagination" view-mode="grid"/>
				</div>
			</div>

			<div class="container env">
				<div class="title">Enviroment</div>
				<div class="body">
					<div class="number _panel">
						<div class="label">Misskey</div>
						<div class="value _monospace">{{ version }}</div>
					</div>
					<div v-if="serverInfo" class="number _panel">
						<div class="label">Node.js</div>
						<div class="value _monospace">{{ serverInfo.node }}</div>
					</div>
					<div v-if="serverInfo" class="number _panel">
						<div class="label">PostgreSQL</div>
						<div class="value _monospace">{{ serverInfo.psql }}</div>
					</div>
					<div v-if="serverInfo" class="number _panel">
						<div class="label">Redis</div>
						<div class="value _monospace">{{ serverInfo.redis }}</div>
					</div>
					<div class="number _panel">
						<div class="label">Vue</div>
						<div class="value _monospace">{{ vueVersion }}</div>
					</div>
				</div>
			</div>
		</div>
		<div class="right">
			<div v-if="topSubInstancesForPie && topPubInstancesForPie" class="container federationPies">
				<div class="body">
					<div class="chart deliver">
						<div class="title">Sub</div>
						<XPie :data="topSubInstancesForPie"/>
						<div class="subTitle">Top 10</div>
					</div>
					<div class="chart inbox">
						<div class="title">Pub</div>
						<XPie :data="topPubInstancesForPie"/>
						<div class="subTitle">Top 10</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</MkSpacer>
</template>

<script lang="ts" setup>
import { markRaw, version as vueVersion, onMounted, onBeforeUnmount, nextTick } from 'vue';
import {
	Chart,
	ArcElement,
	LineElement,
	BarElement,
	PointElement,
	BarController,
	LineController,
	CategoryScale,
	LinearScale,
	TimeScale,
	Legend,
	Title,
	Tooltip,
	SubTitle,
	Filler,
} from 'chart.js';
import { enUS } from 'date-fns/locale';
import tinycolor from 'tinycolor2';
import MagicGrid from 'magic-grid';
import XMetrics from './metrics.vue';
import XQueueChart from './overview.queue-chart.vue';
import XUser from './overview.user.vue';
import XPie from './overview.pie.vue';
import MkNumberDiff from '@/components/MkNumberDiff.vue';
import { version, url } from '@/config';
import number from '@/filters/number';
import * as os from '@/os';
import { stream } from '@/stream';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';
import 'chartjs-adapter-date-fns';
import { defaultStore } from '@/store';
import { useChartTooltip } from '@/scripts/use-chart-tooltip';
import MkFileListForAdmin from '@/components/MkFileListForAdmin.vue';

Chart.register(
	ArcElement,
	LineElement,
	BarElement,
	PointElement,
	BarController,
	LineController,
	CategoryScale,
	LinearScale,
	TimeScale,
	Legend,
	Title,
	Tooltip,
	SubTitle,
	Filler,
	//gradient,
);

const rootEl = $ref<HTMLElement>();
const chartEl = $ref<HTMLCanvasElement>(null);
let stats: any = $ref(null);
let onlineUsersCount = $ref();
let serverInfo: any = $ref(null);
let topSubInstancesForPie: any = $ref(null);
let topPubInstancesForPie: any = $ref(null);
let newUsers = $ref(null);
let activeInstances = $shallowRef(null);
const queueStatsConnection = markRaw(stream.useChannel('queueStats'));
const now = new Date();
const chartLimit = 30;
const filesPagination = {
	endpoint: 'admin/drive/files' as const,
	limit: 9,
	noPaging: true,
};

const { handler: externalTooltipHandler } = useChartTooltip();

function onInstanceClick(i) {
	os.pageWindow(`/instance-info/${i.host}`);
}

onMounted(async () => {
	/*
	const magicGrid = new MagicGrid({
		container: rootEl,
		static: true,
		animate: true,
	});

	magicGrid.listen();
	*/

	os.api('stats', {}).then(statsResponse => {
		stats = statsResponse;
	});

	os.api('get-online-users-count').then(res => {
		onlineUsersCount = res.count;
	});

	os.api('federation/stats', { limit: 10 }).then(res => {
		topSubInstancesForPie = res.topSubInstances.map(x => ({
			name: x.host,
			color: x.themeColor,
			value: x.followersCount,
			onClick: () => {
				os.pageWindow(`/instance-info/${x.host}`);
			},
		})).concat([{ name: '(other)', color: '#80808080', value: res.otherFollowersCount }]);
		topPubInstancesForPie = res.topPubInstances.map(x => ({
			name: x.host,
			color: x.themeColor,
			value: x.followingCount,
			onClick: () => {
				os.pageWindow(`/instance-info/${x.host}`);
			},
		})).concat([{ name: '(other)', color: '#80808080', value: res.otherFollowingCount }]);
	});

	os.api('admin/server-info').then(serverInfoResponse => {
		serverInfo = serverInfoResponse;
	});

	os.api('admin/show-users', {
		limit: 5,
		sort: '+createdAt',
	}).then(res => {
		newUsers = res;
	});

	os.api('federation/instances', {
		sort: '+lastCommunicatedAt',
		limit: 25,
	}).then(res => {
		activeInstances = res;
	});

	nextTick(() => {
		queueStatsConnection.send('requestLog', {
			id: Math.random().toString().substr(2, 8),
			length: 100,
		});
	});
});

onBeforeUnmount(() => {
	queueStatsConnection.dispose();
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.dashboard,
	icon: 'fas fa-tachometer-alt',
});
</script>

<style lang="scss" scoped>
.edbbcaef {
	display: flex;

	> .left, > .right {
		box-sizing: border-box;
		width: 50%;

		> .container {
			margin: 32px 0;

			> .title {
				font-weight: bold;
				margin-bottom: 16px;
			}

			&.stats, &.federationStats {
				> .body {
					display: grid;
					grid-gap: 16px;
					grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));

					> .number {
						padding: 14px 20px;

						> .label {
							opacity: 0.7;
							font-size: 0.8em;
						}

						> .value {
							font-weight: bold;
							font-size: 1.5em;

							> .diff {
								font-size: 0.7em;
							}
						}
					}
				}
			}

			&.env {
				> .body {
					display: grid;
					grid-gap: 16px;
					grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));

					> .number {
						padding: 14px 20px;

						> .label {
							opacity: 0.7;
							font-size: 0.8em;
						}

						> .value {
							font-size: 1.1em;
						}
					}
				}
			}

			&.charts {
				> .body {
					padding: 32px;
					background: var(--panel);
					border-radius: var(--radius);
				}
			}

			&.users {
				> .body {
					background: var(--panel);
					border-radius: var(--radius);

					> .user {
						padding: 16px 20px;

						&:not(:last-child) {
							border-bottom: solid 0.5px var(--divider);
						}
					}
				}
			}

			&.federation {
				> .body {
					background: var(--panel);
					border-radius: var(--radius);
					overflow: clip;
				}
			}

			&.queue {
				> .body {
					display: grid;
					grid-gap: 16px;
					grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));

					> .chart {
						position: relative;
						padding: 20px;
						background: var(--panel);
						border-radius: var(--radius);

						> .title {
							position: absolute;
							top: 20px;
							left: 20px;
							font-size: 90%;
						}
					}
				}
			}

			&.federationPies {
				> .body {
					display: grid;
					grid-gap: 16px;
					grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));

					> .chart {
						position: relative;
						padding: 20px;
						background: var(--panel);
						border-radius: var(--radius);

						> .title {
							position: absolute;
							top: 20px;
							left: 20px;
							font-size: 90%;
						}

						> .subTitle {
							position: absolute;
							bottom: 20px;
							right: 20px;
							font-size: 85%;
						}
					}
				}
			}
		}
	}

	> .left {
		padding-right: 16px;
	}

	> .right {
		padding-left: 16px;
	}
}
</style>
