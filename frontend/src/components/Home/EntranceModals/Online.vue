<template>
  <v-dialog v-model="entryModal" max-width="400px" persistent>
    <v-card>
      <v-form ref="formAdd" lazy-validation @submit.prevent="save" class="my-4">
        <v-card-text>
          <span class="flex items-center justify-center">
            <v-btn @click="save" color="primary" class="flex flex-col items-center justify-center" width="320px" height="120px" dark>
              <p class="mb-0 text-2xl">Exit LEMAC</p>
              <v-icon class="ml-4" large>mdi-exit-to-app</v-icon>
            </v-btn>
          </span>
          <span class="flex flex-row items-center justify-center gap-4 mt-4">
            <div>
              <v-btn @click="start_break" color="orange" class="flex flex-col items-center justify-center" width="152px" height="30px" dark>
                <p class="mb-0 text-sm">Enter Break</p>
                <v-icon class="ml-4" small>mdi-pause-box-outline</v-icon>
              </v-btn>
            </div>
            <div>
              <v-btn @click="close" color="light-gray" class="flex flex-col items-center justify-center" width="152px" height="30px" dark>
                <p class="mb-0 text-sm">Cancel</p>
                <v-icon class="ml-4" small>mdi-close</v-icon>
              </v-btn>
            </div>
          </span>
        </v-card-text>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { setLemacUser } from '@/api/lemacUsers.api';

export default {
  name: 'OnlineModal',
  props: {
    close: Function,
    entryStations: Array | String,
    select: Function,
    userData: Object,
    entryModal: Boolean
  },
  async mounted() {
  },
  methods: {
    async save() {
      if (!this.$refs.formAdd.validate()) return;

      const newUserData = this.userData;

      newUserData.state = "offline";

      try {
        await setLemacUser(newUserData);
        this.close("close");
      } catch (error) {
      }

    },
    async start_break() {
      if (!this.$refs.formAdd.validate()) return;

      const newUserData = this.userData;

      newUserData.state = "in_break";

      try {
        console.log(newUserData)
        await setLemacUser(newUserData);
        this.close("");
      } catch (error) {
        console.log(error)
      }

    }
  }
}
</script>
