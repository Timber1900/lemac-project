<template>
  <v-tabs grow>
    <v-tab key="1">Calendar</v-tab>
    <v-tab key="2">Event Log</v-tab>
    <v-tab-item>
      <v-container>
        <RoomCalenderVue />
      </v-container>
    </v-tab-item>
    <v-tab-item>
      <v-container>
        <EventLogVue />
      </v-container>
    </v-tab-item>
  </v-tabs>
</template>

<script>
import RoomCalenderVue from '@/components/RoomHours/RoomCalender.vue';
import EventLogVue from '@/components/RoomHours/EventLog.vue';

export default {
  name: 'Rooms',
  components: { RoomCalenderVue, EventLogVue },
  methods: {
    goHome() {
      window.location = '/';
    },
  },
};
</script>
