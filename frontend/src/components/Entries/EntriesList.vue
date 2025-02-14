<template>
  <div class="elevation-1">
    <v-toolbar flat>
      <v-toolbar-title> Lab Entries </v-toolbar-title>
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-spacer></v-spacer>
      <v-dialog v-model="dialogAdd" max-width="550px">
        <template #activator="{ on, attrs }">
          <v-btn color="secondary" dark class="mb-2" v-bind="attrs" v-on="on">
            New Registration
          </v-btn>
        </template>
        <v-card>
          <v-form ref="formAdd" lazy-validation @submit.prevent="save">
            <v-card-title>
              <span class="headline"> New Registration </span>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="6">
                  <div v-for="(number, i) in numberList" :key="i + 'a'">
                    <v-text-field
                      v-model="numberList[i]"
                      :rules="[(v) => !!v || 'IST Id is required']"
                      label="Id"
                      type="number"
                      required
                      filled
                    ></v-text-field>
                  </div>
                </v-col>
                <v-col cols="6" class="flex items-center justify-center">
                  <v-autocomplete
                    v-model="newItem.workstationId"
                    label="Workstation"
                    :items="workstations"
                    item-text="name"
                    item-value="id"
                    :rules="[(v) => !!v || 'Workstation is required']"
                    required
                    filled
                  ></v-autocomplete>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="add"> Add Number </v-btn>
              <v-btn color="primary" text @click="remove"> Remove Number </v-btn>
              <v-btn color="primary" text @click="close"> Cancel </v-btn>
              <v-btn color="primary" text @click="save"> Save </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>
    </v-toolbar>
    <v-list>
      <template v-if="entries.length > 0">
        <div v-for="(entry, index) in entries" :key="entry.id + 'b'">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="mb-2">
                <v-chip color="secondary">
                  {{ entry.istId.slice(4) }}
                </v-chip>
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-icon left right small>mdi-desktop-classic</v-icon> {{ entry.workstation.name }}
                <v-icon left right small>mdi-clock</v-icon>
                {{ new Date(entry.createdAt).toLocaleString('pt-PT') }}
                <v-icon left right small>mdi-text</v-icon>
                {{entry.observations}}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <div>
                <v-tooltip bottom open-delay="500">
                  <template #activator="{ on, attrs }">
                    <v-btn
                      class="primary ma-1"
                      small
                      v-bind="attrs"
                      v-on="on"
                      @click="editEntry(entry)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                  Edit
                </v-tooltip>
                <v-tooltip bottom open-delay="500">
                  <template #activator="{ on, attrs }">
                    <v-btn
                      class="ma-1 info darken-1"
                      small
                      v-bind="attrs"
                      v-on="on"
                      @click="addObservation(entry)"
                    >
                      <v-icon>mdi-text</v-icon>
                    </v-btn>
                  </template>
                  Observations
                </v-tooltip>
                <v-tooltip bottom open-delay="500">
                  <template #activator="{ on, attrs }">
                    <v-btn
                      class="ma-1 error"
                      small
                      v-bind="attrs"
                      v-on="on"
                      @click="closeEntry(entry)"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </template>
                  Close Entry
                </v-tooltip>
              </div>
            </v-list-item-action>
          </v-list-item>
          <v-divider v-if="index < entries.length - 1" :key="index + 'c'"></v-divider>
        </div>
      </template>
      <!-- template for empty list -->
      <template v-else>
        <v-list-item key="0"> There are no active entries in the lab! </v-list-item>
      </template>
      <v-dialog v-model="dialog" max-width="550px">
        <v-card>
          <v-form ref="formEdit" lazy-validation @submit.prevent="save">
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>
            <v-card-text>
              <v-textarea
                v-model="editedItem.observations"
                filled
                clearable
                counter
                auto-grow
              ></v-textarea>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="observationsClose"> Cancel </v-btn>
              <v-btn color="primary" text @click="observationsSave"> Save </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>
      <v-dialog v-model="dialogClose" max-width="500px">
        <v-card>
          <v-card-title class="headline">Are you sure you want to close this entry?</v-card-title>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="closeCancel">Cancel</v-btn>
            <v-btn color="error" text @click="closeConfirm">Close</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-list>

    <v-dialog v-model="editEntryModal" max-width="550px" v-if="editEntryModal">
        <v-card>
          <v-form ref="formAdd" lazy-validation @submit.prevent="save">
            <v-card-title>
              <span class="headline"> Edit Registration </span>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="editingEntry.number"
                    :rules="[(v) => !!v || 'IST Id is required']"
                    label="Id"
                    type="number"
                    required
                    filled
                  ></v-text-field>
                </v-col>
                <v-col cols="6" class="flex items-center justify-center">
                  <v-autocomplete
                    v-model="editingEntry.workstationId"
                    label="Workstation"
                    :items="workstations"
                    item-text="name"
                    item-value="id"
                    :rules="[(v) => !!v || 'Workstation is required']"
                    required
                    filled
                  ></v-autocomplete>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="close"> Cancel </v-btn>
              <v-btn color="primary" text @click="edit"> Edit </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>
  </div>
</template>

<script>
import { getEntries, updateEntry, addEntry } from '@/api/entries.api';
import { getWorkstations } from '@/api/workstations.api';
import { getLemacUsers, setLemacUser } from '@/api/lemacUsers.api';

