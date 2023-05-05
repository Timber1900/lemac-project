<template>
  <div class="w-full h-full">
    <OfflineModal v-if="modelType == 'offline'" :close="close" :entryStations="entryStations" :select="select" :userData="userData" :entryModal="entryModal"/>
    <OnlineModal v-if="modelType == 'online'" :close="close" :entryStations="entryStations" :select="select" :userData="userData" :entryModal="entryModal"/>
    <InBreak v-if="modelType == 'in_break'" :close="close" :entryStations="entryStations" :select="select" :userData="userData" :entryModal="entryModal"/>
    <CreateUser v-if="modelType == 'create_user'" :close="close" :entryStations="entryStations" :select="select" :mifare_id="mifare_id" :entryModal="entryModal"/>
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
import { getWorkstations} from '@/api/workstations.api';
import { getPublications} from '@/api/publications.api';
import { getLemacUser } from '@/api/lemacUsers.api';
import OfflineModal from "@/components/Home/EntranceModals/OfflineModal.vue";
import OnlineModal from "@/components/Home/EntranceModals/Online.vue";
import CreateUser from "@/components/Home/EntranceModals/CreateUser.vue";
import InBreak from "@/components/Home/EntranceModals/InBreak.vue";
import { addEntry, getEntries, updateEntry } from '@/api/entries.api';

export default {
  name: 'RoomMap',
  async mounted() {
    await this.update();
    setInterval(this.update, 30000);
    this.socket = new WebSocket(process.env.VUE_APP_BASE_URL_WS || 'ws://localhost:5000');

    this.socket.onopen = (e) => {
      this.socket.send("Socket Open");
    };

    const keepSocketAlive = () => {
      this.socket.send("test");

      setInterval(keepSocketAlive, 30000);
    }

    //keepSocketAlive();

    this.socket.addEventListener('message', async (event) => {
      const mifareId = event.data;

      try {
        this.userData = (await getLemacUser(mifareId)).data;
        this.modelType = this.userData.state;
      } catch (error) {
        console.log("test")
        this.mifare_id = mifareId;
        this.modelType = "create_user";
      }

      this.entryModal = true;
      this.entryStations = JSON.parse(JSON.stringify(this.stations));
    });
  },

  destroyed() {
    console.log("Test")
    this.socket.close()
  },
  components: {
    OfflineModal,
    OnlineModal,
    CreateUser,
    InBreak
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
    socket: null,
    modelType: "offline",
    userData: null,
    mifare_id: null
  }),
  methods: {
    async update() {
      const { data } = await getWorkstations();

      this.stations = this.order.map((val, index) => {
        const station = data.find(station => station.name.match(/\d+/)[0] == val );
        const returnVal = {
          number: station ? station.name : '',
          class: 'base',
          id: station ? station.id : '',
          capacity: station ? station.capacity : '',
          occupation: station ? station.occupation : ''
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
    async close(action) {
      if(action == "save") {
          const { data } = await addEntry({
            istId: 'ist1' + this.userData.ist_id,
            workstationId: this.entrySelected.id,
          });
          this.$notify({
            type: 'success',
            title: 'Entry created',
            text: `You have created an entry for workstation ${data.workstation.name}`,
          });
      } else if(action == "close") {
        const entrie = ((await getEntries()).data.filter(val => val.closedAt === null && val.istId === 'ist1' + this.userData.ist_id))[0];
        try {
          await updateEntry(entrie.id, { active: 0 });
          this.$notify({
            type: 'success',
            title: 'Entry closed',
            text: `You have closed entry the entry on ${closed[0].workstation.name}`,
          });
        } catch (error) {

        }
      }
      this.update();
      this.entryModal = false;
    },
    select(val) {
      const index = this.entryStations.indexOf(val);
      this.entryStations = JSON.parse(JSON.stringify(this.stations));

      if(this.entryStations[index].number) {
        if (this.entryStations[index].capacity - this.entryStations[index].occupation === 0) {
          this.entrySelected = -1;
          return
        }

        const classes = this.entryStations[index].class.split(" ");
        classes[classes.length - 1] = "pc-selected";

        this.entryStations[index].class = classes.reduce((val, acc) => `${acc} ${val}`, "");
        this.entrySelected = this.entryStations[index];
      } else {
        this.entrySelected = -1;
      };
    },

  },
};
</script>
