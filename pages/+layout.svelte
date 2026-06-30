<script>
	import '@evidence-dev/tailwind/fonts.css';
	import '../app.css';
	import { EvidenceDefaultLayout } from '@evidence-dev/core-components';
	export let data;
</script>

<EvidenceDefaultLayout
	{data}
	title="Monitor Hub"
	builtWithEvidence={false}
	maxWidth={1680}
	homePageName="Overview"
	hideBreadcrumbs={true}
	hideTOC={true}
>
	<div class="dashboard not-prose">
		<slot />
	</div>
</EvidenceDefaultLayout>

<style>
	:global(body) {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		background: #f8f9fb;
		margin: 0;
	}

	:global(.markdown) {
		max-width: none;
		width: 100%;
	}

	:global(.markdown > p:first-of-type),
	:global(.markdown h1) {
		display: none;
	}

	:global(.not-prose *) {
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
	}
</style>
