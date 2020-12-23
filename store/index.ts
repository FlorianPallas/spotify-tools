import { GetterTree, ActionTree, MutationTree } from 'vuex';

export const state = () => ({
  accessToken: undefined as string | undefined,
});

export type RootState = ReturnType<typeof state>;

export const getters: GetterTree<RootState, RootState> = {
  accessToken: (state) => state.accessToken,
  oAuthUrl: () => {
    const scopes =
      'playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative';
    return (
      'https://accounts.spotify.com/authorize' +
      '?response_type=token' +
      '&client_id=' +
      process.env.SPOTIFY_CLIENT_ID +
      (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' +
      encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI)
    );
  },
};

export const mutations: MutationTree<RootState> = {
  SET_TOKEN: (state, newToken: string) => (state.accessToken = newToken),
};

export const actions: ActionTree<RootState, RootState> = {};
