export interface Playlist {
  id: string;
  name: string;
  images: {
    url: string;
  }[];
}

export interface Track {
  id: string;
  name: string;
  uri: string;
}
