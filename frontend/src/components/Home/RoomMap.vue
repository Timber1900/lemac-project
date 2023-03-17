<template>
  <div class="w-full h-full">
    <v-dialog v-model="entryModal" max-width="1250px">
      <v-card>
        <v-form ref="formAdd" lazy-validation @submit.prevent="save">
          <v-card-title>
            <span class="headline"> Entrance </span>
          </v-card-title>
          <v-card-text>
            <div class="grid overflow-hidden lg:grid-rows-8 grid-rows-9 grid-cols-18">
              <div class="relative col-span-6 col-start-8 row-span-2 row-start-5 border-2 border-[#a5a5a5] flex justify-center items-center text-4xl font-semibold bg-whit">
                Monitor
                <div class="absolute my-auto right-[-48px]">
                  <v-icon size="48" color="black">
                    mdi-account
                  </v-icon>
                </div>
              </div>
              <div :class="[val.number ? 'cursor-pointer' : '', val.class]" v-for="(val) in entryStations" @click="select(val)"> {{val.number !== -1 ? val.number : ''}}</div>
              <div class="row-span-3 col-span-18 xl:row-span-2">
                <div class="grid grid-rows-1 grid-cols-18 border border-[#a5a5a5] my-4 py-4">
                  <div class="flex items-center justify-center col-span-2 col-start-1 px-2 text-xs text-center lg:text-base">
                    Legenda:
                  </div>
                  <div class="col-start-3 base pc-normal">
                    LTI-PC
                  </div>
                  <div class="flex items-center justify-center col-span-3 col-start-4 px-2 text-xs text-center lg:text-base">
                    Computador Livre para estudo sem portátil
                  </div>
                  <div class="col-start-7 base pc-laptop">
                    LTI-PC
                  </div>
                  <div class="flex items-center justify-center col-span-3 col-start-8 px-2 text-xs text-center lg:text-base">
                    Computador Livre para estudo com portátil
                  </div>
                  <div class="col-start-11 base pc-active">
                    LTI-PC
                  </div>
                  <div class="flex items-center justify-center col-span-3 col-start-12 px-2 text-xs text-center lg:text-base">
                    Computador em uso
                  </div>
                  <div class="col-start-15 base pc-selected">
                    LTI-PC
                  </div>
                  <div class="flex items-center justify-center col-span-3 px-2 text-xs text-center col-start-16 lg:text-base">
                    Computador selecionado
                  </div>
                </div>
              </div>
            </div>
            <v-text-field
              v-model="entryId"
              :rules="[(v) => !!v || 'IST Id is required']"
              label="Id"
              type="number"
              required
              filled
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" text @click="save"> Submit </v-btn>
            <v-btn color="primary" text @click="close"> Close </v-btn>
          </v-card-actions>
        </v-form>

      </v-card>
    </v-dialog>
    <div class="grid overflow-hidden lg:grid-rows-8 grid-rows-9 grid-cols-18">
      <div class="relative col-span-6 col-start-8 row-span-2 row-start-5 border-2 border-[#a5a5a5] flex justify-center items-center text-4xl font-semibold bg-whit">
        Monitor
        <div class="absolute my-auto right-[-48px]">
          <v-icon size="48" color="black">
            mdi-account
          </v-icon>
        </div>
      </div>
      <div :class=[val.class] v-for="(val) in stations"> {{val.number !== -1 ? val.number : ''}}</div>
      <div class="row-span-3 col-span-18 xl:row-span-2">
        <div class="grid grid-rows-1 grid-cols-18 border border-[#a5a5a5] my-4 py-4">
          <div class="flex items-center justify-center col-span-2 col-start-1 px-2 text-xs text-center lg:text-base">
            Legenda:
          </div>
          <div class="col-start-3 base pc-normal">
            LTI-PC
          </div>
          <div class="flex items-center justify-center col-span-3 col-start-4 px-2 text-xs text-center lg:text-base">
            Computador Livre para estudo sem portátil
          </div>
          <div class="col-start-7 base pc-laptop">
            LTI-PC
          </div>
          <div class="flex items-center justify-center col-span-3 col-start-8 px-2 text-xs text-center lg:text-base">
            Computador Livre para estudo com portátil
          </div>
          <div class="col-start-11 base pc-active">
            LTI-PC
          </div>
          <div class="flex items-center justify-center col-span-3 col-start-12 px-2 text-xs text-center lg:text-base">
            Computador em uso
          </div>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-start w-full px-8 py-4">
      <div class="mr-2 text-lg font-semibold lg:text-4xl">
        Avisos:
      </div>
      <div class="flex flex-col items-center justify-start h-full grow">
        <div v-for="(pub) in publications" class="text-sm whitespace-pre-wrap lg:text-lg">
          <b>{{pub.title}}</b> : {{pub.text}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getWorkstations } from '@/api/workstations.api';
