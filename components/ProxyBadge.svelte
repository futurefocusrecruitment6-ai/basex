<script>
	/** @type {boolean | null | undefined} */
	export let uses_proxy = null;
</script>

{#if uses_proxy === true}
	<span class="badge badge-proxy" title="Scrapes via HTTP proxy">Proxy</span>
{:else if uses_proxy === false}
	<span class="badge badge-direct" title="Direct HTTP — no proxy">Direct</span>
{:else}
	<span class="badge badge-muted" title="Set uses_proxy in monitor-sites/registry.yml">Unknown</span>
{/if}
