export function useLocalStorage(key, defaultValue) {
    if (typeof window === 'undefined') {
        return ref(null);
    }

    // Try to get value from local storage
    const storedValue = localStorage.getItem(key);

    // Use the stored value if it exists, otherwise use the default
    const value = storedValue !== null ? JSON.parse(storedValue) : defaultValue;

    // Create a ref from the value
    const valueRef = ref(value);

    // Watch for changes in the ref and store them in local storage
    watch(
        valueRef,
        (newValue) => {
            localStorage.setItem(key, JSON.stringify(newValue));
        },
        { deep: true }
    );

    // If the key doesn't exist in local storage, initialize it with the default value
    if (storedValue === null) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
    }

    return valueRef;
}
