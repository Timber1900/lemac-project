<template>
  <div v-if="getPermission === 1">
    <v-container v-if="publications" class="mt-6">
      <PublicationsTable :passed-data="publications" />
    </v-container>
  </div>
</template>

<script>
import PublicationsTable from '@/components/Publications/PublicationsTable.vue';
import { getPublications } from '@/api/publications.api';
import { mapGetters } from 'vuex';

export default {
  name: 'PublicationsPage',
  components: { PublicationsTable },
  data() {
    return {
      publications: null,
    };
  },
  computed: {
    ...mapGetters('user', ['getPermission']),
  },
  async mounted() {
    this.$loading.show();
    const response = await getPublications();
    this.publications = response.data;
    this.$loading.hide();
  },
};
</script>
