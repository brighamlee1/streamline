<template>
    <div v-if="currentUser?.group !== 'Admin'" class="text-xl font-medium">You do not have permission to view this page.</div>
    <div v-else class="pb-8">
        <div class="mx-auto flex max-w-[1600px] justify-end">
            <UButton class="mb-2" :variant="colorMode.preference === 'dark' ? 'soft' : 'outline'" @click="router.back()">Go Back</UButton>
        </div>

        <div class="mx-auto min-h-full max-w-[1600px] rounded-lg bg-gray-300 p-5 dark:bg-gray-800">
            <div class="mb-4 text-2xl font-bold">Create Day Order</div>

            <div class="mb-8 grid gap-4 sm:grid-cols-4">
                <div class="flex flex-col gap-1 sm:col-span-3">
                    Job Name
                    <USelectMenu
                        v-model="dayOrder.jobId"
                        placeholder="Select Job"
                        :options="jobs || []"
                        :loading="jobsPending"
                        searchable
                        :search-attributes="['name', 'number']"
                        clear-search-on-close
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
                </div>

                <div class="flex flex-col gap-1">
                    Status
                    <USelectMenu v-model="dayOrder.status" placeholder="Select Status" :options="statuses" searchable clear-search-on-close color="red" :ui="inputUi" />
                </div>

                <div class="flex flex-col gap-1 sm:col-span-3">
                    Fitter
                    <USelectMenu
                        v-model="dayOrder.fitterId"
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
                </div>

                <div class="flex flex-col justify-end gap-1">
                    Requested Delivery Date
                    <flat-pickr
                        placeholder="None Selected"
                        v-model="dayOrder.deliveryDateRequested"
                        :config="datePickerConfig"
                        class="h-[32px] rounded-md border border-gray-900 bg-white px-2 py-2 text-sm dark:border-gray-500 dark:bg-gray-900"
                    />
                </div>

                <div class="flex flex-col gap-1 sm:col-span-3">
                    Remarks
                    <UInput v-model="dayOrder.remarks" placeholder="Enter Remarks" color="red" :ui="inputUi" />
                </div>

                <div class="flex flex-col gap-1">
                    Date Issued
                    <flat-pickr placeholder="None Selected" v-model="dayOrder.date" :config="datePickerConfig" class="h-[32px] rounded-md border border-gray-900 bg-white px-2 py-2 text-sm dark:border-gray-500 dark:bg-gray-900" />
                </div>
            </div>

            <UTable
                :ui="{
                    wrapper: 'relative overflow-x-auto bg-white dark:bg-gray-900 rounded-md',
                    divide: 'divide-y divide-gray-400 dark:divide-gray-700',
                    td: { base: 'mb-0', color: 'dark:text-gray-300', padding: 'p-0' }
                }"
                :rows="dayOrderItems"
                :columns="columns"
            >
                <template #quantityRequired-data="{ row }">
                    <input type="number" v-model="row.quantityRequired" class="form-input" @update:model-value="updateTotalCost(row)" />
                </template>
                <template #description-data="{ row }">
                    <div class="w-[320px]">
                        <input type="text" v-model="row.description" class="form-input" />
                    </div>
                </template>
                <template #efpInventory-data="{ row }">
                    <input type="number" v-model="row.efpInventory" class="form-input" />
                </template>
                <template #fromVendor-data="{ row }">
                    <input type="number" v-model="row.fromVendor" class="form-input" />
                </template>
                <template #quantityBackOrder-data="{ row }">
                    <input type="number" v-model="row.quantityBackOrder" class="form-input" />
                </template>
                <template #backorderDeliveryDate-data="{ row }">
                    <input type="date" v-model="row.backorderDeliveryDate" class="form-input" />
                </template>
                <template #notes-data="{ row }">
                    <input type="text" v-model="row.notes" class="form-input" />
                </template>
                <template #itemCost-data="{ row }">
                    <input type="number" v-model="row.itemCost" class="form-input" @update:model-value="updateTotalCost(row)" />
                </template>
                <template #totalCost-data="{ row }">
                    <input type="number" v-model="row.totalCost" class="form-input" disabled />
                </template>
            </UTable>

            <div class="mt-2 flex justify-end gap-2">
                <UButton v-if="dayOrderItems?.length >= 20" color="red" :variant="colorMode.preference === 'dark' ? 'soft' : 'outline'" @click="lessDayOrderItems">- 10 Less Items</UButton>
                <UButton color="blue" :variant="colorMode.preference === 'dark' ? 'soft' : 'outline'" @click="moreDayOrderItems">+ 10 More Items</UButton>
            </div>

            <div class="mt-4 flex flex-col justify-between gap-2 sm:flex-row">
                <div class="flex flex-col gap-1">
                    Date Shipped
                    <flat-pickr placeholder="None Selected" v-model="dayOrder.shipmentDate" :config="datePickerConfig" class="h-[32px] rounded-md border border-gray-900 bg-white px-2 py-2 text-sm dark:border-gray-500 dark:bg-gray-900" />
                </div>

                <div class="flex flex-col gap-1">
                    Total
                    <UInput type="number" v-model="dayOrder.total" color="red" :ui="inputUi" disabled>
                        <template #leading>$</template>
                    </UInput>
                </div>
            </div>
        </div>

        <div class="mx-auto mt-4 flex max-w-[1600px] justify-end gap-4">
            <UButton @click="confirmClearDayOrder" size="xl" color="red" :variant="colorMode.preference === 'dark' ? 'soft' : 'outline'">Clear All</UButton>
            <UButton size="xl" class="w-fit" color="green" :variant="colorMode.preference === 'dark' ? 'soft' : 'outline'" :loading="is_creating_day_order" @click="createDayOrder">Create</UButton>
        </div>
    </div>
