<template>
  <div class="wrapper">
    <h2>Source Playlists</h2>
    <div class="playlist-grid">
      <div
        v-for="(playlist, index) in playlists"
        :key="index"
        class="playlist"
        :class="{ selected: selectedSource.includes(playlist.id) }"
        @click="toggle('source', playlist.id)"
      >
        <img class="playlist--cover" :src="coverSrc(playlist)" />
        <p class="playlist--name">{{ playlist.name }}</p>
      </div>
    </div>
    <h2>Target Playlist</h2>
    <div class="playlist-grid">
      <div
        v-for="(playlist, index) in playlists"
        :key="index"
        class="playlist"
        :class="{ selected: selectedTarget === playlist.id }"
        @click="toggle('target', playlist.id)"
      >
        <img class="playlist--cover" :src="coverSrc(playlist)" />
        <p class="playlist--name">{{ playlist.name }}</p>
      </div>
    </div>
    <Button @click="merge()">Confirm &amp; Merge</Button>
    <Button secondary href="/">Cancel</Button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Playlist, Track } from '~/types/spotify';

export default Vue.extend({
  data() {
    return {
      playlists: [] as Playlist[],
      selectedSource: [] as string[],
      selectedTarget: undefined as string | undefined,
    };
  },
  computed: {
    coverSrc() {
      return (playlist: Playlist) => {
        if (playlist.images && playlist.images.length > 0) {
          return playlist.images[0].url;
        } else {
          return '';
        }
      };
    },
  },
  mounted() {
    if (!this.$store.getters.accessToken) {
      console.log('unauthorized');
      return;
    }
    this.getUserPlaylists();
  },
  methods: {
    async merge() {
      if (this.selectedSource.length < 1 || this.selectedTarget === undefined) {
        return;
      }

      // Gather all tracks
      const tracks = [] as Track[];
      for (const id of this.selectedSource) {
        const playlistTracks = await this.getPlaylistTracks(id);
        tracks.push(...playlistTracks);
      }

      console.log(tracks);

      // Remove duplicates
      const sourceIds = [] as string[];
      const sourceTracks = [] as Track[];
      tracks.forEach((track) => {
        if (!sourceIds.includes(track.id)) {
          sourceTracks.push(track);
          sourceIds.push(track.id);
        }
      });

      console.log(sourceTracks);

      // Get existing tracks in target playlist
      const targetTracks = await this.getPlaylistTracks(this.selectedTarget);
      const targetIds = targetTracks.map((t) => t.id);

      // Find differences
      const removeUris = [] as string[];
      targetTracks.forEach((track) => {
        if (!sourceIds.includes(track.id)) {
          removeUris.push(track.uri);
        }
      });

      const addUris = [] as string[];
      sourceTracks.forEach((track) => {
        if (!targetIds.includes(track.id)) {
          addUris.push(track.uri);
        }
      });

      console.log(addUris);
      console.log(removeUris);

      const confirmation = confirm(
        `Are you sure you want to merge the selected playlists into the target playlists?\n\n${addUris.length} tracks will be added, ${removeUris.length} tracks will be removed!`
      );
      if (!confirmation) {
        return;
      }

      if (removeUris.length > 0) {
        await this.removePlaylistTracks(this.selectedTarget, removeUris);
      }
      if (addUris.length > 0) {
        await this.addPlaylistTracks(this.selectedTarget, addUris);
      }

      alert('Playlists merged!');
      this.selectedSource = [];
      this.selectedTarget = undefined;
    },
    toggle(type: 'source' | 'target', id: string) {
      if (type === 'source') {
        const index = this.selectedSource.indexOf(id);
        if (index > -1) {
          this.selectedSource.splice(index, 1);
        } else {
          this.selectedSource.push(id);
        }
      }

      if (type === 'target') {
        if (this.selectedTarget === id) {
          this.selectedTarget = undefined;
        } else {
          this.selectedTarget = id;
        }
      }

      console.log(this.selectedSource);
      console.log(this.selectedTarget);
    },
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
    async getPlaylistTracks(id: string, offset: number = 0, count: number = 0) {
      const response = await this.$axios.$get(
        `https://api.spotify.com/v1/playlists/${id}/tracks?offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${this.$store.getters.accessToken}`,
          },
        }
      );
      const tracks = response.items.map((i: any) => i.track) as Track[];
      count += tracks.length;
      if (count < response.total) {
        const newOffset = offset + tracks.length;
        const otherTracks = await this.getPlaylistTracks(id, newOffset, count);
        tracks.push(...otherTracks);
      }
      return tracks;
    },
    async removePlaylistTracks(id: string, uris: string[]) {
      // Split uris into chunks
      if (uris.length > 100) {
        for (let i = 0; i < uris.length; i += 100) {
          const chunk = uris.slice(i, i + 100);
          await this.removePlaylistTracks(id, chunk);
        }
        return;
      }

      const response = await this.$axios.$delete(
        `https://api.spotify.com/v1/playlists/${id}/tracks`,
        {
          data: {
            tracks: uris.map((uri) => {
              return { uri };
            }),
          },
          headers: {
            Authorization: `Bearer ${this.$store.getters.accessToken}`,
          },
        }
      );
      console.log(response);
    },
    async addPlaylistTracks(id: string, uris: string[]) {
      // Split uris into chunks
      if (uris.length > 100) {
        for (let i = 0; i < uris.length; i += 100) {
          const chunk = uris.slice(i, i + 100);
          await this.addPlaylistTracks(id, chunk);
        }
        return;
      }

      const response = await this.$axios.$post(
        `https://api.spotify.com/v1/playlists/${id}/tracks`,
        {
          uris,
        },
        {
          headers: {
            Authorization: `Bearer ${this.$store.getters.accessToken}`,
          },
        }
      );
      console.log(response);
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
  background: #121212;
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

  &.selected {
    box-shadow: 0 0 0 0.2rem $primary;
  }
}
</style>
