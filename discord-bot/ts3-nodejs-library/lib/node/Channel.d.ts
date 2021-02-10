/// <reference types="node" />
import { Abstract } from "./Abstract";
import { TeamSpeak } from "../TeamSpeak";
import { ChannelEntry, ClientEntry } from "../types/ResponseTypes";
import { ChannelEdit } from "../types/PropertyTypes";
import { TeamSpeakClient } from "./Client";
import { Permission } from "../util/Permission";
export declare class TeamSpeakChannel extends Abstract<ChannelEntry> {
    constructor(parent: TeamSpeak, list: ChannelEntry);
    get cid(): string;
    get pid(): string;
    get order(): number;
    get name(): string;
    get topic(): string;
    get flagDefault(): boolean;
    get flagPassword(): boolean;
    get flagPermanent(): boolean;
    get flagSemiPermanent(): boolean;
    get codec(): import("..").Codec;
    get codecQuality(): number;
    get neededTalkPower(): number;
    get iconId(): string;
    get secondsEmpty(): number;
    get totalClientsFamily(): number;
    get maxclients(): number;
    get maxfamilyclients(): number;
    get totalClients(): number;
    get neededSubscribePower(): number;
    get bannerGfxUrl(): string;
    get bannerMode(): number;
    /** returns detailed configuration information about a channel including ID, topic, description, etc */
    getInfo(): Promise<import("../types/ResponseTypes").ChannelInfo>;
    /**
     * Moves a channel to a new parent channel with the ID cpid.
     * If order is specified, the channel will be sorted right under the channel with the specified ID.
     * If order is set to 0, the channel will be sorted right below the new parent.
     * @param parent channel parent id
     * @param order channel sort order
     */
    move(parent: string | TeamSpeakChannel, order?: number): Promise<[]>;
    /**
     * Deletes an existing channel by ID.
     * If force is set to 1, the channel will be deleted even if there are clients within.
     * The clients will be kicked to the default channel with an appropriate reason message.
     * @param {number} force if set to 1 the channel will be deleted even when clients are in it
     */
    del(force?: boolean): Promise<[]>;
    /**
     * Changes a channels configuration using given properties. Note that this command accepts multiple properties which means that you're able to change all settings of the channel specified with cid at once.
     * @param properties the properties of the channel which should get changed
     */
    edit(properties: ChannelEdit): Promise<[]>;
    /**
     * Displays a list of permissions defined for a channel.
     * @param permsid whether the permsid should be displayed aswell
     */
    permList(permsid?: boolean): Promise<Permission<{
        cid: string;
    }>[]>;
    /**
     * Adds a set of specified permissions to a channel.
     * Multiple permissions can be added by providing the two parameters of each permission.
     * A permission can be specified by permid or permsid.
     * @param perm permission object to set
     */
    setPerm(perm: Permission.PermType): Promise<[]>;
    /**
     * Adds a permission to a channel
     * Multiple permissions can be added by providing the two parameters of each permission.
     * A permission can be specified by permid or permsid.
     * @param perm permission object to set
     */
    createPerm(): Permission<any>;
    /**
     * Removes a set of specified permissions from a channel.
     * Multiple permissions can be removed at once.
     * A permission can be specified by permid or permsid.
     * @param perm the permid or permsid
     */
    delPerm(perm: string | number): Promise<[]>;
    /**
     * Gets a List of Clients in the current Channel
     * @param filter the filter object
     */
    getClients(filter?: Partial<ClientEntry>): Promise<TeamSpeakClient[]>;
    /** returns a buffer with the icon of the channel */
    getIcon(): Promise<Buffer>;
    /** returns the icon name of the channel */
    getIconId(): Promise<number>;
    /** retrieves the client id from a string or teamspeak client */
    static getId<T extends TeamSpeakChannel.ChannelType>(channel?: T): T extends undefined ? undefined : string;
    /** retrieves the clients from an array */
    static getMultipleIds(channels: TeamSpeakChannel.MultiChannelType): string[];
}
export declare namespace TeamSpeakChannel {
    type ChannelType = string | TeamSpeakChannel;
    type MultiChannelType = string[] | TeamSpeakChannel[] | ChannelType;
}
