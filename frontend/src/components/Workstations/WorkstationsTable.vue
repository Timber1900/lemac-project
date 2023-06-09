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
              Filters
            </v-btn>
          </template>
          <v-card>
            <v-form ref="form_filter" lazy-validation @submit.prevent="save">
              <v-card-title>
                <span class="headline"> Filter </span>
              </v-card-title>
              <v-card-text>
                <v-select
                  v-model="selected_softwares"
                  :items="available_software"
                  label="Software to filter"
                  :rules="[(v) => v.length > 0 || 'Software to filter is required!']"
                  multiple
                >
                  <div slot="prepend-item" ripple>
                    <v-checkbox
                      v-model="select_all"
                      class="ml-4"
                      label="Select all"
                      @change="selectAll"
                    ></v-checkbox>
                  </div>
                  <v-divider slot="prepend-item" class="mt-2" />
                </v-select>
                <v-checkbox
                  v-model="filter_with_issues"
                  label="Filter all with issues"
                ></v-checkbox>
                <v-checkbox
                  v-model="filter_with_unresolved_issues"
                  label="Filter all with unresolved"
                ></v-checkbox>
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
        <v-dialog v-if="getPermission === 1" v-model="dialog" max-width="550px">
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
      <v-icon v-if="getPermission === 1" small class="mr-2" @click="editItem(item)">
        mdi-pencil
      </v-icon>
      <v-icon v-if="getPermission === 1" small @click="deleteItem(item)"> mdi-delete </v-icon>
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
          <div class="flex flex-row">
            <div class="flex flex-col p-0 m-0 h-min">
              <h3 class="mt-4 text-lg font-medium">Softwares:</h3>
              <ul class="flex flex-col">
                <li
                  v-for="software in item.softwares"
                  :key="software"
                  aria-label="•"
                  class="inline-flex flex-cols before:content-[attr(aria-label)] before:pr-2 before:my-auto before:text-lg"
                >
                  <span class="flex items-center justify-start">
                    {{ software }}
                  </span>
                </li>
              </ul>
            </div>
            <div class="mx-4 my-auto">
              <v-dialog v-if="getPermission === 1" v-model="dialog_software" max-width="550px">
                <template #activator="{ on, attrs }">
                  <v-btn color="secondary" dark class="mb-2 mr-2" v-bind="attrs" v-on="on">
                    Add a software
                  </v-btn>
                </template>
                <v-card>
                  <v-form ref="form_software" lazy-validation @submit.prevent="save">
                    <v-card-title>
                      <span class="headline"> Add a software </span>
                    </v-card-title>
                    <v-card-text>
                      <v-text-field
                        v-model="software_to_add"
                        label="Software to add"
                        outlined
                        :rules="[(v) => !!v || 'Software is required']"
                      ></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" text @click="close_software_dialog"> Cancel </v-btn>
                      <v-btn color="primary" text @click="() => save_software(item)">
                        Add Software
                      </v-btn>
                    </v-card-actions>
                  </v-form>
                </v-card>
              </v-dialog>
            </div>
          </div>
          <div class="flex flex-row">
            <div class="flex flex-col p-0 m-0 h-min">
              <h3 class="mt-4 text-lg font-medium">Problems:</h3>
              <ul>
                <li
                  v-for="(problem, i) in item.problems"
                  :key="problem.message"
                  aria-label="•"
                  class="relative inline-flex flex-cols before:content-[attr(aria-label)] before:pr-2 before:my-auto before:text-lg w-full pr-24"
                >
                  <span class="flex items-center justify-start mr-auto">
                    {{ problem.message }}
                  </span>
                  <v-checkbox
                    v-model="problem.resolved"
                    :disabled="getPermission !== 1"
                    class="self-end my-auto ml-4 min-w-max"
                    hide-details
                    label="Mark resolved"
                    @change="(e) => change_issue_status(e, item, i)"
                  ></v-checkbox>
                </li>
              </ul>
            </div>
            <div class="mx-4 my-auto">
              <v-dialog v-model="dialog_issue" max-width="550px">
                <template #activator="{ on, attrs }">
                  <v-btn color="secondary" dark class="mb-2 mr-2" v-bind="attrs" v-on="on">
                    Report issue
                  </v-btn>
                </template>
                <v-card>
                  <v-form ref="form_issue" lazy-validation @submit.prevent="save">
                    <v-card-title>
                      <span class="headline"> Report issue </span>
                    </v-card-title>
                    <v-card-text>
                      <h4 class="mb-2 text-lg font-normal">Please describe the issue:</h4>
                      <v-textarea
                        v-model="issue_description"
                        label="Description"
                        outlined
                        :rules="[(v) => !!v || 'Description is required']"
                      ></v-textarea>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" text @click="close_issue_dialog"> Cancel </v-btn>
                      <v-btn color="primary" text @click="() => save_issue(item)"> Report </v-btn>
                    </v-card-actions>
                  </v-form>
                </v-card>
              </v-dialog>
            </div>
          </div>
        </div>
      </td>
    </template>
  </v-data-table>
