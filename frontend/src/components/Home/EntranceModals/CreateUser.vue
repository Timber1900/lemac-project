<template>
  <v-dialog v-model="entryModal" persistent>
    <v-card>
      <v-form ref="formAdd" lazy-validation @submit.prevent="save">
        <v-card-title>
          <span class="headline"> Entrance </span>
        </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="name"
              :rules="[(v) => !!v || 'Name is required']"
              label="Name"
              type="string"
              required
              filled
            ></v-text-field>
            <v-text-field
              v-model="ist_id"
              :rules="[(v) => !!v || 'IST Id is required']"
              label="Id"
              type="number"
              required
              filled
            ></v-text-field>
            <v-text-field
              v-model="email"
              :rules="[(v) => !!v || 'Contact email is required']"
              label="Email"
              type="email"
              required
              filled
            ></v-text-field>
            <v-autocomplete
                  v-model="choosenCourse"
                  label="Course"
                  :items="possibleCourses"
                  item-text="course"
                  item-value="course"
                  :rules="[(v) => !!v || 'Course is required']"
                  required
                  filled
                ></v-autocomplete>
          </v-card-text>
        <v-card-actions>
          <v-btn color="primary" text @click="save"> Submit </v-btn>
          <v-btn color="primary" text @click="close"> Close </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { createLemacUser } from '@/api/lemacUsers.api';

export default {
  name: 'CreateUser',
  props: {
    close: Function,
    entryStations: Array,
    select: Function,
    mifare_id: String,
    entrySelected: Number,
    entryModal: Boolean
  },
  data: () => ({
    name: null,
    ist_id: null,
    email: null,
    choosenCourse: null,
    possibleCourses: [{course: "Engenharia Aeroespacial"}, {course: "Engenharia Mecânica"}, {course: "Engenharia Naval"}, {course: "Engenharia de Materiais"}, {course: "Engenharia Ambiente"}, {course: "Outro"}]
  }),
  async mounted() {
  },
  methods: {
    async save() {
      if (!this.$refs.formAdd.validate()) return;

      const userData = {
        name: this.name,
        ist_id: this.ist_id,
        mifare_id: this.mifare_id,
        email: this.email,
        course: this.choosenCourse,
      }

      createLemacUser(userData);

      try {
        this.close();
      } catch (error) {
        console.log(error)
      } finally {
        this.name = null;
        this.ist_id = null;
      }

    }
  }
}
</script>
