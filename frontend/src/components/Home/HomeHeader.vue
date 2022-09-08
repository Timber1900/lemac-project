<template>
  <v-app-bar app dense>
    <v-row>
    <router-link to="/">
      <h2 class="primary--text mx-3">LEMAC</h2>
    </router-link>
    <v-divider vertical></v-divider>
      <router-link to="/about">
        <h2 class="text-black hover:text-[#009de0] transition-colors duration-150 mx-3">About</h2>
      </router-link>
      <router-link to="/reservations">
        <h2 class="text-black hover:text-[#009de0] transition-colors duration-150">Reservations</h2>
      </router-link>
    </v-row>
    <v-spacer />
    <div v-if="!getId">
      <v-btn
        class="primary mx-3"
        :loading="loading"
        :disabled="loading"
        elevation="2"
        small
        @click="$emit('login')"
      >
        Login
      </v-btn>
    </div>
    <div v-else>
      <v-tooltip bottom open-delay="500">
        <template #activator="{ on, attrs }">
          <v-icon v-bind="attrs" @click="$router.push('dashboard')" v-on="on">
            mdi-view-dashboard
          </v-icon>
        </template>
        Admin Dashboard
      </v-tooltip>
      <v-btn
        class="error mx-3"
        :loading="loadingOut"
        :disabled="loadingOut"
        elevation="2"
        small
        @click="$emit('logout')"
      >
        Logout
      </v-btn>
    </div>
  </v-app-bar>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'HomeHeader',
  props: {
    loading: Boolean,
    loadingOut: Boolean,
  },
  computed: {
    ...mapGetters('user', ['getId']),
  },
};
</script>

<style></style>
