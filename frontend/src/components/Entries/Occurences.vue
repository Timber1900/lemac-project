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
import moment from 'moment';

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
        const entry = moment(value.createdAt).utcOffset("+0000");
        const exit = moment(value.createdAt).utcOffset("+0000");

        if(value.closedAt) {
          const times = value.closedAt.split(":");
          exit.set({hour: times[0], minutes: times[1], seconds: times[2]});
        }

        this.data = [...this.data, {
          date: entry.format("DD/MM/YYYY"),
          entry: entry.format("HH:mm:SS"),
          stuId: value.istId,
          computer: value.workstation.name,
          exit: value.closedAt ? exit.format("HH:mm:SS") : '-',
          spent: value.closedAt ? moment((exit.valueOf() - entry.valueOf())).utcOffset("+0000").format("HH:mm:SS"): '-'
        }]
      }


      this.$loading.hide();
    },
  },
};
</script>
