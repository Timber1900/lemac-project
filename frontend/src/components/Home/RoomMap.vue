<template>
  <div class="grid grid-rows-6 grid-cols-18">
    <div class="col-span-6 col-start-8 row-span-2 row-start-5 border-2 border-[#a5a5a5] flex justify-center items-center text-4xl font-semibold bg-whit">
      Monitor
    </div>
    <div :class=[val.class] v-for="(val) in stations"> {{val.number !== -1 ? val.number : ''}}</div>
  </div>
</template>

<script>
import { getWorkstations } from '@/api/workstations.api';
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
  stations: ''
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
    },
  },
};
</script>