export default {
  data() {
    return {
      entries: [],
      numberList: [null],
      workstations: [],
      editedItem: {
        active: 1,
        observations: '',
      },
      newItem: {
        istId: '',
        workstationId: '',
      },
      dialog: false,
      dialogAdd: false,
      dialogClose: false,
      editedIndex: -1,
      editEntryModal: false,
      editingEntry: null
    };
  },
  computed: {
    formTitle() {
      return this.editedItem === -1 ||
        (this.entries[this.editedIndex]?.observations ?? '').length === 0
        ? 'Add Observations'
        : 'Edit Observations';
    },
  },
  watch: {
    async dialogAdd(val) {
      if (val) await this.loadWorkstations();
      else this.close();
    },
    dialog(val) {
      val || this.observationsClose();
    },
    dialogClose(val) {
      val || this.closeCancel();
    },
  },
  async mounted() {
    this.$loading.show();
    const { data } = await getEntries(1);
    console.log(data);
    this.entries = data;
    this.$loading.hide();
  },
  methods: {
    // trigger methods
    addObservation(item) {
      this.editedIndex = this.entries.indexOf(item);
      this.editedItem = item;
      this.editedItem.observations = item.observations;
      this.dialog = true;
    },
    closeEntry(item) {
      this.editedIndex = this.entries.indexOf(item);
      this.dialogClose = true;
    },
    // dont touch this cancer again - lol have to kek (ass hugo)
    async loadWorkstations() {
      this.$loading.show();
      let { data } = await getWorkstations();
      data = data.sort((v1, v2) => v1.name.match(/\d+/)[0] < v2.name.match(/\d+/)[0] ? -1 : 1);

      let available = data.filter((x) => x.occupation == 0 && x.occupation != x.capacity);
      let partlyAvailable = data.filter((x) => x.occupation > 0 && x.occupation < x.capacity);
      let notAvailable = data.filter((x) => x.type === 'disabled' || x.occupation === x.capacity);

      const workstationsSorted = [{ header: 'Available' }];
      available.forEach((x) => workstationsSorted.push(x));
      workstationsSorted.push({ header: 'Partly Available' });
      partlyAvailable.forEach((x) => workstationsSorted.push(x));
      workstationsSorted.push({ header: 'Not Available' });
      notAvailable.forEach((x) => workstationsSorted.push({ ...x, disabled: 'true' }));

      this.workstations = workstationsSorted;
      this.$loading.hide();

    },
    // close entry methods
    closeCancel() {
      this.dialogClose = false;
      this.$nextTick(() => {
        this.editedIndex = -1;
      });
    },
    async closeConfirm() {
      try {
        this.users = (await getLemacUsers()).data;
        const user = this.users.find(val => 'ist1' + val.ist_id === this.entries[this.editedIndex].istId);
        if(user) {
          const newUserData = user;

          newUserData.state = "offline";
          await setLemacUser(newUserData);
        }

        await updateEntry(this.entries[this.editedIndex].id, { active: 0 });
        const closed = this.entries.splice(this.editedIndex, 1);
        this.$notify({
          type: 'success',
          title: 'Entry closed',
          text: `You have closed entry the entry on ${closed[0].workstation.name}`,
        });
      } finally {
        this.closeCancel();
      }
    },
    // observations methods
    observationsClose() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedIndex = -1;
        this.editedItem.observations = '';
      });
    },
    async observationsSave() {
      try {
        const { data } = await updateEntry(this.entries[this.editedIndex].id, this.editedItem);
        this.entries.splice(this.editedIndex, 1, data);
        this.$notify({
          type: 'success',
          title: 'Entry updated',
          text: `You have updated an entry for workstation ${data.workstation.name}`,
        });
      } finally {
        this.observationsClose();
      }
    },
    // add entry methods
    close() {
      this.dialogAdd = false;
      this.editEntryModal = false;
      this.$refs.formAdd.resetValidation();
      this.$nextTick(() => {
        this.newItem = {
          istId: '',
          workstationId: '',
        };
      });
    },
    async save() {
      if (!this.$refs.formAdd.validate()) return;
      try {
        for(const number of this.numberList) {

          const { data } = await addEntry({
            istId: 'ist1' + number,
            workstationId: this.newItem.workstationId,
          });

          this.entries.push(data);

          this.users = (await getLemacUsers()).data;
          const user = this.users.find(val => 'ist1' + val.ist_id === data.istId);
          if(user) {
            const newUserData = user;
            newUserData.state = "online";
            await setLemacUser(newUserData);
          }

          this.$notify({
            type: 'success',
            title: 'Entry created',
            text: `You have created an entry for workstation ${data.workstation.name}`,
          });
        }
      } finally {
        this.close();
        this.numberList = [null];
      }
    },
    async edit() {
      if (!this.$refs.formAdd.validate()) return;
      try {
        this.editingEntry.istId = `ist1${this.editingEntry.number}`;

        const { data } = await updateEntry(this.editingEntry.id, this.editingEntry);
        this.entries.splice(this.editedIndex, 1, data);
        this.$notify({
          type: 'success',
          title: 'Entry updated',
          text: `You have updated an entry for workstation ${data.workstation.name}`,
        });
      } finally {
        this.close();
        this.numberList = [null];
      }
    },
    add() {
      this.numberList = [...this.numberList, null];
    },
    remove() {
      let temp = this.numberList;
      temp.pop();
      this.numberList = temp;
    },
    async editEntry(entry) {
      await this.loadWorkstations();
      this.editedIndex = this.entries.indexOf(entry);

      this.editEntryModal = true;
      this.editingEntry = entry;
      this.editingEntry.number = this.editingEntry.istId.split("ist1")[1];
    }
  },
};
</script>

<style></style>
