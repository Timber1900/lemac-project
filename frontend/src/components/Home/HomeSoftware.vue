<template>
  <div
    :key="personData?.useraname"
    class="flex flex-col items-start justify-start w-full divide-y divide-gray-500"
  >
    <div class="flex flex-row items-start justify-start w-full my-6">
      <div class="flex flex-col items-start justify-start">
        <div>
          <span class="text-xl font-medium">Name</span>:
          {{
            personData?.displayName
              ?.toLowerCase()
              ?.replace(/\b\w/g, (match) => match.toUpperCase()) ?? ''
          }}
        </div>
        <div><span class="text-xl font-medium">Course</span>: {{ getCourse(personData) }}</div>
      </div>
      <div class="grid h-full my-auto w-52 place-content-center">
        <v-select v-model="selected_software" :items="items" label="Software"></v-select>
      </div>
    </div>
    <Solidworks v-if="selected_software == 'Solidworks'" />
    <Siemens_NX v-if="selected_software == 'Siemens NX'" />
  </div>
</template>

<script>
import Solidworks from '@/components/Home/Softwares/Solidworks.vue';
import Siemens_NX from '@/components/Home/Softwares/Siemens_NX.vue';

export default {
  name: 'HomeSoftware',
  components: {
    Solidworks,
    Siemens_NX,
  },
  props: {
    personData: Object,
  },
  data: () => ({
    items: ['Solidworks', 'Siemens NX'],
    selected_software: 'Solidworks',
  }),
  methods: {
    getCourse(data) {
      if (!data) {
        return '';
      }

      const role = data.roles.find((val) => {
        return val.registrations;
      });

      return role.registrations[0]?.name;
    },
  },
};
</script>
