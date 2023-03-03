<script lang="ts">
    let disabled = false;
    let email = "";

    function handle() {

    }
</script>

<h2>Forgot Password</h2>
<p>Write your email address and you'll receive a link to change passwords</p>
<form class="mt-2 w-full flex flex-col gap-3" on:submit|preventDefault>
    <input class="input" type="email" placeholder="email" autocomplete="email" bind:value={email} required />
    <button disabled={disabled} class="btn variant-glass-secondary" on:click={handle}>Submit</button>
</form>
