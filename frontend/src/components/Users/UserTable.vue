<template>
  <v-data-table
    :headers="headers"
    :items="users"
    :search="search"
    sort-by="name"
    class="elevation-1"
  >
    <template #top>
      <v-toolbar flat>
        <v-toolbar-title>Users</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          hide-details
        ></v-text-field>
      </v-toolbar>
    </template>
    <template #[`item.state`]="{ item }">
      <v-chip :color="(states.find(v => v.value === item.state).color)" dark class="capitalized">
        {{ (states.find(v => v.value === item.state)).text }}
      </v-chip>
    </template>
    <template #[`item.last_modified`]="{ item }">
      {{ getTimeDiff(item.last_modified) }}
    </template>
  </v-data-table>
</template>

<script>

export default {
  name: 'UserTable',
  props: {
    members: {
      type: Array,
      default() {
        return [
          {
            id: Number,
            name: String,
            istId: String,
            active: Number,
            admin: Number,
          },
        ];
      },
    },
  },
  data: () => ({
    dialog: false,
    dialogDelete: false,
    search: '',
    users: [],
    headers: [
      { text: 'User', value: 'name' },
      { text: 'Workstation', value: 'workstation' },
      { text: 'IST Id', value: 'ist_id' },
      { text: 'Email', value: 'email', filterable: false },
      { text: 'Course', value: 'course' },
      { text: 'State', value: 'state' },
      { text: 'Mifare ID', value: 'mifare_id', sortable: false, filterable: false },
      { text: 'Time since last action', value: 'last_modified', sortable: false, filterable: false },
    ],
    defaultItem: {
      name: '',
      ist_id: '',
      email: '',
      course: '',
      state: '',
      mifare_id: '',
    },
    states: [
      { text: 'Online', value: "online", color: 'blue' },
      { text: 'Offline', value: "offline", color: 'gray' },
      { text: 'In-Break', value: "in_break", color: 'orange' },
    ],
  }),
  mounted() {
    this.users = this.members;
  },
  methods: {
    getTimeDiff(sqlDateString) {
      // Assuming the SQL date is stored as a string in ISO format, like "2023-05-05T13:48:35.000Z"
      const sqlDate = new Date(sqlDateString);
      const currentDate = new Date();

      // Get the timezone offset difference between the two dates in minutes
      const timezoneOffsetDiff = -currentDate.getTimezoneOffset();

      // Calculate the time difference in milliseconds, adjusted for the timezone offset difference
      const diff = Math.abs(currentDate.getTime() - sqlDate.getTime() + (timezoneOffsetDiff * 60 * 1000));

      // Convert the time difference to hours, minutes, and seconds
      const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(1, "0");
      const minutes = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, "0");
      const seconds = Math.floor((diff / 1000) % 60).toString().padStart(2, "0");

      return `${hours}:${minutes}:${seconds}`;

    }
  }
};
</script>