</template>

<script>
import { createWorkstation, deleteWorkstation, updateWorkstation } from '@/api/workstations.api';
import { mapGetters } from 'vuex';

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
    dialog_issue: false,
    dialog_software: false,
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
    issue_description: null,
    software_to_add: null,
    filter_with_issues: false,
    filter_with_unresolved_issues: false,
    select_all: false,
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Workstation' : 'Edit Workstation';
    },
    ...mapGetters('user', ['getPermission']),
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
    selected_softwares(val) {
      this.select_all = val.length === this.available_software.length;
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
      this.workstations = [...this.passedData];

      if (!this.select_all)
        this.workstations = [...this.passedData].filter((val) => {
          return this.selected_softwares.reduce(
            (prev, cur) => val.softwares.includes(cur) || prev,
            false
          );
        });

      if (this.filter_with_issues)
        this.workstations = this.workstations.filter((val) => val.problems.length > 0);
      if (this.filter_with_unresolved_issues)
        this.workstations = this.workstations.filter((val) => {
          const test = val.problems.reduce((acc, val) => {
            return acc || !val.resolved;
          }, false);

          return val.problems.length > 0 && test;
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

    async save_issue(item) {
      if (!this.$refs.form_issue.validate()) return;

      const new_item = { ...item };

      console.log(new_item.problems);
      new_item.problems = new_item.problems ?? [];
      console.log(new_item.problems);

      new_item.problems = [
        ...new_item.problems,
        {
          message: this.issue_description,
          closed: null,
          created: new Date(),
          resolved: false,
        },
      ];
      this.issue_description = '';
      try {
        const response = await updateWorkstation(new_item.id, new_item);
        //this.workstations.splice(this.editedIndex, 1, response.data);
        this.$notify({
          type: 'success',
          title: 'Workstation updated',
          text: `You have updated Workstation ${response.data.name}`,
        });
      } finally {
        this.close_issue_dialog();
      }
    },

    async close_issue_dialog() {
      this.dialog_issue = false;
    },

    async change_issue_status(event, item, problem_index) {
      console.log({ event, item, problem_index });

      const new_item = { ...item };

      new_item.problems[problem_index].resolved = event;
      new_item.problems[problem_index].closed = event ? new Date() : null;

      try {
        const response = await updateWorkstation(new_item.id, new_item);
        //this.workstations.splice(this.editedIndex, 1, response.data);
        this.$notify({
          type: 'success',
          title: 'Workstation updated',
          text: `You have updated Workstation ${response.data.name}`,
        });
      } catch (e) {
        console.log(e);
      }
    },

    async save_software(item) {
      if (!this.$refs.form_software.validate()) return;

      const new_item = { ...item };
      new_item.softwares = new_item.softwares ?? [];

      new_item.softwares.push(this.software_to_add);
      this.software_to_add = '';

      try {
        const response = await updateWorkstation(new_item.id, new_item);
        //this.workstations.splice(this.editedIndex, 1, response.data);
        this.$notify({
          type: 'success',
          title: 'Workstation updated',
          text: `You have updated Workstation ${response.data.name}`,
        });
      } finally {
        this.close_software_dialog();
      }
    },

    async close_software_dialog() {
      this.dialog_software = false;
    },

    selectAll(event) {
      this.select_all = event;
      this.selected_softwares = event ? [...this.available_software] : [];
    },
  },
};
</script>
