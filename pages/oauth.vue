<template>
  <div class="wrapper"></div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  mounted() {
    const hash = this.$route.hash;
    if (!hash) {
      this.$nuxt.error({ statusCode: 401, message: 'Unauthorized' });
      return;
    }
    const query = this.parseQuery(hash.substring(1));
    this.$store.commit('SET_TOKEN', query.access_token);
    this.$router.push('/');
  },
  methods: {
    parseQuery(queryString: string): any {
      const query = {};
      const pairs = (queryString[0] === '?'
        ? queryString.substr(1)
        : queryString
      ).split('&');
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
      }
      return query;
    },
  },
});
</script>
