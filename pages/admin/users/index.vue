<template>
    <div>
        <div class="flex justify-between">
            <div class="mb-6 text-2xl font-bold">Users</div>

            <UButton class="!h-fit" color="blue" variant="outline" @click="newUser">New User</UButton>
        </div>
        <div>
            <UTable
                :ui="{
                    wrapper: 'relative overflow-x-auto bg-gray-200 dark:bg-gray-900 rounded-md',
                    divide: 'divide-y divide-gray-400 dark:divide-gray-700',
                    tbody: 'divide-y divide-gray-300 dark:divide-gray-800',
                    td: { color: 'text-black dark:text-gray-300' }
                }"
                :loading="usersPending"
                :rows="users"
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
        <div class="p-5">
            <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-1">
                    First Name:
                    <UInput v-model="form.firstName" color="red" :ui="inputUi" />
                </div>
                <div class="flex flex-col gap-1">
                    Last Name:
                    <UInput v-model="form.lastName" color="red" :ui="inputUi" />
                </div>
                <div class="flex flex-col gap-1">
                    Email:
                    <UInput v-model="form.email" color="red" :ui="inputUi" />
                </div>
                <div class="flex flex-col gap-1">
                    Group:
                    <USelectMenu v-model="form.group" color="red" :options="[{ value: 'Admin' }, { value: 'Fitter' }]" option-attribute="value" value-attribute="value" :ui="inputUi" />
                </div>
            </div>

            <UCheckbox class="mt-4" v-model="form.active" color="primary" label="Active?" />

            <div class="mt-4 flex justify-end gap-2">
                <UButton color="gray" variant="outline" @click="cancelCreatingUser">Cancel</UButton>
                <UButton color="green" variant="outline" :loading="isSaving" @click="() => (isEditingUser ? updateUser() : createUser())">{{ isEditingUser ? 'Update User' : 'Create User' }}</UButton>
            </div>
        </div>
    </UModal>
</template>

<script setup>
const toast = useToast();
const isModalOpen = ref(false);
const isSaving = ref(false);
const isEditingUser = ref(false);

const defaultFormValues = () => {
    return {
        firstName: null,
        lastName: null,
        email: null,
        forcePasswordChange: true,
        group: null,
        active: true
    };
};

const form = ref(defaultFormValues());

const { data: users, pending: usersPending, refresh: refreshUsers } = useLazyFetch(`/api/users`);

function newUser() {
    isModalOpen.value = true;
}

function editUser(user) {
    isModalOpen.value = true;
    isEditingUser.value = true;
    form.value = { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, forcePasswordChange: user.forcePasswordChange, group: user.group, active: user.active };
}

function cancelCreatingUser() {
    isModalOpen.value = false;
    isEditingUser.value = false;
    form.value = defaultFormValues();
}

async function createUser() {
    const isValid = validateForm();
    if (!isValid) return;

    try {
        isSaving.value = true;
        const response = await $fetch('/api/users', {
            method: 'POST',
            body: form.value
        });

        if (response?.status !== 200) {
            isSaving.value = false;
            toast.add({ title: 'Failed to create user', color: 'red' });
            return;
        }

        isSaving.value = false;
        isModalOpen.value = false;
        form.value = defaultFormValues();
        toast.add({ title: 'User created successfully', color: 'green' });
        refreshUsers();
    } catch (error) {
        console.error(error);
        toast.add({ title: 'Failed to create user', color: 'red' });
    }
}

async function updateUser() {
    const isValid = validateForm();
    if (!isValid) return;

    try {
        isSaving.value = true;
        const response = await $fetch(`/api/users/${form.value.id}`, {
            method: 'PATCH',
            body: form.value
        });

        if (response?.status !== 200) {
            isSaving.value = false;
            toast.add({ title: 'Failed to update user', color: 'red' });
            return;
        }

        isSaving.value = false;
        isEditingUser.value = false;
        isModalOpen.value = false;
        form.value = defaultFormValues();
        toast.add({ title: 'User updated successfully', color: 'green' });
        await refreshUsers();
    } catch (error) {
        console.error(error);
        toast.add({ title: 'Failed to update user', color: 'red' });
    }
}

function validateForm() {
    if (!form.value.firstName || !form.value.lastName) {
        toast.add({ title: 'First and last name are required', color: 'red' });
        return false;
    }
    if (!form.value.email) {
        toast.add({ title: 'Email is required', color: 'red' });
        return false;
    }
    if (!form.value.group) {
        toast.add({ title: 'Group is required', color: 'red' });
        return false;
    }
    return true;
}

async function resetPassword(user) {
    const confirmed = window.confirm(`Are you sure you want to reset ${user.name}'s password?`);
    if (!confirmed) return;

    try {
        const response = await $fetch(`/api/users/${user.id}`, {
            method: 'PATCH',
            body: { forcePasswordChange: true }
        });

        if (response?.status !== 200) {
            toast.add({ title: 'Failed to reset password', color: 'red' });
            return;
        }

        toast.add({ title: 'Password reset successfully', color: 'green' });
        await refreshUsers();
    } catch (error) {
        console.error(error);
        toast.add({ title: 'Failed to reset password', color: 'red' });
    }
}

const columns = [
    {
        key: 'name',
        label: 'Name'
    },
    {
        key: 'email',
        label: 'Email'
    },
    {
        key: 'username',
        label: 'Username'
    },
    {
        key: 'group',
        label: 'Group'
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
            click: () => editUser(row)
        },
        {
            label: 'Reset Password',
            icon: 'i-heroicons-bookmark-slash',
            click: () => resetPassword(row)
        }
    ],
    [
        {
            label: 'Day Orders',
            icon: 'i-heroicons-clipboard-document-list',
            click: () => navigateTo(`/admin/users/${row.id}/day-orders`)
        }
    ]
];

const inputUi = { color: { red: { outline: 'bg-white focus:ring-red-400 dark:bg-gray-900 ring-1 ring-inset ring-gray-900 dark:ring-gray-500' } } };
</script>
