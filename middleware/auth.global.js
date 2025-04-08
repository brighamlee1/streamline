export default defineNuxtRouteMiddleware(async (to, _from) => {
    if (process.server) return;

    const userCookie = useCookie('dayorders_user');

    // if no user and we're not already on the login page, redirect to login
    if ((!userCookie.value || !userCookie.value.token) && to.path !== '/login') {
        return navigateTo(`/login`);
    }

    if (userCookie.value?.user && userCookie.value.user.forcePasswordChange && to.path !== '/force-pw-change') {
        return navigateTo(`/force-pw-change`);
    }

    // const { user } = useUser();
    // const toast = useToast();

    // if (user.value && user.value.group !== 'Admin' && to.path.includes('/admin')) {
    //     toast.add({ title: 'You do not have permission to view the admin pages.', color: 'red' });
    //     return navigateTo('/');
    // }
});
