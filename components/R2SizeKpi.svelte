<script>
	/** @type {'total' | 'daily'} */
	export let mode = 'total';
	/** @type {'hub' | 'site'} */
	export let scope = 'hub';
	/** @type {Record<string, any> | null | undefined} */
	export let row = null;

	const TYPE_LABELS = [
		{ key: 'images', label: 'Images' },
		{ key: 'json', label: 'JSON' },
		{ key: 'excel', label: 'Excel' },
		{ key: 'csv', label: 'CSV' },
		{ key: 'parquet', label: 'Parquet' },
		{ key: 'other', label: 'Other' }
	];

	let open = false;

	$: prefix =
		scope === 'site'
			? mode === 'daily'
				? 'r2_daily'
				: 'r2'
			: mode === 'daily'
				? 'total_r2_daily'
				: 'total_r2';
	$: totalBytes =
		scope === 'site' && mode === 'daily'
			? num(row?.r2_daily_size)
			: num(row?.[`${prefix}_size_bytes`]);
	$: totalGb = totalBytes / Math.pow(1024, 3);
	$: cardLabel = mode === 'daily' ? 'R2 Daily (GB)' : 'R2 Size (GB)';
	$: modalTitle =
		mode === 'daily' ? 'R2 daily size by file type' : 'R2 total size by file type';
	$: breakdown = TYPE_LABELS.map(({ key, label }) => {
		const bytes = num(row?.[`${prefix}_${key}_bytes`]);
		const gb = bytes / Math.pow(1024, 3);
		const pct = totalBytes > 0 ? (100 * bytes) / totalBytes : 0;
		return { label, bytes, gb, pct };
	}).sort((a, b) => b.bytes - a.bytes);

	/** @param {any} value */
	function num(value) {
		const n = Number(value);
		return Number.isFinite(n) ? n : 0;
	}

	/** @param {number} gb */
	function fmtGb(gb) {
		if (gb >= 100) return gb.toFixed(1);
		if (gb >= 10) return gb.toFixed(2);
		if (gb >= 1) return gb.toFixed(2);
		if (gb >= 0.01) return gb.toFixed(3);
		if (gb > 0) return gb.toFixed(4);
		return '0.00';
	}

	/** @param {number} pct */
	function fmtPct(pct) {
		if (pct >= 10) return pct.toFixed(1);
		if (pct > 0) return pct.toFixed(2);
		return '0.0';
	}

	function openModal() {
		open = true;
	}

	function closeModal() {
		open = false;
	}

	/** @param {KeyboardEvent} event */
	function onWindowKeydown(event) {
		if (open && event.key === 'Escape') closeModal();
	}
</script>

<svelte:window on:keydown={onWindowKeydown} />

<button type="button" class="r2-kpi" on:click={openModal} aria-haspopup="dialog" aria-expanded={open}>
	<div class="kpi-card" data-tone="neutral">
		<p class="kpi-card__label">{cardLabel}</p>
		<p class="kpi-card__value">{fmtGb(totalGb)}</p>
		<p class="r2-kpi__hint">Click for breakdown</p>
	</div>
</button>

