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
		border-bottom: 1px solid hsl(var(--base-300) / 0.5);
		font-size: 1.125rem;
		font-weight: 700;
		letter-spacing: -0.015em;
	}

	/* ------------------------------------------------------------------ */
	/*  Responsive Grid overrides                                         */
	/*  Evidence <Grid> uses inline grid-template-columns.                */
	/*  We override at breakpoints so cards and charts stack gracefully.   */
	/* ------------------------------------------------------------------ */

	/* Mobile-first: everything stacks to 1 column */
	@media (max-width: 639px) {
		:global(.evidence-grid) {
			grid-template-columns: 1fr !important;
			gap: 0.75rem !important;
		}
	}

	/* Tablet: 2 columns max */
	@media (min-width: 640px) and (max-width: 1023px) {
		:global(.evidence-grid) {
			grid-template-columns: repeat(2, 1fr) !important;
			gap: 1rem !important;
		}
	}

	/* ------------------------------------------------------------------ */
	/*  BigValue / KPI card styling                                       */
	/* ------------------------------------------------------------------ */
	:global(.big-value) {
		border: 1px solid hsl(var(--base-300) / 0.6);
		border-radius: 0.75rem;
		padding: 1.25rem 1.5rem;
		background: hsl(var(--base-100));
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04);
		transition: box-shadow 0.15s ease, border-color 0.15s ease;
	}
	:global(.big-value:hover) {
		box-shadow: 0 4px 12px 0 rgb(0 0 0 / 0.06);
		border-color: hsl(var(--base-300));
	}
	:global(.big-value .title) {
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: hsl(var(--base-content) / 0.45);
	}
	:global(.big-value .value) {
		font-size: 1.75rem;
		font-weight: 800;
		letter-spacing: -0.025em;
		color: hsl(var(--base-content));
		line-height: 1.2;
	}

	/* ------------------------------------------------------------------ */
	/*  DataTable cleanup                                                 */
	/* ------------------------------------------------------------------ */
	:global(.evidence-table) {
		border-radius: 0.75rem;
		overflow: hidden;
		border: 1px solid hsl(var(--base-300) / 0.5);
	}
	:global(.evidence-table th) {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: hsl(var(--base-content) / 0.5);
		background: hsl(var(--base-200) / 0.5);
		padding: 0.625rem 0.75rem;
		white-space: nowrap;
	}
	:global(.evidence-table td) {
		padding: 0.5rem 0.75rem;
		font-size: 0.8125rem;
		border-bottom: 1px solid hsl(var(--base-300) / 0.3);
	}
	:global(.evidence-table tbody tr:hover) {
		background: hsl(var(--base-200) / 0.35);
	}

	/* ------------------------------------------------------------------ */
	/*  Tabs styling                                                      */
	/* ------------------------------------------------------------------ */
	:global(.evidence-tabs .tab-list) {
		gap: 0;
		border-bottom: 2px solid hsl(var(--base-300) / 0.4);
	}
	:global(.evidence-tabs .tab-list button) {
		font-size: 0.8125rem;
		font-weight: 600;
		padding: 0.625rem 1.25rem;
		border-radius: 0.5rem 0.5rem 0 0;
		transition: background 0.15s ease, color 0.15s ease;
	}

	/* ------------------------------------------------------------------ */
	/*  Charts                                                            */
	/* ------------------------------------------------------------------ */
	:global(.chart-container) {
		border: 1px solid hsl(var(--base-300) / 0.5);
		border-radius: 0.75rem;
		padding: 1rem;
		background: hsl(var(--base-100));
	}

	/* ------------------------------------------------------------------ */
	/*  Dropdown filters                                                  */
	/* ------------------------------------------------------------------ */
	:global(.evidence-dropdown select),
	:global(.evidence-dropdown input) {
		border-radius: 0.5rem;
		font-size: 0.8125rem;
	}

	/* ------------------------------------------------------------------ */
	/*  Utility: section cards (used across pages)                        */
	/* ------------------------------------------------------------------ */
	:global(.dash-hero) {
		margin-bottom: 2rem;
		border-radius: 1rem;
		border: 1px solid hsl(var(--base-300) / 0.6);
		background: linear-gradient(135deg, hsl(var(--primary) / 0.04), hsl(var(--base-100)), hsl(var(--info) / 0.04));
		padding: 1.5rem;
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.03);
	}
	:global(.dash-hero .hero-label) {
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: hsl(var(--primary));
		margin-bottom: 0.25rem;
	}
	:global(.dash-hero .hero-desc) {
		font-size: 0.875rem;
		color: hsl(var(--base-content) / 0.6);
		max-width: 48rem;
		line-height: 1.6;
	}

	:global(.dash-filter-bar) {
		margin-bottom: 1.5rem;
		border-radius: 0.75rem;
		border: 1px solid hsl(var(--base-300) / 0.5);
		background: hsl(var(--base-200) / 0.25);
		padding: 1rem 1.25rem;
	}
	:global(.dash-filter-bar .filter-label) {
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: hsl(var(--base-content) / 0.4);
		margin-bottom: 0.75rem;
	}

	:global(.dash-meta-pill) {
		display: inline-flex;
		align-items: center;
		border-radius: 0.375rem;
		border: 1px solid hsl(var(--base-300) / 0.6);
		background: hsl(var(--base-200) / 0.4);
		padding: 0.25rem 0.625rem;
		font-size: 0.7rem;
		font-weight: 500;
		color: hsl(var(--base-content) / 0.55);
	}
	:global(.dash-meta-pill strong) {
		margin-left: 0.25rem;
		color: hsl(var(--base-content));
		font-weight: 700;
	}

	:global(.dash-section-label) {
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: hsl(var(--base-content) / 0.35);
		margin-bottom: 0.75rem;
	}

	/* Severity badges */
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
	:global(.sev-low)      { border: 1px solid hsl(var(--base-300)); background: hsl(var(--base-200)); color: hsl(var(--base-content) / 0.5); }

	/* Status badges */
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

	/* Summary stat line */
	:global(.dash-stat-line) {
		font-size: 0.8125rem;
		color: hsl(var(--base-content) / 0.5);
		margin-bottom: 1rem;
	}
	:global(.dash-stat-line strong) {
		color: hsl(var(--base-content));
		font-weight: 700;
	}

	/* Footer nav */
	:global(.dash-footer) {
		font-size: 0.7rem;
		color: hsl(var(--base-content) / 0.4);
		margin-top: 2.5rem;
		padding-top: 1rem;
		border-top: 1px solid hsl(var(--base-300) / 0.3);
	}
	:global(.dash-footer a) {
		color: hsl(var(--primary));
		font-weight: 600;
	}
</style>
