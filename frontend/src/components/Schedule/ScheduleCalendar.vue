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
          <template #day-body="{ date }">
            <div
              :class="{
                first: new Date().getDate() == new Date(date).getDate(),
                'v-current-time': new Date().getDate() == new Date(date).getDate(),
              }"
              :style="{ top: nowY }"
            ></div>
          </template>
        </v-calendar>
      </v-sheet>
      <v-sheet class="py-3 flex flex-row items-center justify-start">
        <v-btn color="secondary" class="mx-3" @click="downloadCalender">Download</v-btn>
        <v-dialog v-model="dialogOffset" max-width="550px" transition="dialog-transition">
            <template #activator="{ on, attrs }">
              <v-btn color="secondary" v-bind="attrs" v-on="on">Edit targets</v-btn>
            </template>
            <v-card>
              <v-form>
                <v-card-title> Edit targets and offsets </v-card-title>
                <v-card-text>
                  <v-row>
                    <v-text-field
                      id="target"
                      v-model="targetHours"
                      name="target"
                      :label="`Target hours (${targetHours})`"
                      class="ml-4"
                      clearable
                      type="number"
                    ></v-text-field>
                    <v-spacer></v-spacer>
                    <v-text-field
                      id="offset"
                      v-model="offsetHours"
                      name="offset"
                      label="Hour offset"
                      class="mr-4"
                      clearable
                      type="number"
                    ></v-text-field>
                  </v-row>
                </v-card-text>
              </v-form>
            </v-card>
        </v-dialog>
        <span class="inline-block grow">
          <p style="text-align: center; margin: auto">{{ active_user.name }}</p>
          <p style="text-align: center; margin: auto">
            Target: {{ targetHours }} - Current: {{ getUserHours() }}
          </p>
        </span>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script>
import { getUsers } from '@/api/user.api';
import {
  createHours,
  getHours,
  deleteHours,
  updateHour,
  getUserTargets,
  setUserTarget,
} from '@/api/schedule.api';
import Vue from 'vue';
import ICS from 'vue-ics';
import { saveAs } from 'file-saver';

