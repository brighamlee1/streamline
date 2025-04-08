<template>
    <div v-if="currentUser.group === 'Admin'">
        <div class="mx-auto flex max-w-[1600px] justify-end">
            <UButton class="mb-2" :variant="colorMode.preference === 'dark' ? 'soft' : 'outline'" @click="router.back()">Go Back</UButton>
        </div>

        <div class="mx-auto min-h-full max-w-[1600px] rounded-lg bg-gray-300 p-5 dark:bg-gray-800">
            <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div v-if="dayOrderPending || dayOrder" class="flex items-end gap-1 text-2xl font-bold">
                    Day Order
                    <div v-if="dayOrder?.id" class="font-normal text-gray-600 dark:text-gray-400">#{{ String(dayOrder?.id).padStart(4, '0') }}</div>
                    <div v-if="dayOrder?.job?.number" class="text-lg font-normal text-gray-600 dark:text-gray-400">[ Job #{{ dayOrder.job.number }} ]</div>
                    <div v-if="!dayOrder" class="space-y-2">
                        <USkeleton class="h-3 w-[150px]" />
                        <USkeleton class="h-3 w-[150px]" />
                    </div>
                </div>
            </div>

            <div v-if="dayOrderPending || dayOrder" class="mb-8 grid gap-4 sm:grid-cols-4">
                <div class="flex flex-col gap-1 sm:col-span-3">
                    Job Name
                    <USelectMenu
                        v-if="dayOrder"
                        v-model="dayOrder.jobId"
                        @change="updateDayOrder('jobId')"
                        placeholder="Select Job"
                        :options="jobs || []"
                        :loading="jobsPending"
                        searchable
                        clear-search-on-close
                        :search-attributes="['name', 'number']"
                        value-attribute="id"
                        option-attribute="name"
                        color="red"
                        :ui="inputUi"
                    >
                        <template #option="{ option: job }">
                            <span>{{ job.name }}</span>
                            <span class="text-gray-600 dark:text-gray-300">#{{ job.number }}</span>
                        </template>
                    </USelectMenu>
                    <div v-else class="space-y-2">
                        <USkeleton class="h-3 w-full" />
                        <USkeleton class="h-3 w-full" />
                    </div>
                </div>

                <div class="flex flex-col gap-1">
                    Status
                    <USelectMenu v-if="dayOrder" v-model="dayOrder.status" @change="updateDayOrder('status')" placeholder="Select Status" :options="statuses" searchable clear-search-on-close color="red" :ui="inputUi" />
                    <div v-else class="space-y-2">
                        <USkeleton class="h-3 w-full" />
                        <USkeleton class="h-3 w-full" />
                    </div>
                </div>

                <div class="flex flex-col gap-1 sm:col-span-3">
                    Fitter
                    <USelectMenu
                        v-if="dayOrder"
                        v-model="dayOrder.fitterId"
                        @change="updateDayOrder('fitterId')"
                        placeholder="Select Fitter"
                        :options="fitters || []"
                        :loading="fittersPending"
                        searchable
                        clear-search-on-close
                        value-attribute="id"
                        option-attribute="name"
                        color="red"
                        :ui="inputUi"
                    />
                    <div v-else class="space-y-2">
                        <USkeleton class="h-3 w-full" />
                        <USkeleton class="h-3 w-full" />
                    </div>
                </div>

                <div class="flex flex-col gap-1">
                    Requested Delivery Date
                    <flat-pickr
                        v-if="dayOrder"
                        placeholder="None Selected"
                        v-model="dayOrder.deliveryDateRequested"
                        :config="datePickerConfig"
                        class="h-[32px] rounded-md border border-gray-900 bg-white px-2 py-2 text-sm dark:border-gray-500 dark:bg-gray-900"
                        @change="updateDayOrder('deliveryDateRequested')"
                    />
                    <div v-else class="space-y-2">
                        <USkeleton class="h-3 w-full" />
                        <USkeleton class="h-3 w-full" />
                    </div>
                </div>

                <div class="flex flex-col gap-1 sm:col-span-3">
                    Remarks
                    <UInput v-if="dayOrder" v-model="dayOrder.remarks" color="red" :ui="inputUi" @blur="updateDayOrder('remarks')" @keyup.enter="updateDayOrder('remarks')" />
                    <div v-else class="space-y-2">
                        <USkeleton class="h-3 w-full" />
                        <USkeleton class="h-3 w-full" />
                    </div>
                </div>

                <div class="flex flex-col gap-1">
                    Date Issued
                    <flat-pickr
                        v-if="dayOrder"
                        placeholder="None Selected"
                        v-model="dayOrder.date"
                        :config="datePickerConfig"
                        class="h-[32px] rounded-md border border-gray-900 bg-white px-2 py-2 text-sm dark:border-gray-500 dark:bg-gray-900"
                        @change="updateDayOrder('date')"
                    />
                    <div v-else class="space-y-2">
                        <USkeleton class="h-3 w-full" />
                        <USkeleton class="h-3 w-full" />
                    </div>
                </div>
            </div>

            <div v-else class="mb-8 text-xl font-medium">No Day Order Found.</div>

            <UTable
                :ui="{
                    wrapper: 'relative overflow-x-auto bg-white dark:bg-gray-900 rounded-md',
                    td: { color: 'dark:text-gray-300', base: 'truncate' }
                }"
                :loading="dayOrderItemsPending"
                :rows="dayOrderItems"
                :columns="columns"
            >
                <template #quantityRequired-data="{ row }">
                    <input v-if="itemEditing === row.id" type="number" v-model="dayOrderItemForm.quantityRequired" class="form-input" placeholder="Quantity Required" />
                    <div v-else class="row">{{ row.quantityRequired ?? '-' }}</div>
                </template>
                <template #description-data="{ row }">
                    <input v-if="itemEditing === row.id" type="text" v-model="dayOrderItemForm.description" class="form-input !w-[200px]" placeholder="Description" />
                    <div v-else class="w-[200px] overflow-ellipsis">{{ row.description ?? '-' }}</div>
                </template>
                <template #efpInventory-data="{ row }">
                    <input v-if="itemEditing === row.id" type="number" v-model="dayOrderItemForm.efpInventory" class="form-input" placeholder="EFP Inventory" />
                    <div v-else class="row">{{ row.efpInventory ?? '-' }}</div>
                </template>
                <template #fromVendor-data="{ row }">
                    <input v-if="itemEditing === row.id" type="number" v-model="dayOrderItemForm.fromVendor" class="form-input" placeholder="From Supplier" />
                    <div v-else class="row">{{ row.fromVendor ?? '-' }}</div>
                </template>
                <template #quantityBackOrder-data="{ row }">
                    <input v-if="itemEditing === row.id" type="number" v-model="dayOrderItemForm.quantityBackOrder" class="form-input" placeholder="Quantity Back Order" />
                    <div v-else class="row">{{ row.quantityBackOrder ?? '-' }}</div>
                </template>
                <template #backorderDeliveryDate-data="{ row }">
                    <input v-if="itemEditing === row.id" type="date" v-model="dayOrderItemForm.backorderDeliveryDate" class="form-input pl-1" />
                    <div v-else class="row">{{ row.backorderDeliveryDate ? niceDatetime(row.backorderDeliveryDate, true) : '-' }}</div>
                </template>
                <template #notes-data="{ row }">
                    <input v-if="itemEditing === row.id" v-model="dayOrderItemForm.notes" class="form-input" />
                    <div v-else-if="!row.notes" class="row">{{ '-' }}</div>
                    <UTooltip v-else class="row" :text="row.notes" :ui="{ width: 'max-w-[80%]' }">{{ row.notes }}</UTooltip>
                </template>
                <template #itemCost-data="{ row }">
                    <input v-if="itemEditing === row.id" type="number" v-model="dayOrderItemForm.itemCost" class="form-input" placeholder="Item Cost" />
                    <div v-else class="row">{{ row.itemCost ? formatCurrency(row.itemCost) : '-' }}</div>
                </template>
                <template #totalCost-data="{ row }">
                    <div v-if="itemEditing === row.id" class="row">{{ formatCurrency(dayOrderItemForm.totalCost) }}</div>
                    <div v-else class="row">{{ row.totalCost ? formatCurrency(row.totalCost) : '-' }}</div>
                </template>
                <template #actions-data="{ row }">
                    <div v-if="itemEditing === row.id" class="row flex gap-2">
                        <UButton icon="i-heroicons-x-circle" color="red" :variant="colorMode.preference === 'dark' ? 'soft' : 'outline'" size="sm" @click="cancelEditingItem" />
                        <UButton icon="i-heroicons-check-circle" color="green" :variant="colorMode.preference === 'dark' ? 'soft' : 'outline'" size="sm" :loading="isUpdatingItem" @click="updateDayOrderItem" />
                    </div>
                    <div v-else-if="!itemEditing" class="row"><UButton color="green" :variant="colorMode.preference === 'dark' ? 'soft' : 'outline'" size="sm" @click="editItem(row)">Edit</UButton></div>
                    <div v-else class="h-[32px]"></div>
                </template>
            </UTable>

            <div class="mt-8 flex flex-col justify-between gap-2 sm:flex-row w-full">
                <div class="flex flex-col gap-1 w-full">
                    Fitter Notes
                    <UTextarea v-if="dayOrder" v-model="dayOrder.notes" @blur="updateDayOrder('notes')" color="red" :ui="inputUi" />
                    <div v-else class="space-y-2">
                        <USkeleton class="h-3 w-full" />
                        <USkeleton class="h-3 w-full" />
                    </div>
                </div>
            </div>

            <div class="mt-8 flex flex-col justify-between gap-2 sm:flex-row">
                <div class="flex flex-col gap-1">
                    Date Shipped
                    <flat-pickr
                        v-if="dayOrder"
                        placeholder="None Selected"
                        v-model="dayOrder.shipmentDate"
                        :config="datePickerConfig"
                        class="h-[32px] rounded-md border border-gray-900 bg-white px-2 py-2 text-sm dark:border-gray-500 dark:bg-gray-900"
                        @change="updateDayOrder('shipmentDate')"
                    />
                    <div v-else class="space-y-2">
                        <USkeleton class="h-3 w-full" />
                        <USkeleton class="h-3 w-full" />
                    </div>
                </div>

                <div class="flex flex-col gap-1">
                    Total
                    <UInput v-if="dayOrder" :value="formatCurrency(dayOrder.total)" color="red" :ui="inputUi" disabled />
                    <div v-else class="space-y-2">
                        <USkeleton class="h-3 w-full" />
                        <USkeleton class="h-3 w-full" />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-else class="text-2xl font-medium">You do not have permission to view this page.</div>
