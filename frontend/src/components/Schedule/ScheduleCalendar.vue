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
          <div style="display: flex; justify-items: center; align-items: center; padding: 0 1em">
            <v-switch
              v-model="switchValue"
              fill-height
              align-center
              justify-center
              inset
              hide-details
              label="Edit mode"
            ></v-switch>
          </div>
          <v-menu bottom right offset-y>
            <template #activator="{ on, attrs }">
              <v-btn style="margin: 0 1em" color="secondary" v-bind="attrs" v-on="on">
                <span>{{ active_user.name }}</span>
                <v-icon right> mdi-menu-down </v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item v-for="user in users" :key="user.id" @click="active_user = user">
                <v-list-item-title>
                  {{ user.name }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
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
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>
      <v-sheet min-height="70vh">
        <v-calendar
          ref="calendar"
          v-model="value"
          :type="type"
          :events="events"
          :event-overlap-mode="mode"
          :event-overlap-threshold="60"
          :event-ripple="false"
          interval-count="14"
          first-interval="8"
          @mousedown:event="startDrag"
          @mousedown:time="startTime"
          @mousemove:time="mouseMove"
          @mouseup:time="endDrag"
          @mouseleave.native="cancelDrag"
        >
          <template #interval="{ weekday, hour }">
            <div
              v-if="weekday == 0 || weekday == 6 || hour < 9 || hour >= 21"
              style="height: 100%; width: 100%; background-color: #f2f2f2"
            ></div>
            <div v-else style="height: 100%; width: 100%"></div>
          </template>
          <template #event="{ event, timed }">
            <div
              class="v-event-timed-container"
              style="user-select: none; background-color: inherit; position: relative"
            >
              <div style="padding-left: 0.5em; background-color: inherit">
                <strong>{{ event.name }}</strong>
                <br />
                {{ formatTime(event.start, event.end) }}
              </div>
            </div>
            <v-hover v-slot="{ hover }">
              <div
                v-if="timed"
                style="
                  position: absolute;
                  left: 0;
                  right: 0;
                  bottom: 0px;
                  height: 20px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding-bottom: 4px;
                "
              >
                <v-icon
                  v-if="hover && switchValue"
                  color="white"
                  @mousedown.stop="extendBottom(event)"
                  >mdi-menu</v-icon
                >
                <v-btn
                  v-if="hover && switchValue"
                  fab
                  text
                  small
                  style="position: absolute; bottom: 0; right: 0; margin: auto auto 0 0; padding: 0"
                  @click="deleteHour(event)"
                >
                  <v-icon color="red">mdi-close</v-icon>
                </v-btn>
              </div>
            </v-hover>
          </template>
        </v-calendar>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script>
import { getUsers } from '@/api/user.api';
import { createHours, getHours, deleteHours, updateHour } from '@/api/schedule.api';

export default {
  data: () => ({
    type: 'week',
    mode: 'stack',
    value: '',
    switchValue: false,
    events: [],
    colors: [
      '#2196F3',
      '#3F51B5',
      '#673AB7',
      '#00BCD4',
      '#4CAF50',
      '#FF9800',
      '#757575',
      '#950d7e',
      '#e4acc7',
      '#81ac3a',
      '#24f021',
    ],
    dragEvent: null,
    lastEvent: '',
    createEvent: null,
    createStart: null,
    extendOriginal: null,
    typeToLabel: {
      week: 'Week',
      day: 'Day',
    },
    menu: false,
    date: false,
    users: [],
    active_user: '',
  }),
  async mounted() {
    const cal = this.$refs.calendar;
    cal.scrollToTime(8.5 * 60);

    this.$refs.calendar.checkChange();

    this.users = (await getUsers()).data;
    this.active_user = this.users.find((val) => val.current);

    let events = (await getHours()).data;
    events = events.map((val) => {
      let user = this.users.find((user) => user.id == val.userId);

      return {
        name: user.name,
        start: this.toTimestamp(new Date(val.entry)),
        end: this.toTimestamp(new Date(val.exit)),
        color: this.colors[user.id],
        details: val,
      };
    });

    this.events = [...this.events, ...events];
    console.log(events);
  },
  methods: {
    formatTime(start, end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      return `${startDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    },
    startDrag(e) {
      if (e.event && e.timed) {
        this.dragEvent = e.event;
        this.dragTime = null;
        this.extendOriginal = null;
      }

      this.lastEvent = 'startDrag';
    },
    async startTime(e) {
      if (!this.switchValue) return;
      const mouse = this.toDate(e);
      if (
        mouse.getHours() < 9 ||
        mouse.getHours() > 21 ||
        (mouse.getHours() == 21 && mouse.getMinutes() != 0) ||
        mouse.getDay() == 0 ||
        mouse.getDay() == 6
      )
        return;
      if (this.dragEvent && this.dragTime === null) {
        const start = this.toDate(this.dragEvent.start);
        this.dragTime = mouse.getTime() - start.getTime();
      } else {
        this.createStart = this.roundTime(mouse.getTime());
        this.createEvent = {
          name: this.active_user ? this.active_user.name : 'Unkown',
          start: this.toTimestamp(new Date(this.createStart)),
          end: this.toTimestamp(new Date(this.createStart)),
          color: this.colors[this.active_user.id],
        };
        this.events.push(this.createEvent);
      }
      this.lastEvent = 'startTime';
    },
    extendBottom(event) {
      if (!this.switchValue) return;

      this.createEvent = event;
      this.createStart = this.toDate(event.start).getTime();
      this.extendOriginal = event.end;
    },
    mouseMove(e) {
      if (this.dragEvent && this.dragTime !== null) {
        const start = this.toDate(this.dragEvent.start);
        const end = this.toDate(this.dragEvent.end);
        const duration = end.getTime() - start.getTime();
        const mouse = this.toDate(e);

        const newStartTime = mouse.getTime() - this.dragTime;
        let newStart = new Date(this.roundTime(newStartTime));
        let newEnd = new Date(newStart.getTime() + duration);

        if (newStart.getHours() < 9) {
          newStart.setHours(9, 0);
          newEnd = new Date(newStart.getTime() + duration);
        }

        if (newEnd.getHours() > 21 || (newEnd.getHours() == 21 && newEnd.getMinutes() != 0)) {
          newEnd.setHours(21, 0);
          newStart = new Date(newEnd.getTime() - duration);
        }
        if (newEnd.getDay() != newStart.getDay()) {
          newEnd.setHours(21, 0);
          newEnd.setDate(newStart.getDate());
          newStart = new Date(newEnd.getTime() - duration);
        }

        if (newStart.getDay() == 0 || newStart.getDay() == 6) {
          return;
        }

        this.dragEvent.start = this.toTimestamp(newStart);
        this.dragEvent.end = this.toTimestamp(newEnd);
      } else if (this.createEvent && this.createStart !== null) {
        const mouse = this.toDate(e).getTime();
        const mouseRounded = this.roundTime(mouse, false);
        const min = Math.min(mouseRounded, this.createStart);
        const max = Math.max(mouseRounded, this.createStart);

        let startDate = new Date(min);
        if (startDate.getHours() < 9) {
          startDate.setHours(9, 0);
        }
        this.createEvent.start = this.toTimestamp(startDate);
        let endDate = new Date(max);
        if (endDate.getHours() > 21 || (endDate.getHours() == 21 && endDate.getMinutes() != 0)) {
          endDate.setHours(21, 0);
        }
        if (endDate.getDay() != startDate.getDay()) {
          endDate.setHours(21, 0);
          endDate.setDate(startDate.getDate());
        }
        this.createEvent.end = this.toTimestamp(endDate);
      }
    },
    async endDrag() {
      if ((!this.createEvent && !this.dragEvent) || !this.switchValue) return;
      const event = this.createEvent ?? this.dragEvent;
      this.dragTime = null;
      this.dragEvent = null;
      this.createEvent = null;
      this.createStart = null;
      this.extendOriginal = null;

      this.lastEvent = 'endDrag';

      let events = (await getHours()).data;
      if (!this.events.find((val) => val.details?.id === event.details?.id)) return;

      if (events.find((val) => val.id === event.details?.id)) {
        let update_event = {
          userId: event.details.userId,
          entry: event.start,
          exit: event.end,
        };

        await updateHour(event.details.id, update_event);
      } else {
        let add_event = {
          userId: this.active_user.id,
          entry: event.start,
          exit: event.end,
        };

        const index = this.events.length - 1;

        const data = (await createHours(add_event)).data;
        let user = this.users.find((user) => user.id == data.userId);

        let updatedEvent = {
          name: user.name,
          start: this.toTimestamp(new Date(data.entry)),
          end: this.toTimestamp(new Date(data.exit)),
          color: this.colors[user.id],
          details: data,
        };
        this.events[index] = updatedEvent;
      }
    },
    cancelDrag() {
      if (this.createEvent) {
        if (this.extendOriginal) {
          this.createEvent.end = this.extendOriginal;
        } else {
          const i = this.events.indexOf(this.createEvent);
          if (i !== -1) {
            this.events.splice(i, 1);
          }
        }
      }

      this.createEvent = null;
      this.createStart = null;
      this.dragTime = null;
      this.dragEvent = null;

      this.lastEvent = 'cancelDrag';
    },
    roundTime(time, down = true) {
      const roundDownTime = 15 * 60 * 1000; // 15 minutes

      return down ? time - (time % roundDownTime) : time + (roundDownTime - (time % roundDownTime));
    },
    toDate(tms) {
      return typeof tms === 'string'
        ? new Date(tms)
        : new Date(tms.year, tms.month - 1, tms.day, tms.hour, tms.minute);
    },
    toTimestamp(date) {
      return `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
    },
    setToday() {
      this.value = '';
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    async deleteHour(event) {
      const ev = this.events.filter((val) => this.getUniqueId(val) === this.getUniqueId(event));
      this.events = this.events.filter((val) => this.getUniqueId(val) !== this.getUniqueId(event));
      await deleteHours(ev[0].details.id);
    },
    getUniqueId(event) {
      return `${event.name}${event.start}${event.end}`;
    },
  },
};
</script>
