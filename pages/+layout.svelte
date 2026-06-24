<script>
	import { EvidenceDefaultLayout } from '@evidence-dev/core-components';
	export let data;
</script>

<EvidenceDefaultLayout
	{data}
	title="Monitor Hub"
	builtWithEvidence={false}
	maxWidth={1360}
>
	<slot />
</EvidenceDefaultLayout>

<style>
	:global(.markdown h1) {
		letter-spacing: -0.025em;
		font-weight: 700;
	}
	:global(.markdown h2) {
		margin-top: 2rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid hsl(var(--base-300) / 0.6);
		font-size: 1.125rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}
</style>
