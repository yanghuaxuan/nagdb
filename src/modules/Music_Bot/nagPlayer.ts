import { AudioPlayer, 
        AudioPlayerStatus, 
        NoSubscriberBehavior, 
        PlayerSubscription, 
        VoiceConnection } from "@discordjs/voice";
import { nagLogger } from "../nagLogger";
import { createSongsFromLink, Song, songQueue, video_details } from "./songQueue";

/**
 * Discord bot music player implementation
 *
 * @export
 * @class nagPlayer
 */
export class nagPlayer {
    /**
     * The Discord bot's audio player
     *
     * @type {AudioPlayer}
     * @memberof nagPlayer
     * 
     */
    private connection: VoiceConnection;
    private subscription: PlayerSubscription;
    private songQueue: songQueue;
    private player: AudioPlayer;
    private willPlayAll: boolean = false;

    /**
     * Creates an instance of nagPlayer.
     * @param {string} input
     * @memberof nagPlayer
     */
    constructor(connection: VoiceConnection) {
        this.connection = connection;
        this.player = new AudioPlayer( {
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        })
        this.subscription = this
                .connection
                .subscribe(this.player) as PlayerSubscription;
        this.songQueue = new songQueue();
    }

    /**
     * Add song to queue
     *
     * @param {string} url
     * @memberof nagPlayer
     * @throws An Error if cannot unable to create Song array
     */
    @nagLogger.getInstance().log("debug", "Adding song to queue...")
    async addSongs(url: string) {
        let songList = await createSongsFromLink(url);
        if(songList) {
            for(let i = 0; i < songList.length; i++) {
                const song = songList[i];
                this.songQueue.enqueue(song);
            }
        }
        else {
            throw new Error("Cannot add song to queue!");
        }
    }

    /**
     * Play next Song from queue
     *
     * @memberof nagPlayer
     * @throws An Error if no song in queue
     */
    @nagLogger.getInstance().log("debug", "Playing music from queue...")
    nextSong() {
        const song = this.songQueue.dequeue();

        if(song) {
            this.player.play(song.resource);
        } 
        else {
            throw new Error("No songs in queue")
        }

        return song;
    }

    /**
     * Plays all music from queue
     *
     * @note Adds an event listener that plays Songs when AudioPlayer is Idle, 
     * will remove itself when there's no songs in queue
     * @memberof nagPlayer
     * @callback {function(vid_details: Song | undefined): void} Will return
     */
    playAll(func: (song: video_details | undefined) => void) {
        // Will not execute below if already 
        if(!this.willPlayAll) {
            // Play current song
            const song = this.nextSong();
            func(song.songDetails);
            const callback = async () => {
                try {
                    this.nextSong();
                    func(song.songDetails);
                }
                catch (error) {
                    this.willPlayAll = false;
                    this.player.removeListener(AudioPlayerStatus.Idle, callback);
                    func(undefined);
                } 
            }
            this.willPlayAll = true;
            this.player.on(AudioPlayerStatus.Idle, callback)
        }
    }

    @nagLogger.getInstance().log("debug", "Skipping music")
    skipMusic(): Song | undefined {
        if(this.player.stop()) {
            return this.nextSong();
        }
        else {
            throw new Error("Error while skipping music");
        }
    }

}
