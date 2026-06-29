<script>
	/** @type {Array<{ text: string; bold?: boolean }>} */
	export let items = [];
</script>

<div class="dash-meta">
	{#each items as item, i}
		{#if i > 0}<span class="sep">·</span>{/if}
		<span>
			{#if item.bold}<strong>{item.text}</strong>{:else}{item.text}{/if}
		</span>
	{/each}
</div>
