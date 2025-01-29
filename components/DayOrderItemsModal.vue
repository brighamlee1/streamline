<template>
    <UTooltip text="View Items">
        <UButton icon="i-heroicons-information-circle" color="black" @click="isModalOpen = true" />
    </UTooltip>

    <UModal v-model="isModalOpen" fullscreen>
        <div class="w-full p-5">
            <div class="mb-6 flex items-center justify-between">
                <div class="text-2xl font-medium">Day Order Items</div>
                <UButton class="h-fit" icon="i-heroicons-x-mark" color="black" square @click="isModalOpen = false" />
            </div>
            <UTable
                :ui="{
                    wrapper: 'relative overflow-x-auto bg-gray-900 rounded-md',
                    td: { color: 'dark:text-gray-300' }
                }"
                :loading="dayOrderItemsPending"
                :rows="dayOrderItems"
                :columns="columns"
            >
                <template #quantityBackOrder-data="{ row }">
                    <div>{{ row.quantityBackOrder ?? '-' }}</div>
                </template>
                <template #filledDir-data="{ row }">
                    <div>{{ row.filledDir ?? '-' }}</div>
                </template>
                <template #filledCust-data="{ row }">
                    <div>{{ row.filledCust ?? '-' }}</div>
                </template>
                <template #filledInv-data="{ row }">
                    <div>{{ row.filledInv ?? '-' }}</div>
                </template>
                <template #itemCost-data="{ row }">
                    <div>{{ row.itemCost ? formatCurrency(row.itemCost) : '-' }}</div>
                </template>
                <template #totalCost-data="{ row }">
                    <div>{{ row.totalCost ? formatCurrency(row.totalCost) : '-' }}</div>
                </template>
            </UTable>
        </div>
    </UModal>
</template>

<script setup>
const isModalOpen = ref(false);

const props = defineProps(['dayOrderId']);

const { data: dayOrderItems, pending: dayOrderItemsPending } = useLazyFetch(`/api/day-orders/${props.dayOrderId}/items`);

const columns = [
    {
        key: 'quantityRequired',
        label: 'Quantity Required'
    },
    {
        key: 'quantityBackOrder',
        label: 'Quantity Back Order'
    },
    {
        key: 'filledDir',
        label: 'Filled Direct'
    },
    {
        key: 'filledCust',
        label: 'From Supplier'
    },
    {
        key: 'filledInv',
        label: 'Filled Inv'
    },
    {
        key: 'description',
        label: 'Description'
    },
    {
        key: 'itemCost',
        label: 'Cost'
    },
    {
        key: 'totalCost',
        label: 'Total Cost'
    }
];
</script>
