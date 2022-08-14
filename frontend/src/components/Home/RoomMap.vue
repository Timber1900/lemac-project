<template>
<div class="w-full h-full">

  <div class="grid grid-rows-9 grid-cols-18 overflow-hidden">
    <div class="relative col-span-6 col-start-8 row-span-2 row-start-5 border-2 border-[#a5a5a5] flex justify-center items-center text-4xl font-semibold bg-whit">
      Monitor
      <div class="absolute my-auto right-[-48px]">
        <v-icon size="48" color="black">
          mdi-account
        </v-icon>
      </div>
    </div>
    <div :class=[val.class] v-for="(val) in stations"> {{val.number !== -1 ? val.number : ''}}</div>
    <div class="col-span-18 xl:row-span-2 row-span-3">
      <div class="grid grid-rows-1 grid-cols-18 border border-[#a5a5a5] my-4 py-4">
        <div class="col-start-1 col-span-2 flex items-center justify-center text-center px-2 lg:text-base text-xs">
          Legenda:
        </div>
        <div class="base col-start-3 pc-normal">
          LTI-PC
        </div>
        <div class="col-start-4 col-span-3 flex items-center justify-center text-center px-2 lg:text-base text-xs">
          Computador Livre para estudo sem portátil
        </div>
        <div class="base col-start-7 pc-laptop">
          LTI-PC
        </div>
        <div class="col-start-8 col-span-3 flex items-center justify-center text-center px-2 lg:text-base text-xs">
          Computador Livre para estudo com portátil
        </div>
        <div class="base col-start-11 pc-active">
          LTI-PC
        </div>
        <div class="col-start-12 col-span-3 flex items-center justify-center text-center px-2 lg:text-base text-xs">
          Computador em uso
        </div>
      </div>
    </div>
  </div>
  <div class="flex w-full px-8 py-4 items-center justify-start">
    <div class="lg:text-4xl text-lg font-semibold mr-2">
      Avisos:
    </div>
    <div class="h-full grow flex flex-col items-center justify-start">
      <div v-for="(pub) in publications" class="lg:text-lg text-sm">
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
  },
  data: () => ({
  order: [
    69, 66, -1, 65, 62, -1, 61, 58, -1, 57, 54, -1, 53, 50, -1, -1, 49, 40, 68, 67, -1, 64, 63, -1, 60, 59, -1, 56, 55, -1, 52, 51, -1, -1, 48, 41, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 47, 42, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 71, 72, -1, 75, 76, -1, -1, -1, -1, -1, 45, 43, 70, 73, -1, 74, 77, -1, -1, -1, -1, -1, 46, 44
  ],
  classData: ['l', 'r', '', 'l', 'r', '', 'l', 'r', '', 'l', 'r', '', '', '', 'l', 'r', '', '', 'l', 'r', '', 'l', 'r', '', 'l', 'r', '', 'l', 'r', '', '', '', 'l', 'r', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'l', 'r', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'l', 'r', '', '', '', '', '', '', 'l', 'r', '', '', 'l', 'r', '', '', '', '', '', '', 'l', 'r', '', ''],
  stations: '',
  publications: ''
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
        if(station.occupation != 0) returnVal.class = 'base pc-active'

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
  },
};
</script>
