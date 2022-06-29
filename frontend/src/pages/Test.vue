<template>
  <div v-if="getPermission === 1">
    <v-tabs grow>
      <v-tab key="1">Calendar</v-tab>
      <v-tab key="2">Hour Table</v-tab>
      <v-tab-item>
        <v-container>
          <RoomCalenderVue />
        </v-container>
      </v-tab-item>
      <v-tab-item>
        <v-container>
          <SumTable />
        </v-container>
      </v-tab-item>
    </v-tabs>
  </div>

  <div v-else>
    <v-container v-if="hours" class="mt-6">
      <HourTable :prop-hours="hours" />
    </v-container>
  </div>
</template>

<script>
import RoomCalenderVue from '@/components/Test/RoomCalender.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'Test',
  components: { RoomCalenderVue },
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
