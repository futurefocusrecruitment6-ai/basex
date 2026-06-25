<script>
	import { EvidenceDefaultLayout } from '@evidence-dev/core-components';
	export let data;
</script>

<EvidenceDefaultLayout
	{data}
	title="Monitor Hub"
	builtWithEvidence={false}
	maxWidth={1440}
>
	<slot />
</EvidenceDefaultLayout>

<style>
	/* ------------------------------------------------------------------ */
	/*  Typography                                                        */
	/* ------------------------------------------------------------------ */
	:global(.markdown h1) {
		letter-spacing: -0.03em;
		font-weight: 800;
		font-size: 1.75rem;
	}
	:global(.markdown h2) {
		margin-top: 2.5rem;
		padding-bottom: 0.625rem;
		border-bottom: 1px solid hsl(var(--twc-base-300) / 0.5);
		font-size: 1.125rem;
		font-weight: 700;
		letter-spacing: -0.015em;
	}

	/* ------------------------------------------------------------------ */
	/*  DataTable styling via .table-container (actual Evidence class)     */
	/* ------------------------------------------------------------------ */
	:global(.table-container) {
		border-radius: 0.75rem;
		overflow: hidden;
		border: 1px solid hsl(var(--twc-base-300) / 0.5);
	}
	:global(.table-container .scrollbox) {
		border-radius: 0.75rem;
	}
	:global(.table-container th) {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: hsl(var(--twc-base-content) / 0.5);
		background: hsl(var(--twc-base-200) / 0.5);
		padding: 0.625rem 0.75rem;
		white-space: nowrap;
	}
	:global(.table-container td) {
		padding: 0.5rem 0.75rem;
		font-size: 0.8125rem;
		border-bottom: 1px solid hsl(var(--twc-base-300) / 0.3);
	}
	:global(.table-container tbody tr:hover) {
		background: hsl(var(--twc-base-200) / 0.35);
	}

	/* ------------------------------------------------------------------ */
	/*  Tabs — target the actual <nav> inside <section>                   */
	/* ------------------------------------------------------------------ */
	:global(section > nav) {
		gap: 0;
		border-bottom: 2px solid hsl(var(--twc-base-300) / 0.4);
	}
	:global(section > nav button) {
		font-size: 0.8125rem;
		font-weight: 600;
		padding: 0.625rem 1.25rem;
		border-radius: 0.5rem 0.5rem 0 0;
		transition: background 0.15s ease, color 0.15s ease;
	}

	/* ------------------------------------------------------------------ */
	/*  Utility: dashboard hero block                                     */
	/* ------------------------------------------------------------------ */
	:global(.dash-hero) {
		margin-bottom: 2rem;
		border-radius: 1rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.6);
		background: linear-gradient(135deg, hsl(var(--twc-primary) / 0.04), var(--base-100), hsl(var(--twc-info) / 0.04));
		padding: 1.5rem;
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.03);
	}
	:global(.dash-hero .hero-label) {
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--primary);
		margin-bottom: 0.25rem;
	}
	:global(.dash-hero .hero-desc) {
		font-size: 0.875rem;
		color: hsl(var(--twc-base-content) / 0.6);
		max-width: 48rem;
		line-height: 1.6;
	}

	/* ------------------------------------------------------------------ */
	/*  Filter bar                                                        */
	/* ------------------------------------------------------------------ */
	:global(.dash-filter-bar) {
		margin-bottom: 1.5rem;
		border-radius: 0.75rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.5);
		background: hsl(var(--twc-base-200) / 0.25);
		padding: 1rem 1.25rem;
	}
	:global(.dash-filter-bar .filter-label) {
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: hsl(var(--twc-base-content) / 0.4);
		margin-bottom: 0.75rem;
	}

	/* ------------------------------------------------------------------ */
	/*  Meta pills (partition/listing date badges)                        */
	/* ------------------------------------------------------------------ */
	:global(.dash-meta-pill) {
		display: inline-flex;
		align-items: center;
		border-radius: 0.375rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.6);
		background: hsl(var(--twc-base-200) / 0.4);
		padding: 0.25rem 0.625rem;
		font-size: 0.7rem;
		font-weight: 500;
		color: hsl(var(--twc-base-content) / 0.55);
	}
	:global(.dash-meta-pill strong) {
		margin-left: 0.25rem;
		color: var(--base-content);
		font-weight: 700;
	}

	/* ------------------------------------------------------------------ */
	/*  Section labels                                                    */
	/* ------------------------------------------------------------------ */
	:global(.dash-section-label) {
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: hsl(var(--twc-base-content) / 0.35);
		margin-bottom: 0.75rem;
	}

	/* ------------------------------------------------------------------ */
	/*  Severity badges                                                   */
	/* ------------------------------------------------------------------ */
	:global(.sev-badge) {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		border-radius: 9999px;
		padding: 0.25rem 0.75rem;
		font-size: 0.7rem;
		font-weight: 700;
	}
	:global(.sev-critical) { border: 1px solid #fecaca; background: #fef2f2; color: #b91c1c; }
	:global(.sev-high)     { border: 1px solid #fed7aa; background: #fff7ed; color: #c2410c; }
	:global(.sev-medium)   { border: 1px solid #fde68a; background: #fefce8; color: #a16207; }
	:global(.sev-low)      { border: 1px solid hsl(var(--twc-base-300)); background: hsl(var(--twc-base-200)); color: hsl(var(--twc-base-content) / 0.5); }

	/* ------------------------------------------------------------------ */
	/*  Status badges                                                     */
	/* ------------------------------------------------------------------ */
	:global(.status-badge) {
		display: inline-flex;
		align-items: center;
		border-radius: 9999px;
		padding: 0.25rem 0.625rem;
		font-size: 0.7rem;
		font-weight: 700;
	}
	:global(.status-ok)      { border: 1px solid #bbf7d0; background: #f0fdf4; color: #15803d; }
	:global(.status-failed)  { border: 1px solid #fecaca; background: #fef2f2; color: #b91c1c; }
	:global(.status-missing) { border: 1px solid #fde68a; background: #fefce8; color: #a16207; }

	/* ------------------------------------------------------------------ */
	/*  Summary stat line                                                 */
	/* ------------------------------------------------------------------ */
	:global(.dash-stat-line) {
		font-size: 0.8125rem;
		color: hsl(var(--twc-base-content) / 0.5);
		margin-bottom: 1rem;
	}
	:global(.dash-stat-line strong) {
		color: var(--base-content);
		font-weight: 700;
	}

	/* ------------------------------------------------------------------ */
	/*  Footer navigation                                                 */
	/* ------------------------------------------------------------------ */
	:global(.dash-footer) {
		font-size: 0.7rem;
		color: hsl(var(--twc-base-content) / 0.4);
		margin-top: 2.5rem;
		padding-top: 1rem;
		border-top: 1px solid hsl(var(--twc-base-300) / 0.3);
	}
	:global(.dash-footer a) {
		color: var(--primary);
		font-weight: 600;
	}
</style>
