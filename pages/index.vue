<template>
  <div class="wrapper">
    <nuxt-link tag="div" to="/merge" class="tool">
      <h1 class="title">PLAYLIST MERGER</h1>
      <p class="description">Easily merge multiple playlists into one!</p>
    </nuxt-link>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  head() {
    return {
      title: 'Spotify Tools',
    };
  },
});
</script>

<style lang="scss" scoped>
.wrapper {
  max-width: 100rem;
  margin: 10rem auto;
  padding: 0 2rem;
}

.tool {
  box-shadow: 0 0 0 0.2rem #fff inset;
  color: #fff;
  margin: 0 1rem;
  margin-bottom: 5rem;
  padding: 2rem 4rem;
  border-radius: 0.5rem;
  text-align: center;
  cursor: pointer;
  transition: box-shadow 0.3s, color 0.3s;

  .title,
  .description {
    margin: 1rem 0;
  }

  &:hover {
    box-shadow: 0 0 0 0.2rem $primary inset;
    color: $primary;
  }
}
</style>
