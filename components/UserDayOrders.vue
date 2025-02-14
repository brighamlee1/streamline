<template>
    <div class="flex flex-col gap-4">
        <template v-if="dayOrders && dayOrders?.length > 0" v-for="dayOrder in dayOrders" :key="dayOrder.id">
            <div class="flex flex-col gap-1 rounded-md bg-gray-300 p-4 dark:bg-gray-800">
                <div class="flex justify-between">
                    <div class="text-lg">{{ String(dayOrder.id).padStart(4, '0') }}</div>
                    <div class="text-lg">
                        {{ dayOrder.job?.name }} <span class="text-base text-gray-600 dark:text-gray-400">#{{ dayOrder.job?.number }}</span>
                    </div>
                </div>
                <div><b>Status: </b> {{ dayOrder.status }}</div>
                <div v-if="dayOrder.date"><b>Date Issued: </b>{{ niceDatetime(dayOrder.date, true) }}</div>
                <div v-if="dayOrder.remarks"><b>Remarks: </b>{{ dayOrder.remarks }}</div>
                <div v-if="dayOrder.deliveryDateRequested"><b>Requested Delivery Date: </b>{{ niceDatetime(dayOrder.deliveryDateRequested, true) }}</div>
                <div v-if="dayOrder.shipmentDate"><b>Date Shipped: </b>{{ niceDatetime(dayOrder.shipmentDate, true) }}</div>

                <UTable
                    :ui="{
                        wrapper: 'relative overflow-x-auto bg-white dark:bg-gray-900 rounded-md',
                        td: { color: 'text-gray-700 dark:text-gray-300' }
                    }"
                    :loading="pending"
                    :rows="dayOrder.items"
                    :columns="columns"
                    class="mt-3"
                >
                    <template #quantityRequired-data="{ row }">
                        <div class="row">{{ row.quantityRequired ?? '-' }}</div>
                    </template>
                    <template #description-data="{ row }">
                        <div class="w-[200px]">{{ row.description ?? '-' }}</div>
                    </template>
                    <template #efpInventory-data="{ row }">
                        <div class="row">{{ row.efpInventory ?? '-' }}</div>
                    </template>
                    <template #fromVendor-data="{ row }">
                        <div class="row">{{ row.fromVendor ?? '-' }}</div>
                    </template>
                    <template #quantityBackOrder-data="{ row }">
                        <div class="row">{{ row.quantityBackOrder ?? '-' }}</div>
                    </template>
                    <template #backorderDeliveryDate-data="{ row }">
                        <div class="row">{{ row.backorderDeliveryDate ? niceDatetime(row.backorderDeliveryDate, true) : '-' }}</div>
                    </template>
                    <template #notes-data="{ row }">
                        <div class="row">{{ row.notes ?? '-' }}</div>
                    </template>
                </UTable>

                <div class="mt-3 flex flex-col gap-3">
                    <UCheckbox
                        v-model="dayOrder.verified"
                        @update:model-value="(value) => updateDayOrder(value, 'verified', dayOrder.id)"
                        color="red"
                        :ui="{
                            wrapper: 'relative flex items-center',
                            base: 'h-5 w-5 dark:checked:bg-current dark:checked:border-transparent dark:indeterminate:bg-current dark:indeterminate:border-transparent disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-transparent focus:ring-offset-transparent'
                        }"
                        label="Check this box if you received all items. If not, type below what you didn't receive."
                    />
                    <UTextarea v-model="dayOrder.notes" @blur="() => updateDayOrder(dayOrder.notes, 'notes', dayOrder.id)" placeholder="What are you missing?" />
                </div>
            </div>
        </template>
        <div v-else class="text-xl font-medium">None Found.</div>
    </div>
</template>

<script setup>
const props = defineProps({
    complete: {
        type: Boolean,
        required: true
    }
});

const toast = useToast();
const { user: currentUser } = useUser();

const { data: dayOrders, pending } = useLazyFetch(`/api/day-orders`, { query: { fitter: currentUser.value?.id, complete: props.complete } });

async function updateDayOrder(value, key, id) {
    try {
        const payload = { [key]: value };

        await $fetch(`/api/day-orders/${id}`, {
            method: 'PATCH',
            body: payload
        });
    } catch (error) {
        console.error(error);
        toast.add({ title: `Failed to update day order!`, color: 'red' });
    }
}

const columns = [
    {
        key: 'quantityRequired',
        label: 'Quantity Required'
    },
    {
        key: 'description',
        label: 'Description'
    },
    {
        key: 'efpInventory',
        label: 'EFP Inventory'
    },
    {
        key: 'fromVendor',
        label: 'From Supplier'
    },
    {
        key: 'quantityBackOrder',
        label: 'Quantity Back Order'
    },
    {
        key: 'backorderDeliveryDate',
        label: 'Backorder Delivery Date'
    },
    {
        key: 'notes',
        label: 'Notes'
    }
];
</script>
