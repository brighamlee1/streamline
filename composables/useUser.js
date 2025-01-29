function useUser() {
    if (process.server) {
        // If running on the server, return default values
        return { user: ref(null), userId: ref(null), updateUser: () => {} };
    }

    const user = ref(null);
    const userId = ref(null);

    const cookie = useCookie('dayorders_user');

    if (cookie.value?.token && cookie.value?.user) user.value = cookie.value.user;

    const updateUser = (key, value) => {
        if (!user.value) return;

        // Update the specified property of the user object
        user.value[key] = value;
        cookie.value.user[key] = value;
    };

    return { user, userId, updateUser };
}

export default useUser;
