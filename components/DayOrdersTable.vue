<template>
    <UTable
        :ui="{
            wrapper: 'relative overflow-x-auto bg-gray-200 dark:bg-gray-900 rounded-md',
            divide: 'divide-y divide-gray-400 dark:divide-gray-700',
            tbody: 'divide-y divide-gray-300 dark:divide-gray-800',
            td: { color: 'text-black dark:text-gray-300' }
        }"
        :loading="dayOrdersPending"
        :rows="dayOrders"
        :columns="columns"
    >
        <template #job.name-data="{ row }">
            <div>{{ row.job?.name }}</div>
        </template>
        <template #date-data="{ row }">
            <div>{{ row.date ? niceDatetime(row.date, true) : niceDatetime(row.createdAt, true) }}</div>
        </template>
        <template #remarks-data="{ row }">
            <div>{{ row.remarks ?? '-' }}</div>
        </template>
        <template #shipmentDate-data="{ row }">
            <div>{{ row.shipmentDate ? niceDatetime(row.shipmentDate, true) : '-' }}</div>
        </template>
        <template #total-data="{ row }">
            <div>{{ row.total ? formatCurrency(row.total) : '-' }}</div>
        </template>
        <template #actions-data="{ row }">
            <UTooltip text="Open Day Order">
                <UButton icon="i-heroicons-clipboard-document-list" color="black" @click="navigateTo(`/day-orders/${row.id}`)" />
            </UTooltip>
            <!-- <LazyDayOrderItemsModal :day-order-id="row.id" /> -->
        </template>
    </UTable>
</template>

<script setup>
const props = defineProps({
    dayOrders: {
        type: Array
    },
    dayOrdersPending: {
        type: Boolean,
        required: true
    }
});

const columns = [
    {
        key: 'job.name',
        label: 'Job Name'
    },
    {
        key: 'date',
        label: 'Date Issued'
    },
    {
        key: 'remarks',
        label: 'Remarks'
    },
    {
        key: 'status',
        label: 'Status'
    },
    {
        key: 'shipmentDate',
        label: 'Shipment Date'
    },
    {
        key: 'total',
        label: 'Total'
    },
    {
        key: 'actions',
        label: 'Actions'
    }
];
</script>
