<template>
    <div>
        <div class="flex justify-between">
            <div class="mb-6 text-2xl font-bold">{{ active ? 'Active' : 'Inactive' }} Jobs</div>

            <UButton class="!h-fit" color="blue" variant="outline" @click="newJob">New Job</UButton>
        </div>
        <div>
            <UTable
                :ui="{
                    wrapper: 'relative overflow-x-auto bg-gray-200 dark:bg-gray-900 rounded-md',
                    divide: 'divide-y divide-gray-400 dark:divide-gray-700',
                    tbody: 'divide-y divide-gray-300 dark:divide-gray-800',
                    td: { color: 'text-black dark:text-gray-300' }
                }"
                :loading="jobsPending"
                :rows="jobs"
                :columns="columns"
            >
                <template #name-data="{ row }">
                    <div class="flex items-center gap-1">
                        <div :class="[row.active ? 'bg-green-500' : 'bg-red-500', 'mr-1 h-3 w-3 rounded-full']"></div>
                        <div>{{ row.name }}</div>
                    </div>
                </template>
                <template #actions-data="{ row }">
                    <UDropdown :items="actionItems(row)">
                        <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
                    </UDropdown>
                </template>
            </UTable>
        </div>
    </div>

    <UModal v-model="isModalOpen" prevent-close :ui="{ container: 'flex min-h-full items-start sm:items-center justify-center text-center' }">
        <div class="flex flex-col gap-2 p-5">
            <div class="flex flex-col gap-1">
                Name:
                <UInput v-model="form.name" color="red" :ui="inputUi" />
            </div>
            <div class="flex flex-col gap-1">
                Number:
                <UInput v-model="form.number" color="red" :ui="inputUi" />
            </div>

            <UCheckbox class="mt-4" v-model="form.active" color="primary" label="Active?" />

            <div class="mt-3 flex justify-end gap-2">
                <UButton color="gray" variant="outline" @click="cancelCreatingJob">Cancel</UButton>
                <UButton color="green" variant="outline" :loading="isSaving" @click="() => (isEditingJob ? updateJob() : createJob())">{{ isEditingJob ? 'Update Job' : 'Create Job' }}</UButton>
            </div>
        </div>
    </UModal>
</template>

<script setup>
const toast = useToast();

const props = defineProps({
    active: {
        type: Boolean,
        required: true
    }
});

const isModalOpen = ref(false);
const isSaving = ref(false);
const isEditingJob = ref(false);
const form = ref({ name: null, number: null, active: true });

const { data: jobs, pending: jobsPending, refresh: refreshJobs } = useLazyFetch(`/api/jobs`, { query: { active: props.active } });

function newJob() {
    isModalOpen.value = true;
}

function editJob(job) {
    isModalOpen.value = true;
    isEditingJob.value = true;
    form.value = { id: job.id, name: job.name, number: job.number, active: job.active };
}

function cancelCreatingJob() {
    isModalOpen.value = false;
    isEditingJob.value = false;
    form.value = { name: null, number: null, active: true };
}

async function createJob() {
    const isValid = validateForm();
    if (!isValid) return;

    try {
        isSaving.value = true;
        const response = await $fetch('/api/jobs', {
            method: 'POST',
            body: { name: form.value.name, number: form.value.number, active: form.value.active }
        });

        if (response?.status !== 200) {
            isSaving.value = false;
            toast.add({ title: 'Failed to create job', color: 'red' });
            return;
        }

        isSaving.value = false;
        isModalOpen.value = false;
        form.value = { name: null, number: null, active: true };
        toast.add({ title: 'Job created successfully', color: 'green' });
        refreshJobs();
    } catch (error) {
        console.error(error);
        toast.add({ title: 'Failed to create job', color: 'red' });
    }
}

async function updateJob() {
    const isValid = validateForm();
    if (!isValid) return;

    try {
        isSaving.value = true;
        const response = await $fetch(`/api/jobs/${form.value.id}`, {
            method: 'PATCH',
            body: { name: form.value.name, number: form.value.number, active: form.value.active }
        });

        if (response?.status !== 200) {
            isSaving.value = false;
            toast.add({ title: 'Failed to update job', color: 'red' });
            return;
        }

        isSaving.value = false;
        isEditingJob.value = false;
        isModalOpen.value = false;
        form.value = { name: null, number: null, active: true };
        toast.add({ title: 'Job updated successfully', color: 'green' });
        await refreshJobs();
    } catch (error) {
        console.error(error);
        toast.add({ title: 'Failed to update job', color: 'red' });
    }
}

function validateForm() {
    if (!form.value.name) {
        toast.add({ title: 'Name is required', color: 'red' });
        return false;
    }
    if (!form.value.number) {
        toast.add({ title: 'Number is required', color: 'red' });
        return false;
    }
    return true;
}

async function deleteJob(job) {
    const confirmed = window.confirm(`Are you sure you want to delete ${job.name}?`);
    if (!confirmed) return;

    try {
        const response = await $fetch(`/api/jobs/${job.id}`, {
            method: 'DELETE'
        });

        if (response?.status !== 200) {
            toast.add({ title: 'Failed to delete job', color: 'red' });
            return;
        }

        toast.add({ title: 'Job deleted successfully', color: 'green' });
        await refreshJobs();
    } catch (error) {
        console.error(error);
        toast.add({ title: 'Failed to delete job', color: 'red' });
    }
}

const columns = [
    {
        key: 'name',
        label: 'Name'
    },
    {
        key: 'number',
        label: 'Number'
    },
    {
        key: 'actions',
        label: 'Actions'
    }
];

const actionItems = (row) => [
    [
        {
            label: 'Edit',
            icon: 'i-heroicons-pencil-square-20-solid',
            click: () => editJob(row)
        },
        {
            label: 'Delete',
            icon: 'i-heroicons-trash',
            click: () => deleteJob(row)
        }
    ],
    [
        {
            label: 'Active Day Orders',
            icon: 'i-heroicons-clipboard-document-list',
            click: () => {
                navigateTo(`/reporting/day-orders/active`);
                const filters = useLocalStorage('day-order-filters');
                filters.value.status = undefined;
                filters.value.fitter = undefined;
                filters.value.job = row.id;
            }
        },
        {
            label: 'Inactive Day Orders',
            icon: 'i-heroicons-clipboard-document-list',
            click: () => {
                navigateTo(`/reporting/day-orders/inactive`);
                const filters = useLocalStorage('day-order-filters');
                filters.value.status = undefined;
                filters.value.fitter = undefined;
                filters.value.job = row.id;
            }
        }
    ]
];

const inputUi = { color: { red: { outline: 'bg-white focus:ring-red-400 dark:bg-gray-900 ring-1 ring-inset ring-gray-900 dark:ring-gray-500' } } };
</script>
