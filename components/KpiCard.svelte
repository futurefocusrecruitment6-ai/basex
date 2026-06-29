<script>
	/** @type {string} */
	export let label = '';
	/** @type {string | number | null | undefined} */
	export let value = '—';
	/** @type {'neutral' | 'good' | 'bad' | 'warn' | 'primary'} */
	export let tone = 'neutral';
</script>

<div class="kpi-card" data-tone={tone}>
	<p class="kpi-card__label">{label}</p>
	<p class="kpi-card__value">{value ?? '—'}</p>
</div>
