<template>
  <div>
    <v-tabs grow>
    <v-tab key="1">Monitors</v-tab>
    <v-tab key="2">Users</v-tab>

    <v-tab-item>
      <v-container v-if="monitors" class="mt-6">
        <MonitorTable :members="monitors" />
      </v-container>
    </v-tab-item>
    <v-tab-item>
      <v-container>
        <UserTable :members="users" />
      </v-container>
    </v-tab-item>
  </v-tabs>
  </div>
</template>

<script>
import MonitorTable from '@/components/Users/MonitorTable';
import UserTable from '@/components/Users/UserTable';
import { getUsers } from '@/api/user.api';
import { getLemacUsers } from '@/api/lemacUsers.api';
import { getEntries } from '@/api/entries.api';


export default {
  name: 'UserPage',
  components: { MonitorTable, UserTable },
  data() {
    return {
      monitors: null,
      users: null
    };
  },
  async mounted() {
    this.$loading.show();
    this.monitors = (await getUsers()).data;
    this.users = (await getLemacUsers()).data;
    const entries  = (await getEntries()).data;

    this.users.forEach(val => {

      const entrie = entries.find(item => 'ist1' + val.ist_id === item.istId && item.active);

      if(entrie) {
        val.workstation = entrie.workstation.name;
      } else {
        val.workstation = "ERROR"
      }
    })
    this.$loading.hide();
  },
};
</script>
