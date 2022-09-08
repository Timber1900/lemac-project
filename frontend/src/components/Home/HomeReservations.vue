<template>
  <v-row class="fill-height">
    <v-col>

    <v-sheet height="64">
        <v-toolbar flat>
          <v-btn class="mr-4" color="secondary" @click="setToday"> Today </v-btn>
          <v-btn fab text small color="grey darken-2" @click="prev">
            <v-icon small> mdi-chevron-left </v-icon>
          </v-btn>
          <v-btn fab text small color="grey darken-2" @click="next">
            <v-icon small> mdi-chevron-right </v-icon>
          </v-btn>
          <v-toolbar-title v-if="$refs.calendar">
            {{ $refs.calendar.title }}
          </v-toolbar-title>
          <v-spacer></v-spacer>

          <v-menu bottom right offset-y>
            <template #activator="{ on, attrs }">
              <v-btn color="secondary" v-bind="attrs" v-on="on">
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right> mdi-menu-down </v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Day</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Week</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Month</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
    </v-sheet>

    <v-sheet height="75vh">
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          :events="events"
          :event-color="getEventColor"
          :type="type"
          @click:more="viewDay"
          @click:date="viewDay"
          @change="updateRange"
          @click:event="showEvent"

        ></v-calendar>
        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
        >
          <v-card v-if="selectedElement" color="grey lighten-4" min-width="250px" flat>
            <v-toolbar :color="selectedEvent.color" dark>
              <v-toolbar-title v-if="selectedElement">{{
                selectedEvent.details.title
              }}</v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>
            <v-card-text>
              <p>
                Classroom: <b>{{ selectedEvent.details.room }}</b>
              </p>
              <p>
                Entry:
                {{
                  new Date(selectedEvent.details.entry).toLocaleString(undefined, {
                    dateStyle: 'long',
                    timeStyle: 'short',
                    timeZone: 'UTC',
                  })
                }}
              </p>
              <p>
                Exit:
                {{
                  new Date(selectedEvent.details.exit).toLocaleString(undefined, {
                    dateStyle: 'long',
                    timeStyle: 'short',
                    timeZone: 'UTC',
                  })
                }}
              </p>
              <p v-if="typeof selectedEvent.details.id !== 'number'">Description: {{ selectedEvent.details.description }}</p>
            </v-card-text>
          </v-card>
        </v-menu>
    </v-sheet>
  </v-col>

  </v-row>

</template>

<script>
  import {
    getHoursFenix,
    getHours,
  } from '@/api/room_hours.api';
  import { getEvents } from '@/api/room_events.api';


  export default {
    name: 'HomeReservations',
    components: {},
    data: () => ({
    focus: '',
    type: 'week',
    typeToLabel: {
      month: 'Month',
      week: 'Week',
      day: 'Day',
    },
    menu: false,
    menu2: false,
    menu3: false,
    menu4: false,
    menu5: false,
    menu6: false,
    date: false,
    roomDropdown: '',
    dialog: false,
    dialogCard: false,
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
    colors: { SDM: 'blue', MOM: 'green', LTI: 'orange' },
    editedItem: {
      entry: '',
      exit: '',
      date: '',
    },
    requested: [],
    items: ['SDM', 'MOM', 'LTI'],
    name: '',
    ist_id: '',
  }),
    mounted() {
    },
      methods: {
        viewDay({ date }) {
        this.focus = date;
        this.type = 'day';
      },
      getEventColor(event) {
        if (event.givenKey) {
          return `${event.color} darken-4`;
        } else {
          return event.color;
        }
      },

      setToday() {
        this.focus = '';
      },

      prev() {
        this.$refs.calendar.prev();
      },

      next() {
        this.$refs.calendar.next();
      },


    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        requestAnimationFrame(() => requestAnimationFrame(() => (this.selectedOpen = true)));
      };

      if (this.selectedOpen) {
        this.selectedOpen = false;
        requestAnimationFrame(() => requestAnimationFrame(() => open()));
      } else {
        open();
      }

      nativeEvent.stopPropagation();
    },

      async updateRange({ start, end }) {
        this.$loading.show();

        await this.pushEventsFenix();

        if (!this.requested.includes('' + start.month + start.year)) {
          await this.pushEvents(start.month, start.year);
          this.requested.push('' + start.month + start.year);
        }
        if (!this.requested.includes('' + end.month + end.year)) {
          await this.pushEvents(end.month, end.year);
          this.requested.push('' + end.month + end.year);
        }
        this.$loading.hide();
      },

      async pushEvents(month, year) {
      const date = new Date();
      const dates = [];
      date.setDate(date.getDate() - date.getDay());
      dates[0] = date.toISOString().slice(0, 10);
      date.setDate(date.getDate() + 6);
      dates[1] = date.toISOString().slice(0, 10);

      const events = [];
      const data = (await getHours(month, year)).data;
      const data_events = (await getEvents(dates[0], dates[1])).data;

      for (const event of data) {
        const data_event = data_events.filter((val) => val.roomId === event.id);
        event.title = `Reservation of ${event.user.name}`;
        event.events = data_event;

        events.push({
          name: event.title,
          start: new Date(event.entry),
          end: new Date(event.exit),
          color: this.colors[event.room],
          timed: true,
          id: event.id,
          givenKey: event.givenKey,
          details: event,
        });
      }

      this.events = events.concat(this.events);
    },

    async pushEventsFenix() {
      const events = [];
      const data = (await getHoursFenix()).data;

      for (const event of data) {
        if (!this.events.find((el) => el.id === event.id)) {
          events.push({
            name: event.title,
            start: new Date(event.entry),
            end: new Date(event.exit),
            color: this.colors[event.room],
            timed: true,
            id: event.id,
            givenKey: false,
            details: event,
          });
        }
      }

      this.events = events.concat(this.events);
    },
    },
  };
  </script>