</template>

<script setup>
import dayjs from 'dayjs';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';

const colorMode = useColorMode();
const toast = useToast();
const router = useRouter();
const { user: currentUser } = useUser();

const defaultDayOrderItem = () => {
    return {
        quantityRequired: null,
        quantityBackOrder: null,
        efpInventory: null,
        fromVendor: null,
        backorderDeliveryDate: null,
        description: null,
        notes: null,
        itemCost: null,
        totalCost: null
    };
};

const defaultDayOrderItems = () => {
    return [
        defaultDayOrderItem(),
        defaultDayOrderItem(),
        defaultDayOrderItem(),
        defaultDayOrderItem(),
        defaultDayOrderItem(),
        defaultDayOrderItem(),
        defaultDayOrderItem(),
        defaultDayOrderItem(),
        defaultDayOrderItem(),
        defaultDayOrderItem()
    ];
};

const defaultDayOrder = () => {
    return {
        jobId: '',
        fitterId: '',
        status: 'New',
        remarks: null,
        date: dayjs().format('YYYY-MM-DD'),
        shipmentDate: null,
        deliveryDateRequested: null,
        total: 0
    };
};

const dayOrder = useLocalStorage('adminDayOrder', defaultDayOrder());
// set default day order items to 10, they can add more if they need to
const dayOrderItems = useLocalStorage('adminDayOrderItems', defaultDayOrderItems());
const is_creating_day_order = ref(false);

const { data: jobs, pending: jobsPending } = await useLazyFetch('/api/jobs', { query: { active: true } });
const { data: fitters, pending: fittersPending } = await useLazyFetch('/api/users/fitters');

async function createDayOrder() {
    if (!dayOrder.value.jobId || !dayOrder.value.fitterId) {
        toast.add({ title: 'You must select a job and a fitter to create day order', color: 'red' });
        return;
    }
    if (dayOrderItems.value?.length <= 0) {
        toast.add({
            title: 'You must enter at least one day order item',
            color: 'red'
        });
        return;
    }

    // setup payload to create day order
    const payload = JSON.parse(JSON.stringify(dayOrder.value));
    if (payload.date) payload.date = dayjs(payload.date).format();
    if (payload.shipmentDate) payload.shipmentDate = dayjs(payload.shipmentDate).format();
    if (payload.deliveryDateRequested) payload.deliveryDateRequested = dayjs(payload.deliveryDateRequested).format();
    delete payload.coj;

    try {
        is_creating_day_order.value = true;
        console.time('creatingDayOrder');

        const response = await $fetch(`/api/day-orders`, {
            method: 'POST',
            body: payload
        });

        if (response?.status !== 200 || !response?.dayOrder?.id) {
            is_creating_day_order.value = false;
            console.log('fail');
            toast.add({ title: 'Failed to create day order', color: 'red' });
            return;
        }

        dayOrder.value.id = response?.dayOrder?.id;
        const newDayOrderItems = getDayOrderItems(response.dayOrder.id);
        await createDayOrderItems(newDayOrderItems);

        console.timeEnd('creatingDayOrder');
        is_creating_day_order.value = false;
        dayOrder.value = defaultDayOrder();
        dayOrderItems.value = defaultDayOrderItems();
        navigateTo(`/day-orders/${response.dayOrder.id}`);
        toast.add({ title: 'Created Day Order Successfully' });
    } catch (error) {
        console.error(error);
        console.log('fail');
        toast.add({ title: 'Failed to create day order', color: 'red' });
        is_creating_day_order.value = false;
    }
}

