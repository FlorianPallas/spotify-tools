<template>
  <Button
    v-if="$store.getters.accessToken === undefined"
    outbound
    :href="$store.getters.oAuthUrl"
    >Authorize</Button
  >
  <Button v-else secondary @click.native="logout()">Logout</Button>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  methods: {
    logout() {
      this.$store.commit('SET_TOKEN', undefined);
      this.$router.push('/');
    },
  },
});
</script>
