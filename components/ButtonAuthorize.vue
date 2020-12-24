<template>
  <Button
    v-if="$store.getters.accessToken === undefined"
    outbound
    :href="$store.getters.oAuthUrl(scopes, state)"
    >Authorize</Button
  >
  <Button v-else secondary @click="logout()">Logout</Button>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue';

export default Vue.extend({
  props: {
    scopes: { type: Array, default: () => [] } as PropOptions<string[]>,
    state: { type: String, default: '/' },
  },
  methods: {
    logout() {
      this.$store.commit('SET_TOKEN', undefined);
      this.$emit('logout');
    },
  },
});
</script>
