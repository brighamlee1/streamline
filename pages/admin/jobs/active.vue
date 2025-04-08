<template>
    <div v-if="currentUser?.group !== 'Admin'" class="text-xl font-medium">You do not have permission to view this page.</div>

    <LazyAdminJobs v-else :active="true" />
</template>

<script setup>
const { user: currentUser } = useUser();
</script>