import { getPublications } from '@/api/publications.api';

export default {
  name: 'RoomMap',
  async mounted() {
    await this.update();
    setInterval(this.update, 30000);
    this.socket = new WebSocket(process.env.VUE_APP_BASE_URL_WS || 'ws://localhost:5000');

    this.socket.onopen = (e) => {
      this.socket.send("Socket Open");
    };

    this.socket.addEventListener('message', (event) => {
      this.message = event.data;
      this.entryModal = true;
      this.entryStations = JSON.parse(JSON.stringify(this.stations));
    });
  },

  destroyed() {
    console.log("Test")
    this.socket.close()
  },
  data: () => ({
    order: [
      30, 28, -1, 26, 24, -1, 22, 20, -1, 18, 16, -1, 14, 12, -1, -1, 10, 7, 29, 27, -1, 25, 23, -1, 21, 19, -1, 17, 15, -1, 13, 11, -1, -1, 9, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 31, 33, -1, 35, 37, -1, -1, -1, -1, -1, 4, 2, 32, 34, -1, 36, 38, -1, -1, -1, -1, -1, 3, 1
    ],
    classData: ['l', 'r', '', 'l', 'r', '', 'l', 'r', '', 'l', 'r', '', '', '', 'l', 'r', '', '', 'l', 'r', '', 'l', 'r', '', 'l', 'r', '', 'l', 'r', '', '', '', 'l', 'r', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'l', 'r', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'l', 'r', '', '', '', '', '', '', 'l', 'r', '', '', 'l', 'r', '', '', '', '', '', '', 'l', 'r', '', ''],
    stations: '',
    publications: '',
    message: "WAITING",
    entryModal: null,
    entrySelected: null,
    entryStations: '',
    entryId: null,
    socket: null
  }),
  methods: {
    async update() {
      const { data } = await getWorkstations();

      this.stations = this.order.map((val, index) => {
        const station = data.find(station => station.name.match(/\d+/)[0] == val );

        const returnVal = {
          number: station ? station.name : '',
          class: 'base'
        }

        if(val != -1) returnVal.class = 'base pc-normal'
        if(!station) return returnVal

        if(station.capacity == 1) returnVal.class = 'base pc-laptop'
        if(station.capacity == 2 && Math.abs(station.occupation - station.capacity) == 1) returnVal.class += ' pc-semiactive'
        if(Math.abs(station.occupation - station.capacity) == 0) returnVal.class = 'base pc-active'

        return returnVal
      })

      this.stations = this.stations.map((val, index) => {
        const returnVal = val;
        returnVal.class = this.classData[index] == 'l' ? `!border-r-2 !border-r-black ${returnVal.class}` : this.classData[index] == 'r' ? `!border-l-2 !border-l-black ${returnVal.class}` : `${returnVal.class}`

        return returnVal
      })

      const publicationData = (await getPublications()).data;
      this.publications = publicationData.filter(val => val.active)
    },
    close() {
      this.entryModal = false;
    },
    select(val) {
      const index = this.entryStations.indexOf(val);
      this.entryStations = JSON.parse(JSON.stringify(this.stations));

      if(this.entryStations[index].number) {
        const classes = this.entryStations[index].class.split(" ");
        classes[classes.length - 1] = "pc-selected";

        this.entryStations[index].class = classes.reduce((val, acc) => `${acc} ${val}`, "");
      };

      this.entrySelected = this.entryStations[index];
    },
    save() {
      if (!this.$refs.formAdd.validate()) return;

      this.entryModal = false;
    }
  },
};
</script>
