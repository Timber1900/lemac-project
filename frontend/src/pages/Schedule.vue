<template>
  <v-container>
    <ScheduleCalendar />
  </v-container>
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
