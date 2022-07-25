<script lang="ts">
	import { auth } from '$lib/Auth/authstore';
</script>

<main>
	{#if $auth === undefined}
		<p>Checking auth status...</p>
	{:else}
		{#if $auth === null}
			<h1>Kirjaudu sisään</h1>
			<button on:click={() => auth.signInWith('google')}>Googlella</button>
		{:else}
			<h1>Hei, {$auth.displayName || $auth.email}</h1>
			<button class="profilebtn" on:click={() => {if(confirm("Are you sure you want to sign out?")){auth.signOut();}}}>
             	Kirjaudu Ulos
             </button>
		{/if}
	{/if}
</main>

<style>
	main {
		background: var(--background);
	}
</style>