{#if open}
	<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
	<div class="r2-modal-backdrop" on:click={closeModal}>
		<div
			class="r2-modal"
			role="dialog"
			aria-modal="true"
			aria-labelledby="r2-modal-title-{mode}"
			on:click|stopPropagation
		>
			<div class="r2-modal__header">
				<div>
					<h2 id="r2-modal-title-{mode}" class="r2-modal__title">{modalTitle}</h2>
					<p class="r2-modal__subtitle">
						Total <strong>{fmtGb(totalGb)} GB</strong>
						{#if row?.partition_date}
							· run {row.partition_date}
						{/if}
					</p>
				</div>
				<button type="button" class="r2-modal__close" on:click={closeModal} aria-label="Close">
					×
				</button>
			</div>

			<div class="r2-modal__table-wrap">
				<table class="r2-modal__table">
					<thead>
						<tr>
							<th>Type</th>
							<th>Size (GB)</th>
							<th>Share</th>
						</tr>
					</thead>
					<tbody>
						{#each breakdown as item (item.label)}
							<tr class:zero={item.bytes === 0}>
								<td>
									<span class="r2-modal__type">{item.label}</span>
								</td>
								<td>{fmtGb(item.gb)}</td>
								<td>
									<div class="r2-modal__share">
										<div class="r2-modal__bar" aria-hidden="true">
											<span style="width: {Math.min(item.pct, 100)}%"></span>
										</div>
										<span class="r2-modal__pct">{fmtPct(item.pct)}%</span>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
					<tfoot>
						<tr>
							<td><strong>Total</strong></td>
							<td><strong>{fmtGb(totalGb)}</strong></td>
							<td><strong>100%</strong></td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	</div>
{/if}

<style>
	.r2-kpi {
		display: block;
		width: 100%;
		padding: 0;
		border: none;
		background: transparent;
		text-align: inherit;
		cursor: pointer;
		font: inherit;
	}

	.r2-kpi:focus-visible {
		outline: 2px solid var(--color-primary, #3b82f6);
		outline-offset: 3px;
		border-radius: var(--radius-md, 12px);
	}

	.r2-kpi__hint {
		margin: 8px 0 0;
		font-size: 11px;
		font-weight: 500;
		color: var(--color-text-muted, #8b95a5);
	}

	.r2-modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		background: rgba(15, 17, 23, 0.45);
		backdrop-filter: blur(2px);
	}

	.r2-modal {
		width: min(100%, 520px);
		max-height: calc(100vh - 48px);
		overflow: auto;
		border-radius: var(--radius-md, 12px);
		background: var(--color-surface, #fff);
		box-shadow: var(--shadow-lg, 0 4px 12px rgba(0, 0, 0, 0.06));
		border: 1px solid var(--color-border-subtle, #f0f1f3);
	}

	.r2-modal__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		padding: 20px 20px 12px;
		border-bottom: 1px solid var(--color-border-subtle, #f0f1f3);
	}

	.r2-modal__title {
		margin: 0;
		font-size: 18px;
		font-weight: 700;
		line-height: 1.3;
		color: var(--color-text, #1a1d23);
	}

	.r2-modal__subtitle {
		margin: 6px 0 0;
		font-size: 13px;
		color: var(--color-text-secondary, #5f6b7a);
	}

	.r2-modal__subtitle strong {
		color: var(--color-text, #1a1d23);
		font-weight: 600;
	}

	.r2-modal__close {
		flex-shrink: 0;
		width: 32px;
		height: 32px;
		border: none;
		border-radius: 8px;
		background: var(--color-surface-alt, #f1f3f5);
		color: var(--color-text-secondary, #5f6b7a);
		font-size: 22px;
		line-height: 1;
		cursor: pointer;
		transition: background 0.15s ease, color 0.15s ease;
	}

	.r2-modal__close:hover {
		background: var(--color-surface-hover, #f4f5f7);
		color: var(--color-text, #1a1d23);
	}

	.r2-modal__table-wrap {
		padding: 8px 20px 20px;
	}

	.r2-modal__table {
		width: 100%;
		border-collapse: collapse;
	}

	.r2-modal__table th {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-text-muted, #8b95a5);
		text-align: left;
		padding: 10px 0;
		border-bottom: 1px solid var(--color-border, #e8eaed);
	}

	.r2-modal__table th:nth-child(2),
	.r2-modal__table th:nth-child(3) {
		text-align: right;
	}

	.r2-modal__table td {
		padding: 12px 0;
		font-size: 14px;
		color: var(--color-text, #1a1d23);
		border-bottom: 1px solid var(--color-border-subtle, #f0f1f3);
		font-variant-numeric: tabular-nums;
	}

	.r2-modal__table td:nth-child(2),
	.r2-modal__table td:nth-child(3) {
		text-align: right;
	}

	.r2-modal__table tr.zero td {
		color: var(--color-text-muted, #8b95a5);
	}

	.r2-modal__table tfoot td {
		border-bottom: none;
		padding-top: 14px;
	}

	.r2-modal__type {
		font-weight: 500;
	}

	.r2-modal__share {
		display: inline-flex;
		align-items: center;
		justify-content: flex-end;
		gap: 10px;
		min-width: 140px;
	}

	.r2-modal__bar {
		flex: 1 1 72px;
		max-width: 72px;
		height: 6px;
		border-radius: 999px;
		background: var(--color-surface-alt, #f1f3f5);
		overflow: hidden;
	}

	.r2-modal__bar span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: var(--color-primary, #3b82f6);
	}

	.r2-modal__pct {
		min-width: 44px;
		font-size: 13px;
		color: var(--color-text-secondary, #5f6b7a);
	}
</style>
