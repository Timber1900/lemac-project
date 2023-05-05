<template>
  <v-dialog v-model="entryModal" max-width="1250px" persistent>
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
        </v-card-text>
        <v-card-actions>
          <v-btn color="green" large dark @click="save" class="px-8"> Submit </v-btn>
          <v-btn color="light-gray" large dark @click="close" class="px-8"> Close </v-btn>
        </v-card-actions>
      </v-form>

    </v-card>
  </v-dialog>
</template>

<script>
import { setLemacUser } from '@/api/lemacUsers.api';

export default {
  name: 'OfflineModal',
  props: {
    close: Function,
    entryStations: Array | String,
    select: Function,
    userData: Object,
    entrySelected: Number,
    entryModal: Boolean
  },
  async mounted() {
  },
  methods: {
    async save() {
      if (!this.$refs.formAdd.validate()) return;
      const newUserData = this.userData;

      newUserData.state = "online";

      try {
        console.log(newUserData)
        await setLemacUser(newUserData);
        this.close("save");
      } catch (error) {
        console.log(error)
      }

    }
  }
}
</script>
