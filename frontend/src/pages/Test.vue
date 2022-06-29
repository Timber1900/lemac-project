<template>
  <v-container>
    <RoomCalenderVue> </RoomCalenderVue>
  </v-container>
</template>

<script>
import RoomCalenderVue from '@/components/Test/RoomCalender.vue';

export default {
  name: 'Test',
  components: { RoomCalenderVue },
  methods: {
    goHome() {
      window.location = '/';
    },
  },
};
</script>
