<template>
  <v-data-table
    :headers="headers"
    :items="workstations"
    :search="search"
    :single-expand="singleExpand"
    sort-by="name"
    show-expand
    class="elevation-1"
  >
    <template #top>
      <v-toolbar flat>
        <v-toolbar-title>Workstations</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          hide-details
        ></v-text-field>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog_filter" max-width="550px">
          <template #activator="{ on, attrs }">
            <v-btn color="secondary" dark class="mb-2 mr-2" v-bind="attrs" v-on="on">
              Filter Softares
            </v-btn>
          </template>
          <v-card>
            <v-form ref="form_filter" lazy-validation @submit.prevent="save">
              <v-card-title>
                <span class="headline"> Filter Softwares </span>
              </v-card-title>
              <v-card-text>
                <v-select
                  v-model="selected_softwares"
                  :items="available_software"
                  label="Software to filter"
                  :rules="[(v) => v.length > 0 || 'Software to filter is required!']"
                  multiple
                ></v-select>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="clear_filter"> Clear Filter </v-btn>
                <v-btn color="primary" text @click="close_filter"> Cancel </v-btn>
                <v-btn color="primary" text @click="save_filter"> Save </v-btn>
              </v-card-actions>
            </v-form>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialog" max-width="550px">
          <template #activator="{ on, attrs }">
            <v-btn color="secondary" dark class="mb-2" v-bind="attrs" v-on="on">
              New Workstation
            </v-btn>
          </template>
          <v-card>
            <v-form ref="form" lazy-validation @submit.prevent="save">
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="editedItem.name"
                      :rules="[(v) => !!v || 'Workstation name is required']"
                      label="Name"
                      required
                      filled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="editedItem.capacity"
                      label="Capacity"
                      type="number"
                      required
                      filled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-select
                      v-model="editedItem.type"
                      label="Type"
                      required
                      :items="types"
                      filled
                    ></v-select>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="close"> Cancel </v-btn>
                <v-btn color="primary" text @click="save"> Save </v-btn>
              </v-card-actions>
            </v-form>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="headline">Are you sure you want to delete this item?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="closeDelete">Cancel</v-btn>
              <v-btn color="error" text @click="deleteItemConfirm">OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template #[`item.actions`]="{ item }">
      <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
      <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
    </template>
    <template #[`item.capacity`]="{ item }">
      {{ `${item.occupation} / ${item.capacity}` }}
    </template>
    <template #[`item.type`]="{ item }">
      <v-chip :color="typeColors[item.type]" dark class="capitalized">
        {{ (types.find((v) => v.value == item.type) || {}).text }}
      </v-chip>
    </template>
    <template #expanded-item="{ headers, item }">
      <td class="shadow-inner bg-gray-50" :colspan="headers.length">
        <div class="flex flex-col w-full h-full m-4">
          <h3 class="mt-4 text-lg font-medium">Softwares:</h3>
          <span>
            <li v-for="software in item.softwares" :key="software">
              {{ software }}
            </li>
          </span>
          <h3 class="mt-4 text-lg font-medium">Problems:</h3>
        </div>
      </td>
    </template>
  </v-data-table>
</template>

<script>
import { createWorkstation, deleteWorkstation, updateWorkstation } from '@/api/workstations.api';

export default {
  name: 'WorkstationsTable',
  props: {
    passedData: {
      type: Array,
      default() {
        return [
          {
            id: Number,
            name: String,
            capacity: Number,
            occupation: Number,
            type: String,
          },
        ];
      },
    },
  },
  data: () => ({
    dialog: false,
    dialog_filter: false,
    dialogDelete: false,
    search: '',
    workstations: [],
    headers: [
      { text: 'Name', value: 'name' },
      { text: 'Occupation/Capacity', value: 'capacity', filterable: false },
      { text: 'Type', value: 'type' },
      { text: 'Actions', value: 'actions', sortable: false, filterable: false },
    ],
    editedIndex: -1,
    editedItem: {
      name: '',
      type: 'active',
      capacity: 0,
    },
    defaultItem: {
      name: '',
      type: 'active',
      capacity: 0,
    },
    singleExpand: true,
    types: [
      { text: 'Active', value: 'active' },
      { text: 'Disabled', value: 'disabled' },
      { text: 'Remote', value: 'remote' },
    ],
    typeColors: {
      active: 'yellow darken-2',
      disabled: 'red',
      remote: 'blue',
    },
    available_software: [],
    selected_softwares: '',
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Workstation' : 'Edit Workstation';
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  mounted() {
    this.workstations = [...this.passedData];

    const uniqueSoftwareSet = new Set();

    this.available_software = this.workstations.forEach((val) => {
      val.softwares.forEach((software) => {
        uniqueSoftwareSet.add(software);
      });
    });

    this.available_software = Array.from(uniqueSoftwareSet);
  },
  methods: {
    editItem(item) {
      this.editedIndex = this.workstations.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.workstations.indexOf(item);
      this.dialogDelete = true;
    },

    async deleteItemConfirm() {
      try {
        await deleteWorkstation(this.workstations[this.editedIndex].id);
        const deleted = this.workstations.splice(this.editedIndex, 1);
        this.$notify({
          type: 'success',
          title: 'Workstation deleted',
          text: `You have deleted Workstation ${deleted[0].name}`,
        });
      } finally {
        this.closeDelete();
      }
    },

    close() {
      this.dialog = false;
      this.$refs.form.resetValidation();
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    close_filter() {
      this.dialog_filter = false;
    },

    save_filter() {
      if (!this.$refs.form_filter.validate()) return;
      this.workstations = [...this.passedData].filter((val) => {
        return this.selected_softwares.reduce(
          (prev, cur) => val.softwares.includes(cur) || prev,
          false
        );
      });

      this.close_filter();
    },

    clear_filter() {
      this.workstations = [...this.passedData];

      this.close_filter();
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    async save() {
      // Don't save if validation is unsuccessful
      if (!this.$refs.form.validate()) return;
      try {
        if (this.editedIndex > -1) {
          const response = await updateWorkstation(
            this.workstations[this.editedIndex].id,
            this.editedItem
          );
          this.workstations.splice(this.editedIndex, 1, response.data);
          this.$notify({
            type: 'success',
            title: 'Workstation updated',
            text: `You have updated Workstation ${response.data.name}`,
          });
        } else {
          const response = await createWorkstation(this.editedItem);
          this.workstations.push(response.data);
          this.$notify({
            type: 'success',
            title: 'Workstation created',
            text: `You have created Workstation ${response.data.name}`,
          });
        }
      } finally {
        this.close();
      }
    },
  },
};
</script>
