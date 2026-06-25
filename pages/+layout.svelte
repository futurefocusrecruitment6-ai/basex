<script>
	import { EvidenceDefaultLayout } from '@evidence-dev/core-components';
	export let data;
</script>

<EvidenceDefaultLayout
	{data}
	title="Monitor Hub"
	builtWithEvidence={false}
	maxWidth={1536}
	homePageName="Overview"
>
	<slot />
</EvidenceDefaultLayout>

<style>
	/* ------------------------------------------------------------------ */
	/*  App shell — v0 / shadcn dashboard feel                            */
	/* ------------------------------------------------------------------ */
	:global(body) {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(main),
	:global(.content) {
		background: hsl(var(--twc-base-200) / 0.35) !important;
	}

	:global(.markdown) {
		max-width: none;
	}

	/* ------------------------------------------------------------------ */
	/*  Typography                                                        */
	/* ------------------------------------------------------------------ */
	:global(.markdown h1) {
		letter-spacing: -0.03em;
		font-weight: 800;
		font-size: 1.75rem;
	}
	:global(.markdown h2) {
		margin-top: 2rem;
		padding-bottom: 0.5rem;
		border-bottom: none;
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: hsl(var(--twc-base-content) / 0.85);
	}

	/* ------------------------------------------------------------------ */
	/*  Page layout                                                       */
	/* ------------------------------------------------------------------ */
	:global(.dash-page) {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	:global(.dash-page-header) {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem 1.5rem;
	}

	:global(.dash-page-header h1) {
		margin: 0;
		font-size: 1.875rem;
		font-weight: 800;
		letter-spacing: -0.035em;
		line-height: 1.15;
		color: var(--base-content);
	}

	:global(.dash-page-header .dash-page-desc) {
		margin: 0.375rem 0 0;
		font-size: 0.875rem;
		line-height: 1.55;
		color: hsl(var(--twc-base-content) / 0.55);
		max-width: 40rem;
	}

	:global(.dash-page-meta) {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	/* ------------------------------------------------------------------ */
	/*  Quick nav cards                                                   */
	/* ------------------------------------------------------------------ */
	:global(.dash-quick-nav) {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: 0.75rem;
	}

	:global(.dash-quick-nav a) {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border-radius: 0.75rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.65);
		background: var(--base-100);
		padding: 0.875rem 1rem;
		text-decoration: none;
		transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.04);
	}

	:global(.dash-quick-nav a:hover) {
		border-color: hsl(var(--twc-primary) / 0.35);
		box-shadow: 0 4px 12px hsl(var(--twc-primary) / 0.08);
		transform: translateY(-1px);
	}

	:global(.dash-quick-nav .nav-icon) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		background: hsl(var(--twc-primary) / 0.1);
		color: var(--primary);
		font-size: 0.875rem;
		font-weight: 700;
		flex-shrink: 0;
	}

	:global(.dash-quick-nav .nav-label) {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--base-content);
		line-height: 1.2;
	}

	:global(.dash-quick-nav .nav-sub) {
		font-size: 0.6875rem;
		color: hsl(var(--twc-base-content) / 0.45);
		margin-top: 0.125rem;
	}

	/* ------------------------------------------------------------------ */
	/*  Filter panel                                                      */
	/* ------------------------------------------------------------------ */
	:global(.dash-filter-bar) {
		border-radius: 0.75rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.55);
		background: var(--base-100);
		padding: 1rem 1.25rem;
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.03);
	}

	:global(.dash-filter-bar .filter-label) {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: hsl(var(--twc-base-content) / 0.4);
		margin-bottom: 0.875rem;
	}

	/* ------------------------------------------------------------------ */
	/*  KPI stat cards                                                    */
	/* ------------------------------------------------------------------ */
	:global(.dash-kpi-grid) {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	@media (min-width: 640px) {
		:global(.dash-kpi-grid) {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	:global(.dash-kpi-grid.cols-3) {
		grid-template-columns: repeat(1, minmax(0, 1fr));
	}

	@media (min-width: 640px) {
		:global(.dash-kpi-grid.cols-3) {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	:global(.dash-kpi-card) {
		position: relative;
		overflow: hidden;
		border-radius: 0.75rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.55);
		background: var(--base-100);
		padding: 1.25rem;
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.04);
		transition: box-shadow 0.15s ease;
	}

	:global(.dash-kpi-card:hover) {
		box-shadow: 0 4px 12px rgb(0 0 0 / 0.06);
	}

	:global(.dash-kpi-card::before) {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: hsl(var(--twc-base-300) / 0.6);
	}

	:global(.dash-kpi-card.kpi-success::before) { background: #22c55e; }
	:global(.dash-kpi-card.kpi-info::before)    { background: var(--primary); }
	:global(.dash-kpi-card.kpi-warning::before) { background: #f59e0b; }
	:global(.dash-kpi-card.kpi-danger::before)  { background: #ef4444; }
	:global(.dash-kpi-card.kpi-neutral::before) { background: hsl(var(--twc-base-content) / 0.25); }

	:global(.dash-kpi-top) {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	:global(.dash-kpi-label) {
		font-size: 0.8125rem;
		font-weight: 500;
		color: hsl(var(--twc-base-content) / 0.55);
		line-height: 1.3;
	}

	:global(.dash-kpi-icon) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		font-size: 0.75rem;
		font-weight: 700;
		flex-shrink: 0;
	}

	:global(.kpi-success .dash-kpi-icon) { background: #dcfce7; color: #15803d; }
	:global(.kpi-info .dash-kpi-icon)    { background: hsl(var(--twc-primary) / 0.12); color: var(--primary); }
	:global(.kpi-warning .dash-kpi-icon) { background: #fef3c7; color: #b45309; }
	:global(.kpi-danger .dash-kpi-icon)  { background: #fee2e2; color: #b91c1c; }
	:global(.kpi-neutral .dash-kpi-icon) { background: hsl(var(--twc-base-200)); color: hsl(var(--twc-base-content) / 0.5); }

	:global(.dash-kpi-value) {
		font-size: 1.875rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1;
		color: var(--base-content);
		font-variant-numeric: tabular-nums;
	}

	:global(.dash-kpi-sub) {
		margin-top: 0.375rem;
		font-size: 0.75rem;
		color: hsl(var(--twc-base-content) / 0.45);
	}

	/* ------------------------------------------------------------------ */
	/*  Section panels & chart cards                                        */
	/* ------------------------------------------------------------------ */
	:global(.dash-section) {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	:global(.dash-section-head) {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
	}

	:global(.dash-section-title) {
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--base-content);
		letter-spacing: -0.01em;
	}

	:global(.dash-section-desc) {
		font-size: 0.8125rem;
		color: hsl(var(--twc-base-content) / 0.45);
	}

	:global(.dash-panel) {
		border-radius: 0.75rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.55);
		background: var(--base-100);
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.04);
		overflow: hidden;
	}

	:global(.dash-panel-padded) {
		padding: 1.25rem;
	}

	:global(.dash-chart-card) {
		border-radius: 0.75rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.55);
		background: var(--base-100);
		padding: 0.25rem 0.5rem 0.5rem;
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.04);
	}

	/* ------------------------------------------------------------------ */
	/*  Meta pills                                                        */
	/* ------------------------------------------------------------------ */
	:global(.dash-meta-pill) {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		border-radius: 9999px;
		border: 1px solid hsl(var(--twc-base-300) / 0.6);
		background: var(--base-100);
		padding: 0.3125rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: hsl(var(--twc-base-content) / 0.55);
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.03);
	}

	:global(.dash-meta-pill strong) {
		color: var(--base-content);
		font-weight: 600;
	}

	:global(.dash-section-label) {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: hsl(var(--twc-base-content) / 0.4);
		margin-bottom: 0.375rem;
	}

	/* ------------------------------------------------------------------ */
	/*  Site detail header card                                           */
	/* ------------------------------------------------------------------ */
	:global(.dash-site-header) {
		border-radius: 0.75rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.55);
		background: var(--base-100);
		padding: 1.5rem;
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.04);
	}

	:global(.dash-back-link) {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: hsl(var(--twc-base-content) / 0.55);
		text-decoration: none;
		margin-bottom: 1rem;
		transition: color 0.15s ease;
	}

	:global(.dash-back-link:hover) {
		color: var(--primary);
	}

	/* ------------------------------------------------------------------ */
	/*  Severity & status badges                                          */
	/* ------------------------------------------------------------------ */
	:global(.sev-badge) {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		border-radius: 9999px;
		padding: 0.3125rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 600;
	}
	:global(.sev-critical) { border: 1px solid #fecaca; background: #fef2f2; color: #b91c1c; }
	:global(.sev-high)     { border: 1px solid #fed7aa; background: #fff7ed; color: #c2410c; }
	:global(.sev-medium)   { border: 1px solid #fde68a; background: #fefce8; color: #a16207; }
	:global(.sev-low)      { border: 1px solid hsl(var(--twc-base-300)); background: hsl(var(--twc-base-200)); color: hsl(var(--twc-base-content) / 0.5); }

	:global(.status-badge) {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		border-radius: 9999px;
		padding: 0.3125rem 0.625rem;
		font-size: 0.75rem;
		font-weight: 600;
	}
	:global(.status-ok)      { border: 1px solid #bbf7d0; background: #f0fdf4; color: #15803d; }
	:global(.status-failed)  { border: 1px solid #fecaca; background: #fef2f2; color: #b91c1c; }
	:global(.status-missing) { border: 1px solid #fde68a; background: #fefce8; color: #a16207; }

	/* ------------------------------------------------------------------ */
	/*  DataTable                                                         */
	/* ------------------------------------------------------------------ */
	:global(.table-container) {
		border-radius: 0.75rem;
		overflow: hidden;
		border: 1px solid hsl(var(--twc-base-300) / 0.55);
		background: var(--base-100);
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.04);
	}
	:global(.table-container .scrollbox) {
		border-radius: 0.75rem;
	}
	:global(.table-container th) {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: hsl(var(--twc-base-content) / 0.45);
		background: hsl(var(--twc-base-200) / 0.45);
		padding: 0.75rem 1rem;
		white-space: nowrap;
	}
	:global(.table-container td) {
		padding: 0.625rem 1rem;
		font-size: 0.8125rem;
		border-bottom: 1px solid hsl(var(--twc-base-300) / 0.25);
	}
	:global(.table-container tbody tr:hover) {
		background: hsl(var(--twc-base-200) / 0.35);
	}
	:global(.table-container tbody tr:last-child td) {
		border-bottom: none;
	}

	/* ------------------------------------------------------------------ */
	/*  Tabs                                                              */
	/* ------------------------------------------------------------------ */
	:global(section > nav) {
		gap: 0.25rem;
		border-bottom: 1px solid hsl(var(--twc-base-300) / 0.5);
		padding: 0 0.25rem;
		margin-bottom: 0.25rem;
	}
	:global(section > nav button) {
		font-size: 0.8125rem;
		font-weight: 500;
		padding: 0.625rem 1rem;
		border-radius: 0.5rem 0.5rem 0 0;
		color: hsl(var(--twc-base-content) / 0.55);
		transition: background 0.15s ease, color 0.15s ease;
	}
	:global(section > nav button[aria-selected='true']) {
		color: var(--primary);
		font-weight: 600;
	}

	:global(.dash-tab-panel) {
		border-radius: 0.75rem;
		border: 1px solid hsl(var(--twc-base-300) / 0.55);
		background: var(--base-100);
		padding: 1.25rem;
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.04);
		margin-top: 0.75rem;
	}

	:global(.dash-stat-line) {
		font-size: 0.8125rem;
		color: hsl(var(--twc-base-content) / 0.5);
		margin-bottom: 1rem;
	}
	:global(.dash-stat-line strong) {
		color: var(--base-content);
		font-weight: 600;
	}

	/* ------------------------------------------------------------------ */
	/*  BigValue override — match KPI cards when used                     */
	/* ------------------------------------------------------------------ */
	:global(.big-value-wrapper),
	:global([class*='BigValue']) {
		border-radius: 0.75rem !important;
		border: 1px solid hsl(var(--twc-base-300) / 0.55) !important;
		background: var(--base-100) !important;
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.04) !important;
	}

	/* ------------------------------------------------------------------ */
	/*  Footer                                                            */
	/* ------------------------------------------------------------------ */
	:global(.dash-footer) {
		font-size: 0.75rem;
		color: hsl(var(--twc-base-content) / 0.4);
		padding-top: 0.5rem;
	}
	:global(.dash-footer a) {
		color: var(--primary);
		font-weight: 500;
		text-decoration: none;
	}
	:global(.dash-footer a:hover) {
		text-decoration: underline;
	}

	/* Legacy hero — keep for backwards compat but toned down */
	:global(.dash-hero) {
		display: none;
	}
</style>
