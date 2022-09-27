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
      <v-sheet >
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
          <template #interval="{ weekday, hour, date }">
            <div
              v-if="weekday == 0 || weekday == 6 || hour < 9 || hour >= 21 || testDate(date)"
              style="height: 100%; width: 100%; background-color: #f2f2f2"
            ></div>
            <div v-else style="height: 100%; width: 100%"></div>
          </template>
          <template #event="{ event, timed }">
            <div
              class="v-event-timed-container"
              style="user-select: none; background-color: inherit; position: relative"
            >
              <div style="padding-left: 0.5em; background-color: inherit; color: black">
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
      <v-sheet class="flex flex-row items-center justify-start py-3">
        <v-btn color="secondary" class="mx-3" @click="downloadCalender">Download</v-btn>
        <v-dialog v-if="getPermission === 1" v-model="dialogOffset" max-width="650px" transition="dialog-transition">
            <template #activator="{ on, attrs }">
              <v-btn color="secondary" class="mr-3" v-bind="attrs" v-on="on">Edit targets</v-btn>
            </template>
            <v-card>
              <v-form>
                <v-card-title> Edit targets and offsets </v-card-title>
                <v-card-text>
                  <v-row v-for="(user, i) in users">
                    <span class="flex items-center justify-start px-4 text-sm font-semibold w-36">
                      {{user.name}}:
                    </span>
                    <v-text-field
                      id="target"
                      name="target"
                      v-model="targetHoursArray[user.id]"
                      :label="`Target hours (${targetHoursArray[user.id]})`"
                      class="ml-4"
                      clearable
                      type="number"
                      @change="save(user)"
                    ></v-text-field>
                    <v-spacer></v-spacer>
                    <v-text-field
                      id="offset"
                      v-model="offsetHours"
                      name="offset"
                      label="Hour offset"
                      class="mr-4"
                      clearable
                      disabled
                      type="number"
                    ></v-text-field>
                  </v-row>
                </v-card-text>
              </v-form>
            </v-card>
        </v-dialog>
        <v-dialog v-if="getPermission === 1" v-model="dialogOffDays" max-width="450px" transition="dialog-transition">
            <template #activator="{ on, attrs }">
              <v-btn color="secondary" v-bind="attrs" v-on="on">Edit off days</v-btn>
            </template>
            <v-date-picker
            v-model="dates"
            class="py-3"
            full-width
            multiple
            no-title
            @input="updateDates()"
          ></v-date-picker>
        </v-dialog>
        <span class="inline-block grow">
          <p style="text-align: center; margin: auto">{{ active_user.name }}</p>
          <p style="text-align: center; margin: auto">
            Target: {{ targetHours.find(val => val.user == this.active_user)?.hours }} - Current: {{ getUserHours(active_user) }}
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
  getOffDays,
  setOffDays,
  deleteOffDay
} from '@/api/schedule.api';
import Vue from 'vue';
import ICS from 'vue-ics';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { mapGetters } from 'vuex';

