<script>
	import '@evidence-dev/tailwind/fonts.css';
	import '../app.css';
	import { EvidenceDefaultLayout } from '@evidence-dev/core-components';
	export let data;
</script>

<EvidenceDefaultLayout
	{data}
	title="Monitor Hub"
	builtWithEvidence={false}
	maxWidth={1536}
	homePageName="Overview"
	hideBreadcrumbs={true}
	hideTOC={true}
>
	<div class="dash-page">
		<slot />
	</div>
</EvidenceDefaultLayout>

<style>
	/* Professional BI dashboard shell — compact, full-width, aligned */

	:global(body) {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		background: var(--base-200);
		color: var(--base-content);
		font-feature-settings: 'tnum' 1;
	}

	:global(.markdown) {
		max-width: none;
		width: 100%;
	}

	/* Hide long page descriptions — title in header is enough */
	:global(.markdown > p:first-of-type) {
		display: none;
	}

	:global(.markdown h1) {
		display: none;
	}

	:global(.markdown h2) {
		margin-top: 1.25rem;
		margin-bottom: 0.5rem;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: hsl(var(--twc-base-content) / 0.45);
	}

	/* Top nav */
	:global(.report-nav) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.125rem;
		margin: 0 0 0.875rem;
		padding: 0.1875rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.65);
		border-radius: 0.25rem;
		background: var(--base-100);
		width: fit-content;
		max-width: 100%;
	}

	:global(.report-nav a) {
		display: inline-flex;
		align-items: center;
		padding: 0.375rem 0.75rem;
		border-radius: 0.1875rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: hsl(var(--twc-base-content) / 0.6);
		text-decoration: none;
		transition: background 0.12s, color 0.12s;
	}

	:global(.report-nav a:hover) {
		background: hsl(var(--twc-base-200));
		color: var(--base-content);
	}

	:global(.report-context),
	:global(.dash-context) {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.375rem 0.75rem;
	}

	:global(.report-context strong),
	:global(.dash-context strong) {
		color: var(--base-content);
		font-weight: 600;
	}

	:global(.report-context .ctx-sep),
	:global(.dash-context .ctx-sep) {
		color: hsl(var(--twc-base-content) / 0.2);
	}

	/* Compact KPI tiles */
	:global(.dash-kpis .grid > *) {
		border: 1px solid hsl(var(--twc-base-300) / 0.65);
		border-radius: 0.25rem;
		background: var(--base-100);
		min-height: 0 !important;
		height: auto !important;
		overflow: hidden;
	}

	:global(.dash-kpis .grid > * > *) {
		display: block !important;
		width: 100% !important;
		min-width: 0 !important;
		max-width: none !important;
		min-height: 0 !important;
		padding: 0.625rem 0.75rem !important;
		margin: 0 !important;
		box-sizing: border-box;
	}

	:global(.dash-kpis .grid > * span),
	:global(.dash-kpis .grid > * p),
	:global(.dash-kpis .grid > * > * span),
	:global(.dash-kpis .grid > * > * p) {
		display: block !important;
		margin: 0 0 0.125rem !important;
		font-size: 0.625rem !important;
		font-weight: 600 !important;
		line-height: 1.3 !important;
		letter-spacing: 0.05em !important;
		text-transform: uppercase !important;
		color: hsl(var(--twc-base-content) / 0.45) !important;
	}

	:global(.dash-kpis .grid > * [class*='text-']),
	:global(.dash-kpis .grid > * .value),
	:global(.dash-kpis .grid > * > * [class*='text-3']),
	:global(.dash-kpis .grid > * > * [class*='text-2']),
	:global(.dash-kpis .grid > * > * [class*='text-4']) {
		font-size: 1.375rem !important;
		font-weight: 600 !important;
		line-height: 1.15 !important;
		letter-spacing: -0.02em !important;
		color: var(--base-content) !important;
	}

	:global(.dash-kpis.hub-kpis .grid > *:nth-child(1)) {
		border-top: 2px solid var(--positive);
	}

	:global(.dash-kpis.hub-kpis .grid > *:nth-child(4)),
	:global(.dash-kpis.hub-kpis .grid > *:nth-child(5)),
	:global(.dash-kpis.hub-kpis .grid > *:nth-child(6)) {
		border-top: 2px solid var(--negative);
	}

	:global(.dash-kpis.cols-3 .grid > *:nth-child(1)) {
		border-top: 2px solid var(--primary);
	}

	:global(.dash-kpis.cols-3 .grid > *:nth-child(2)) {
		border-top: 2px solid var(--positive);
	}

	:global(.dash-kpis.cols-3 .grid > *:nth-child(3)) {
		border-top: 2px solid var(--warning);
	}

	:global(.dash-kpis.site-kpis .grid > *:nth-child(3)) {
		border-top: 2px solid var(--positive);
	}

	:global(.dash-kpis.site-kpis .grid > *:nth-child(4)) {
		border-top: 2px solid var(--negative);
	}

	:global(.dash-kpis.site-kpis .grid > *:nth-child(5)) {
		border-top: 2px solid var(--positive);
	}

	/* Chart panels — fixed height, light background */
	:global(.dash-charts .grid > *),
	:global(.dash-panel .grid > *) {
		border: 1px solid hsl(var(--twc-base-300) / 0.65);
		border-radius: 0.25rem;
		background: var(--base-100);
		padding: 0.5rem 0.625rem 0.625rem;
		min-width: 0;
	}

	:global(.dash-charts .grid),
	:global(.dash-panel .grid) {
		min-width: 0;
	}

	:global(.dash-panel > .grid > *:only-child) {
		margin-top: 0.625rem;
	}

	:global(.dash-charts canvas),
	:global(.dash-panel canvas) {
		max-width: 100%;
	}

	/* Filter controls */
	:global(.dash-toolbar label),
	:global(.dash-toolbar .label) {
		font-size: 0.625rem !important;
		font-weight: 600 !important;
		letter-spacing: 0.04em !important;
		text-transform: uppercase !important;
		color: hsl(var(--twc-base-content) / 0.45) !important;
		margin-bottom: 0.25rem !important;
	}

	:global(.dash-toolbar select),
	:global(.dash-toolbar input),
	:global(.dash-toolbar button) {
		font-size: 0.8125rem !important;
		min-height: 2rem;
		border-radius: 0.1875rem !important;
		border-color: hsl(var(--twc-base-300) / 0.75) !important;
		background: var(--base-100) !important;
	}

	/* Site hero */
	:global(.site-hero) {
		margin-bottom: 0.875rem;
		padding: 0.875rem 1rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.65);
		border-radius: 0.25rem;
		background: var(--base-100);
	}

	:global(.site-hero h1) {
		margin: 0.5rem 0 0;
		font-size: 1.25rem;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	:global(.site-hero .site-sub) {
		margin: 0.125rem 0 0;
		font-size: 0.8125rem;
		color: hsl(var(--twc-base-content) / 0.5);
	}

	:global(.back-link) {
		display: inline-flex;
		align-items: center;
		font-size: 0.8125rem;
		font-weight: 500;
		color: hsl(var(--twc-base-content) / 0.5);
		text-decoration: none;
		margin-bottom: 0.75rem;
	}

	:global(.back-link:hover) {
		color: var(--primary);
	}

	/* Badges */
	:global(.status-badge),
	:global(.sev-badge) {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		border-radius: 0.1875rem;
		padding: 0.125rem 0.4375rem;
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		border: 1px solid transparent;
	}

	:global(.status-ok) {
		background: hsl(var(--twc-positive) / 0.12);
		color: var(--positive);
		border-color: hsl(var(--twc-positive) / 0.22);
	}

	:global(.status-failed) {
		background: hsl(var(--twc-negative) / 0.12);
		color: var(--negative);
		border-color: hsl(var(--twc-negative) / 0.22);
	}

	:global(.status-missing) {
		background: hsl(var(--twc-warning) / 0.12);
		color: var(--warning);
		border-color: hsl(var(--twc-warning) / 0.22);
	}

	:global(.sev-critical) {
		background: hsl(var(--twc-negative) / 0.12);
		color: var(--negative);
		border-color: hsl(var(--twc-negative) / 0.22);
	}

	:global(.sev-high) {
		background: hsl(var(--twc-warning) / 0.12);
		color: var(--warning);
		border-color: hsl(var(--twc-warning) / 0.22);
	}

	:global(.sev-medium) {
		background: hsl(var(--twc-warning) / 0.08);
		color: var(--warning);
		border-color: hsl(var(--twc-warning) / 0.18);
	}

	:global(.sev-low) {
		background: hsl(var(--twc-base-300) / 0.35);
		color: hsl(var(--twc-base-content) / 0.55);
		border-color: hsl(var(--twc-base-300) / 0.5);
	}

	:global(.sev-row) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin-bottom: 0.625rem;
	}

	/* Metadata */
	:global(.meta-grid) {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
		gap: 0.75rem 1rem;
		font-size: 0.8125rem;
	}

	:global(.meta-grid .meta-label) {
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: hsl(var(--twc-base-content) / 0.4);
		margin-bottom: 0.125rem;
	}

	:global(.meta-grid .meta-value) {
		font-weight: 500;
		margin: 0;
	}

	/* Tables */
	:global(.table-container th) {
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: hsl(var(--twc-base-content) / 0.45);
		background: hsl(var(--twc-base-200) / 0.55);
		border-bottom: 1px solid hsl(var(--twc-base-300) / 0.65);
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		white-space: nowrap;
	}

	:global(.table-container td) {
		font-size: 0.8125rem;
		padding-top: 0.4375rem;
		padding-bottom: 0.4375rem;
		border-bottom: 1px solid hsl(var(--twc-base-300) / 0.25);
		vertical-align: middle;
		text-align: left;
		font-variant-numeric: tabular-nums;
	}

	:global(.table-container tbody tr:hover) {
		background: hsl(var(--twc-base-200) / 0.35);
	}

	:global(.table-container tbody tr:last-child td) {
		border-bottom: none;
	}

	/* Tabs */
	:global(.dash-panel section > nav),
	:global(section > nav) {
		border-bottom: 1px solid hsl(var(--twc-base-300) / 0.65);
		margin: 0 -0.75rem;
		padding: 0 0.75rem;
	}

	:global(section > nav button) {
		font-size: 0.8125rem;
		font-weight: 500;
		padding: 0.5625rem 0.875rem !important;
		border-radius: 0 !important;
		border-bottom: 2px solid transparent !important;
		margin-bottom: -1px;
		color: hsl(var(--twc-base-content) / 0.55) !important;
		background: transparent !important;
	}

	:global(section > nav button[aria-selected='true']),
	:global(section > nav button.active) {
		color: var(--primary) !important;
		border-bottom-color: var(--primary) !important;
	}

	:global(section[role='tabpanel'][hidden]) {
		display: none !important;
	}

	:global(.stat-line) {
		font-size: 0.75rem;
		color: hsl(var(--twc-base-content) / 0.5);
	}

	:global(.stat-line strong) {
		color: var(--base-content);
		font-weight: 600;
	}

	:global(.report-footer) {
		margin-top: 1rem;
		padding: 0.5rem 0.625rem;
		border-radius: 0.1875rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.4);
		background: hsl(var(--twc-base-200) / 0.35);
		font-size: 0.6875rem;
		color: hsl(var(--twc-base-content) / 0.45);
	}

	:global(.report-footer code) {
		font-size: 0.6875rem;
		padding: 0.0625rem 0.25rem;
		border-radius: 0.125rem;
		background: hsl(var(--twc-base-300) / 0.35);
	}

	@media (max-width: 1024px) {
		:global(.dash-kpis .grid > * [class*='text-']),
		:global(.dash-kpis .grid > * > * [class*='text-3']),
		:global(.dash-kpis .grid > * > * [class*='text-2']) {
			font-size: 1.125rem !important;
		}
	}
</style>
