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
	maxWidth={1280}
	homePageName="Overview"
	hideBreadcrumbs={true}
	hideTOC={true}
>
	<slot />
</EvidenceDefaultLayout>

<style>
	/* Embedded analytics shell — native Evidence components, minimal overrides */

	:global(body) {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		background: var(--base-100);
		color: var(--base-content);
	}

	:global(.markdown) {
		max-width: none;
	}

	/* Page rhythm */
	:global(.markdown h2) {
		margin-top: 2rem;
		margin-bottom: 0.75rem;
		padding-bottom: 0;
		border-bottom: none;
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: hsl(var(--twc-base-content) / 0.45);
	}

	:global(.markdown hr) {
		margin: 1.75rem 0;
		border-color: hsl(var(--twc-base-300) / 0.5);
	}

	/* Report context strip */
	:global(.report-context) {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1rem;
		margin: 0 0 1.25rem;
		font-size: 0.8125rem;
		color: hsl(var(--twc-base-content) / 0.5);
	}

	:global(.report-context strong) {
		color: var(--base-content);
		font-weight: 600;
	}

	:global(.report-context .ctx-sep) {
		color: hsl(var(--twc-base-content) / 0.2);
	}

	/* Inline nav links */
	:global(.report-nav) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 0 0 1.5rem;
	}

	:global(.report-nav a) {
		display: inline-flex;
		align-items: center;
		padding: 0.375rem 0.75rem;
		border-radius: 0.375rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.6);
		background: var(--base-100);
		font-size: 0.8125rem;
		font-weight: 500;
		color: hsl(var(--twc-base-content) / 0.65);
		text-decoration: none;
		transition: border-color 0.15s, color 0.15s;
	}

	:global(.report-nav a:hover) {
		border-color: hsl(var(--twc-primary) / 0.4);
		color: var(--primary);
	}

	/* Site detail header */
	:global(.site-hero) {
		margin-bottom: 1.5rem;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid hsl(var(--twc-base-300) / 0.5);
	}

	:global(.site-hero h1) {
		margin: 0.5rem 0 0;
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.025em;
		color: var(--base-content);
	}

	:global(.site-hero .site-sub) {
		margin: 0.25rem 0 0;
		font-size: 0.875rem;
		color: hsl(var(--twc-base-content) / 0.5);
	}

	:global(.back-link) {
		display: inline-block;
		font-size: 0.8125rem;
		font-weight: 500;
		color: hsl(var(--twc-base-content) / 0.45);
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
		border-radius: 9999px;
		padding: 0.2rem 0.625rem;
		font-size: 0.75rem;
		font-weight: 600;
	}
	:global(.status-ok)      { background: hsl(var(--twc-positive) / 0.12); color: var(--positive); }
	:global(.status-failed)  { background: hsl(var(--twc-negative) / 0.12); color: var(--negative); }
	:global(.status-missing) { background: hsl(var(--twc-warning) / 0.12); color: var(--warning); }

	:global(.sev-badge) {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		border-radius: 9999px;
		padding: 0.2rem 0.625rem;
		font-size: 0.75rem;
		font-weight: 600;
	}
	:global(.sev-critical) { background: hsl(var(--twc-negative) / 0.12); color: var(--negative); }
	:global(.sev-high)     { background: hsl(25 95% 53% / 0.12); color: #c2410c; }
	:global(.sev-medium)   { background: hsl(var(--twc-warning) / 0.12); color: var(--warning); }
	:global(.sev-low)       { background: hsl(var(--twc-base-300) / 0.4); color: hsl(var(--twc-base-content) / 0.55); }

	/* Metadata grid inside Details */
	:global(.meta-grid) {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8.75rem, 1fr));
		gap: 1rem 1.5rem;
		font-size: 0.8125rem;
	}

	:global(.meta-grid .meta-label) {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: hsl(var(--twc-base-content) / 0.4);
		margin-bottom: 0.125rem;
	}

	:global(.meta-grid .meta-value) {
		font-weight: 600;
		color: var(--base-content);
		margin: 0;
	}

	/* Tables — light polish on native Evidence tables */
	:global(.table-container) {
		border-radius: 0.5rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.55);
		overflow: hidden;
	}

	:global(.table-container th) {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: hsl(var(--twc-base-content) / 0.45);
		background: hsl(var(--twc-base-200) / 0.6);
	}

	:global(.table-container td) {
		font-size: 0.8125rem;
	}

	:global(.table-container tbody tr:hover) {
		background: hsl(var(--twc-base-200) / 0.4);
	}

	/* Tabs */
	:global(section > nav) {
		border-bottom: 1px solid hsl(var(--twc-base-300) / 0.5);
	}

	:global(section > nav button) {
		font-size: 0.8125rem;
		font-weight: 500;
	}

	:global(.stat-line) {
		font-size: 0.8125rem;
		color: hsl(var(--twc-base-content) / 0.5);
		margin-bottom: 1rem;
	}

	:global(.stat-line strong) {
		color: var(--base-content);
		font-weight: 600;
	}

	:global(.report-footer) {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid hsl(var(--twc-base-300) / 0.4);
		font-size: 0.75rem;
		color: hsl(var(--twc-base-content) / 0.4);
	}
</style>
