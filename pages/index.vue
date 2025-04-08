<template>
    <div class="text-xl sm:text-2xl">
        Welcome back, <span class="font-bold">{{ currentUser?.name }}</span>
    </div>
    <div>
        You are a member of the
        <span class="font-bold">{{ currentUser?.group }}</span> group.
    </div>

    <div class="mt-5">
        <div class="max-w-[400px] rounded-md bg-gray-200 p-2 dark:bg-gray-900">
            <UVerticalNavigation :links="links">
                <template #default="{ link }">
                    <span class="link relative font-medium">{{ link.label }}</span>
                </template>
            </UVerticalNavigation>
        </div>
    </div>

    <!-- <UButton @click="test">Test</UButton> -->
</template>

<script setup>
const { user: currentUser } = useUser();

const links = computed(() => [
    { label: 'New Day Order', icon: 'i-heroicons-briefcase', to: currentUser.value?.group === 'Admin' ? '/admin/day-orders/create' : '/day-orders/create' },
    { label: 'My Day Orders', icon: 'i-heroicons-users', to: '/user/day-orders', class: currentUser.value?.group === 'Admin' ? 'hidden' : '' }
]);

const test = async () => {
    const response = await fetch(`/api/test`, { 
        method: 'POST',
        'Content-Type': 'application/json',
        body: JSON.stringify({
            userId: 1
        })
    });
};
</script>

<style scoped lang="postcss">
.link {
    @apply w-fit px-2 py-1 text-sm font-semibold transition-all;
}
</style>
