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
	maxWidth={1440}
	homePageName="Overview"
	hideBreadcrumbs={true}
	hideTOC={true}
>
	<slot />
</EvidenceDefaultLayout>

<style>
	/* Grafana / Power BI inspired analytics shell */

	:global(body) {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		background: var(--base-200);
		color: var(--base-content);
		font-feature-settings: 'tnum' 1;
	}

	:global(.markdown) {
		max-width: none;
	}

	:global(.markdown > p:first-of-type) {
		margin-top: 0;
		font-size: 0.875rem;
		color: hsl(var(--twc-base-content) / 0.55);
		line-height: 1.5;
	}

	:global(.markdown h2) {
		margin-top: 1.75rem;
		margin-bottom: 0.625rem;
		padding-bottom: 0;
		border-bottom: none;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: hsl(var(--twc-base-content) / 0.45);
	}

	:global(.markdown hr) {
		margin: 1.5rem 0;
		border-color: hsl(var(--twc-base-300) / 0.45);
	}

	/* Top navigation — Grafana-style section tabs */
	:global(.report-nav) {
		display: flex;
		flex-wrap: wrap;
		gap: 0;
		margin: 0 0 1.25rem;
		padding: 0.25rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.55);
		border-radius: 0.375rem;
		background: hsl(var(--twc-base-100));
		width: fit-content;
		max-width: 100%;
	}

	:global(.report-nav a) {
		display: inline-flex;
		align-items: center;
		padding: 0.4375rem 0.875rem;
		border-radius: 0.25rem;
		border: none;
		background: transparent;
		font-size: 0.8125rem;
		font-weight: 500;
		color: hsl(var(--twc-base-content) / 0.6);
		text-decoration: none;
		transition: background 0.12s, color 0.12s;
	}

	:global(.report-nav a:hover) {
		background: hsl(var(--twc-base-200) / 0.8);
		color: var(--base-content);
	}

	/* Context strip — compact metadata bar */
	:global(.report-context) {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.375rem 0.875rem;
		margin: 0 0 1rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.25rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.4);
		background: hsl(var(--twc-base-200) / 0.35);
		font-size: 0.75rem;
		color: hsl(var(--twc-base-content) / 0.55);
	}

	:global(.report-context strong) {
		color: var(--base-content);
		font-weight: 600;
	}

	:global(.report-context .ctx-sep) {
		color: hsl(var(--twc-base-content) / 0.18);
	}

	/* KPI tiles — Power BI stat cards */
	:global(.dash-kpis .grid > *) {
		border: 1px solid hsl(var(--twc-base-300) / 0.55);
		border-radius: 0.375rem;
		background: hsl(var(--twc-base-100));
		box-shadow: 0 1px 2px hsl(var(--twc-base-content) / 0.04);
		overflow: hidden;
	}

	:global(.dash-kpis .grid > * > div) {
		padding: 0.875rem 1rem !important;
	}

	:global(.dash-kpis .grid > * span),
	:global(.dash-kpis .grid > * p) {
		font-size: 0.6875rem !important;
		font-weight: 600 !important;
		letter-spacing: 0.05em !important;
		text-transform: uppercase !important;
		color: hsl(var(--twc-base-content) / 0.45) !important;
	}

	:global(.dash-kpis .grid > * [class*='text-']),
	:global(.dash-kpis .grid > * .value) {
		font-size: 1.625rem !important;
		font-weight: 600 !important;
		letter-spacing: -0.02em !important;
		line-height: 1.2 !important;
		color: var(--base-content) !important;
	}

	:global(.dash-kpis .grid > *:nth-child(1)) {
		border-top: 3px solid var(--positive);
	}

	:global(.dash-kpis.hub-kpis .grid > *:nth-child(4)),
	:global(.dash-kpis.hub-kpis .grid > *:nth-child(5)),
	:global(.dash-kpis.hub-kpis .grid > *:nth-child(6)) {
		border-top: 3px solid var(--negative);
	}

	:global(.dash-kpis.cols-3 .grid > *:nth-child(1)) {
		border-top: 3px solid var(--primary);
	}

	:global(.dash-kpis.cols-3 .grid > *:nth-child(2)) {
		border-top: 3px solid var(--positive);
	}

	:global(.dash-kpis.cols-3 .grid > *:nth-child(3)) {
		border-top: 3px solid var(--warning);
	}

	:global(.dash-kpis:not(.hub-kpis):not(.cols-3) .grid > *:nth-child(3)) {
		border-top: 3px solid var(--positive);
	}

	:global(.dash-kpis:not(.hub-kpis):not(.cols-3) .grid > *:nth-child(4)) {
		border-top: 3px solid var(--negative);
	}

	:global(.dash-kpis:not(.hub-kpis):not(.cols-3) .grid > *:nth-child(5)) {
		border-top: 3px solid var(--positive);
	}

	/* Chart panels */
	:global(.dash-panel .grid > *),
	:global(.markdown .grid:not(.dash-kpis .grid) > *) {
		border: 1px solid hsl(var(--twc-base-300) / 0.55);
		border-radius: 0.375rem;
		background: hsl(var(--twc-base-100));
		padding: 0.75rem;
	}

	:global(.markdown > .grid > *:only-child),
	:global(.dash-panel > .grid > *:only-child) {
		margin-top: 0.75rem;
	}

	/* Filter dropdowns */
	:global(.dash-toolbar label),
	:global(.dash-toolbar .label) {
		font-size: 0.6875rem !important;
		font-weight: 600 !important;
		letter-spacing: 0.04em !important;
		text-transform: uppercase !important;
		color: hsl(var(--twc-base-content) / 0.45) !important;
	}

	:global(.dash-toolbar select),
	:global(.dash-toolbar input),
	:global(.dash-toolbar button) {
		font-size: 0.8125rem !important;
		border-radius: 0.25rem !important;
		border-color: hsl(var(--twc-base-300) / 0.65) !important;
		background: hsl(var(--twc-base-100)) !important;
	}

	/* Site detail header */
	:global(.site-hero) {
		margin-bottom: 1.25rem;
		padding: 1rem 1.25rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.55);
		border-radius: 0.375rem;
		background: hsl(var(--twc-base-100));
	}

	:global(.site-hero h1) {
		margin: 0.625rem 0 0;
		font-size: 1.375rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		color: var(--base-content);
	}

	:global(.site-hero .site-sub) {
		margin: 0.25rem 0 0;
		font-size: 0.8125rem;
		color: hsl(var(--twc-base-content) / 0.5);
	}

	:global(.back-link) {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: hsl(var(--twc-base-content) / 0.5);
		text-decoration: none;
		margin-bottom: 1rem;
	}

	:global(.back-link:hover) {
		color: var(--primary);
	}

	/* Status & severity badges */
	:global(.status-badge) {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		border-radius: 0.25rem;
		padding: 0.1875rem 0.5rem;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		text-transform: uppercase;
	}

	:global(.status-ok) {
		background: hsl(var(--twc-positive) / 0.15);
		color: var(--positive);
		border: 1px solid hsl(var(--twc-positive) / 0.25);
	}

	:global(.status-failed) {
		background: hsl(var(--twc-negative) / 0.15);
		color: var(--negative);
		border: 1px solid hsl(var(--twc-negative) / 0.25);
	}

	:global(.status-missing) {
		background: hsl(var(--twc-warning) / 0.15);
		color: var(--warning);
		border: 1px solid hsl(var(--twc-warning) / 0.25);
	}

	:global(.sev-badge) {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		border-radius: 0.25rem;
		padding: 0.1875rem 0.5rem;
		font-size: 0.6875rem;
		font-weight: 600;
		border: 1px solid transparent;
	}

	:global(.sev-critical) {
		background: hsl(var(--twc-negative) / 0.15);
		color: var(--negative);
		border-color: hsl(var(--twc-negative) / 0.25);
	}

	:global(.sev-high) {
		background: hsl(var(--twc-warning) / 0.15);
		color: var(--warning);
		border-color: hsl(var(--twc-warning) / 0.25);
	}

	:global(.sev-medium) {
		background: hsl(var(--twc-warning) / 0.1);
		color: hsl(var(--twc-warning));
		border-color: hsl(var(--twc-warning) / 0.2);
	}

	:global(.sev-low) {
		background: hsl(var(--twc-base-300) / 0.35);
		color: hsl(var(--twc-base-content) / 0.55);
		border-color: hsl(var(--twc-base-300) / 0.5);
	}

	/* Metadata grid */
	:global(.meta-grid) {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
		gap: 0.875rem 1.25rem;
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
		color: var(--base-content);
		margin: 0;
	}

	/* Data tables */
	:global(.table-container) {
		border-radius: 0.375rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.55);
		overflow: hidden;
		background: hsl(var(--twc-base-100));
	}

	:global(.table-container th) {
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: hsl(var(--twc-base-content) / 0.45);
		background: hsl(var(--twc-base-200) / 0.5);
		border-bottom: 1px solid hsl(var(--twc-base-300) / 0.55);
	}

	:global(.table-container td) {
		font-size: 0.8125rem;
		border-bottom: 1px solid hsl(var(--twc-base-300) / 0.25);
	}

	:global(.table-container tbody tr:hover) {
		background: hsl(var(--twc-base-200) / 0.35);
	}

	:global(.table-container tbody tr:last-child td) {
		border-bottom: none;
	}

	/* Tabs — Grafana underline style */
	:global(.dash-panel section > nav),
	:global(section > nav) {
		border-bottom: 1px solid hsl(var(--twc-base-300) / 0.55);
		margin-bottom: 0;
		gap: 0;
	}

	:global(section > nav button) {
		font-size: 0.8125rem;
		font-weight: 500;
		padding: 0.625rem 1rem !important;
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
		background: transparent !important;
	}

	:global(.stat-line) {
		font-size: 0.75rem;
		color: hsl(var(--twc-base-content) / 0.5);
		margin-bottom: 0.75rem;
	}

	:global(.stat-line strong) {
		color: var(--base-content);
		font-weight: 600;
	}

	:global(.report-footer) {
		margin-top: 1.5rem;
		padding: 0.625rem 0.75rem;
		border-radius: 0.25rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.35);
		background: hsl(var(--twc-base-200) / 0.25);
		font-size: 0.6875rem;
		color: hsl(var(--twc-base-content) / 0.45);
	}

	:global(.report-footer code) {
		font-size: 0.6875rem;
		padding: 0.0625rem 0.25rem;
		border-radius: 0.1875rem;
		background: hsl(var(--twc-base-300) / 0.35);
	}
</style>