</template>

<script setup>
import dayjs from 'dayjs';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';

const colorMode = useColorMode();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { user: currentUser } = useUser();

const dayOrderId = route.params.id;
const initialDayOrder = ref(null);
const itemEditing = ref(null);
const isUpdatingItem = ref(false);
const dayOrderItemForm = ref(null);

const datePickerConfig = {
    altInput: true,
    altFormat: 'F j, Y',
    dateFormat: 'Y-m-d'
};

const { data: dayOrder, pending: dayOrderPending, refresh: refreshDayOrder } = useLazyFetch(`/api/day-orders/${dayOrderId}`);
const { data: dayOrderItems, pending: dayOrderItemsPending, refresh: refreshDayOrderItems } = useLazyFetch(`/api/day-orders/${dayOrderId}/items`);
const { data: jobs, pending: jobsPending } = await useLazyFetch('/api/jobs');
const { data: fitters, pending: fittersPending } = await useLazyFetch('/api/users/fitters');

async function updateDayOrder(key) {
    const isValid = validateDayOrder(key);
    if (!isValid) return;

    const payload = { [key]: dayOrder.value[key] };
    if (key === 'date' || key === 'shipmentDate' || key === 'deliveryDateRequested') payload[key] = dayjs(dayOrder.value[key]).format();

    try {
        await $fetch(`/api/day-orders/${dayOrderId}`, {
            method: 'PATCH',
            body: payload
        });

        initialDayOrder.value = null;
        toast.add({ title: `Day order ${key} field updated!` });
        await refreshDayOrder();
    } catch (error) {
        console.error(error);
        toast.add({ title: `Failed to update day order!`, color: 'red' });
        await refreshDayOrder();
    }
}

