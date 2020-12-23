<template>
  <div class="wrapper">
    <ButtonAuthorize />
    <h2>Source Playlists</h2>
    <div class="playlist-grid">
      <div v-for="(playlist, index) in playlists" :key="index" class="playlist">
        <img class="playlist--cover" :src="playlist.images[0].url" />
        <p class="playlist--name">{{ playlist.name }}</p>
      </div>
    </div>
    <h2>Target Playlist</h2>
    <div class="playlist-grid">
      <div v-for="(playlist, index) in playlists" :key="index" class="playlist">
        <img class="playlist--cover" :src="playlist.images[0].url" />
        <p class="playlist--name">{{ playlist.name }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Playlist } from '~/types/spotify';

export default Vue.extend({
  data() {
    return {
      playlists: [] as Playlist[],
    };
  },
  mounted() {
    if (!this.$store.getters.accessToken) {
      console.log('unauthorized');
      return;
    }
    this.getUserPlaylists();
  },
  methods: {
    async getUserPlaylists() {
      const response = await this.$axios.$get(
        'https://api.spotify.com/v1/me/playlists',
        {
          headers: {
            Authorization: `Bearer ${this.$store.getters.accessToken}`,
          },
        }
      );
      const playlists = response.items as Playlist[];
      this.playlists = playlists;
    },
  },
});
</script>

<style lang="scss" scoped>
.playlist-grid {
  display: flex;
  flex-flow: row wrap;
}

.playlist {
  position: relative;
  height: 20rem;
  width: 20rem;
  margin: 1rem;
  overflow: hidden;

  &--cover {
    height: 100%;
  }

  &--name {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
  }
}
</style>
