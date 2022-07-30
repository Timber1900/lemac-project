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
          v-model="value"
          :type="type"
          :events="events"
          :event-overlap-mode="mode"
          :event-overlap-threshold="60"
          :event-ripple="false"
          @mousedown:event="startDrag"
          @mousedown:time="startTime"
          @mousemove:time="mouseMove"
          @mouseup:time="endDrag"
          @mouseleave.native="cancelDrag"
        >
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
                <v-icon v-if="hover" color="white" @mousedown.stop="extendBottom(event)"
                  >mdi-menu</v-icon
                >
              </div>
            </v-hover>
          </template>
        </v-calendar>
      </v-sheet>
      <v-dialog v-model="dialog" :overlay="false" max-width="500px" transition="dialog-transition">
        <v-card> Test </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script>
import { getUsers } from '@/api/user.api';

export default {
  data: () => ({
    type: 'week',
    types: ['month', 'week', 'day', '4day'],
    mode: 'stack',
    modes: ['stack', 'column'],
    value: '',
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
    dragStart: null,
    lastEvent: '',
    createEvent: null,
    createStart: null,
    extendOriginal: null,
    dialog: false,
    isMounted: false,
    focus: '',
    typeToLabel: {
      month: 'Month',
      week: 'Week',
      day: 'Day',
    },
    menu: false,
    date: false,
  }),
  watch: {
    dialog(visible) {
      if (!visible) {
        this.dialog = false;
      }
    },
  },
  mounted() {
    const cal = this.$refs.calendar;

    window.app = this;
    window.cal = cal;

    this.isMounted = true;

    // scroll to the current time
    const minutes = cal.times.now.hour * 60 + cal.times.now.minute;
    const firstTime = Math.max(0, minutes - (minutes % 30) - 30);
    cal.scrollToTime(firstTime);

    // every minute update the current time bar
    setInterval(() => cal.updateTimes(), 60 * 1000);

    this.$refs.calendar.checkChange();
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
      const mouse = this.toDate(e);
      if (
        mouse.getHours() < 9 ||
        mouse.getHours() > 21 ||
        (mouse.getHours() == 21 && mouse.getMinutes() != 0)
      )
        return;

      const users = (await getUsers()).data;
      const active_user = users.find((val) => val.current);
      if (this.dragEvent && this.dragTime === null) {
        const start = this.toDate(this.dragEvent.start);
        this.dragTime = mouse.getTime() - start.getTime();
      } else {
        this.createStart = this.roundTime(mouse.getTime());
        this.createEvent = {
          name: active_user ? active_user.name : 'Unkown',
          start: this.toTimestamp(new Date(this.createStart)),
          end: this.toTimestamp(new Date(this.createStart)),
          color: this.colors[active_user.id],
        };
        this.events.push(this.createEvent);
      }
      this.lastEvent = 'startTime';
    },
    extendBottom(event) {
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
    endDrag() {
      this.dialog = this.lastEvent === 'startTime';

      this.dragTime = null;
      this.dragEvent = null;
      this.createEvent = null;
      this.createStart = null;
      this.extendOriginal = null;

      this.lastEvent = 'endDrag';
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
      this.focus = '';
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
  },
};
</script>
