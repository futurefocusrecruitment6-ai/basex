<script>
	/** @type {'overview' | 'ads' | 'sites'} */
	export let active = 'overview';
</script>

<nav class="dash-nav">
	<a href="/" class:is-active={active === 'overview'}>Overview</a>
	<a href="/ads" class:is-active={active === 'ads'}>Listing volume</a>
	<a href="/site" class:is-active={active === 'sites'}>All sites</a>
</nav>