export default {
  data: () => ({
    type: 'week',
    mode: 'stack',
    value: '',
    dialogOffset: '',
    targetHours: 40,
    offsetHours: 0,
    switchValue: false,
    events: [],
    colors: {
      9: '#ff0000',
      10: '#ff00ff',
      11: '#fbbc04',
      12: '#9900ff',
      13: '#93c47d',
      14: '#eb6212',
      15: '#d9d9d9',
      16: '#999999',
      17: '#d9d9d9',
      18: '#86b42b',
    },
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
    inactive_users: [],
    active_user: '',
    ready: false,
    update: false,
    nowY: '-10px',
  }),
  computed: {
    cal() {
      return this.ready ? this.$refs.calendar : null;
    },
  },
  watch: {
    active_user() {
      this.getTargetHours();
    },
    value() {
      this.getTargetHours();
    },
    dialogOffset(visible) {
      if (!visible) {
        this.save();
      }
    },
  },
  async mounted() {
    const cal = this.$refs.calendar;
    const now = cal.times.now;
    now.hour++;
    this.ready = true;

    cal.scrollToTime(8.5 * 60);
    Vue.use(ICS, {});

    this.$refs.calendar.checkChange();

    this.users = (await getUsers()).data;
    this.inactive_users = this.users.filter((val) => !val.active);
    this.users = this.users.filter((val) => val.active);
    this.active_user = this.users.find((val) => val.current);
    let events = (await getHours()).data;
    events = events.map((val) => {
      let user = this.users.find((user) => user.id == val.userId);
      if (!user) user = this.inactive_users.find((user) => user.id == val.userId);
      return {
        name: user.name,
        start: this.toTimestamp(new Date(val.entry)),
        end: this.toTimestamp(new Date(val.exit)),
        color: this.colors[user.id],
        details: val,
      };
    });

    this.events = [...this.events, ...events];

    const refresh = () => {
      if (this.cal) {
        const now = this.cal.times.now;
        const nowDate = new Date();
        now.hour = nowDate.getHours() + 1;
        now.minute = nowDate.getMinutes();

        this.nowY = this.cal.timeToY(this.cal.times.now) + 'px';
      } else {
        this.nowY = '-10px';
      }
      requestAnimationFrame(refresh);
    };

    refresh();
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
          details: { userId: this.active_user.id },
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

      let workedHours = 0;
      const calenderDate = this.value ? new Date(this.value) : new Date();
      const oneAug = new Date(calenderDate.getFullYear(), 6, 31);
      const numberOfDays = Math.floor((calenderDate - oneAug) / (24 * 60 * 60 * 1000));
      const curWeek = Math.floor(numberOfDays / (7 * 4));

      for (const ev of this.events) {
        const calenderDate = new Date(ev.start);
        const numberOfDays = Math.floor((calenderDate - oneAug) / (24 * 60 * 60 * 1000));
        const eventWeek = Math.floor(numberOfDays / (7 * 4));

        if (curWeek == eventWeek) {
          workedHours += (new Date(ev.end) - new Date(ev.start)) / (60 * 60 * 1000);
        }
      }

      const fullHours = 12 * 5 * 4 - workedHours;
      if (fullHours === 0) {
        const databaseTargets = (await getUserTargets()).data;
        const weekVals = databaseTargets.filter(
          (val) => val.week === curWeek && val.targetHours !== null
        );
        const workedHours = weekVals.reduce((acc, val) => acc + val.targetHours, 0);
        const fullHours = 12 * 5 * 4 - workedHours;
        const defaultTarget = fullHours / (this.users.length - weekVals.length);

        for (const user of this.users) {
          const check = databaseTargets.find(
            (val) => val.week === curWeek && val.userId === user.id
          );

          if (!check) {
            const dataChange = {
              userId: user.id,
              targetHours: defaultTarget,
              targetOffset: 0,
              week: curWeek,
            };

            await setUserTarget(dataChange);
          }
        }
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
    getUserHours() {
      const calenderDate = this.value ? new Date(this.value) : new Date();
      const oneAug = new Date(calenderDate.getFullYear(), 6, 31);
      const numberOfDays = Math.floor((calenderDate - oneAug) / (24 * 60 * 60 * 1000));
      const curWeek = Math.floor(numberOfDays / (7 * 4));

      let event_weeks = this.events.map((val) => {
        const calenderDate = new Date(val.start);
        const oneAug = new Date(calenderDate.getFullYear(), 6, 31);
        const numberOfDays = Math.floor((calenderDate - oneAug) / (24 * 60 * 60 * 1000));
        const curWeek = Math.floor(numberOfDays / (7 * 4));

        return {
          event: val,
          week: curWeek,
        };
      });

      const res = event_weeks.filter((val) => val.week === curWeek);

      const user_hours = res.reduce((acc, val) => {
        if (val.event.details.userId == this.active_user.id) {
          const work_hours =
            (new Date(val.event.end) - new Date(val.event.start)) / (1000 * 60 * 60);
          return acc + work_hours;
        }
        return acc;
      }, 0);

      return user_hours;
    },
    async getTargetHours() {
      const calenderDate = this.value ? new Date(this.value) : new Date();
      const oneAug = new Date(calenderDate.getFullYear(), 6, 31);
      const numberOfDays = Math.floor((calenderDate - oneAug) / (24 * 60 * 60 * 1000));
      const curWeek = Math.floor(numberOfDays / (7 * 4));

      const databaseTargets = (await getUserTargets()).data;
      const check = databaseTargets.find(
        (val) => val.week === curWeek && val.userId === this.active_user.id
      );

      const weekVals = databaseTargets.filter(
        (val) => val.week === curWeek && val.targetHours !== null
      );
      const workedHours = weekVals.reduce((acc, val) => acc + val.targetHours, 0);
      const fullHours = 12 * 5 * 4 - workedHours;

      if (check) {
        this.targetHours =
          check.targetHours ?? Math.floor(fullHours / (this.users.length - weekVals.length));
      } else {
        let workedHours = 0;
        const calenderDate = this.value ? new Date(this.value) : new Date();
        const oneAug = new Date(calenderDate.getFullYear(), 6, 31);
        const numberOfDays = Math.floor((calenderDate - oneAug) / (24 * 60 * 60 * 1000));
        const curWeek = Math.floor(numberOfDays / (7 * 4));

        for (const ev of this.events) {
          const calenderDate = new Date(ev.start);
          const numberOfDays = Math.floor((calenderDate - oneAug) / (24 * 60 * 60 * 1000));
          const eventWeek = Math.floor(numberOfDays / (7 * 4));

          if (curWeek == eventWeek) {
            workedHours += (new Date(ev.end) - new Date(ev.start)) / (60 * 60 * 1000);
          }
        }

        const fullHours = 12 * 5 * 4 - workedHours;
        if (fullHours === 0) {
          this.targetHours = 0;
        } else {
          this.targetHours = Math.floor(fullHours / (this.users.length - weekVals.length));
        }
      }
    },
    async save() {
      const calenderDate = this.value ? new Date(this.value) : new Date();
      const oneAug = new Date(calenderDate.getFullYear(), 6, 31);
      const numberOfDays = Math.floor((calenderDate - oneAug) / (24 * 60 * 60 * 1000));
      const curWeek = Math.floor(numberOfDays / (7 * 4));

      const dataChange = {
        userId: this.active_user.id,
        targetHours: this.targetHours,
        targetOffset: this.offsetHours,
        week: curWeek,
      };

      const data = (await setUserTarget(dataChange)).data;

      const databaseTargets = (await getUserTargets()).data;
      const weekVals = databaseTargets.filter(
        (val) => val.week === curWeek && val.targetHours !== null
      );

      const workedHours = weekVals.reduce((acc, val) => acc + val.targetHours, 0);
      const fullHours = 12 * 5 * 4 - workedHours;
      const defaultTarget = Math.floor(fullHours / (this.users.length - weekVals.length));

      this.targetHours = data.targetHours ?? defaultTarget;
      this.offsetHours = data.targetOffset;
    },
    downloadCalender() {
      const calenderDate = this.value ? new Date(this.value) : new Date();
      const oneAug = new Date(calenderDate.getFullYear(), 6, 31);
      const numberOfDays = Math.floor((calenderDate - oneAug) / (24 * 60 * 60 * 1000));
      const curWeek = Math.floor(numberOfDays / (7 * 4));

      this.$ics.removeAllEvents();

      for (const ev of this.events) {
        const calenderDate = new Date(ev.start);
        const oneAug = new Date(calenderDate.getFullYear(), 6, 31);
        const numberOfDays = Math.floor((calenderDate - oneAug) / (24 * 60 * 60 * 1000));
        const eventWeek = Math.floor(numberOfDays / (7 * 4));

        if (ev.details.userId === this.active_user.id && eventWeek === curWeek) {
          this.$ics.addEvent(
            'pt-Pt',
            `LEMAC - ${this.active_user.name}`,
            '',
            'LEMAC-LTI',
            new Date(ev.start).toISOString(),
            new Date(ev.end).toISOString()
          );
        }
      }

      const calender = this.$ics.calendar();
      let final_calender = '';

      for (const line of calender.split('\n')) {
        if (line !== '') final_calender = `${final_calender}${line}\r\n`;
      }

      var blob = new Blob([final_calender], { type: 'text/x-vCalendar;charset=utf-8' });
      saveAs(blob, `LEMAC-${this.active_user.name}-Week_${curWeek}.ics`);
    },
  },
};
</script>

<style lang="scss">
.v-current-time {
  height: 2px;
  background-color: #ea4335;
  position: absolute;
  left: -1px;
  right: 0;
  pointer-events: none;

  &.first::before {
    content: '';
    position: absolute;
    background-color: #ea4335;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-top: -5px;
    margin-left: -6.5px;
  }
}
</style>
