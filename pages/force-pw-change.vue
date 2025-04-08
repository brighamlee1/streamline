<template>
    <div class="flex h-[100vh] flex-row items-center justify-center p-10">
        <div>
            <div class="mb-2 text-center text-2xl font-medium">Forced Password Reset</div>
            <div class="my-2 text-center text-lg">You must choose a new password.</div>

            <div class="flex w-[380px] flex-col gap-5 rounded-md bg-gray-200 p-5 dark:bg-gray-900 sm:w-[500px]">
                <div>
                    <span class="text-sm">New Password</span>
                    <UInput v-model="password" @keyup.enter="update" color="red" type="password" placeholder="Password" />
                </div>
                <div>
                    <span class="text-sm">Confirm Password</span>
                    <UInput v-model="confirmed_password" @keyup.enter="update" color="red" type="password" placeholder="Confirm Password" />
                </div>

                <UButton block color="red" :variant="colorMode.preference === 'dark' ? 'soft' : 'solid'" :loading="isUpdating" @click="update">Change Password</UButton>
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    layout: 'blank'
});

const colorMode = useColorMode();
const { user: currentUser, updateUser } = useUser();

const password = ref('');
const confirmed_password = ref('');
const isUpdating = ref(false);

const toast = useToast();

async function update() {
    if (!password.value || !confirmed_password.value) {
        toast.add({ title: 'You must enter a new password', color: 'red' });
        return;
    }
    if (password.value !== confirmed_password.value) {
        toast.add({ title: 'Passwords must match', color: 'red' });
        return;
    }
    if (password.value.length < 8) {
        toast.add({ title: 'Password must be at least 8 characters', color: 'red' });
        return;
    }

    try {
        isUpdating.value = true;

        const response = await $fetch(`/api/users/${currentUser.value?.id}`, {
            method: 'PATCH',
            body: { password: password.value, forcePasswordChange: false }
        });

        if (response?.status !== 200) {
            isUpdating.value = false;
            toast.add({ title: 'Failed to update password', color: 'red' });
            return;
        }

        updateUser('forcePasswordChange', false);

        isUpdating.value = false;
        toast.add({ title: 'Password updated successfully', color: 'green' });
        await navigateTo('/');
    } catch (error) {
        console.error(error);
        toast.add({ title: 'Failed to update password', color: 'red' });
        isUpdating.value = false;
    }
}
</script>
