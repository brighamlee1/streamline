<template>
    <div>
        <div class="flex gap-2 justify-between items-end mb-4">
            <div class="text-xl font-medium">{{ complete ? 'Delivered' : 'In Progress' }} Day Orders</div>
            
            <div class="flex gap-1 items-center">
                Delivered?
                <UToggle v-model="complete"></UToggle>
            </div>
        </div>

        <UserDayOrders v-if="complete" :complete="complete" />
        <UserDayOrders v-if="!complete" :complete="complete" />
    </div>
</template>

<script setup>
const complete = ref(false);
</script>