function validateDayOrder(key) {
    if (dayOrder.value[key] === initialDayOrder.value[key] || dayOrder.value[key] === null || dayOrder.value[key] === undefined || dayOrder.value[key] === '') {
        return false;
    } else return true;
}

async function updateDayOrderItem() {
    const isValid = validateDayOrderItem();
    if (!isValid) {
        toast.add({ title: 'Description and Quantity Required must not be empty' });
        return;
    }

    const payload = { ...dayOrderItemForm.value };
    if (payload.backorderDeliveryDate) payload.backorderDeliveryDate = dayjs(payload.backorderDeliveryDate).format();

    isUpdatingItem.value = true;

    try {
        await $fetch(`/api/day-order-items/${itemEditing.value}`, {
            method: 'PATCH',
            body: payload
        });

        itemEditing.value = null;
        dayOrderItemForm.value = null;
        toast.add({ title: `Day Order Item updated!` });
        await refreshDayOrderItems();
        if (payload.quantityBackOrder || payload.itemCost || payload.totalCost) await refreshDayOrder();
    } catch (error) {
        console.error(error);
        toast.add({ title: `Failed to update day order item!`, color: 'red' });
        await refreshDayOrderItems();
    }

    isUpdatingItem.value = false;
}

function validateDayOrderItem() {
    if (!dayOrderItemForm.value.description || !dayOrderItemForm.value.quantityRequired) {
        return false;
    } else return true;
}

