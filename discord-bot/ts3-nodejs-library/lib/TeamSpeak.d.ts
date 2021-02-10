/// <reference types="node" />
import { EventEmitter } from "events";
import { TeamSpeakQuery } from "./transport/TeamSpeakQuery";
import { ResponseError } from "./exception/ResponseError";
import { TeamSpeakClient } from "./node/Client";
import { TeamSpeakServer } from "./node/Server";
import { TeamSpeakChannel } from "./node/Channel";
import { TeamSpeakServerGroup } from "./node/ServerGroup";
import { TeamSpeakChannelGroup } from "./node/ChannelGroup";
import * as Response from "./types/ResponseTypes";
import * as Event from "./types/Events";
import * as Props from "./types/PropertyTypes";
import { ReasonIdentifier, TextMessageTargetMode, TokenType, LogLevel } from "./types/enum";
import { Permission } from "./util/Permission";
export interface TeamSpeak {
    on(event: "error", listener: (error: Error) => void): this;
    on(event: "ready", listener: () => void): this;
    on(event: "close", listener: (error?: Error) => void): this;
    on(event: "flooding", listener: (error: ResponseError) => void): this;
    on(event: "debug", listener: (event: Event.Debug) => void): this;
    on(event: "clientconnect", listener: (event: Event.ClientConnect) => void): this;
    on(event: "clientdisconnect", listener: (event: Event.ClientDisconnect) => void): this;
    on(event: "tokenused", listener: (event: Event.TokenUsed) => void): this;
    on(event: "textmessage", listener: (event: Event.TextMessage) => void): this;
    on(event: "clientmoved", listener: (event: Event.ClientMoved) => void): this;
    on(event: "serveredit", listener: (event: Event.ServerEdit) => void): this;
    on(event: "channeledit", listener: (event: Event.ChannelEdit) => void): this;
    on(event: "channelcreate", listener: (event: Event.ChannelCreate) => void): this;
    on(event: "channelmoved", listener: (event: Event.ChannelMove) => void): this;
    on(event: "channeldelete", listener: (event: Event.ChannelDelete) => void): this;
}
export declare class TeamSpeak extends EventEmitter {
    readonly config: TeamSpeak.ConnectionParams;
    private serverVersion;
    private clients;
    private servers;
    private servergroups;
    private channels;
    private channelgroups;
    private priorizeNextCommand;
    private query;
    private context;
    constructor(config: Partial<TeamSpeak.ConnectionParams>);
    /**
     * connects via a Promise wrapper
     * @param config config options to connect
     */
    static connect(config: Partial<TeamSpeak.ConnectionParams>): Promise<TeamSpeak>;
    /**
     * attempts a reconnect to the teamspeak server with full context features
     * @param attempts the amount of times it should try to reconnect (-1 = try forever)
     * @param timeout time in ms to wait inbetween reconnect
     */
    reconnect(attempts?: number, timeout?: number): Promise<this>;
    /**
     * waits a set time of ms
     * @param time time in ms to wait
     */
    static wait(time: number): Promise<unknown>;
    /**
     * connects to the TeamSpeak Server
     */
    connect(): Promise<TeamSpeak>;
    /** subscribes to some query events if necessary */
    private handleNewListener;
    /** handles initial commands after successfully connecting to a TeamSpeak Server */
    private handleReady;
    /**
     * Gets called when a client connects to the TeamSpeak Server
     * @param event the raw teamspeak event
     */
    private evcliententerview;
    /**
     * Gets called when a client discconnects from the TeamSpeak Server
     * @param event the raw teamspeak event
     */
    private evclientleftview;
    /**
     * Gets called when a client uses a privilege key
     * @param event the raw teamspeak event
     */
    private evtokenused;
    /**
     * Gets called when a chat message gets received
     * @param event the raw teamspeak event
     */
    private evtextmessage;
    /**
     * Gets called when a client moves to a different channel
     * @param event the raw teamspeak event
     */
    private evclientmoved;
    /**
     * Gets called when the server has been edited
     * @param event the raw teamspeak event
     */
    private evserveredited;
    /**
     * Gets called when a channel gets edited
     * @param event the raw teamspeak event
     */
    private evchanneledited;
    /**
     * Gets called when a channel gets edited
     * @param event the raw teamspeak event
     */
    private evchannelcreated;
    /**
     * Gets called when a channel gets moved
     * @param event the raw teamspeak event
     */
    private evchannelmoved;
    /**
     * Gets called when a channel gets deleted
     * @param event the raw teamspeak event
     */
    private evchanneldeleted;
    /** priorizes the next command, this commands will be first in execution */
    priorize(): this;
    /**
     * Sends a raw command to the TeamSpeak Server.
     * @param {...any} args the command which should get executed on the teamspeak server
     * @example
     * ts3.execute("clientlist", ["-ip"])
     * ts3.execute("use", [9987], { clientnickname: "test" })
     */
    execute<T extends (TeamSpeakQuery.ResponseEntry | TeamSpeakQuery.Response) = []>(cmd: string, ...args: TeamSpeakQuery.executeArgs[]): Promise<T>;
    /**
     * Adds a new query client login, or enables query login for existing clients.
     * When no virtual server has been selected, the command will create global query logins.
     * Otherwise the command enables query login for existing client, and cldbid must be specified.
     * @param clientLoginName the login name
     * @param client optional database id or teamspeak client
     */
    queryLoginAdd(clientLoginName: string, client?: TeamSpeakClient.ClientType): Promise<Response.QueryLoginAdd>;
    /**
     * Deletes an existing server query login on selected server.
     * When no virtual server has been selected, deletes global query logins instead.
     * @param client client database id or teamspeak client object
     */
    queryLoginDel(client: TeamSpeakClient.ClientType): Promise<[]>;
    /**
     * List existing query client logins.
     * The pattern parameter can include regular characters and SQL wildcard characters (e.g. %).
     * Only displays query logins of the selected virtual server, or all query logins when no virtual server have been  selected.
     * @param pattern the pattern to filter for client login names
     * @param start the offset from where clients should be listed
     * @param duration how many clients should be listed
     */
    queryLoginList(pattern?: string, start?: number, duration?: number): Promise<Response.QueryLoginEntry[]>;
    apiKeyAdd(props: Props.ApiKeyAdd): Promise<Response.ApiKeyAdd>;
    /**
     * Lists all apikeys owned by the user, or of all users using cldbid=*.
     * Usage of cldbid=... requires bVirtualserverApikeyManage.
     */
    apiKeyList(props?: Props.ApiKeyList): Promise<Response.ApiKeyEntry[]>;
    /**
     * Deletes an apikey. Any apikey owned by the current user, can always be deleted
     * Deleting apikeys from other requires bVirtualserverApikeyManage
     * @param id the key id to delete
     */
    apiKeyDel(id: string): Promise<[]>;
    /**
     * Updates your own ServerQuery login credentials using a specified username.
     * The password will be auto-generated.
     * @param name
     */
    clientSetServerQueryLogin(name: string): Promise<Response.ClientSetServerQueryLogin>;
    /**
     * Change your ServerQuery clients settings using given properties.
     * @param props the properties which should be changed
     */
    clientUpdate(props: Props.ClientUpdate): Promise<[]>;
    /**
     * Subscribes to an Event
     * @param event the event on which should be subscribed
     * @param id the channel id, only required when subscribing to the "channel" event
     */
    registerEvent(event: string, id?: string): Promise<[]>;
    /**
     * Subscribes to an Event.
     */
    unregisterEvent(): Promise<[]>;
    /**
     * Authenticates with the TeamSpeak 3 Server instance using given ServerQuery login credentials.
     * @param username the username which you want to login with
     * @param password the password you want to login with
     */
    login(username: string, password: string): Promise<[]>;
    /** Deselects the active virtual server and logs out from the server instance. */
    logout(): Promise<[]>;
    /**
     * Displays the servers version information including platform and build number.
     * @param refresh if this parameter has been set it will send a command to the server otherwise will use the cached info
     */
    version(refresh?: boolean): Promise<Response.Version | undefined>;
    /**
     * Displays detailed connection information about the server instance including uptime,
     * number of virtual servers online, traffic information, etc.
     */
    hostInfo(): Promise<Response.HostInfo>;
    /**
     * Displays the server instance configuration including database revision number,
     * the file transfer port, default group IDs, etc.
     */
    instanceInfo(): Promise<Response.InstanceInfo>;
    /**
     * Changes the server instance configuration using given properties.
     * @param properties the props you want to change
     */
    instanceEdit(properties: Props.InstanceEdit): Promise<[]>;
    /** returns a list of IP addresses used by the server instance on multi-homed machines. */
    bindingList(): Promise<Response.BindingEntry[]>;
    /**
     * Selects the virtual server specified with the port to allow further interaction.
     * @param port the port the server runs on
     * @param clientNickname set nickname when selecting a server
     */
    useByPort(port: number, clientNickname?: string): Promise<[]>;
    /**
     * Selects the virtual server specified with the sid to allow further interaction.
     * @param server the server id
     * @param clientNickname set nickname when selecting a server
     */
    useBySid(server: TeamSpeakServer.ServerType, clientNickname?: string): Promise<[]>;
    /** returns information about your current ServerQuery connection including your loginname, etc. */
    whoami(): Promise<Response.Whoami>;
    /**
     * Displays detailed configuration information about the selected virtual server
     * including unique ID, number of clients online, configuration, etc.
     */
    serverInfo(): Promise<Response.ServerInfo>;
    /**
     * Displays the database ID of the virtual server running on the UDP port
     * @param virtualserverPort the server port where data should be retrieved
     */
    serverIdGetByPort(virtualserverPort: number): Promise<Response.ServerIdGetByPort>;
    /**
     * Changes the selected virtual servers configuration using given properties.
     * Note that this command accepts multiple properties which means that you're able to change all settings of the selected virtual server at once.
     */
    serverEdit(properties: Props.ServerEdit): Promise<[]>;
    /**
     * Stops the entire TeamSpeak 3 Server instance by shutting down the process.
     * @param reasonmsg specifies a text message that is sent to the clients before the client disconnects (requires TeamSpeak Server 3.2.0 or newer).
     */
    serverProcessStop(reasonmsg?: string): Promise<[]>;
    /**
     * returns detailed connection information about the selected virtual server including uptime, traffic information, etc.
     */
    connectionInfo(): Promise<Response.ServerRequestConnectionInfo>;
    /**
     * Creates a new virtual server using the given properties and displays its ID, port and initial administrator privilege key.
     * If virtualserverPort is not specified, the server will test for the first unused UDP port
     * @param properties the server properties
     */
    serverCreate(properties: Props.ServerEdit): Promise<Response.ServerCreate>;
    /**
     * deletes the teamspeak server
     * @param server the server id to delete
     */
    serverDelete(server: TeamSpeakServer.ServerType): Promise<[]>;
    /**
     * Starts the virtual server. Depending on your permissions,
     * you're able to start either your own virtual server only or all virtual servers in the server instance.
     * @param server the server id to start
     */
    serverStart(server: TeamSpeakServer.ServerType): Promise<[]>;
    /**
     * Stops the virtual server. Depending on your permissions,
     * you're able to stop either your own virtual server only or all virtual servers in the server instance.
     * @param server the server id to stop
     * @param reasonmsg Specifies a text message that is sent to the clients before the client disconnects (requires TeamSpeak Server 3.2.0 or newer).
     */
    serverStop(server: TeamSpeakServer.ServerType, reasonmsg?: string): Promise<[]>;
    /**
     * Creates a new server group using the name specified with name.
     * The optional type parameter can be used to create ServerQuery groups and template groups.
     * @param name the name of the servergroup
     * @param type type of the servergroup
     */
    serverGroupCreate(name: string, type?: number): Promise<TeamSpeakServerGroup>;
    /**
     * returns the IDs of all clients currently residing in the server group.
     * @param group the servergroup id
     */
    serverGroupClientList(group: TeamSpeakServerGroup.GroupType): Promise<Response.ServerGroupClientEntry[]>;
    /**
     * Adds one or more clients to a server group specified with sgid.
     * Please note that a client cannot be added to default groups or template groups
     * @param client one or more client database ids which should be added
     * @param group the servergroup id which the client(s) should be added to
     */
    serverGroupAddClient(client: TeamSpeakClient.MultiClientType, group: TeamSpeakServerGroup.GroupType): Promise<[]>;
    /**
     * Removes one or more clients from the server group specified with sgid.
     * @param client one or more client database ids which should be added
     * @param group the servergroup id which the client(s) should be removed from
     */
    serverGroupDelClient(client: TeamSpeakClient.MultiClientType, group: TeamSpeakServerGroup.GroupType): Promise<[]>;
    /**
     * displays all server groups the client specified with cldbid is currently residing in
     * @param client the client database id to check
     */
    serverGroupsByClientId(client: TeamSpeakClient.ClientType): Promise<Response.ServerGroupsByClientId[]>;
    /**
     * Adds one or more servergroups to a client.
     * Please note that a client cannot be added to default groups or template groups
     * @param client one or more client database ids which should be added
     * @param group one or more servergroup ids which the client should be added to
     */
    clientAddServerGroup(client: TeamSpeakClient.ClientType, group: TeamSpeakServerGroup.MultiGroupType): Promise<[]>;
    /**
     * Removes one or more servergroups from the client.
     * @param client one or more client database ids which should be added
     * @param groups one or more servergroup ids which the client should be removed from
     */
    clientDelServerGroup(client: TeamSpeakClient.ClientType, groups: TeamSpeakServerGroup.MultiGroupType): Promise<[]>;
    /**
     * Deletes the server group. If force is set to 1, the server group will be deleted even if there are clients within.
     * @param group the servergroup id
     * @param force if set to 1 the servergoup will be deleted even when clients stil belong to this group
     */
    serverGroupDel(group: TeamSpeakServerGroup.GroupType, force?: boolean): Promise<[]>;
    /**
     * Creates a copy of the server group specified with ssgid.
     * If tsgid is set to 0, the server will create a new group.
     * To overwrite an existing group, simply set tsgid to the ID of a designated target group.
     * If a target group is set, the name parameter will be ignored.
     * @param sourceGroup the source ServerGroup
     * @param targetGroup the target ServerGroup, 0 to create a new Group
     * @param type the type of the servergroup (0 = Query Group | 1 = Normal Group)
     * @param name name of the group
     */
    serverGroupCopy(sourceGroup: TeamSpeakServerGroup.GroupType, targetGroup?: TeamSpeakServerGroup.GroupType, type?: number, name?: string): Promise<Response.ServerGroupCopy>;
    /**
     * Changes the name of the server group
     * @param group the servergroup id
     * @param name new name of the servergroup
     */
    serverGroupRename(group: TeamSpeakServerGroup.GroupType, name: string): Promise<[]>;
    /**
     * Displays a list of permissions assigned to the server group specified with sgid.
     * @param sgid the servergroup id
     * @param permsid if the permsid option is set to true the output will contain the permission names
     */
    serverGroupPermList(group: TeamSpeakServerGroup.GroupType, permsid?: boolean): Promise<Permission<{
        sgid: string;
    }>[]>;
    /**
     * Adds a specified permissions to the server group.
     * A permission can be specified by permid or permsid.
     * @param group the serverGroup id
     * @param perm the permission object
     */
    serverGroupAddPerm(group: TeamSpeakServerGroup.GroupType, perm: undefined): Permission;
    serverGroupAddPerm(group: TeamSpeakServerGroup.GroupType, perm: Permission.PermType): Promise<[]>;
    /**
     * Removes a set of specified permissions from the server group.
     * A permission can be specified by permid or permsid.
     * @param group the servergroup id
     * @param perm the permid or permsid
     */
    serverGroupDelPerm(group: TeamSpeakServerGroup.GroupType, perm: string | number): Promise<[]>;
    /**
     * Sets a new temporary server password specified with pw. The temporary
     * password will be valid for the number of seconds specified with duration. The
     * client connecting with this password will automatically join the channel
     * specified with tcid. If tcid is set to 0, the client will join the default
     * channel.
     */
    serverTempPasswordAdd(props: Props.ServerTempPasswordAdd): Promise<[]>;
    /**
     * Deletes the temporary server password specified with pw.
     * @param pw the password to delete
     */
    serverTempPasswordDel(pw: string): Promise<[]>;
    /**
     * Returns a list of active temporary server passwords. The output contains the
     * clear-text password, the nickname and unique identifier of the creating
     * client.
     */
    serverTempPasswordList(): Promise<Response.ServerTempPasswordEntry[]>;
    /**
     * Creates a new channel using the given properties.
     * Note that this command accepts multiple properties which means that you're able to specifiy all settings of the new channel at once.
     * @param name the name of the channel
     * @param properties properties of the channel
     */
    channelCreate(name: string, properties?: Props.ChannelEdit): Promise<TeamSpeakChannel>;
    /**
     * Creates a new channel group using a given name.
     * The optional type parameter can be used to create ServerQuery groups and template groups.
     * @param name the name of the channelgroup
     * @param type type of the channelgroup
     */
    channelGroupCreate(name: string, type?: number): Promise<TeamSpeakChannelGroup>;
    /**
     * Retrieves a Single Channel by the given Channel ID
     * @param channel the channel id
     */
    getChannelById(channel: TeamSpeakChannel.ChannelType): Promise<TeamSpeakChannel | undefined>;
    /**
     * Retrieves a Single Channel by the given Channel Name
     * @param channelName the name of the channel
     */
    getChannelByName(channelName: string): Promise<TeamSpeakChannel | undefined>;
    /**
     * displays a list of channels matching a given name pattern
     * @param pattern the channel name pattern to search for
     */
    channelFind(pattern: string): Promise<Response.ChannelFind[]>;
    /**
     * Displays detailed configuration information about a channel including ID, topic, description, etc.
     * @param channel the channel id
     */
    channelInfo(channel: TeamSpeakChannel.ChannelType): Promise<Response.ChannelInfo>;
    /**
     * Moves a channel to a new parent channel with the ID cpid.
     * If order is specified, the channel will be sorted right under the channel with the specified ID.
     * If order is set to 0, the channel will be sorted right below the new parent.
     * @param channel the channel id
     * @param parent channel parent id
     * @param order channel sort order
     */
    channelMove(channel: TeamSpeakChannel.ChannelType, parent: TeamSpeakChannel.ChannelType, order?: number): Promise<[]>;
    /**
     * Deletes an existing channel by ID.
     * If force is set to 1, the channel will be deleted even if there are clients within.
     * The clients will be kicked to the default channel with an appropriate reason message.
     * @param channel the channel id
     * @param force if set to 1 the channel will be deleted even when client are in it
     */
    channelDelete(channel: TeamSpeakChannel.ChannelType, force?: boolean): Promise<[]>;
    /**
     * Changes a channels configuration using given properties.
     * Note that this command accepts multiple properties which means that you're able to change all settings of the channel specified with cid at once.
     * @param channel the channel id
     * @param properties the properties of the channel which should get changed
     */
    channelEdit(channel: TeamSpeakChannel.ChannelType, properties?: Props.ChannelEdit): Promise<[]>;
    /**
     * Displays a list of permissions defined for a channel.
     * @param channel the channel id
     * @param permsid whether the permsid should be displayed aswell
     */
    channelPermList(channel: TeamSpeakChannel.ChannelType, permsid?: boolean): Promise<Permission<{
        cid: string;
    }>[]>;
    /**
     * Adds a set of specified permissions to a channel.
     * @param channel the channel id
     * @param perm the permission object
     */
    channelSetPerm(channel: TeamSpeakChannel.ChannelType, perm: undefined): Permission;
    channelSetPerm(channel: TeamSpeakChannel.ChannelType, perm: Permission.PermType): Promise<[]>;
    /**
     * Adds a set of specified permissions to a channel.
     * A permission can be specified by permid or permsid.
     * @param channel the channel id
     * @param permissions the permissions to assign
     * @example
     * TeamSpeak.channelSetPerms(5, [{ permsid: "i_channel_needed_modify_power", permvalue: 75 }])
     */
    channelSetPerms(channel: TeamSpeakChannel.ChannelType, permissions: {
        permid?: number;
        permsid?: string;
        permvalue: number;
    }[]): Promise<[]>;
    /**
     * Removes a set of specified permissions from a channel.
     * Multiple permissions can be removed at once.
     * A permission can be specified by permid or permsid.
     * @param channel the channel id
     * @param perm the permid or permsid
     */
    channelDelPerm(channel: TeamSpeakChannel.ChannelType, perm: string | number): Promise<[]>;
    /**
     * Retrieves a Single Client by the given Client ID
     * @param client the client id
     */
    getClientById(client: TeamSpeakClient.ClientType): Promise<TeamSpeakClient | undefined>;
    /**
     * Retrieves a Single Client by the given Client Database ID
     * @param client the client database Id
     */
    getClientByDbid(client: TeamSpeakClient.ClientType): Promise<TeamSpeakClient | undefined>;
    /**
     * Retrieves a Single Client by the given Client Unique Identifier
     * @param client the client unique identifier
     */
    getClientByUid(client: TeamSpeakClient.ClientType): Promise<TeamSpeakClient | undefined>;
    /**
     * Retrieves a Single Client by the given Client Unique Identifier
     * @param clientNickname the nickname of the client
     */
    getClientByName(clientNickname: string): Promise<TeamSpeakClient | undefined>;
    /**
     * Returns General Info of the Client, requires the Client to be online
     * @param clients one or more client ids to get
     */
    clientInfo(clients: TeamSpeakClient.MultiClientType): Promise<Response.ClientInfo[]>;
    /**
     * Returns the Clients Database List
     * @param start start offset
     * @param duration amount of entries which should get retrieved
     * @param count retrieve the count of entries
     */
    clientDbList(start?: number, duration?: number, count?: boolean): Promise<Response.ClientDBEntry[]>;
    /**
     * Returns the Clients Database Info
     * @param clients one or more client database ids to get
     */
    clientDbInfo(clients: TeamSpeakClient.MultiClientType): Promise<Response.ClientDBInfo[]>;
    /**
     * Kicks the Client from the Server
     * @param client the client id
     * @param reasonid the reasonid
     * @param reasonmsg the message the client should receive when getting kicked
     * @param continueOnError ignore errors
     */
    clientKick(client: TeamSpeakClient.ClientType, reasonid: ReasonIdentifier, reasonmsg: string, continueOnError?: boolean): Promise<[]>;
    /**
     * Moves the Client to a different Channel
     * @param client the client id
     * @param channel channel id in which the client should get moved
     * @param cpw the channel password
     * @param continueOnError ignore errors
     */
    clientMove(client: TeamSpeakClient.ClientType, channel: TeamSpeakChannel.ChannelType, cpw?: string, continueOnError?: boolean): Promise<[]>;
    /**
     * Pokes the Client with a certain message
     * @param client the client id
     * @param msg the message the client should receive
     */
    clientPoke(client: TeamSpeakClient.ClientType, msg: string): Promise<[]>;
    /**
     * Displays a list of permissions defined for a client
     * @param client the client database id
     * @param permsid if the permsid option is set to true the output will contain the permission names
     */
    clientPermList(client: TeamSpeakClient.ClientType, permsid?: boolean): Promise<Permission<{
        cldbid: string;
    }>[]>;
    /**
     * Adds a set of specified permissions to a client.
     * Multiple permissions can be added by providing the three parameters of each permission.
     * A permission can be specified by permid or permsid.
     * @param client the client database id
     * @param perm the permission object
     */
    clientAddPerm(client: TeamSpeakClient.ClientType, perm: undefined): Permission;
    clientAddPerm(client: TeamSpeakClient.ClientType, perm: Permission.PermType): Promise<[]>;
    /**
     * Removes a set of specified permissions from a client.
     * Multiple permissions can be removed at once.
     * A permission can be specified by permid or permsid
     * @param client the client database id
     * @param perm the permid or permsid
     */
    clientDelPerm(client: TeamSpeakClient.ClientType, perm: string | number): Promise<[]>;
    /**
     * Searches for custom client properties specified by ident and value.
     * The value parameter can include regular characters and SQL wildcard characters (e.g. %).
     * @param ident the key to search for
     * @param pattern the search pattern to use
     */
    customSearch(ident: string, pattern: string): Promise<Response.CustomSearch>;
    /**
     * returns a list of custom properties for the client specified with cldbid.
     * @param client the Client Database ID which should be retrieved
     */
    customInfo(client: TeamSpeakClient.ClientType): Promise<Response.CustomInfo>;
    /**
     * Removes a custom property from a client specified by the cldbid.
     * This requires TeamSpeak Server Version 3.2.0 or newer.
     * @param client the client Database ID which should be changed
     * @param ident the key which should be deleted
     */
    customDelete(client: TeamSpeakClient.ClientType, ident: string): Promise<[]>;
    /**
     * Creates or updates a custom property for client specified by the cldbid.
     * Ident and value can be any value, and are the key value pair of the custom property.
     * This requires TeamSpeak Server Version 3.2.0 or newer.
     * @param client the client database id which should be changed
     * @param ident the key which should be set
     * @param value the value which should be set
     */
    customSet(client: TeamSpeakClient.ClientType, ident: string, value: string): Promise<[]>;
    /**
     * Sends a text message a specified target.
     * The type of the target is determined by targetmode while target specifies the ID of the recipient,
     * whether it be a virtual server, a channel or a client.
     * @param target target client id or channel id which should receive the message
     * @param targetmode targetmode (1: client, 2: channel, 3: server)
     * @param msg the message the client should receive
     */
    sendTextMessage(target: "0", targetmode: TextMessageTargetMode.SERVER, msg: string): any;
    sendTextMessage(target: TeamSpeakChannel.ChannelType, targetmode: TextMessageTargetMode.CHANNEL, msg: string): any;
    sendTextMessage(target: TeamSpeakClient.ClientType, targetmode: TextMessageTargetMode.CLIENT, msg: string): any;
    /**
     * Retrieves a single ServerGroup by the given ServerGroup ID
     * @param group the servergroup id
     */
    getServerGroupById(group: TeamSpeakServerGroup.GroupType): Promise<TeamSpeakServerGroup | undefined>;
    /**
     * Retrieves a single ServerGroup by the given ServerGroup Name
     * @param name the servergroup name
     */
    getServerGroupByName(name: string): Promise<TeamSpeakServerGroup | undefined>;
    /**
     * Retrieves a single ChannelGroup by the given ChannelGroup ID
     * @param group the channelgroup Id
     */
    getChannelGroupById(group: TeamSpeakChannelGroup.GroupType): Promise<TeamSpeakChannelGroup | undefined>;
    /**
     * Retrieves a single ChannelGroup by the given ChannelGroup Name
     * @param name the channelGroup name
     */
    getChannelGroupByName(name: string): Promise<TeamSpeakChannelGroup | undefined>;
    /**
     * Sets the channel group of a client
     * @param group the channelgroup which the client should get assigned
     * @param channel the channel in which the client should be assigned the group
     * @param client the client database id which should be added to the group
     */
    setClientChannelGroup(group: TeamSpeakChannelGroup.GroupType, channel: TeamSpeakChannel.ChannelType, client: TeamSpeakClient.ClientType): Promise<[]>;
    /**
     * Deletes the channel group. If force is set to 1, the channel group will be deleted even if there are clients within.
     * @param group the channelgroup id
     * @param force if set to true the channelgroup will be deleted even when clients are in it
     */
    deleteChannelGroup(group: TeamSpeakChannelGroup.GroupType, force?: boolean): Promise<[]>;
    /**
     * Creates a copy of the channel group.
     * If tcgid is set to 0, the server will create a new group.
     * To overwrite an existing group, simply set tcgid to the ID of a designated target group.
     * If a target group is set, the name parameter will be ignored.
     * @param sourceGroup the source channelgroup
     * @param targetGroup the target channelgroup (0 to create a new group)
     * @param type the type of the group (0 = Template Group | 1 = Normal Group)
     * @param name name of the goup
     */
    channelGroupCopy(sourceGroup: TeamSpeakChannelGroup.GroupType, targetGroup?: TeamSpeakChannelGroup.GroupType, type?: number, name?: string): Promise<Response.ChannelGroupCopy>;
    /**
     * Changes the name of the channel group
     * @param group the channelgroup id to rename
     * @param name new name of the ghannelgroup
     */
    channelGroupRename(group: TeamSpeakChannelGroup.GroupType, name: string): Promise<[]>;
    /**
     * Displays a list of permissions assigned to the channel group specified with cgid.
     * @param group the channelgroup id to list
     * @param permsid if the permsid option is set to true the output will contain the permission names.
     */
    channelGroupPermList(group: TeamSpeakChannelGroup.GroupType, permsid?: boolean): Promise<Permission<{
        cgid: string;
    }>[]>;
    /**
     * Adds a specified permissions to the channel group.
     * A permission can be specified by permid or permsid.
     * @param group the channelgroup id
     * @param perm the permission object
     */
    channelGroupAddPerm(group: TeamSpeakChannelGroup.GroupType, perm?: undefined): Permission;
    channelGroupAddPerm(group: TeamSpeakChannelGroup.GroupType, perm: Permission.PermType): Promise<[]>;
    /**
     * Removes a set of specified permissions from the channel group. A permission can be specified by permid or permsid.
     * @param group the channelgroup id
     * @param perm the permid or permsid
     */
    channelGroupDelPerm(group: TeamSpeakChannelGroup.GroupType, perm: string | number): Promise<[]>;
    /**
     * Displays the IDs of all clients currently residing in the channel group.
     * @param cgid the channelgroup id
     * @param cid the channel id
     * @param cldbid the client database id to filter
     */
    channelGroupClientList(group: TeamSpeakChannelGroup.GroupType, channel?: TeamSpeakChannel.ChannelType, client?: TeamSpeakClient.ClientType): Promise<Response.ChannelGroupClientList>;
    /**
     * Displays all permissions assigned to a client for the channel specified with cid.
     * If permid is set to 0, all permissions will be displayed.
     * A permission can be specified by permid or permsid.
     * @param client the client database id
     * @param channel one or more permission names
     * @param permid one or more permission ids
     * @param permsid one or more permission names
     */
    permOverview(client: TeamSpeakClient.ClientType, channel: TeamSpeakChannel.ChannelType, perms?: number[] | string[]): Promise<Response.PermOverviewEntry[]>;
    /**
     * Retrieves a list of permissions available on the server instance including ID, name and description.
     */
    permissionList(): Promise<Response.PermissionEntry[]>;
    /**
     * Retrieves the database ID of one or more permissions specified by permsid.
     * @param permsid single permission name
     */
    permIdGetByName(permsid: string): Promise<Response.PermIdGetByName>;
    /**
     * Retrieves the database ID of one or more permissions specified by permsid.
     * @param permsid multiple permission names
     */
    permIdsGetByName(permsid: string[]): Promise<Response.PermIdGetByName[]>;
    /**
     * Retrieves the current value of the permission for your own connection.
     * This can be useful when you need to check your own privileges.
     * @param perm perm id or name which should be checked
     */
    permGet(perm: number | string): Promise<Response.PermGet>;
    /**
     * Retrieves detailed information about all assignments of the permission.
     * The output is similar to permoverview which includes the type and the ID of the client, channel or group associated with the permission.
     * @param perm perm id or name to retrieve
     */
    permFind(perm: number | string): Promise<Response.PermFind[]>;
    /**
     * Restores the default permission settings on the selected virtual server and creates a new initial administrator token.
     * Please note that in case of an error during the permreset call - e.g. when the database has been modified or corrupted - the virtual server will be deleted from the database.
     */
    permReset(): Promise<Response.Token>;
    /**
     * Retrieves a list of privilege keys available including their type and group IDs.
     */
    privilegeKeyList(): Promise<Response.PrivilegeKeyEntry[]>;
    /**
     * Create a new token.+
     * If type is set to 0, the ID specified with tokenid will be a server group ID.
     * Otherwise, tokenid is used as a channel group ID and you need to provide a valid channel ID using channelid.
     * @param tokentype token type
     * @param group depends on the type given, add either a valid channelgroup or servergroup
     * @param channel depends on the type given, add a valid channel id
     * @param description token description
     * @param customset token custom set
     */
    privilegeKeyAdd(tokentype: TokenType.ChannelGroup, group: TeamSpeakChannelGroup.GroupType, channel: TeamSpeakChannel.ChannelType, description?: string, customset?: string): any;
    privilegeKeyAdd(tokentype: TokenType.ServerGroup, group: TeamSpeakServerGroup.GroupType, channel: undefined, description?: string, customset?: string): any;
    /**
     * Create a new privilegekey token for a ServerGroup with the given description
     * @param group servergroup which should be generated the token for
     * @param description token description
     * @param tokencustomset token custom set
     */
    serverGroupPrivilegeKeyAdd(group: TeamSpeakServerGroup.GroupType, description?: string, customset?: string): Promise<Response.Token>;
    /**
     * Create a new privilegekey token for a Channel Group and assigned Channel ID with the given description
     * @param group the channel group for which the token should be valid
     * @param cid channel id for which the token should be valid
     * @param description token description
     * @param tokencustomset token custom set
     */
    channelGroupPrivilegeKeyAdd(group: TeamSpeakChannelGroup.GroupType, channel: TeamSpeakChannel.ChannelType, description?: string, customset?: string): Promise<Response.Token>;
    /**
     * Deletes an existing token matching the token key specified with token.
     * @param token the token which should be deleted
     */
    privilegeKeyDelete(token: string): Promise<[]>;
    /**
     * Use a token key gain access to a server or channel group.
     * Please note that the server will automatically delete the token after it has been used.
     * @param token the token which should be used
     */
    privilegeKeyUse(token: string): Promise<[]>;
    /**
     * Displays a list of offline messages you've received.
     * The output contains the senders unique identifier, the messages subject, etc.
     */
    messageList(): Promise<Response.MessageEntry[]>;
    /**
     * Sends an offline message to the client specified by uid.
     * @param client client unique identifier
     * @param subject subject of the message
     * @param message message text
     */
    messageAdd(client: TeamSpeakClient.ClientType, subject: string, message: string): Promise<[]>;
    /**
     * Sends an offline message to the client specified by uid.
     * @param msgid the message id which should be deleted
     */
    messageDel(msgid: string): Promise<[]>;
    /**
     * Displays an existing offline message with the given id from the inbox.
     * @param msgid the message id
     */
    messageGet(msgid: string): Promise<Response.MessageGet>;
    /**
     * Displays an existing offline message with the given id from the inbox.
     * @param msgid the message id
     * @param flag if flag is set to 1 the message will be marked as read
     */
    messageUpdate(msgid: string, flag?: boolean): Promise<[]>;
    /**
     * Displays a list of complaints on the selected virtual server.
     * If dbid is specified, only complaints about the targeted client will be shown.
     * @param client filter only for certain client with the given database id
     */
    complainList(client?: TeamSpeakClient.ClientType): Promise<Response.ComplainEntry[]>;
    /**
     * Submits a complaint about the client with database ID dbid to the server.
     * @param client filter only for certain client with the given database id
     * @param message the Message which should be added
     */
    complainAdd(client: TeamSpeakClient.ClientType, message?: string): Promise<[]>;
    /**
     * Deletes the complaint about the client with ID tcldbid submitted by the client with ID fdbid from the server.
     * If fcldbid will be left empty all complaints for the tcldbid will be deleted
     * @param targetClient the target client database id
     * @param fromClient the client database id which filed the report
     */
    complainDel(targetClient: TeamSpeakClient.ClientType, fromClient?: TeamSpeakClient.ClientType): Promise<[]>;
    /**
     * Displays a list of active bans on the selected virtual server.
     * @param start optional start from where clients should be listed
     * @param duration optional duration on how much ban entries should be retrieved
     */
    banList(start?: number, duration?: number): Promise<Response.BanEntry[]>;
    /**
     * Adds a new ban rule on the selected virtual server.
     * All parameters are optional but at least one of the following must be set: ip, name, uid or mytsid.
     */
    ban(properties: Props.BanAdd): Promise<Response.BanAdd>;
    /**
     * Bans the client specified with ID clid from the server.
     * Please note that this will create two separate ban rules for the targeted clients IP address and his unique identifier.
     */
    banClient(properties: Props.BanClient): Promise<Response.BanAdd>;
    /**
     * Removes one or all bans from the server
     * @param banid the banid to remove, if not provided it will remove all bans
     */
    banDel(banid?: string): Promise<[]>;
    /**
     * Displays a specified number of entries from the servers log.
     * If instance is set to 1, the server will return lines from the master logfile (ts3server_0.log) instead of the selected virtual server logfile.
     * @param lines amount of lines to receive
     * @param reverse invert output (like Array.reverse)
     * @param instance instance or virtualserver log
     * @param beginPos begin at position
     */
    logView(lines?: number, reverse?: number, instance?: number, beginPos?: number): Promise<Response.LogView[]>;
    /**
     * Writes a custom entry into the servers log.
     * Depending on your permissions, you'll be able to add entries into the server instance log and/or your virtual servers log.
     * The loglevel parameter specifies the type of the entry
     * @param loglevel level 1 to 4
     * @param logmsg message to log
     */
    logAdd(loglevel: LogLevel, logmsg: string): Promise<[]>;
    /**
     * Sends a text message to all clients on all virtual servers in the TeamSpeak 3 Server instance.
     * @param msg message which will be sent to all instances
     */
    gm(msg: string): Promise<[]>;
    /**
     * displays a list of clients matching a given name pattern
     * @param pattern the pattern to search clients
     */
    clientFind(pattern: string): Promise<Response.ClientFind[]>;
    /**
     * displays all client IDs matching the unique identifier specified by cluid
     * @param cluid the unique id to search for
     */
    clientGetIds(cluid: string): Promise<Response.ClientGetIdEntry[]>;
    /**
     * displays the database ID matching the unique identifier specified by cluid
     * @param cluid the unique id to search for
     */
    clientGetDbidFromUid(cluid: string): Promise<Response.ClientGetDbidFromUid>;
    /**
     * displays the database ID and nickname matching the unique identifier specified by cluid
     * @param cluid the unique id to search for
     */
    clientGetNameFromUid(cluid: string): Promise<Response.ClientGetNameFromUid>;
    /**
     * displays the database ID and nickname matching the unique identifier specified by cluid
     * @param clid the client id to search from
     */
    clientGetUidFromClid(clid: string): Promise<Response.ClientGetUidFromClid>;
    /**
     * displays the unique identifier and nickname matching the database ID specified by cldbid
     * @param cldbid client database it to search from
     */
    clientGetNameFromDbid(cldbid: string): Promise<Response.ClientGetNameFromDbid>;
    /**
     * edits a specific client
     * @param client the client id to modify
     * @param properties the properties to change
     */
    clientEdit(client: TeamSpeakClient.ClientType, properties: Props.ClientEdit): Promise<[]>;
    /**
     * Displays a list of client database IDs matching a given pattern.
     * You can either search for a clients last known nickname or his unique identity by using the -uid option.
     * @param pattern the pattern which should be searched for
     * @param isUid true when instead of the Name it should be searched for an uid
     */
    clientDbFind(pattern: string, isUid?: boolean): Promise<Response.ClientDBFind[]>;
    /**
     * Changes a clients settings using given properties.
     * @param client the client database id which should be edited
     * @param properties the properties which should be modified
     */
    clientDbEdit(client: TeamSpeakClient.ClientType, properties: Props.ClientDBEdit): Promise<[]>;
    /**
     * Deletes a clients properties from the database.
     * @param client the client database id which should be deleted
     */
    clientDbDelete(client: TeamSpeakClient.ClientType): Promise<[]>;
    /**
     * Displays a list of virtual servers including their ID, status, number of clients online, etc.
     */
    serverList(filter?: Partial<Response.ServerEntry>): Promise<TeamSpeakServer[]>;
    /**
     * displays a list of permissions defined for a client in a specific channel
     * @param channel the channel to search from
     * @param client the client database id to get permissions from
     * @param permsid wether to retrieve permission names instead of ids
     */
    channelClientPermList(channel: TeamSpeakChannel.ChannelType, client: TeamSpeakClient.ClientType, permsid?: false): Promise<Response.ChannelClientPermIdList>;
    channelClientPermList(channel: TeamSpeakChannel.ChannelType, client: TeamSpeakClient.ClientType, permsid?: true): Promise<Response.ChannelClientPermSidList>;
    /**
     * Displays a list of channel groups available. Depending on your permissions, the output may also contain template groups.
     */
    channelGroupList(filter?: Partial<Response.ChannelGroupEntry>): Promise<TeamSpeakChannelGroup[]>;
    /**
     * Displays a list of server groups available.
     * Depending on your permissions, the output may also contain global ServerQuery groups and template groups.
     */
    serverGroupList(filter?: Partial<Response.ServerGroupEntry>): Promise<TeamSpeakServerGroup[]>;
    /**
     * Lists all Channels with a given Filter
     */
    channelList(filter?: Partial<Response.ChannelEntry>): Promise<TeamSpeakChannel[]>;
    /**
     * Lists all Clients with a given Filter
     */
    clientList(filter?: Partial<Response.ClientEntry>): Promise<TeamSpeakClient[]>;
    /**
     * Lists currently active file transfers
     */
    ftList(): Promise<Response.FileTransferEntry[]>;
    /**
     * Displays a list of files and directories stored in the specified channels file repository.
     * @param channel the channel id to check for
     * @param path the path to list
     * @param cpw the channel password
     */
    ftGetFileList(channel: TeamSpeakChannel.ChannelType, path?: string, cpw?: string): Promise<Response.FTGetFileEntry[]>;
    /**
     * Displays detailed information about one or more specified files stored in a channels file repository.
     * @param channel the channel id to check for
     * @param name the filepath to receive
     * @param cpw the channel password
     */
    ftGetFileInfo(channel: TeamSpeakChannel.ChannelType, name: string, cpw?: string): Promise<Response.FTGetFileInfo>;
    /**
     * Stops the running file transfer with server-side ID serverftfid.
     * @param serverftfid server file transfer id
     * @param del
     */
    ftStop(serverftfid: number, del?: number): Promise<[]>;
    /**
     * Deletes one or more files stored in a channels file repository
     * @param channel the channel id to check for
     * @param name path to the file to delete
     * @param cpw the channel password
     */
    ftDeleteFile(channel: TeamSpeakChannel.ChannelType, name: string, cpw?: string): Promise<[]>;
    /**
     * Creates new directory in a channels file repository
     * @param channel the channel id to check for
     * @param dirname path to the directory
     * @param cpw the channel password
     */
    ftCreateDir(channel: TeamSpeakChannel.ChannelType, dirname: string, cpw?: string): Promise<[]>;
    /**
     * Renames a file in a channels file repository.
     * If the two parameters tcid and tcpw are specified, the file will be moved into another channels file repository
     * @param channel the channel id to check for
     * @param oldname the path to the file which should be renamed
     * @param newname the path to the file with the new name
     * @param tcid target channel id if the file should be moved to a different channel
     * @param cpw the channel password from where the file gets renamed
     * @param tcpw the channel password from where the file will get transferred to
     */
    ftRenameFile(channel: TeamSpeakChannel.ChannelType, oldname: string, newname: string, tcid?: string, cpw?: string, tcpw?: string): Promise<[]>;
    /**
     * Initializes a file transfer upload. clientftfid is an arbitrary ID to identify the file transfer on client-side.
     * On success, the server generates a new ftkey which is required to start uploading the file through TeamSpeak 3's file transfer interface.
     */
    ftInitUpload(transfer: Props.TransferUpload): Promise<Response.FTInitUpload>;
    /**
     * Initializes a file transfer download. clientftfid is an arbitrary ID to identify the file transfer on client-side.
     * On success, the server generates a new ftkey which is required to start downloading the file through TeamSpeak 3's file transfer interface.
     */
    ftInitDownload(transfer: Props.TransferDownload): Promise<Response.FTInitDownload>;
    /**
     * uploads a file
     * @param path the path whith the filename where the file should be uploaded to
     * @param data the data to upload
     * @param channel channel id to upload to (0 = server)
     * @param cpw channel password of the channel which will be uploaded to
     */
    uploadFile(path: string, data: string | Buffer, channel?: TeamSpeakChannel.ChannelType, cpw?: string): Promise<void>;
    /**
     * returns the file in the channel with the given path
     * @param path the path whith the filename where the file should be uploaded to
     * @param channel channel id to download from (0 = server)
     * @param cpw channel password of the channel which will be uploaded to
     */
    downloadFile(path: string, channel?: TeamSpeakChannel.ChannelType, cpw?: string): Promise<Buffer>;
    /**
     * returns an icon with the given id
     * @param id the id of the icon to retrieve eg 262672952
     */
    downloadIcon(id: number): Promise<Buffer>;
    /**
     * uploads an icon to the teamspeak server and returns its id
     * @param data icon buffer to upload
     */
    uploadIcon(data: Buffer): Promise<number>;
    /**
     * gets the icon id of a resolveable Perm List
     * @param permlist expects a promise which resolves to a permission list
     */
    getIconId(permlist: Promise<Permission[]>): Promise<number>;
    /**
     * displays a snapshot of the selected virtual server containing all settings,
     * groups and known client identities. The data from a server snapshot can be
     * used to restore a virtual servers configuration, channels and permissions
     * using the serversnapshotdeploy command.
     * only supports version 2 (from server 3.10.0)
     * @param password the optional password to encrypt the snapshot
     */
    createSnapshot(password?: string): Promise<Response.SnapshotCreate>;
    /**
     * displays a snapshot of the selected virtual server containing all settings,
     * groups and known client identities. The data from a server snapshot can be
     * used to restore a virtual servers configuration, channels and permissions
     * using the serversnapshotdeploy command.
     * only supports version 2 (from server 3.10.0)
     * @param salt if a password has been set provide the salt from the response
     * @param password the password which has been set while saving
     * @param keepfiles wether it should keep the file mapping
     * @param version of the snapshot with 0 the version of the current teamspeak server is being used
     */
    deploySnapshot(data: string, salt?: string, password?: string, keepfiles?: boolean, version?: string): Promise<[]>;
    logQueryTiming(): Promise<[]>;
    /** closes the ServerQuery connection to the TeamSpeak server instance. */
    quit(): Promise<[]>;
    /** forcefully closes the socket connection */
    forceQuit(): void;
    /**
     * parses the whole cache by given objects
     * @param cache the cache object
     * @param list the list to check against the cache
     * @param key the key used to identify the object inside the cache
     * @param node the class which should be used
     */
    private handleCache;
    /**
     * updates the context when the inner callback gets called
     * and returns the first parameter
     * @param context context data to update
     */
    private updateContextResolve;
    /**
     * updates the context when the inner callback gets called
     * and throws the first parameter which is an error
     * @param context context data to update
     */
    private updateContextReject;
    /**
     * updates the context with new data
     * @param data the data to update the context with
     */
    private updateContext;
    /**
     * wether the query client should get handled or not
     * @param type the client type
     */
    private ignoreQueryClient;
    /**
     * retrieves an instance of the Permission
     */
    private getPermBuilder;
    /** creates a channel perm builder for the specified channel id */
    private createChannelPermBuilder;
    /** creates a channel group perm builder for the specified channel group id */
    private createChannelGroupPermBuilder;
    /** creates a servergroup perm builder for the specified server group id */
    private createServerGroupPermBuilder;
    /** creates a client perm builder for the specified client database id */
    private createClientPermBuilder;
    /**
     * checks if the server is subscribed to a specific event
     * @param event event name which was subscribed to
     * @param id context to check
     */
    private isSubscribedToEvent;
    /**
     * filters an array with given filter
     * @param array the array which should get filtered
     * @param filter filter object
     */
    static filter<T extends TeamSpeakQuery.ResponseEntry>(array: T[], filter: Partial<T>): T[];
    /**
     * Transforms an Input to an Array
     * @param input input data which should be converted to an array
     */
    static toArray<T>(input: T | T[]): T[];
    /**
     * retrieves the first element of an array
     * @param input the response input
     */
    static singleResponse<T>(input: T | T[]): T;
}
export declare namespace TeamSpeak {
    interface ConnectionParams {
        /** the host to connect to (default: 127.0.0.1) */
        host: string;
        /** the query protocol to use (default: @see QueryProtocol ) */
        protocol: QueryProtocol;
        /** the queryport to use (default: raw=10011 ssh=10022) */
        queryport: number;
        /** the server to select upon connect (default: none) */
        serverport?: number;
        /** the username to login with (default: none) */
        username?: string;
        /** the password to use with the login (default: none) */
        password?: string;
        /** the nickname to connect with */
        nickname?: string;
        /** time to wait until a timeout gets fired (default: 10000) */
        readyTimeout: number;
        /** wether a keepalive should get sent (default: true) */
        keepAlive: boolean;
        /** sends the keepalive after x seconds of inactivity (default: 250s) */
        keepAliveTimeout: number;
        /** wether query clients should be ignored allover (clientList, events, etc) */
        ignoreQueries: boolean;
        /** local address the socket should connect from */
        localAddress?: string;
        /** wether it should automatically connect after instanciating (default: true) */
        autoConnect?: boolean;
    }
    enum QueryProtocol {
        RAW = "raw",
        SSH = "ssh"
    }
}
export declare const QueryProtocol: typeof TeamSpeak.QueryProtocol;
export declare type ConnectionParams = TeamSpeak.ConnectionParams;
