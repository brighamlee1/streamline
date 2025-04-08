<template>
    <h1 class="mb-4 text-2xl font-medium">{{ active ? 'Active' : 'Inactive' }} Day Orders</h1>

    <div class="mb-5 grid items-end gap-2 sm:grid-cols-4">
        <div class="flex flex-col gap-1">
            Status
            <USelectMenu v-model="filters.status" :options="statuses" clear-search-on-close color="red" :ui="{ ...inputUi, icon: { trailing: { pointer: '' } } }">
                <template #trailing>
                    <UButton v-show="filters.status" color="gray" variant="link" :padded="false" icon="i-heroicons-x-mark-20-solid" @click.prevent="filters.status = undefined" />
                </template>
            </USelectMenu>
        </div>
        <div class="flex flex-col gap-1">
            Fitter
            <USelectMenu v-model="filters.fitter" :options="fitters || []" :loading="fittersPending" clear-search-on-close searchable color="red" :ui="{ ...inputUi, icon: { trailing: { pointer: '' } } }" option-attribute="name" value-attribute="id">
                <template #trailing>
                    <UButton v-show="filters.fitter" color="gray" variant="link" :padded="false" icon="i-heroicons-x-mark-20-solid" @click.prevent="filters.fitter = undefined" />
                </template>
            </USelectMenu>
        </div>
        <div class="flex flex-col gap-1">
            Job
            <USelectMenu v-model="filters.job" :options="jobs || []" :loading="jobsPending" clear-search-on-close searchable :search-attributes="['name', 'number']" color="red" :ui="{ ...inputUi, icon: { trailing: { pointer: '' } } }" option-attribute="name" value-attribute="id">
                <template #trailing>
                    <UButton v-show="filters.job" color="gray" variant="link" :padded="false" icon="i-heroicons-x-mark-20-solid" @click.prevent="filters.job = undefined" />
                </template>
                <template #option="{ option: job }">
                    <span>{{ job.name }}</span>
                    <span class="text-gray-600 dark:text-gray-300">#{{ job.number }}</span>
                </template>
            </USelectMenu>
        </div>

        <div class="flex gap-1">
            <UButton class="w-1/2" block color="red" variant="outline" @click="clearFilters">Clear</UButton>
            <UButton class="w-1/2" block variant="outline" @click="applyFilters">Apply</UButton>
        </div>
    </div>

    <DayOrdersTable :day-orders="data" :day-orders-pending="pending" />
</template>

<script setup>
const props = defineProps({
    active: {
        type: Boolean,
        required: true
    }
});

const statusFilter = ref();
const fitterFilter = ref();
const jobFilter = ref();

const filters = useLocalStorage('day-order-filters', {
    status: undefined,
    fitter: undefined,
    job: undefined
});

const { data, pending } = useLazyFetch(`/api/day-orders`, {
    query: { status: statusFilter, fitter: fitterFilter, job: jobFilter, active: props.active }
});
const { data: jobs, pending: jobsPending } = useLazyFetch('/api/jobs');
const { data: fitters, pending: fittersPending } = useLazyFetch('/api/users/fitters');

function applyFilters() {
    statusFilter.value = filters.value.status;
    fitterFilter.value = filters.value.fitter;
    jobFilter.value = filters.value.job;
}

function clearFilters() {
    statusFilter.value = undefined;
    fitterFilter.value = undefined;
    jobFilter.value = undefined;
    filters.value.status = undefined;
    filters.value.fitter = undefined;
    filters.value.job = undefined;
}

onMounted(() => {
    applyFilters();
});

const statuses = ['New', 'Pending', 'Partially Filled', 'Filled', 'Order Checked', 'Delivered (Partial)', 'Delivered', 'Pricing Completed (If applicable)'];
const inputUi = { color: { red: { outline: 'bg-white focus:ring-red-400 dark:bg-gray-900 ring-1 ring-inset ring-gray-900 dark:ring-gray-500' } } };
</script>
