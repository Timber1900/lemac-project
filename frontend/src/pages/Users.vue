<template>
  <div v-if="getPermission === 1">
    <v-container v-if="users" class="mt-6">
      <UsersTable :members="users" />
    </v-container>
  </div>
</template>

<script>
import UsersTable from '@/components/Users/UserTable';
import { getUsers } from '@/api/user.api';
import { mapGetters } from 'vuex';

export default {
  name: 'UserPage',
  components: { UsersTable },
  data() {
    return {
      users: null,
    };
  },
  computed: {
    ...mapGetters('user', ['getPermission']),
  },
  async mounted() {
    this.$loading.show();
    const response = await getUsers();
    this.users = response.data;
    this.$loading.hide();
  },
};
</script>