export default {
  data: () => ({
    type: 'week',
    mode: 'stack',
    value: '',
    dialogOffset: '',
    dialogOffDays: '',
    targetHours: [],
    offsetHours: 0,
    switchValue: false,
    events: [],
    colors: {
      1: '#fbbc04',
      2: '#eb6212',
      3: '#93c47d',
      4: '#ff0000',
      5: '#9900ff',
      6: '#ff00ff',
      7: '#4a86e8',
      8: '#d9d9d9',
      9: '#d9d9d9',
      10: '#999999',
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
    offDays: [],
    dates: [],
    targetHoursArray: [],
  }),
  computed: {
    cal() {
      return this.ready ? this.$refs.calendar : null;
    },
    ...mapGetters('user', ['getPermission']),
  },
  watch: {
    active_user() {
      this.getTargetHours();
    },
    value() {
      this.getTargetHours();
    },
  },
  async mounted() {
    const cal = this.$refs.calendar;
    const now = cal.times.now;
    now.hour++;
    this.ready = true;

    const off_days = (await getOffDays()).data;
    this.offDays = [...this.offDays, ...off_days];
    this.dates = this.offDays.map(val => new Date(val.date).toISOString().split('T')[0])

    cal.scrollToTime(8.5 * 60);
    Vue.use(ICS, {});

    this.$refs.calendar.checkChange();

    this.users = (await getUsers()).data;
    this.inactive_users = this.users.filter((val) => !val.active || val.id === 13);
    this.users = this.users.filter((val) => val.active && val.id !== 13);

    this.active_user = this.users.find((val) => val.current);
    let events = (await getHours()).data;
    events = events.map((val) => {
      let user = this.users.find((user) => user.id == val.userId);
      if (!user) user = this.inactive_users.find((user) => user.id == val.userId);

      return {
        name: user.name,
        start: this.toTimestamp(val.entry),
        end: this.toTimestamp(val.exit),
        color: this.colors[user.id],
        details: val,
        timed: true,
      };
    });

    this.events = [...this.events, ...events];

    const refresh = () => {
      if (this.cal) {
        const now = this.cal.times.now;
        const nowDate = moment();
        now.hour = nowDate.utcOffset("+0100").hour();
        now.minute = nowDate.minute();
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
      const startDate = moment(start);
      const endDate = moment(end);

      return `${startDate.format("HH:mm")} - ${endDate.format("HH:mm")}`;
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
      const start = moment(mouse.getTime());

      if (
        start.hours() < 9 ||
        start.hours() > 21 ||
        (start.hours() == 21 && start.minutes() != 0) ||
        start.day() == 0 ||
        start.day() == 6 ||
        this.testDate(start)
      )
        return;
      if (this.dragEvent && this.dragTime === null) {
        const start = this.toDate(this.dragEvent.start);
        this.dragTime = mouse.getTime() - start.getTime();
      } else {
        this.createStart = this.roundTime(mouse.getTime());
        this.createEvent = {
          name: this.active_user ? this.active_user.name : 'Unkown',
          start: moment(this.createStart).format("YYYY-MM-DD HH:mm"),
          end: moment(this.createStart).format("YYYY-MM-DD HH:mm"),
          color: this.colors[this.active_user.id],
          details: { userId: this.active_user.id },
          timed: true,

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
        let newStart = this.roundTime(newStartTime);
        let newEnd = newStart + duration;

        newStart = moment(newStart);
        newEnd = moment(newEnd);

        if (newStart.hours() < 9) {
          newStart.set({hour: 9, minute: 0});
          newEnd = moment(newStart.valueOf() + duration);
        }

        if (newEnd.hours() > 21 || (newEnd.hours() == 21 && newEnd.minutes() != 0)) {
          newEnd.set({hour: 21, minute: 0});
          newStart = moment(newEnd.valueOf() - duration);
        }

        if (newEnd.day() != newStart.day()) {
          newEnd.set({hour: 21, minute: 0, date: newStart.date()});
          newStart = moment(newEnd.valueOf() - duration);
        }

        if (newStart.day() == 0 || newStart.day() == 6 || this.testDate(newStart)) {
          return;
        }

        this.dragEvent.start = newStart.format("YYYY-MM-DD HH:mm");
        this.dragEvent.end = newEnd.format("YYYY-MM-DD HH:mm");
      } else if (this.createEvent && this.createStart !== null) {
        const mouse = this.toDate(e).getTime();
        const mouseRounded = this.roundTime(mouse, false);
        const min = Math.min(mouseRounded, this.createStart);
        const max = Math.max(mouseRounded, this.createStart);

        let startDate = moment(min);
        if (startDate.hours() < 9) {
          startDate.set({hour: 9,  minute: 0});
        }
        this.createEvent.start = startDate.format("YYYY-MM-DD HH:mm");
        let endDate = moment(max);
        if (endDate.hours() > 21 || (endDate.hours() == 21 && endDate.minutes() != 0)) {
          endDate.set({hour: 21, minute: 0});
        }
        if (endDate.day() != startDate.day()) {
          endDate.set({hour: 21, minute: 0, date: startDate.date()});
        }
        this.createEvent.end = endDate.format("YYYY-MM-DD HH:mm");
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
          start: this.toTimestamp(data.entry),
          end: this.toTimestamp(data.exit),
          color: this.colors[user.id],
          details: data,
          timed: true,
        };
        this.events[index] = updatedEvent;
      }

      let workedHours = 0;
      const calenderDate = this.value ? new Date(this.value) : new Date();
      const oneAug = new Date(calenderDate.getFullYear(), 6, 10);
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
      return moment(date).utcOffset('+0000').format("YYYY-MM-DD HH:mm");
      //return `${date.getFullYear()}-${
      //  date.getMonth()+1
      //}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
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
    getUserHours(user) {
      const calenderDate = this.value ? new Date(this.value) : new Date();

      const oneAug = new Date(calenderDate.getFullYear(), 6, 10);
      const numberOfDays = Math.floor((calenderDate - oneAug) / (24 * 60 * 60 * 1000));
      const curWeek = Math.floor(numberOfDays / (7 * 4));

      let event_weeks = this.events.map((val) => {
        const calenderDate = new Date(val.start);

        const oneAug = new Date(calenderDate.getFullYear(), 6, 10);
        const numberOfDays = Math.floor((calenderDate - oneAug) / (24 * 60 * 60 * 1000));
        const curWeek = Math.floor(numberOfDays / (7 * 4));

        return {
          event: val,
          week: curWeek,
        };
      });

      const res = event_weeks.filter((val) => val.week === curWeek);

      const user_hours = res.reduce((acc, val) => {
        if (val.event.details.userId == user.id) {
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
      const oneAug = new Date(calenderDate.getFullYear(), 6, 10);
      const numberOfDays = Math.floor((calenderDate - oneAug) / (24 * 60 * 60 * 1000));
      const curWeek = Math.floor(numberOfDays / (7 * 4));

      const off_in_week = this.offDays.filter(val => {
        const calenderDate = new Date(val.date);
        const oneAug = new Date(calenderDate.getFullYear(), 6, 10);
        const numberOfDays = Math.floor((calenderDate - oneAug) / (24 * 60 * 60 * 1000));
        const curWeekLocal = Math.floor(numberOfDays / (7 * 4));

        return curWeek == curWeekLocal;
      });

      const databaseTargets = (await getUserTargets()).data;

      this.targetHours = [];

      for(const user of this.users) {
        const check = databaseTargets.find(
          (val) => val.week === curWeek && val.userId === user.id
        );


        const weekVals = databaseTargets.filter(
          (val) => val.week === curWeek && val.targetHours !== null
        );

        const workedHours = weekVals.reduce((acc, val) => acc + (val.targetHours ?? 0), 0);

        const fullHours = 12 * 5 * 4 - workedHours - (12*off_in_week.length);


        if (check) {
          this.targetHours = [...this.targetHours, {hours: check.targetHours ?? Math.floor(fullHours / (this.users.length - weekVals.length)), user}]
        } else {
          let workedHours = 0;
          const calenderDate = this.value ? new Date(this.value) : new Date();
          const oneAug = new Date(calenderDate.getFullYear(), 6, 10);
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

          const fullHours = 12 * 5 * 4 - workedHours - workedHours - (12*off_in_week.length);
          if (fullHours === 0) {
            this.targetHours = [...this.targetHours, 0]
          } else {
            this.targetHours = [...this.targetHours, {hours: Math.floor(fullHours / (this.users.length - weekVals.length)), user}]
          }
        }
      }

      for(const hour of this.targetHours) {
        this.targetHoursArray[hour.user.id] = hour.hours;
      }
    },
    async save(user) {
      const calenderDate = this.value ? new Date(this.value) : new Date();

      const oneAug = new Date(calenderDate.getFullYear(), 6, 10);
      const numberOfDays = Math.floor((calenderDate - oneAug) / (24 * 60 * 60 * 1000));
      const curWeek = Math.floor(numberOfDays / (7 * 4));

      const off_in_week = this.offDays.filter(val => {
        const calenderDate = new Date(val.date);
        const oneAug = new Date(calenderDate.getFullYear(), 6, 10);
        const numberOfDays = Math.floor((calenderDate - oneAug) / (24 * 60 * 60 * 1000));
        const curWeekLocal = Math.floor(numberOfDays / (7 * 4));

        return curWeek == curWeekLocal;
      });

      const dataChange = {
        userId: user.id,
        targetHours: this.targetHoursArray[user.id],
        targetOffset: this.offsetHours,
        week: curWeek,
      };

      const data = (await setUserTarget(dataChange)).data;

      await this.getTargetHours();
      this.offsetHours = data.targetOffset;
    },
    downloadCalender() {
      const calenderDate = this.value ? new Date(this.value) : new Date();
      const oneAug = new Date(calenderDate.getFullYear(), 6, 10);
      const numberOfDays = Math.floor((calenderDate - oneAug) / (24 * 60 * 60 * 1000));
      const curWeek = Math.floor(numberOfDays / (7 * 4));

      this.$ics.removeAllEvents();

      for (const ev of this.events) {
        const calenderDate = new Date(ev.start);
        const oneAug = new Date(calenderDate.getFullYear(), 6, 10);
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
    testDate(date) {
      for (const val of this.offDays) {
        if(new Date(date).toLocaleDateString() === new Date(val.date).toLocaleDateString()) {
          return true;
        }
      }

      return false;
    },
    async updateDates() {
      let off_days = (await getOffDays()).data;
      this.offDays = [...off_days];

      const addedDates = this.dates.filter(val => {
        if(this.offDays.length == 0) return true

        for(const {date} of this.offDays) {
          if (new Date(date).toLocaleDateString() !== new Date(val).toLocaleDateString()) {
            return true
          }
        }
        return false;
      });

      const removedDates =  this.offDays.filter(({date}) => {
        for(const val of this.dates) {
          if (new Date(date).toLocaleDateString() === new Date(val).toLocaleDateString()) {
            return false
          }
        }
        return true;
      });

      for(const date of addedDates) {
        await setOffDays({date});
      }

      for(const val of removedDates) {
        await deleteOffDay(val.id);
      }

      off_days = (await getOffDays()).data;
      this.offDays = [...off_days];

      this.getTargetHours();
    }

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
