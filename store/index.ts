import { GetterTree, ActionTree, MutationTree } from 'vuex';

export const state = () => ({
  accessToken: undefined as string | undefined,
});

export type RootState = ReturnType<typeof state>;

export const getters: GetterTree<RootState, RootState> = {
  accessToken: (state) => state.accessToken,
  oAuthUrl: () => {
    return (scopes: string[], state: string = '/') => {
      return (
        'https://accounts.spotify.com/authorize' +
        '?response_type=token' +
        '&client_id=' +
        process.env.SPOTIFY_CLIENT_ID +
        (scopes ? '&scope=' + encodeURIComponent(scopes.join(' ')) : '') +
        '&redirect_uri=' +
        encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI) +
        '&show_dialog=true' +
        '&state=' +
        encodeURIComponent(state)
      );
    };
  },
};

export const mutations: MutationTree<RootState> = {
  SET_TOKEN: (state, newToken: string) => (state.accessToken = newToken),
};

export const actions: ActionTree<RootState, RootState> = {};