async function createDayOrderItems(items) {
    const response = await $fetch('/api/day-order-items/create-many', {
        method: 'POST',
        body: items
    });

    if (response?.status !== 200) {
        is_creating_day_order.value = false;
        toast.add({ title: 'Failed to create day order items', color: 'red' });
    }
}

function getDayOrderItems(dayOrderId) {
    const newDayOrderItems = dayOrderItems.value
        .map((item) => {
            if (!item.quantityRequired || !item.description) return null;
            return {
                quantityRequired: item.quantityRequired,
                quantityBackOrder: item.quantityBackOrder !== '' ? item.quantityBackOrder : null,
                efpInventory: item.efpInventory !== '' && item.efpInventory !== null ? item.efpInventory : null,
                fromVendor: item.fromVendor !== '' ? item.fromVendor : null,
                backorderDeliveryDate: item.backorderDeliveryDate !== '' && item.backorderDeliveryDate !== null ? dayjs(item.backorderDeliveryDate).format() : null,
                description: item.description,
                notes: item.notes !== '' ? item.notes : null,
                itemCost: item.itemCost !== '' ? item.itemCost : null,
                totalCost: item.totalCost !== '' ? item.totalCost : null,
                dayOrderId: dayOrderId
            };
        })
        .filter((item) => item !== null);
    return newDayOrderItems;
}

function moreDayOrderItems() {
    // add 10 more items
    dayOrderItems.value.push(...defaultDayOrderItems());
}

function lessDayOrderItems() {
    // remove last 10 items
    dayOrderItems.value = dayOrderItems.value.slice(0, dayOrderItems.value.length - 10);
}

function confirmClearDayOrder() {
    toast.add({
        title: 'Are you sure you want to clear all?',
        description: 'This action cannot be undone.',
        icon: 'i-heroicons-question-mark-circle',
        color: 'blue',
        actions: [
            {
                label: 'Yes',
                click: () => clearDayOrder(),
                color: 'green'
            },
            {
                label: 'No',
                click: () => toast.remove(''),
                color: 'red'
            }
        ]
    });
};

function clearDayOrder() {
    dayOrderItems.value = defaultDayOrderItems();
    dayOrder.value = defaultDayOrder();
}

function updateTotalCost(row) {
    if ((row.quantityRequired && row.itemCost) || row.itemCost === 0) {
        row.totalCost = Number((row.quantityRequired * row.itemCost).toFixed(2));
    }
    if (row.itemCost === '') row.totalCost = null;
    // create a reducer fuction that will add up all the itemTotal values from all the day order items
    const reducer = (accumulator, currentValue) => accumulator + currentValue.totalCost;
    const totalCost = Number(dayOrderItems.value.reduce(reducer, 0).toFixed(2));
    dayOrder.value.total = totalCost;
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
    }
];

const statuses = ['New', 'Pending', 'Partially Filled', 'Filled', 'Order Checked', 'Delivered (Partial)', 'Delivered', 'Pricing Completed (If applicable)'];
const inputUi = { color: { red: { outline: 'bg-white focus:ring-red-400 dark:bg-gray-900 ring-1 ring-inset ring-gray-900 dark:ring-gray-500' } } };

const datePickerConfig = {
    altInput: true,
    altFormat: 'F j, Y',
    dateFormat: 'Y-m-d'
};

onMounted(() => {
    dayOrder.value.date = dayjs().format();
});
</script>

<style scoped lang="postcss">
.form-input {
    @apply block h-[32px] border border-b border-l border-r border-t-0 border-gray-400 bg-white text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-900;
    @apply w-full focus:border focus:border-red-400 focus:ring-0;
}
</style>
