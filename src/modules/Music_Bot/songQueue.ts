import { AudioResource, createAudioResource } from "@discordjs/voice";
import { validate, video_info, stream, validate_playlist, playlist_info } from "play-dl";
import { Stream } from "play-dl/dist/YouTube/classes/LiveStream";
import { PlayList } from "play-dl/dist/YouTube/classes/Playlist";
import { nagLogger } from "../nagLogger";

/**
 * See play-dl's video_details
 *
 * @export
 * @interface video_details
 */
export interface video_details {
    id: any;
    url: string;
    title: any;
    description: any;
    durationInSec: any;
    durationRaw: string;
    uploadedDate: any;
    thumbnail: any;
    channel: {
        name: any;
        id: any;
        url: string;
        verified: boolean;
    };
    views: any;
    tags: any;
    averageRating: any;
    live: any;
    private: any;
}

/**
 * Simple songQueue implementation
 *
 * @export
 * @class songQueue
 */
export interface Song {
    resource: AudioResource,
    songDetails: video_details
}

export class songQueue {
    private queue: Array<Song>;

    public constructor() {
        this.queue = [];
    }

    /**
     * Adds song(s) to queue, can directly pass a Song object or a url link
     *
     * @param {string} input
     * @memberof nagPlayer
     */
    @nagLogger.getInstance().log("debug", "Adding song to queue...")
    async addSongs(url: string) {
        const song = await CreateSongsFromLink(url);
        if(!song) {
            throw new Error("Invalid song!");
        }
        if("songDetails" in song) {

        }
    }; 

    public enqueue(music: Song): number | undefined {
        const result =  this.queue.push(music);
        return result ? result : undefined;
    }
    /**
     * Dequeue a AudioResource from queue
     * 
     * @returns Next Djs/Voice AudioResource to play
     */
    public dequeue(): Song | undefined {
        const result = this.queue.shift();
        return result ? result : undefined;
    }
}

/**
 * Create a song or songlist from a youtube-dl supported link
 *
 * @export
 * @param {string} input
 * @return {*}  {(Song | SongList)}
 */
// TODO: Convert this to return a Song array
export async function CreateSongsFromLink (input: string): 
        Promise< Song[] | undefined> 
{
    if(validate(input)) {
        let songList: Array<Song> = [];
        const songDetails: video_details = (await video_info(input)).
                video_details;
        try {
            const musicStream = await stream(input);
            const resource = createAudioResource(musicStream.stream, 
                        {inputType: musicStream.type});
            const song: Song = {
                resource,
                songDetails
            }
            songList.push(song);
            return songList;
        }
        catch (error) {
            throw new Error("Error while trying to stream YouTube Link")
        }
    }

    if(validate_playlist(input)) {
        let songList: Array<Song> = [];
        let playlist: PlayList | undefined;

        try {
            playlist = await playlist_info(input);
            if(playlist) {
                const playlistAll = await playlist.fetch()
                if(playlistAll) {
                    const pages = playlistAll.total_pages; 
                    for(let i = 1; i <= pages; i++) {
                        let videos = playlistAll.page(pages);
                        for(let a = 0; a < videos.length; a++) {
                            let video = videos[a];
                            if(video.url) {
                                const musicStream = await stream(video.url);
                                const songDetails: video_details = 
                                        (await video_info(video.url))
                                                .video_details;
                                const resource = createAudioResource(
                                        musicStream.stream, 
                                        {inputType: musicStream.type});
                                const song: Song = {
                                    resource,
                                    songDetails
                                }
                                songList.push(song);
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
           throw new Error("Error while processing a YouTube playlist");
       }
    }
}