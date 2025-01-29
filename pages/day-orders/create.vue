<template>
    <div>
        <div class="mb-4 text-xl font-bold">Day Order</div>

        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
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
                Requested Delivery Date
                <flat-pickr
                    placeholder="None Selected"
                    v-model="dayOrder.deliveryDateRequested"
                    :config="datePickerConfig"
                    class="h-[32px] rounded-md border border-gray-900 bg-white px-2 py-2 text-sm dark:border-gray-500 dark:bg-gray-900"
                />
            </div>

            <table class="w-full table-auto overflow-hidden overflow-x-scroll">
                <thead>
                    <tr class="bg-white dark:bg-gray-900">
                        <th class="w-[20%] border border-gray-700 px-4 py-2 text-left text-sm font-normal dark:border-gray-500">Quantity</th>
                        <th class="w-[80%] border border-gray-700 px-4 py-2 text-center text-sm font-normal dark:border-gray-500">Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in dayOrderItems" :key="index">
                        <td class="border border-gray-700 dark:border-gray-500">
                            <input
                                type="number"
                                v-model="item.quantityRequired"
                                class="form-input block w-full border-none bg-white focus:border-none focus:outline-none focus:ring-1 focus:ring-red-700 dark:bg-gray-900"
                                placeholder="Enter Number"
                            />
                        </td>
                        <td class="border border-gray-700 dark:border-gray-500">
                            <input
                                type="text"
                                v-model="item.description"
                                class="form-input block w-full border-none bg-white focus:border-none focus:outline-none focus:ring-1 focus:ring-red-700 dark:bg-gray-900"
                                placeholder="Enter Description"
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="flex justify-end gap-2">
                <UButton v-if="dayOrderItems?.length >= 20" color="red" variant="outline" @click="lessDayOrderItems">- 10 Less Items</UButton>
                <UButton color="blue" variant="outline" @click="moreDayOrderItems">+ 10 More Items</UButton>
            </div>

            <UButton block color="gray" variant="outline" @click="confirmClearDayOrder">Clear All</UButton>
            <UButton block color="green" variant="outline" :loading="is_creating_day_order" @click="createDayOrder">Create</UButton>
        </div>
    </div>
</template>

<script setup>
import dayjs from 'dayjs';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';

const { user: currentUser } = useUser();
const toast = useToast();

const defaultDayOrderItems = () => {
    return [
        { quantityRequired: null, description: null },
        { quantityRequired: null, description: null },
        { quantityRequired: null, description: null },
        { quantityRequired: null, description: null },
        { quantityRequired: null, description: null },
        { quantityRequired: null, description: null },
        { quantityRequired: null, description: null },
        { quantityRequired: null, description: null },
        { quantityRequired: null, description: null },
        { quantityRequired: null, description: null }
    ];
};

const dayOrder = useLocalStorage('fitterDayOrderCreating', {
    jobId: null,
    deliveryDateRequested: null
});

// set default day order items to 10, they can add more if they need to
const dayOrderItems = useLocalStorage('dayOrderItems', defaultDayOrderItems());
const is_creating_day_order = ref(false);

const { data: jobs, pending: jobsPending } = await useLazyFetch('/api/jobs', { query: { active: true } });

async function createDayOrder() {
    if (!dayOrder.value.jobId) {
        toast.add({ title: 'You must select a job', color: 'red' });
        return;
    }
    if (dayOrderItems.value?.length <= 0) {
        toast.add({
            title: 'You must enter at least one day order item',
            color: 'red'
        });
        return;
    }

    try {
        is_creating_day_order.value = true;
        const payload = { createdByFitter: true, jobId: dayOrder.value.jobId, date: dayjs().format(), fitterId: currentUser.value?.id, deliveryDateRequested: dayOrder.value.deliveryDateRequested ? dayjs(dayOrder.value.deliveryDateRequested).format() : null };

        const response = await $fetch(`/api/day-orders`, {
            method: 'POST',
            body: payload
        });

        if (response?.status !== 200 || !response?.dayOrder?.id) {
            is_creating_day_order.value = false;
            toast.add({ title: 'Failed to create day order', color: 'red' });
            return;
        }

        dayOrder.value.id = response?.dayOrder?.id;
        const newDayOrderItems = getDayOrderItems(response.dayOrder.id);
        await createDayOrderItems(newDayOrderItems);

        console.timeEnd('creatingDayOrder');
        is_creating_day_order.value = false;
        dayOrder.value.jobId = null;
        dayOrder.value.deliveryDateRequested = null;
        dayOrderItems.value = defaultDayOrderItems();
        toast.add({ title: 'Created Day Order Successfully' });
    } catch (error) {
        console.error(error);
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
                dayOrderId: dayOrderId,
                quantityRequired: item.quantityRequired,
                description: item.description
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
    dayOrder.value.jobId = null;
    dayOrder.value.deliveryDateRequested = null;
}

const inputUi = { color: { red: { outline: 'bg-white focus:ring-red-400 dark:bg-gray-900 ring-1 ring-inset ring-gray-900 dark:ring-gray-500' } } };
const datePickerConfig = {
    altInput: true,
    altFormat: 'F j, Y',
    dateFormat: 'Y-m-d'
};
</script>
