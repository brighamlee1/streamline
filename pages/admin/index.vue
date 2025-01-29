<template>
    <div v-if="currentUser?.group === 'Admin'">
        <UBreadcrumb class="mb-6" :links="breadcrumbLinks" :ui="{ active: 'dark:text-red-500' }" />
        <div class="max-w-[400px] rounded-md bg-gray-200 p-2 dark:bg-gray-900">
            <UVerticalNavigation :links="links" :ui="{ padding: 'py-2.5' }">
                <template #default="{ link }">
                    <span class="relative font-medium">{{ link.label }}</span>
                </template>
            </UVerticalNavigation>
        </div>
    </div>

    <div v-else class="text-2xl font-medium">You do not have permission to view this page.</div>
</template>

<script setup>
const { user: currentUser } = useUser();

const breadcrumbLinks = [{ label: 'Admin', icon: 'i-heroicons-user-group', to: '/admin' }];

const links = [
    { label: 'Active Jobs', icon: 'i-heroicons-briefcase', to: '/admin/jobs/active' },
    { label: 'Inactive Jobs', icon: 'i-heroicons-briefcase', to: '/admin/jobs/inactive' },
    { label: 'Users', icon: 'i-heroicons-users', to: '/admin/users' },
    { label: 'Active Day Orders', icon: 'i-heroicons-clipboard-document-list', to: '/reporting/day-orders/active' },
    { label: 'Inactive Day Orders', icon: 'i-heroicons-clipboard-document-list', to: '/reporting/day-orders/inactive' }
];
</script>
