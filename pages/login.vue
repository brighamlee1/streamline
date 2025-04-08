<template>
    <div class="flex h-[100vh] flex-row items-center justify-center p-10">
        <div>
            <div class="mb-2 text-center text-2xl font-medium">EFP Day Orders</div>

            <div class="flex w-[380px] flex-col gap-5 rounded-md bg-gray-200 p-5 dark:bg-gray-900 sm:w-[500px]">
                <div>
                    <span class="text-sm">Username</span>
                    <UInput v-model="form.username" color="red" placeholder="Username [ firstname + lastname ]" />
                </div>
                <div>
                    <span class="text-sm">Password</span>
                    <UInput v-model="form.password" @keyup.enter="login" color="red" type="password" placeholder="Password" />
                </div>

                <UButton block color="red" :variant="colorMode.preference === 'dark' ? 'soft' : 'solid'" :loading="is_logging_in" @click="login">Sign In</UButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import dayjs from 'dayjs';

definePageMeta({
    layout: 'blank'
});

const colorMode = useColorMode();
const { user: currentUser } = useUser();

const form = ref({
    username: '',
    password: ''
});
const is_logging_in = ref(false);

const toast = useToast();

async function login() {
    if (!form.value.username || !form.value.password) {
        toast.add({
            title: 'Please provide a username and password',
            color: 'red'
        });
        return;
    }

    is_logging_in.value = true;

    try {
        const response = await $fetch('/api/auth', {
            method: 'POST',
            body: form.value
        });

        if (response.statusCode !== 200) return toast.add({ title: response.message, color: 'red' });

        const cookie = useCookie("dayorders_user", {
            path: '/',
            secure: true,
            sameSite: 'lax',
            expires: dayjs().add(16, 'hours').toDate()
        });

        cookie.value = JSON.stringify({ token: response.token, user: response.user });

        toast.add({ title: 'Logged in Successfully', color: 'green' });
        if (response.user.forcePasswordChange) return await navigateTo('/force-pw-change');
        await navigateTo('/');
    } catch (error) {
        toast.add({ title: 'Error logging in', color: 'red' });
    } finally {
        is_logging_in.value = false;
    }
}

watchEffect(() => {
    if (!currentUser.value) return;
    navigateTo('/');
});
</script>