function editItem(row) {
    dayOrderItemForm.value = {
        quantityRequired: row.quantityRequired,
        quantityBackOrder: row.quantityBackOrder,
        efpInventory: row.efpInventory,
        fromVendor: row.fromVendor,
        backorderDeliveryDate: row.backorderDeliveryDate ? dayjs(row.backorderDeliveryDate).format('YYYY-MM-DD') : null,
        description: row.description,
        notes: row.notes,
        itemCost: row.itemCost,
        totalCost: row.totalCost
    };
    itemEditing.value = row.id;
}

async function cancelEditingItem() {
    itemEditing.value = null;
    dayOrderItemForm.value = null;
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
    },
    {
        key: 'itemCost',
        label: 'Cost'
    },
    {
        key: 'totalCost',
        label: 'Total Cost'
    },
    {
        key: 'actions',
        label: 'Actions'
    }
];

const statuses = ['New', 'Pending', 'Partially Filled', 'Filled', 'Order Checked', 'Delivered (Partial)', 'Delivered', 'Pricing Completed (If applicable)'];
const inputUi = { color: { red: { outline: 'bg-white focus:ring-red-400 dark:bg-gray-900 ring-1 ring-inset ring-gray-900 dark:ring-gray-500' } } };

watch(dayOrder, () => {
    if (!dayOrder.value) return;

    initialDayOrder.value = JSON.parse(JSON.stringify(dayOrder.value));
});

watchEffect(() => {
    if (!dayOrderItemForm.value) return;

    // When the quantityRequired field is filled and the itemCost field is filled, set the total cost field to the product of the two
    if (dayOrderItemForm.value.quantityRequired && dayOrderItemForm.value.itemCost) {
        dayOrderItemForm.value.totalCost = Number((dayOrderItemForm.value.quantityRequired * dayOrderItemForm.value.itemCost).toFixed(2));
    }
});
</script>

<style scoped lang="postcss">
.form-input {
    @apply block h-[32px] w-[110px] rounded-md border-none bg-white text-sm ring-1 ring-gray-500 focus:outline-none focus:ring-gray-300 dark:bg-gray-900;
}
.row {
    @apply w-[110px];
}
</style>
