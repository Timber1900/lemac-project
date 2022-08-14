<template>
<v-data-table :headers="headers" :items="data" sort-by="id" class="elevation-1">
    <template #top>
      <v-toolbar flat>
        <v-toolbar-title>Occurrence list</v-toolbar-title>
      </v-toolbar>
    </template>
  </v-data-table>
  </template>

<script>
import { getEntries } from '@/api/entries.api';
export default {
  data() {
    return {
      headers: [
        { text: 'Date', value: 'date', sortable: false },
        { text: 'Entry hour', value: 'entry', sortable: false },
        { text: 'Student number', value: 'stuId', sortable: false },
        { text: 'Computer', value: 'computer', sortable: false },
        { text: 'Exit hour', value: 'exit', sortable: false },
        { text: 'Time spent', value: 'spent', sortable: false },
      ],
      data: [],
      dates: [],

    };
  },
  watch: {

  },
  async mounted() {
    this.update();
  },
  methods: {
    async update() {
      this.$loading.show();
      this.data = [];

      if (new Date(this.dates[0]) > new Date(this.dates[1])) this.dates.reverse();

      const {data} = await getEntries();

      for (const value of data) {
        const entry = new Date(value.createdAt);
        const exit = new Date(entry.getTime());
        if(value.closedAt) {
          exit.setHours(value.closedAt.split(":")[0])
          exit.setMinutes(value.closedAt.split(":")[1])
          exit.setSeconds(value.closedAt.split(":")[2])
        }

        this.data = [...this.data, {
          date: entry.toLocaleDateString(),
          entry: entry.toLocaleTimeString(),
          stuId: value.istId,
          computer: value.workstation.name,
          exit: value.closedAt ? exit.toLocaleTimeString() : '-',
          spent: value.closedAt ? new Date((exit - entry)).toISOString().substring(11,19): '-'
        }]
      }


      this.$loading.hide();
    },
  },
};
</script>
