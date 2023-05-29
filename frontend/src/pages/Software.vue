<template>
  <div class="home">
    <HomeHeader :loading="loading" :loading-out="false" @login="login" @logout="logout" />
    <v-container>
      <v-row v-if="userData == null" class="flex items-center justify-center gap-4 m-4">
        <p class="mb-0 text-xl">Please login in order to request a software: </p>
        <v-btn color="primary" small @click="loginFenix">Authenticate</v-btn>
      </v-row>
      <HomeSoftware v-if="userComputed" :personData="userComputed"/>
    </v-container>
  </div>
</template>

<script>
  import HomeHeader from '@/components/Home/HomeHeader.vue';
  import { getFenixInfo } from '@/api/auth.api';
  import { mapActions } from 'vuex';
  import HomeSoftware from '@/components/Home/HomeSoftware.vue';

  export default {
    name: 'Home',
    components: {
    HomeHeader,
    HomeSoftware
    },
    data: () => ({
      loading: false,
      loadingOut: false,
      personKey: 0,
      userData: null
    }),
    mounted() {
      const fenixCode = this.$route.query.code;
      if (fenixCode) this.getFenixInfo(fenixCode);
    },
    computed: {
      userComputed() {
        return this.userData
      }
    },
    methods: {
      loginFenix() {
        window.location = `${process.env.VUE_APP_FENIX_BASE_URL}oauth/userdialog?client_id=${process.env.VUE_APP_FENIX_CLIENT_SOFTWARE_ID}&redirect_uri=${process.env.VUE_APP_FENIX_REDIRECT_URL_SOFTWARE}`;
      },
      //only runs after fenix login
      async getFenixInfo(code) {
        this.loading = true;
        try {
          const { data } = await getFenixInfo(code);

          if(JSON.stringify(data) == "{}") {
            window.location = `${process.env.VUE_APP_FENIX_REDIRECT_URL_SOFTWARE}`;
            return
          };

          this.userData = data;
          this.personKey++;
        } catch (e) {
          this.$notify({
            type: 'error',
            title: 'Unauthorized user',
            text: "You don't have permission to access this ",
            duration: -1,
          });
        }
        this.loading = false;
      },
      login() {
        window.location = `${process.env.VUE_APP_FENIX_BASE_URL}oauth/userdialog?client_id=${process.env.VUE_APP_FENIX_CLIENT_ID}&redirect_uri=${process.env.VUE_APP_FENIX_REDIRECT_URL}`;
      },
      //only runs after fenix login
      async authBackend(code) {
        this.loading = true;
        try {
          const { data } = await apiLogin(code);
          if (data.jwt) {
            localStorage.setItem('token', data.jwt);
            this.loginUser(data.user);
          }
        } catch (e) {
          this.$notify({
            type: 'error',
            title: 'Unauthorized user',
            text: "You don't have permission to access this ",
            duration: -1,
          });
        }
        this.loading = false;
        this.$router.push('login');
        },
        logout() {
          this.loadingOut = true;
          localStorage.removeItem('token');
          this.logoutUser();
          this.loadingOut = false;
        },
        ...mapActions('user', ['loginUser', 'logoutUser']),
      },
    };
  </script>
