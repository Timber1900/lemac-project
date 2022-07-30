<template>
  <div v-if="getPermission === 1">
    <v-container>
      <ScheduleCalendar />
    </v-container>
  </div>

  <div v-else>
    <v-container v-if="hours" class="mt-6">
      <HourTable :prop-hours="hours" />
    </v-container>
  </div>
</template>

<script>
import ScheduleCalendar from '@/components/Schedule/ScheduleCalendar.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'Rooms',
  components: { ScheduleCalendar },
  computed: {
    ...mapGetters('user', ['getPermission']),
  },
  methods: {
    goHome() {
      window.location = '/';
    },
  },
};
</script>
