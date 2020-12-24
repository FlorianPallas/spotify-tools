<template>
  <div class="wrapper">
    <header class="header">
      <h1 class="title">PLAYLIST MERGER</h1>
      <p class="description">Easily merge multiple playlists into one!</p>
      <div class="buttons">
        <ButtonAuthorize
          :scopes="[
            'playlist-modify-public',
            'playlist-modify-private',
            'playlist-read-private',
            'playlist-read-collaborative',
          ]"
          state="/merge"
          @logout="playlists = []"
        />
        <Button secondary href="/">Overview</Button>
      </div>
    </header>
    <div class="info">
      <h2>Source Playlists</h2>
      <p>
        Select one or more playlists. The tracks from these playlists will be
        merged and put into the target playlist. The tracks of the source
        playlists will not be altered.
      </p>
    </div>
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
    <div class="info">
      <h2>Target Playlist</h2>
      <strong>The tracks in this playlist will be overridden!</strong>
      <p>
        Select one playlist. This playlist will later contain all tracks of the
        selected source playlists. If you are unsure, create and choose an empty
        playlist instead.
      </p>
    </div>
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
    <div class="buttons">
      <Button
        :disabled="
          $store.getters.accessToken === undefined ||
          selectedSource.length < 1 ||
          selectedTarget === undefined ||
          isLoading
        "
        @click="merge()"
        >{{ isLoading ? 'Merging ...' : 'Confirm & Merge' }}</Button
      >
      <Button secondary href="/">Overview</Button>
    </div>
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
      isLoading: false,
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
      return;
    }
    this.getUserPlaylists();
  },
  methods: {
    async merge() {
      if (this.selectedSource.length < 1 || this.selectedTarget === undefined) {
        return;
      }
      this.isLoading = true;

      // Gather all tracks
      const tracks = [] as Track[];
      for (const id of this.selectedSource) {
        const playlistTracks = await this.getPlaylistTracks(id);
        tracks.push(...playlistTracks);
      }

      // Remove duplicates
      const sourceIds = [] as string[];
      const sourceTracks = [] as Track[];
      tracks.forEach((track) => {
        if (!sourceIds.includes(track.id)) {
          sourceTracks.push(track);
          sourceIds.push(track.id);
        }
      });

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

      const confirmation = confirm(
        `Are you sure you want to merge the selected playlists into the target playlists?\n\n${addUris.length} tracks will be added, ${removeUris.length} tracks will be removed!`
      );
      if (!confirmation) {
        this.isLoading = false;
        return;
      }

      try {
        if (removeUris.length > 0) {
          await this.removePlaylistTracks(this.selectedTarget, removeUris);
        }
        if (addUris.length > 0) {
          await this.addPlaylistTracks(this.selectedTarget, addUris);
        }
      } catch (error) {
        console.log(error);
        alert('An Error occured!\nThe target playlist may be incomplete.');
        this.isLoading = false;
        return;
      }

      alert('Playlists merged successfully!');
      this.selectedSource = [];
      this.selectedTarget = undefined;
      this.isLoading = false;
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

      await this.$axios.$delete(
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

      await this.$axios.$post(
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
    },
  },
});
</script>

<style lang="scss" scoped>
.wrapper {
  max-width: 100rem;
  margin: 10rem auto;
  padding: 0 2rem;
}

.playlist-grid {
  display: flex;
  flex-flow: row wrap;
  margin-bottom: 5rem;
}

.playlist {
  background: #121212;
  position: relative;
  height: 20rem;
  width: 20rem;
  margin: 1rem;
  overflow: hidden;
  transition: box-shadow 0.15s;
  cursor: pointer;

  &--cover {
    height: 100%;
  }

  &--name {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    text-shadow: 0 0 0.5 rgba($color: #000, $alpha: 0.75);
  }

  &.selected {
    box-shadow: 0 0 0 0.2rem $primary;
  }
}

.info {
  padding: 0 1rem;

  strong {
    color: $primary;
  }
}

.buttons {
  margin-top: 2rem;
  button {
    margin: 0 1rem;
    margin-bottom: 1rem;
  }
}

.header {
  box-shadow: 0 0 0 0.2rem $primary inset;
  color: $primary;
  margin: 0 1rem;
  margin-bottom: 5rem;
  padding: 2rem 4rem;
  border-radius: 0.5rem;
  text-align: center;

  .title,
  .description {
    margin: 1rem 0;
  }
}
</style>
