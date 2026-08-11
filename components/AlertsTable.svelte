<script>
	import { onMount } from 'svelte';

	/** @type {any} */
	export let data = [];
	/** @type {string} */
	export let emptyMessage = 'No alerts — all scrapers passed for the current filters.';
	/** @type {boolean} */
	export let showSite = true;

	/** @type {Record<string, boolean>} */
	let solvedMap = {};
	/** @type {Record<string, boolean>} */
	let savingMap = {};
	/** @type {string | null} */
	let errorMessage = null;
	let search = '';
	let hideSolved = false;
	let ready = false;

	$: rows = normalizeRows(data);
	$: if (rows) seedFromRows(rows);
	$: filtered = rows.filter((row) => {
		const solved = !!solvedMap[alertKey(row)];
		if (hideSolved && solved) return false;
		if (!search.trim()) return true;
		const q = search.trim().toLowerCase();
		return [
			row.scraper,
			row.severity,
			row.alert_type,
			row.detail,
			row.display_name,
			row.check_name,
			row.file_key,
			row.site_id,
			row.alert_id
		]
			.filter((v) => v != null && v !== '')
			.some((v) => String(v).toLowerCase().includes(q));
	});
	$: openCount = rows.filter((row) => !solvedMap[alertKey(row)]).length;
	$: solvedCount = rows.filter((row) => !!solvedMap[alertKey(row)]).length;

	onMount(async () => {
		seedFromRows(rows);
		ready = true;
		await refreshSolvedFromApi(rows);
	});

	/** @param {any} input */
	function normalizeRows(input) {
		if (!input) return [];
		if (Array.isArray(input)) return input;
		if (typeof input === 'object' && typeof input.length === 'number') {
			return Array.from(input);
		}
		return [];
	}

	/** @param {any} value */
	function truthy(value) {
		if (value === true || value === 1) return true;
		if (value === false || value === 0 || value == null) return false;
		const s = String(value).trim().toLowerCase();
		return s === 'true' || s === 't' || s === '1' || s === 'yes';
	}

	/** @param {any} row */
	function alertKey(row) {
		if (row?.alert_id != null && String(row.alert_id).trim() !== '') {
			return `id:${row.alert_id}`;
		}
		return [
			row?.hub_partition_date ?? '',
			row?.site_id ?? '',
			row?.scraper ?? '',
			row?.alert_type ?? '',
			row?.check_name ?? '',
			row?.detail ?? '',
			row?.file_key ?? ''
		].join('|');
	}

	/** @param {any[]} list */
	function seedFromRows(list) {
		/** @type {Record<string, boolean>} */
		const next = { ...solvedMap };
		let changed = false;
		for (const row of list) {
			const key = alertKey(row);
			if (!(key in next)) {
				next[key] = truthy(row?.solved);
				changed = true;
			}
		}
		if (changed) solvedMap = next;
	}

	/** @param {any[]} list */
	async function refreshSolvedFromApi(list) {
		const ids = list
			.map((row) => (row?.alert_id != null ? String(row.alert_id).trim() : ''))
			.filter(Boolean);

		if (ids.length === 0) return;

		try {
			const res = await fetch(`/api/alerts/solved?ids=${encodeURIComponent(ids.join(','))}`);
			if (!res.ok) return;
			const payload = await res.json();
			const remote = payload?.solved && typeof payload.solved === 'object' ? payload.solved : {};
			/** @type {Record<string, boolean>} */
			const next = { ...solvedMap };
			for (const row of list) {
				const id = row?.alert_id != null ? String(row.alert_id).trim() : '';
				if (!id) continue;
				if (Object.prototype.hasOwnProperty.call(remote, id)) {
					next[`id:${id}`] = !!remote[id];
				}
			}
			solvedMap = next;
		} catch {
			/* keep baked / local state if API unavailable (e.g. evidence dev) */
		}
	}

	/** @param {any} row @param {Event} event */
	async function toggleSolved(row, event) {
		const input = /** @type {HTMLInputElement} */ (event.currentTarget);
		const checked = input.checked;
		const key = alertKey(row);
		const previous = !!solvedMap[key];

		errorMessage = null;
		solvedMap = { ...solvedMap, [key]: checked };
		savingMap = { ...savingMap, [key]: true };

		try {
			const body =
				row?.alert_id != null && String(row.alert_id).trim() !== ''
					? { alert_id: String(row.alert_id).trim(), solved: checked }
					: {
							hub_partition_date: row?.hub_partition_date ?? null,
							site_id: row?.site_id ?? null,
							scraper: row?.scraper ?? null,
							alert_type: row?.alert_type ?? null,
							check_name: row?.check_name ?? null,
							detail: row?.detail ?? null,
							file_key: row?.file_key ?? null,
							solved: checked
						};

			const res = await fetch('/api/alerts/solved', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			if (!res.ok) {
				const payload = await res.json().catch(() => ({}));
				throw new Error(payload.error || `Save failed (${res.status})`);
			}
		} catch (err) {
			solvedMap = { ...solvedMap, [key]: previous };
			input.checked = previous;
			errorMessage =
				err instanceof Error
					? err.message
					: 'Could not save solved state to MotherDuck';
		} finally {
			const nextSaving = { ...savingMap };
			delete nextSaving[key];
			savingMap = nextSaving;
		}
	}

	/** @param {string | null | undefined} severity */
	function severityClass(severity) {
		const s = String(severity ?? '').toLowerCase();
		if (s === 'critical') return 'sev-critical';
		if (s === 'high') return 'sev-high';
		if (s === 'medium') return 'sev-medium';
		return 'sev-low';
	}
</script>

<div class="alerts-table">
	<div class="alerts-table__toolbar">
		<label class="alerts-table__search">
			<span class="sr-only">Search alerts</span>
			<input type="search" bind:value={search} placeholder="Search alerts…" />
		</label>
		<label class="alerts-table__hide">
			<input type="checkbox" bind:checked={hideSolved} />
			Hide solved
		</label>
		<span class="alerts-table__counts">
			<strong>{openCount}</strong> open · <strong>{solvedCount}</strong> solved
		</span>
	</div>

	{#if errorMessage}
		<p class="alerts-table__error">{errorMessage}</p>
	{/if}

	{#if rows.length === 0}
		<p class="alerts-table__empty">{emptyMessage}</p>
	{:else if filtered.length === 0}
		<p class="alerts-table__empty">No alerts match the current search or filters.</p>
	{:else}
		<div class="alerts-table__wrap">
			<table>
				<thead>
					<tr>
						<th class="col-solved">Solved</th>
						<th>Scraper</th>
						<th>Severity</th>
						<th>Alert type</th>
						<th>Detail</th>
						{#if showSite}
							<th>Site</th>
						{/if}
						<th>Check</th>
						<th>File</th>
					</tr>
				</thead>
				<tbody>
					{#each filtered as row (alertKey(row))}
						<tr class:solved={ready && !!solvedMap[alertKey(row)]}>
							<td class="col-solved">
								<label class="solved-check" class:saving={!!savingMap[alertKey(row)]}>
									<input
										type="checkbox"
										checked={ready && !!solvedMap[alertKey(row)]}
										disabled={!!savingMap[alertKey(row)]}
										on:change={(e) => toggleSolved(row, e)}
										aria-label="Mark alert as solved"
									/>
									<span class="box" aria-hidden="true"></span>
								</label>
							</td>
							<td>{row.scraper ?? '—'}</td>
							<td>
								<span class="sev {severityClass(row.severity)}">{row.severity ?? '—'}</span>
							</td>
							<td class="mono">{row.alert_type ?? '—'}</td>
							<td class="detail">{row.detail ?? '—'}</td>
							{#if showSite}
								<td>{row.display_name ?? row.site_id ?? '—'}</td>
							{/if}
							<td class="mono">{row.check_name ?? '—'}</td>
							<td class="mono file">{row.file_key ?? '—'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.alerts-table {
		width: 100%;
	}

	.alerts-table__toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
		margin-bottom: 12px;
	}

	.alerts-table__search {
		flex: 1 1 220px;
		min-width: 180px;
	}

	.alerts-table__search input {
		width: 100%;
		padding: 8px 12px;
		border: 1px solid var(--color-border, #e8eaed);
		border-radius: 8px;
		background: var(--color-surface, #fff);
		color: var(--color-text, #1a1d23);
		font-size: 13.5px;
	}

	.alerts-table__hide {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		color: var(--color-text-secondary, #5f6b7a);
		cursor: pointer;
		user-select: none;
	}

	.alerts-table__counts {
		font-size: 13px;
		color: var(--color-text-secondary, #5f6b7a);
		margin-left: auto;
	}

	.alerts-table__counts strong {
		color: var(--color-text, #1a1d23);
		font-weight: 600;
	}

	.alerts-table__error {
		margin: 0 0 12px;
		padding: 10px 12px;
		border-radius: 8px;
		background: var(--color-bad-soft, #fef2f2);
		color: var(--color-bad-text, #dc2626);
		font-size: 13px;
	}

	.alerts-table__empty {
		margin: 0;
		padding: 28px 16px;
		text-align: center;
		font-size: 14px;
		color: var(--color-text-secondary, #5f6b7a);
		background: var(--color-surface, #fff);
		border: 1px solid var(--color-border-subtle, #f0f1f3);
		border-radius: 12px;
	}

	.alerts-table__wrap {
		width: 100%;
		overflow-x: auto;
		border-radius: 12px;
		background: var(--color-surface, #fff);
		border: 1px solid var(--color-border-subtle, #f0f1f3);
	}

	table {
		width: 100%;
		min-width: 52rem;
		border-collapse: collapse;
	}

	th {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-text-muted, #8b95a5);
		background: var(--color-surface-alt, #f1f3f5);
		border-bottom: 1px solid var(--color-border, #e8eaed);
		white-space: nowrap;
		padding: 10px 14px;
		text-align: left;
	}

	td {
		font-size: 13.5px;
		border-bottom: 1px solid var(--color-border-subtle, #f0f1f3);
		padding: 10px 14px;
		color: var(--color-text, #1a1d23);
		vertical-align: top;
	}

	tbody tr:hover {
		background: var(--color-surface-hover, #f4f5f7);
	}

	tbody tr.solved td {
		color: var(--color-text-muted, #8b95a5);
	}

	tbody tr.solved .detail {
		text-decoration: line-through;
	}

	.col-solved {
		width: 72px;
		text-align: center;
	}

	.solved-check {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	.solved-check.saving {
		opacity: 0.55;
		cursor: wait;
	}

	.solved-check input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.solved-check .box {
		width: 18px;
		height: 18px;
		border-radius: 4px;
		border: 1.5px solid var(--color-border, #e8eaed);
		background: var(--color-surface, #fff);
		display: inline-block;
		position: relative;
		transition: all 0.12s ease;
	}

	.solved-check input:checked + .box {
		background: var(--color-good, #10b981);
		border-color: var(--color-good, #10b981);
	}

	.solved-check input:checked + .box::after {
		content: '';
		position: absolute;
		left: 5px;
		top: 2px;
		width: 5px;
		height: 9px;
		border: solid #fff;
		border-width: 0 2px 2px 0;
		transform: rotate(45deg);
	}

	.solved-check input:focus-visible + .box {
		outline: 2px solid var(--color-primary, #3b82f6);
		outline-offset: 2px;
	}

	.sev {
		display: inline-flex;
		align-items: center;
		padding: 2px 8px;
		border-radius: 999px;
		font-size: 11.5px;
		font-weight: 600;
		text-transform: lowercase;
	}

	.sev-critical,
	.sev-high {
		background: var(--color-bad-soft, #fef2f2);
		color: var(--color-bad-text, #dc2626);
	}

	.sev-medium {
		background: var(--color-warn-soft, #fffbeb);
		color: var(--color-warn-text, #d97706);
	}

	.sev-low {
		background: var(--color-surface-alt, #f1f3f5);
		color: var(--color-text-secondary, #5f6b7a);
	}

	.mono {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 12.5px;
	}

	.detail {
		max-width: 28rem;
		line-height: 1.4;
	}

	.file {
		max-width: 12rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
