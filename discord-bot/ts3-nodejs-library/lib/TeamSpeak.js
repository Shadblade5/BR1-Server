"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryProtocol = exports.TeamSpeak = void 0;
const events_1 = require("events");
const buffer_crc32_1 = __importDefault(require("buffer-crc32"));
const TeamSpeakQuery_1 = require("./transport/TeamSpeakQuery");
const FileTransfer_1 = require("./transport/FileTransfer");
const Client_1 = require("./node/Client");
const Server_1 = require("./node/Server");
const Channel_1 = require("./node/Channel");
const ServerGroup_1 = require("./node/ServerGroup");
const ChannelGroup_1 = require("./node/ChannelGroup");
const Command_1 = require("./transport/Command");
const context_1 = require("./types/context");
const EventError_1 = require("./exception/EventError");
const enum_1 = require("./types/enum");
const Permission_1 = require("./util/Permission");
class TeamSpeak extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.clients = {};
        this.servers = {};
        this.servergroups = {};
        this.channels = {};
        this.channelgroups = {};
        this.priorizeNextCommand = false;
        this.context = {
            selectType: context_1.SelectType.NONE,
            selected: 0,
            events: []
        };
        this.config = {
            protocol: TeamSpeak.QueryProtocol.RAW,
            host: "127.0.0.1",
            queryport: config.protocol === TeamSpeak.QueryProtocol.SSH ? 10022 : 10011,
            readyTimeout: 10000,
            ignoreQueries: false,
            keepAlive: true,
            keepAliveTimeout: 250,
            autoConnect: true,
            ...config
        };
        this.query = new TeamSpeakQuery_1.TeamSpeakQuery(this.config);
        this.query.on("cliententerview", this.evcliententerview.bind(this));
        this.query.on("clientleftview", this.evclientleftview.bind(this));
        this.query.on("tokenused", this.evtokenused.bind(this));
        this.query.on("serveredited", this.evserveredited.bind(this));
        this.query.on("channeledited", this.evchanneledited.bind(this));
        this.query.on("channelmoved", this.evchannelmoved.bind(this));
        this.query.on("channeldeleted", this.evchanneldeleted.bind(this));
        this.query.on("channelcreated", this.evchannelcreated.bind(this));
        this.query.on("clientmoved", this.evclientmoved.bind(this));
        this.query.on("textmessage", this.evtextmessage.bind(this));
        this.query.on("ready", this.handleReady.bind(this));
        this.query.on("close", (e) => super.emit("close", e));
        this.query.on("error", (e) => super.emit("error", e));
        this.query.on("flooding", (e) => super.emit("flooding", e));
        this.query.on("debug", (data) => super.emit("debug", data));
        //@ts-ignore
        this.on("newListener", this.handleNewListener.bind(this));
        if (this.config.autoConnect)
            /** can be dropped silently since errors are getting emitted via the error event */
            this.connect().catch(() => null);
    }
    /**
     * connects via a Promise wrapper
     * @param config config options to connect
     */
    static connect(config) {
        return new TeamSpeak({
            ...config,
            autoConnect: false
        }).connect();
    }
    /**
     * attempts a reconnect to the teamspeak server with full context features
     * @param attempts the amount of times it should try to reconnect (-1 = try forever)
     * @param timeout time in ms to wait inbetween reconnect
     */
    async reconnect(attempts = 1, timeout = 2000) {
        let attempt = 0;
        let error = null;
        while (attempts === -1 || attempt++ < attempts) {
            try {
                await TeamSpeak.wait(timeout);
                if (this.query.isConnected())
                    throw new Error("already connected");
                await this.connect();
                return this;
            }
            catch (e) {
                error = e;
            }
        }
        throw error ? error : new Error(`reconnecting failed after ${attempts} attempt(s)`);
    }
    /**
     * waits a set time of ms
     * @param time time in ms to wait
     */
    static wait(time) {
        return new Promise(fulfill => setTimeout(fulfill, time));
    }
    /**
     * connects to the TeamSpeak Server
     */
    connect() {
        return new Promise((fulfill, reject) => {
            const removeListeners = () => {
                this.removeListener("ready", readyCallback);
                this.removeListener("error", errorCallback);
                this.removeListener("close", closeCallback);
            };
            const readyCallback = () => {
                removeListeners();
                fulfill(this);
            };
            const errorCallback = (error) => {
                removeListeners();
                this.forceQuit();
                reject(error);
            };
            const closeCallback = (error) => {
                removeListeners();
                if (error instanceof Error)
                    return reject(error);
                reject(new Error("TeamSpeak Server prematurely closed the connection"));
            };
            this.once("ready", readyCallback);
            this.once("error", errorCallback);
            this.once("close", closeCallback);
            this.query.connect();
        });
    }
    /** subscribes to some query events if necessary */
    handleNewListener(event) {
        const commands = [];
        switch (event) {
            case "clientconnect":
            case "clientdisconnect":
            case "serveredit":
                if (this.isSubscribedToEvent("server"))
                    break;
                commands.push(this.registerEvent("server"));
                break;
            case "tokenused":
                if (this.isSubscribedToEvent("tokenused"))
                    break;
                commands.push(this.registerEvent("tokenused"));
                break;
            case "channeledit":
            case "channelmoved":
            case "channeldelete":
            case "channelcreate":
            case "clientmoved":
                if (this.isSubscribedToEvent("channel", "0"))
                    break;
                commands.push(this.registerEvent("channel", "0"));
                break;
            case "textmessage":
                if (!this.isSubscribedToEvent("textserver"))
                    commands.push(this.registerEvent("textserver"));
                if (!this.isSubscribedToEvent("textchannel"))
                    commands.push(this.registerEvent("textchannel"));
                if (!this.isSubscribedToEvent("textprivate"))
                    commands.push(this.registerEvent("textprivate"));
        }
        Promise.all(commands).catch(e => this.emit("error", e));
    }
    /** handles initial commands after successfully connecting to a TeamSpeak Server */
    handleReady() {
        const exec = [];
        if (this.context.login && this.config.protocol === TeamSpeak.QueryProtocol.RAW) {
            exec.push(this.priorize().login(this.context.login.username, this.context.login.password));
        }
        else if (this.config.username && this.config.password && this.config.protocol === TeamSpeak.QueryProtocol.RAW) {
            exec.push(this.priorize().login(this.config.username, this.config.password));
        }
        if (this.context.selectType !== context_1.SelectType.NONE) {
            if (this.context.selectType === context_1.SelectType.PORT) {
                exec.push(this.priorize().useByPort(this.context.selected, this.context.clientNickname || this.config.nickname));
            }
            else if (this.context.selectType === context_1.SelectType.SID) {
                exec.push(this.priorize().useBySid(this.context.selected, this.context.clientNickname || this.config.nickname));
            }
        }
        else if (this.config.serverport) {
            exec.push(this.priorize().useByPort(this.config.serverport, this.config.nickname));
        }
        exec.push(...this.context.events.map(ev => this.priorize().registerEvent(ev.event, ev.id)));
        exec.push(this.priorize().version());
        this.query.pause(false);
        return Promise.all(exec)
            .then(() => super.emit("ready"))
            .catch(e => super.emit("error", e));
    }
    /**
     * Gets called when a client connects to the TeamSpeak Server
     * @param event the raw teamspeak event
     */
    evcliententerview(event) {
        this.clientList().then(clients => {
            const client = clients.find(client => client.clid === event.clid);
            if (!client)
                throw new EventError_1.EventError(`could not fetch client with id ${event.clid}`, "cliententerview");
            if (this.ignoreQueryClient(client.type))
                return;
            super.emit("clientconnect", { client, cid: event.ctid });
        })
            .catch(error => this.emit("error", error));
    }
    /**
     * Gets called when a client discconnects from the TeamSpeak Server
     * @param event the raw teamspeak event
     */
    evclientleftview(event) {
        const { clid } = event;
        const client = this.clients[clid];
        if (client && this.ignoreQueryClient(client.type))
            return;
        super.emit("clientdisconnect", { client, event });
        Reflect.deleteProperty(this.clients, clid);
    }
    /**
     * Gets called when a client uses a privilege key
     * @param event the raw teamspeak event
     */
    evtokenused(event) {
        this.getClientById(event.clid).then(client => {
            if (!client)
                throw new EventError_1.EventError(`could not fetch client with id ${event.clid}`, "tokenused");
            if (this.ignoreQueryClient(client.type))
                return;
            super.emit("tokenused", { client, token: event.token, token1: event.token1, token2: event.token2, tokencustomset: event.tokencustomset });
        }).catch(e => super.emit("error", e));
    }
    /**
     * Gets called when a chat message gets received
     * @param event the raw teamspeak event
     */
    evtextmessage(event) {
        this.getClientById(event.invokerid).then(invoker => {
            if (!invoker)
                throw new EventError_1.EventError(`could not fetch client with id ${event.invokerid}`, "textmessage");
            if (this.ignoreQueryClient(invoker.type))
                return;
            super.emit("textmessage", { invoker, msg: event.msg, targetmode: event.targetmode });
        }).catch(e => super.emit("error", e));
    }
    /**
     * Gets called when a client moves to a different channel
     * @param event the raw teamspeak event
     */
    evclientmoved(event) {
        Promise.all([
            this.getClientById(event.clid),
            this.getChannelById(event.ctid)
        ]).then(([client, channel]) => {
            if (!client)
                throw new EventError_1.EventError(`could not fetch client with id ${event.clid}`, "clientmoved");
            if (!channel)
                throw new EventError_1.EventError(`could not fetch channel with id ${event.ctid}`, "clientmoved");
            if (this.ignoreQueryClient(client.type))
                return;
            this.emit("clientmoved", { client, channel, reasonid: event.reasonid });
        }).catch(e => this.emit("error", e));
    }
    /**
     * Gets called when the server has been edited
     * @param event the raw teamspeak event
     */
    async evserveredited(event) {
        this.getClientById(event.invokerid).then(invoker => {
            if (!invoker)
                throw new EventError_1.EventError(`could not fetch client with id ${event.invokerid}`, "serveredited");
            if (this.ignoreQueryClient(invoker.type))
                return;
            const modified = {};
            Object.keys(event)
                .filter(k => k.startsWith("virtualserver"))
                .forEach(k => modified[k] = event[k]);
            this.emit("serveredit", { invoker, modified, reasonid: event.reasonid });
        }).catch(e => this.emit("error", e));
    }
    /**
     * Gets called when a channel gets edited
     * @param event the raw teamspeak event
     */
    evchanneledited(event) {
        Promise.all([
            this.getClientById(event.invokerid),
            this.getChannelById(event.cid)
        ]).then(([invoker, channel]) => {
            if (!invoker)
                throw new EventError_1.EventError(`could not fetch client with id ${event.invokerid}`, "channeledited");
            if (this.ignoreQueryClient(invoker.type))
                return;
            if (!channel)
                throw new EventError_1.EventError(`could not fetch channel with id ${event.cid}`, "channeledited");
            const modified = {};
            Object.keys(event)
                .filter(k => k.startsWith("channel"))
                .forEach(k => modified[k] = event[k]);
            this.emit("channeledit", {
                invoker,
                channel,
                modified,
                reasonid: event.reasonid
            });
        }).catch(e => this.emit("error", e));
    }
    /**
     * Gets called when a channel gets edited
     * @param event the raw teamspeak event
     */
    evchannelcreated(event) {
        Promise.all([
            this.getClientById(event.invokerid),
            this.getChannelById(event.cid)
        ]).then(([invoker, channel]) => {
            if (!invoker)
                throw new EventError_1.EventError(`could not fetch client with id ${event.invokerid}`, "channelcreated");
            if (this.ignoreQueryClient(invoker.type))
                return;
            if (!channel)
                throw new EventError_1.EventError(`could not fetch channel with id ${event.cid}`, "channelcreated");
            const modified = {};
            Object.keys(event)
                .filter(k => k.startsWith("channel"))
                .forEach(k => modified[k] = event[k]);
            this.emit("channelcreate", {
                invoker,
                channel,
                modified,
                cpid: event.cpid
            });
        }).catch(e => this.emit("error", e));
    }
    /**
     * Gets called when a channel gets moved
     * @param event the raw teamspeak event
     */
    evchannelmoved(event) {
        Promise.all([
            this.getClientById(event.invokerid),
            this.getChannelById(event.cid),
            this.getChannelById(event.cpid)
        ]).then(([invoker, channel, parent]) => {
            if (!invoker)
                throw new EventError_1.EventError(`could not fetch client with id ${event.invokerid}`, "channelmoved");
            if (this.ignoreQueryClient(invoker.type))
                return;
            if (!channel)
                throw new EventError_1.EventError(`could not fetch channel with id ${event.cid}`, "channelmoved");
            this.emit("channelmoved", { invoker, channel, parent, order: event.order });
        }).catch(e => this.emit("error", e));
    }
    /**
     * Gets called when a channel gets deleted
     * @param event the raw teamspeak event
     */
    async evchanneldeleted(event) {
        this.getClientById(event.invokerid).then(invoker => {
            if (invoker && this.ignoreQueryClient(invoker.type))
                return;
            this.emit("channeldelete", { invoker, cid: event.cid });
        })
            .catch(e => this.emit("error", e));
    }
    /** priorizes the next command, this commands will be first in execution */
    priorize() {
        this.priorizeNextCommand = true;
        return this;
    }
    /**
     * Sends a raw command to the TeamSpeak Server.
     * @param {...any} args the command which should get executed on the teamspeak server
     * @example
     * ts3.execute("clientlist", ["-ip"])
     * ts3.execute("use", [9987], { clientnickname: "test" })
     */
    execute(cmd, ...args) {
        if (this.priorizeNextCommand) {
            this.priorizeNextCommand = false;
            return this.query.executePrio(cmd, ...args);
        }
        else {
            return this.query.execute(cmd, ...args);
        }
    }
    /**
     * Adds a new query client login, or enables query login for existing clients.
     * When no virtual server has been selected, the command will create global query logins.
     * Otherwise the command enables query login for existing client, and cldbid must be specified.
     * @param clientLoginName the login name
     * @param client optional database id or teamspeak client
     */
    queryLoginAdd(clientLoginName, client) {
        return this.execute("queryloginadd", {
            clientLoginName,
            cldbid: Client_1.TeamSpeakClient.getDbid(client)
        }).then(TeamSpeak.singleResponse);
    }
    /**
     * Deletes an existing server query login on selected server.
     * When no virtual server has been selected, deletes global query logins instead.
     * @param client client database id or teamspeak client object
     */
    queryLoginDel(client) {
        return this.execute("querylogindel", { cldbid: Client_1.TeamSpeakClient.getDbid(client) });
    }
    /**
     * List existing query client logins.
     * The pattern parameter can include regular characters and SQL wildcard characters (e.g. %).
     * Only displays query logins of the selected virtual server, or all query logins when no virtual server have been  selected.
     * @param pattern the pattern to filter for client login names
     * @param start the offset from where clients should be listed
     * @param duration how many clients should be listed
     */
    queryLoginList(pattern, start, duration) {
        return this.execute("queryloginlist", { pattern, start, duration }, ["-count"])
            .then(TeamSpeak.toArray);
    }
    apiKeyAdd(props) {
        return this.execute("apikeyadd", props)
            .then(TeamSpeak.singleResponse);
    }
    /**
     * Lists all apikeys owned by the user, or of all users using cldbid=*.
     * Usage of cldbid=... requires bVirtualserverApikeyManage.
     */
    apiKeyList(props = {}) {
        return this.execute("apikeylist", props, ["-count"])
            .then(TeamSpeak.toArray);
    }
    /**
     * Deletes an apikey. Any apikey owned by the current user, can always be deleted
     * Deleting apikeys from other requires bVirtualserverApikeyManage
     * @param id the key id to delete
     */
    apiKeyDel(id) {
        return this.execute("apikeydel", { id });
    }
    /**
     * Updates your own ServerQuery login credentials using a specified username.
     * The password will be auto-generated.
     * @param name
     */
    clientSetServerQueryLogin(name) {
        return this.execute("clientsetserverquerylogin", { clientLoginName: name })
            .then(TeamSpeak.singleResponse);
    }
    /**
     * Change your ServerQuery clients settings using given properties.
     * @param props the properties which should be changed
     */
    clientUpdate(props) {
        return this.execute("clientupdate", props)
            .then(this.updateContextResolve({
            clientNickname: props.clientNickname ? props.clientNickname : this.context.clientNickname
        }));
    }
    /**
     * Subscribes to an Event
     * @param event the event on which should be subscribed
     * @param id the channel id, only required when subscribing to the "channel" event
     */
    registerEvent(event, id) {
        return this.execute("servernotifyregister", { event, id })
            .then(this.updateContextResolve({ events: [{ event, id }] }));
    }
    /**
     * Subscribes to an Event.
     */
    unregisterEvent() {
        return this.execute("servernotifyunregister")
            .then(this.updateContextResolve({ events: [] }));
    }
    /**
     * Authenticates with the TeamSpeak 3 Server instance using given ServerQuery login credentials.
     * @param username the username which you want to login with
     * @param password the password you want to login with
     */
    login(username, password) {
        return this.execute("login", [username, password])
            .then(this.updateContextResolve({ login: { username, password } }))
            .catch(this.updateContextReject({ login: undefined }));
    }
    /** Deselects the active virtual server and logs out from the server instance. */
    logout() {
        return this.execute("logout")
            .then(this.updateContextResolve({
            selectType: context_1.SelectType.NONE,
            clientNickname: this.config.nickname,
            login: undefined,
            events: []
        }));
    }
    /**
     * Displays the servers version information including platform and build number.
     * @param refresh if this parameter has been set it will send a command to the server otherwise will use the cached info
     */
    async version(refresh = false) {
        if (refresh || !this.serverVersion) {
            this.serverVersion = await this.execute("version").then(TeamSpeak.singleResponse);
        }
        return this.serverVersion;
    }
    /**
     * Displays detailed connection information about the server instance including uptime,
     * number of virtual servers online, traffic information, etc.
     */
    hostInfo() {
        return this.execute("hostinfo")
            .then(TeamSpeak.singleResponse);
    }
    /**
     * Displays the server instance configuration including database revision number,
     * the file transfer port, default group IDs, etc.
     */
    instanceInfo() {
        return this.execute("instanceinfo")
            .then(TeamSpeak.singleResponse);
    }
    /**
     * Changes the server instance configuration using given properties.
     * @param properties the props you want to change
     */
    instanceEdit(properties) {
        return this.execute("instanceedit", properties);
    }
    /** returns a list of IP addresses used by the server instance on multi-homed machines. */
    bindingList() {
        return this.execute("bindinglist")
            .then(TeamSpeak.toArray);
    }
    /**
     * Selects the virtual server specified with the port to allow further interaction.
     * @param port the port the server runs on
     * @param clientNickname set nickname when selecting a server
     */
    useByPort(port, clientNickname) {
        return this.execute("use", { port, clientNickname }, ["-virtual"])
            .then(this.updateContextResolve({
            selectType: context_1.SelectType.PORT,
            selected: port,
            clientNickname,
            events: []
        }))
            .catch(this.updateContextReject({ selectType: context_1.SelectType.NONE }));
    }
    /**
     * Selects the virtual server specified with the sid to allow further interaction.
     * @param server the server id
     * @param clientNickname set nickname when selecting a server
     */
    useBySid(server, clientNickname) {
        return this.execute("use", [Server_1.TeamSpeakServer.getId(server), "-virtual"], { clientNickname })
            .then(this.updateContextResolve({
            selectType: context_1.SelectType.SID,
            selected: Server_1.TeamSpeakServer.getId(server),
            clientNickname,
            events: []
        }));
    }
    /** returns information about your current ServerQuery connection including your loginname, etc. */
    whoami() {
        return this.execute("whoami")
            .then(TeamSpeak.singleResponse);
    }
    /**
     * Displays detailed configuration information about the selected virtual server
     * including unique ID, number of clients online, configuration, etc.
     */
    serverInfo() {
        return this.execute("serverinfo")
            .then(TeamSpeak.singleResponse);
    }
    /**
     * Displays the database ID of the virtual server running on the UDP port
     * @param virtualserverPort the server port where data should be retrieved
     */
    serverIdGetByPort(virtualserverPort) {
        return this.execute("serveridgetbyport", { virtualserverPort })
            .then(TeamSpeak.singleResponse);
    }
    /**
     * Changes the selected virtual servers configuration using given properties.
     * Note that this command accepts multiple properties which means that you're able to change all settings of the selected virtual server at once.
     */
    serverEdit(properties) {
        return this.execute("serveredit", properties);
    }
    /**
     * Stops the entire TeamSpeak 3 Server instance by shutting down the process.
     * @param reasonmsg specifies a text message that is sent to the clients before the client disconnects (requires TeamSpeak Server 3.2.0 or newer).
     */
    serverProcessStop(reasonmsg) {
        return this.execute("serverprocessstop", { reasonmsg });
    }
    /**
     * returns detailed connection information about the selected virtual server including uptime, traffic information, etc.
     */
    connectionInfo() {
        return this.execute("serverrequestconnectioninfo")
            .then(TeamSpeak.singleResponse);
    }
    /**
     * Creates a new virtual server using the given properties and displays its ID, port and initial administrator privilege key.
     * If virtualserverPort is not specified, the server will test for the first unused UDP port
     * @param properties the server properties
     */
    serverCreate(properties) {
        let servertoken = "";
        return this.execute("servercreate", properties)
            .then(TeamSpeak.singleResponse)
            .then(({ token, sid }) => {
            servertoken = token;
            return this.serverList({ virtualserverId: sid });
        })
            .then(([server]) => ({ server, token: servertoken }));
    }
    /**
     * deletes the teamspeak server
     * @param server the server id to delete
     */
    serverDelete(server) {
        return this.execute("serverdelete", { sid: Server_1.TeamSpeakServer.getId(server) });
    }
    /**
     * Starts the virtual server. Depending on your permissions,
     * you're able to start either your own virtual server only or all virtual servers in the server instance.
     * @param server the server id to start
     */
    serverStart(server) {
        return this.execute("serverstart", { sid: Server_1.TeamSpeakServer.getId(server) });
    }
    /**
     * Stops the virtual server. Depending on your permissions,
     * you're able to stop either your own virtual server only or all virtual servers in the server instance.
     * @param server the server id to stop
     * @param reasonmsg Specifies a text message that is sent to the clients before the client disconnects (requires TeamSpeak Server 3.2.0 or newer).
     */
    serverStop(server, reasonmsg) {
        return this.execute("serverstop", { sid: Server_1.TeamSpeakServer.getId(server), reasonmsg });
    }
    /**
     * Creates a new server group using the name specified with name.
     * The optional type parameter can be used to create ServerQuery groups and template groups.
     * @param name the name of the servergroup
     * @param type type of the servergroup
     */
    serverGroupCreate(name, type = 1) {
        return this.execute("servergroupadd", { name, type })
            .then(TeamSpeak.singleResponse)
            .then(({ sgid }) => this.serverGroupList({ sgid }))
            .then(group => group[0]);
    }
    /**
     * returns the IDs of all clients currently residing in the server group.
     * @param group the servergroup id
     */
    serverGroupClientList(group) {
        return this.execute("servergroupclientlist", { sgid: ServerGroup_1.TeamSpeakServerGroup.getId(group) }, ["-names"])
            .then(TeamSpeak.toArray);
    }
    /**
     * Adds one or more clients to a server group specified with sgid.
     * Please note that a client cannot be added to default groups or template groups
     * @param client one or more client database ids which should be added
     * @param group the servergroup id which the client(s) should be added to
     */
    serverGroupAddClient(client, group) {
        return this.execute("servergroupaddclient", {
            sgid: ServerGroup_1.TeamSpeakServerGroup.getId(group),
            cldbid: Client_1.TeamSpeakClient.getMultipleDbids(client)
        });
    }
    /**
     * Removes one or more clients from the server group specified with sgid.
     * @param client one or more client database ids which should be added
     * @param group the servergroup id which the client(s) should be removed from
     */
    serverGroupDelClient(client, group) {
        return this.execute("servergroupdelclient", {
            sgid: ServerGroup_1.TeamSpeakServerGroup.getId(group),
            cldbid: Client_1.TeamSpeakClient.getMultipleDbids(client)
        });
    }
    /**
     * displays all server groups the client specified with cldbid is currently residing in
     * @param client the client database id to check
     */
    serverGroupsByClientId(client) {
        return this.execute("servergroupsbyclientid", { cldbid: Client_1.TeamSpeakClient.getMultipleDbids(client) })
            .then(TeamSpeak.toArray);
    }
    /**
     * Adds one or more servergroups to a client.
     * Please note that a client cannot be added to default groups or template groups
     * @param client one or more client database ids which should be added
     * @param group one or more servergroup ids which the client should be added to
     */
    clientAddServerGroup(client, group) {
        return this.execute("clientaddservergroup", {
            cldbid: Client_1.TeamSpeakClient.getDbid(client),
            sgid: ServerGroup_1.TeamSpeakServerGroup.getMultipleIds(group)
        });
    }
    /**
     * Removes one or more servergroups from the client.
     * @param client one or more client database ids which should be added
     * @param groups one or more servergroup ids which the client should be removed from
     */
    clientDelServerGroup(client, groups) {
        return this.execute("clientdelservergroup", {
            cldbid: Client_1.TeamSpeakClient.getDbid(client),
            sgid: ServerGroup_1.TeamSpeakServerGroup.getMultipleIds(groups)
        });
    }
    /**
     * Deletes the server group. If force is set to 1, the server group will be deleted even if there are clients within.
     * @param group the servergroup id
     * @param force if set to 1 the servergoup will be deleted even when clients stil belong to this group
     */
    serverGroupDel(group, force = false) {
        return this.execute("servergroupdel", { sgid: ServerGroup_1.TeamSpeakServerGroup.getId(group), force });
    }
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
    serverGroupCopy(sourceGroup, targetGroup = "0", type = 1, name = "foo") {
        return this.execute("servergroupcopy", {
            ssgid: ServerGroup_1.TeamSpeakServerGroup.getId(sourceGroup),
            tsgid: ServerGroup_1.TeamSpeakServerGroup.getId(targetGroup),
            type,
            name
        }).then(TeamSpeak.singleResponse);
    }
    /**
     * Changes the name of the server group
     * @param group the servergroup id
     * @param name new name of the servergroup
     */
    serverGroupRename(group, name) {
        return this.execute("servergrouprename", { sgid: ServerGroup_1.TeamSpeakServerGroup.getId(group), name });
    }
    /**
     * Displays a list of permissions assigned to the server group specified with sgid.
     * @param sgid the servergroup id
     * @param permsid if the permsid option is set to true the output will contain the permission names
     */
    serverGroupPermList(group, permsid = false) {
        const sgid = ServerGroup_1.TeamSpeakServerGroup.getId(group);
        return this.execute("servergrouppermlist", { sgid }, [permsid ? "-permsid" : null]).then(response => {
            return response.map(perm => {
                return this.createServerGroupPermBuilder(sgid)
                    .perm(perm.permsid || perm.permid)
                    .value(perm.permvalue)
                    .skip(perm.permskip)
                    .negate(perm.permnegated);
            });
        });
    }
    serverGroupAddPerm(group, perm) {
        const builder = this.createServerGroupPermBuilder(ServerGroup_1.TeamSpeakServerGroup.getId(group));
        if (!perm)
            return builder;
        if (perm.permskip)
            builder.skip(perm.permskip);
        if (perm.permnegated)
            builder.negate(perm.permnegated);
        return builder.perm(perm.permname).value(perm.permvalue).update();
    }
    /**
     * Removes a set of specified permissions from the server group.
     * A permission can be specified by permid or permsid.
     * @param group the servergroup id
     * @param perm the permid or permsid
     */
    serverGroupDelPerm(group, perm) {
        const properties = { sgid: ServerGroup_1.TeamSpeakServerGroup.getId(group) };
        properties[typeof perm === "string" ? "permsid" : "permid"] = perm;
        return this.execute("servergroupdelperm", properties);
    }
    /**
     * Sets a new temporary server password specified with pw. The temporary
     * password will be valid for the number of seconds specified with duration. The
     * client connecting with this password will automatically join the channel
     * specified with tcid. If tcid is set to 0, the client will join the default
     * channel.
     */
    serverTempPasswordAdd(props) {
        return this.execute("servertemppasswordadd", { tcid: "0", tcpw: "", desc: "", ...props });
    }
    /**
     * Deletes the temporary server password specified with pw.
     * @param pw the password to delete
     */
    serverTempPasswordDel(pw) {
        return this.execute("servertemppassworddel", { pw });
    }
    /**
     * Returns a list of active temporary server passwords. The output contains the
     * clear-text password, the nickname and unique identifier of the creating
     * client.
     */
    serverTempPasswordList() {
        return this.execute("servertemppasswordlist")
            .then(TeamSpeak.toArray);
    }
    /**
     * Creates a new channel using the given properties.
     * Note that this command accepts multiple properties which means that you're able to specifiy all settings of the new channel at once.
     * @param name the name of the channel
     * @param properties properties of the channel
     */
    channelCreate(name, properties = {}) {
        properties.channelName = name;
        return this.execute("channelcreate", properties)
            .then(TeamSpeak.singleResponse)
            .then(({ cid }) => this.channelList({ cid }))
            .then(([channel]) => channel);
    }
    /**
     * Creates a new channel group using a given name.
     * The optional type parameter can be used to create ServerQuery groups and template groups.
     * @param name the name of the channelgroup
     * @param type type of the channelgroup
     */
    channelGroupCreate(name, type = 1) {
        return this.execute("channelgroupadd", { name, type })
            .then(TeamSpeak.singleResponse)
            .then(({ cgid }) => this.channelGroupList({ cgid }))
            .then(([group]) => group);
    }
    /**
     * Retrieves a Single Channel by the given Channel ID
     * @param channel the channel id
     */
    getChannelById(channel) {
        return this.channelList({ cid: Channel_1.TeamSpeakChannel.getId(channel) }).then(([channel]) => channel);
    }
    /**
     * Retrieves a Single Channel by the given Channel Name
     * @param channelName the name of the channel
     */
    getChannelByName(channelName) {
        return this.channelList({ channelName }).then(([channel]) => channel);
    }
    /**
     * displays a list of channels matching a given name pattern
     * @param pattern the channel name pattern to search for
     */
    channelFind(pattern) {
        return this.execute("channelfind", { pattern }).then(TeamSpeak.toArray);
    }
    /**
     * Displays detailed configuration information about a channel including ID, topic, description, etc.
     * @param channel the channel id
     */
    channelInfo(channel) {
        return this.execute("channelinfo", { cid: Channel_1.TeamSpeakChannel.getId(channel) }).then(TeamSpeak.singleResponse);
    }
    /**
     * Moves a channel to a new parent channel with the ID cpid.
     * If order is specified, the channel will be sorted right under the channel with the specified ID.
     * If order is set to 0, the channel will be sorted right below the new parent.
     * @param channel the channel id
     * @param parent channel parent id
     * @param order channel sort order
     */
    channelMove(channel, parent, order = 0) {
        return this.execute("channelmove", {
            cid: Channel_1.TeamSpeakChannel.getId(channel),
            cpid: Channel_1.TeamSpeakChannel.getId(parent),
            order
        });
    }
    /**
     * Deletes an existing channel by ID.
     * If force is set to 1, the channel will be deleted even if there are clients within.
     * The clients will be kicked to the default channel with an appropriate reason message.
     * @param channel the channel id
     * @param force if set to 1 the channel will be deleted even when client are in it
     */
    channelDelete(channel, force = false) {
        return this.execute("channeldelete", { cid: Channel_1.TeamSpeakChannel.getId(channel), force });
    }
    /**
     * Changes a channels configuration using given properties.
     * Note that this command accepts multiple properties which means that you're able to change all settings of the channel specified with cid at once.
     * @param channel the channel id
     * @param properties the properties of the channel which should get changed
     */
    async channelEdit(channel, properties = {}) {
        const cid = Channel_1.TeamSpeakChannel.getId(channel);
        if (typeof properties.channelName === "string") {
            if (!this.isSubscribedToEvent("server") || Object.keys(this.channels).length === 0)
                await this.channelList();
            const c = await this.channels[cid];
            if (c && properties.channelName === c.name)
                delete properties.channelName;
            if (Object.keys(properties).length === 0)
                return [];
        }
        properties.cid = cid;
        return this.execute("channeledit", properties);
    }
    /**
     * Displays a list of permissions defined for a channel.
     * @param channel the channel id
     * @param permsid whether the permsid should be displayed aswell
     */
    channelPermList(channel, permsid = false) {
        const cid = Channel_1.TeamSpeakChannel.getId(channel);
        return this.execute("channelpermlist", { cid }, [permsid ? "-permsid" : null]).then(response => {
            return response.map(perm => {
                return this.createChannelPermBuilder(cid)
                    .perm(perm.permsid || perm.permid)
                    .value(perm.permvalue);
            });
        });
    }
    channelSetPerm(channel, perm) {
        const builder = this.createChannelPermBuilder(Channel_1.TeamSpeakChannel.getId(channel));
        if (!perm)
            return builder;
        return builder.perm(perm.permname).value(perm.permvalue).update();
    }
    /**
     * Adds a set of specified permissions to a channel.
     * A permission can be specified by permid or permsid.
     * @param channel the channel id
     * @param permissions the permissions to assign
     * @example
     * TeamSpeak.channelSetPerms(5, [{ permsid: "i_channel_needed_modify_power", permvalue: 75 }])
     */
    channelSetPerms(channel, permissions) {
        return this.execute("channeladdperm", { cid: Channel_1.TeamSpeakChannel.getId(channel) }, permissions);
    }
    /**
     * Removes a set of specified permissions from a channel.
     * Multiple permissions can be removed at once.
     * A permission can be specified by permid or permsid.
     * @param channel the channel id
     * @param perm the permid or permsid
     */
    channelDelPerm(channel, perm) {
        const prop = { cid: Channel_1.TeamSpeakChannel.getId(channel) };
        prop[typeof perm === "string" ? "permsid" : "permid"] = perm;
        return this.execute("channeldelperm", prop);
    }
    /**
     * Retrieves a Single Client by the given Client ID
     * @param client the client id
     */
    getClientById(client) {
        return this.clientList({ clid: Client_1.TeamSpeakClient.getId(client) })
            .then(([client]) => client);
    }
    /**
     * Retrieves a Single Client by the given Client Database ID
     * @param client the client database Id
     */
    getClientByDbid(client) {
        return this.clientList({ clientDatabaseId: Client_1.TeamSpeakClient.getDbid(client) })
            .then(([client]) => client);
    }
    /**
     * Retrieves a Single Client by the given Client Unique Identifier
     * @param client the client unique identifier
     */
    getClientByUid(client) {
        return this.clientList({ clientUniqueIdentifier: Client_1.TeamSpeakClient.getUid(client) })
            .then(([client]) => client);
    }
    /**
     * Retrieves a Single Client by the given Client Unique Identifier
     * @param clientNickname the nickname of the client
     */
    getClientByName(clientNickname) {
        return this.clientList({ clientNickname })
            .then(([client]) => client);
    }
    /**
     * Returns General Info of the Client, requires the Client to be online
     * @param clients one or more client ids to get
     */
    clientInfo(clients) {
        return this.execute("clientinfo", { clid: Client_1.TeamSpeakClient.getMultipleIds(clients) })
            .then(TeamSpeak.toArray);
    }
    /**
     * Returns the Clients Database List
     * @param start start offset
     * @param duration amount of entries which should get retrieved
     * @param count retrieve the count of entries
     */
    clientDbList(start = 0, duration = 1000, count = true) {
        return this.execute("clientdblist", { start, duration }, [count ? "-count" : null])
            .then(TeamSpeak.toArray);
    }
    /**
     * Returns the Clients Database Info
     * @param clients one or more client database ids to get
     */
    clientDbInfo(clients) {
        return this.execute("clientdbinfo", { cldbid: Client_1.TeamSpeakClient.getMultipleDbids(clients) })
            .then(TeamSpeak.toArray);
    }
    /**
     * Kicks the Client from the Server
     * @param client the client id
     * @param reasonid the reasonid
     * @param reasonmsg the message the client should receive when getting kicked
     * @param continueOnError ignore errors
     */
    clientKick(client, reasonid, reasonmsg, continueOnError = false) {
        const flags = [];
        if (continueOnError)
            flags.push("-continueonerror");
        return this.execute("clientkick", {
            clid: Client_1.TeamSpeakClient.getId(client),
            reasonid,
            reasonmsg
        }, flags);
    }
    /**
     * Moves the Client to a different Channel
     * @param client the client id
     * @param channel channel id in which the client should get moved
     * @param cpw the channel password
     * @param continueOnError ignore errors
     */
    clientMove(client, channel, cpw, continueOnError = false) {
        const flags = [];
        if (continueOnError)
            flags.push("-continueonerror");
        return this.execute("clientmove", {
            clid: Client_1.TeamSpeakClient.getId(client),
            cid: Channel_1.TeamSpeakChannel.getId(channel),
            cpw
        }, flags);
    }
    /**
     * Pokes the Client with a certain message
     * @param client the client id
     * @param msg the message the client should receive
     */
    clientPoke(client, msg) {
        return this.execute("clientpoke", { clid: Client_1.TeamSpeakClient.getId(client), msg });
    }
    /**
     * Displays a list of permissions defined for a client
     * @param client the client database id
     * @param permsid if the permsid option is set to true the output will contain the permission names
     */
    clientPermList(client, permsid = false) {
        const cldbid = Client_1.TeamSpeakClient.getDbid(client);
        return this.execute("clientpermlist", { cldbid }, [permsid ? "-permsid" : null]).then(response => {
            return response.map(perm => {
                return this.createClientPermBuilder(cldbid)
                    .perm(perm.permsid || perm.permid)
                    .value(perm.permvalue)
                    .skip(perm.permskip)
                    .negate(perm.permnegated);
            });
        });
    }
    clientAddPerm(client, perm) {
        const builder = this.createClientPermBuilder(Client_1.TeamSpeakClient.getDbid(client));
        if (!perm)
            return builder;
        if (perm.permskip)
            builder.skip(perm.permskip);
        if (perm.permnegated)
            builder.negate(perm.permnegated);
        return builder.perm(perm.permname).value(perm.permvalue).update();
    }
    /**
     * Removes a set of specified permissions from a client.
     * Multiple permissions can be removed at once.
     * A permission can be specified by permid or permsid
     * @param client the client database id
     * @param perm the permid or permsid
     */
    clientDelPerm(client, perm) {
        const properties = { cldbid: Client_1.TeamSpeakClient.getDbid(client) };
        properties[typeof perm === "string" ? "permsid" : "permid"] = perm;
        return this.execute("clientdelperm", properties);
    }
    /**
     * Searches for custom client properties specified by ident and value.
     * The value parameter can include regular characters and SQL wildcard characters (e.g. %).
     * @param ident the key to search for
     * @param pattern the search pattern to use
     */
    customSearch(ident, pattern) {
        return this.execute("customsearch", { ident, pattern }).then(TeamSpeak.singleResponse);
    }
    /**
     * returns a list of custom properties for the client specified with cldbid.
     * @param client the Client Database ID which should be retrieved
     */
    customInfo(client) {
        return this.execute("custominfo", { cldbid: Client_1.TeamSpeakClient.getDbid(client) });
    }
    /**
     * Removes a custom property from a client specified by the cldbid.
     * This requires TeamSpeak Server Version 3.2.0 or newer.
     * @param client the client Database ID which should be changed
     * @param ident the key which should be deleted
     */
    customDelete(client, ident) {
        return this.execute("customdelete", { cldbid: Client_1.TeamSpeakClient.getDbid(client), ident });
    }
    /**
     * Creates or updates a custom property for client specified by the cldbid.
     * Ident and value can be any value, and are the key value pair of the custom property.
     * This requires TeamSpeak Server Version 3.2.0 or newer.
     * @param client the client database id which should be changed
     * @param ident the key which should be set
     * @param value the value which should be set
     */
    customSet(client, ident, value) {
        return this.execute("customset", { cldbid: Client_1.TeamSpeakClient.getDbid(client), ident, value });
    }
    sendTextMessage(target, targetmode, msg) {
        let selectedTarget = "0";
        if (targetmode === enum_1.TextMessageTargetMode.CLIENT) {
            selectedTarget = Client_1.TeamSpeakClient.getId(target);
        }
        else if (targetmode === enum_1.TextMessageTargetMode.CHANNEL) {
            selectedTarget = Channel_1.TeamSpeakChannel.getId(target);
        }
        return this.execute("sendtextmessage", { target: selectedTarget, targetmode, msg });
    }
    /**
     * Retrieves a single ServerGroup by the given ServerGroup ID
     * @param group the servergroup id
     */
    getServerGroupById(group) {
        return this.serverGroupList({ sgid: ServerGroup_1.TeamSpeakServerGroup.getId(group) })
            .then(([group]) => group);
    }
    /**
     * Retrieves a single ServerGroup by the given ServerGroup Name
     * @param name the servergroup name
     */
    getServerGroupByName(name) {
        return this.serverGroupList({ name })
            .then(([group]) => group);
    }
    /**
     * Retrieves a single ChannelGroup by the given ChannelGroup ID
     * @param group the channelgroup Id
     */
    getChannelGroupById(group) {
        return this.channelGroupList({ cgid: ChannelGroup_1.TeamSpeakChannelGroup.getId(group) })
            .then(([group]) => group);
    }
    /**
     * Retrieves a single ChannelGroup by the given ChannelGroup Name
     * @param name the channelGroup name
     */
    getChannelGroupByName(name) {
        return this.channelGroupList({ name })
            .then(([group]) => group);
    }
    /**
     * Sets the channel group of a client
     * @param group the channelgroup which the client should get assigned
     * @param channel the channel in which the client should be assigned the group
     * @param client the client database id which should be added to the group
     */
    setClientChannelGroup(group, channel, client) {
        return this.execute("setclientchannelgroup", {
            cgid: ChannelGroup_1.TeamSpeakChannelGroup.getId(group),
            cldbid: Client_1.TeamSpeakClient.getDbid(client),
            cid: Channel_1.TeamSpeakChannel.getId(channel)
        });
    }
    /**
     * Deletes the channel group. If force is set to 1, the channel group will be deleted even if there are clients within.
     * @param group the channelgroup id
     * @param force if set to true the channelgroup will be deleted even when clients are in it
     */
    deleteChannelGroup(group, force = false) {
        return this.execute("channelgroupdel", { cgid: ChannelGroup_1.TeamSpeakChannelGroup.getId(group), force });
    }
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
    channelGroupCopy(sourceGroup, targetGroup = "0", type = 1, name = "foo") {
        return this.execute("channelgroupcopy", {
            scgid: ChannelGroup_1.TeamSpeakChannelGroup.getId(sourceGroup),
            tcgid: ChannelGroup_1.TeamSpeakChannelGroup.getId(targetGroup),
            type,
            name
        }).then(TeamSpeak.singleResponse);
    }
    /**
     * Changes the name of the channel group
     * @param group the channelgroup id to rename
     * @param name new name of the ghannelgroup
     */
    channelGroupRename(group, name) {
        return this.execute("channelgrouprename", { cgid: ChannelGroup_1.TeamSpeakChannelGroup.getId(group), name });
    }
    /**
     * Displays a list of permissions assigned to the channel group specified with cgid.
     * @param group the channelgroup id to list
     * @param permsid if the permsid option is set to true the output will contain the permission names.
     */
    channelGroupPermList(group, permsid = false) {
        const cgid = ChannelGroup_1.TeamSpeakChannelGroup.getId(group);
        return this.execute("channelgrouppermlist", { cgid }, [permsid ? "-permsid" : null]).then(response => {
            return response.map(perm => {
                return this.createChannelGroupPermBuilder(cgid)
                    .perm(perm.permsid || perm.permid)
                    .value(perm.permvalue)
                    .skip(perm.permskip)
                    .negate(perm.permnegated);
            });
        });
    }
    channelGroupAddPerm(group, perm) {
        const builder = this.createChannelGroupPermBuilder(ChannelGroup_1.TeamSpeakChannelGroup.getId(group));
        if (!perm)
            return builder;
        if (perm.permskip)
            builder.skip(perm.permskip);
        if (perm.permnegated)
            builder.negate(perm.permnegated);
        return builder.perm(perm.permname).value(perm.permvalue).update();
    }
    /**
     * Removes a set of specified permissions from the channel group. A permission can be specified by permid or permsid.
     * @param group the channelgroup id
     * @param perm the permid or permsid
     */
    channelGroupDelPerm(group, perm) {
        const properties = { cgid: ChannelGroup_1.TeamSpeakChannelGroup.getId(group) };
        properties[typeof perm === "string" ? "permsid" : "permid"] = perm;
        return this.execute("channelgroupdelperm", properties);
    }
    /**
     * Displays the IDs of all clients currently residing in the channel group.
     * @param cgid the channelgroup id
     * @param cid the channel id
     * @param cldbid the client database id to filter
     */
    channelGroupClientList(group, channel, client) {
        const properties = { cgid: ChannelGroup_1.TeamSpeakChannelGroup.getId(group) };
        const cid = Channel_1.TeamSpeakChannel.getId(channel);
        const cldbid = Client_1.TeamSpeakClient.getId(client);
        if (cid)
            properties.cid = cid;
        if (cldbid)
            properties.cldbid = cldbid;
        return this.execute("channelgroupclientlist", properties).then(TeamSpeak.toArray);
    }
    /**
     * Displays all permissions assigned to a client for the channel specified with cid.
     * If permid is set to 0, all permissions will be displayed.
     * A permission can be specified by permid or permsid.
     * @param client the client database id
     * @param channel one or more permission names
     * @param permid one or more permission ids
     * @param permsid one or more permission names
     */
    permOverview(client, channel, perms = []) {
        const properties = {
            cldbid: Client_1.TeamSpeakClient.getDbid(client),
            cid: Channel_1.TeamSpeakChannel.getId(channel)
        };
        if (typeof perms[0] === "string")
            properties.permsid = perms;
        if (typeof perms[0] === "number")
            properties.permid = perms;
        return this.execute("permoverview", properties).then(TeamSpeak.toArray);
    }
    /**
     * Retrieves a list of permissions available on the server instance including ID, name and description.
     */
    permissionList() {
        return this.execute("permissionlist").then(TeamSpeak.toArray);
    }
    /**
     * Retrieves the database ID of one or more permissions specified by permsid.
     * @param permsid single permission name
     */
    permIdGetByName(permsid) {
        return this.execute("permidgetbyname", { permsid })
            .then(TeamSpeak.singleResponse);
    }
    /**
     * Retrieves the database ID of one or more permissions specified by permsid.
     * @param permsid multiple permission names
     */
    permIdsGetByName(permsid) {
        return this.execute("permidgetbyname", { permsid })
            .then(TeamSpeak.toArray);
    }
    /**
     * Retrieves the current value of the permission for your own connection.
     * This can be useful when you need to check your own privileges.
     * @param perm perm id or name which should be checked
     */
    permGet(perm) {
        return this.execute("permget", typeof perm === "string" ? { permsid: perm } : { permid: perm })
            .then(TeamSpeak.singleResponse);
    }
    /**
     * Retrieves detailed information about all assignments of the permission.
     * The output is similar to permoverview which includes the type and the ID of the client, channel or group associated with the permission.
     * @param perm perm id or name to retrieve
     */
    permFind(perm) {
        return this.execute("permfind", (typeof perm === "number") ? { permid: perm } : { permsid: perm })
            .then(TeamSpeak.toArray);
    }
    /**
     * Restores the default permission settings on the selected virtual server and creates a new initial administrator token.
     * Please note that in case of an error during the permreset call - e.g. when the database has been modified or corrupted - the virtual server will be deleted from the database.
     */
    permReset() {
        return this.execute("permreset").then(TeamSpeak.singleResponse);
    }
    /**
     * Retrieves a list of privilege keys available including their type and group IDs.
     */
    privilegeKeyList() {
        return this.execute("privilegekeylist").then(TeamSpeak.toArray);
    }
    privilegeKeyAdd(tokentype, group, channel, description = "", customset = "") {
        const tokenid1 = tokentype === enum_1.TokenType.ChannelGroup ? ChannelGroup_1.TeamSpeakChannelGroup.getId(group) : ServerGroup_1.TeamSpeakServerGroup.getId(group);
        return this.execute("privilegekeyadd", {
            tokentype,
            tokenid1,
            tokenid2: Channel_1.TeamSpeakChannel.getId(channel) || "0",
            tokendescription: description,
            tokencustomset: customset
        }).then(TeamSpeak.singleResponse);
    }
    /**
     * Create a new privilegekey token for a ServerGroup with the given description
     * @param group servergroup which should be generated the token for
     * @param description token description
     * @param tokencustomset token custom set
     */
    serverGroupPrivilegeKeyAdd(group, description, customset) {
        return this.privilegeKeyAdd(enum_1.TokenType.ServerGroup, group, undefined, description, customset);
    }
    /**
     * Create a new privilegekey token for a Channel Group and assigned Channel ID with the given description
     * @param group the channel group for which the token should be valid
     * @param cid channel id for which the token should be valid
     * @param description token description
     * @param tokencustomset token custom set
     */
    channelGroupPrivilegeKeyAdd(group, channel, description, customset) {
        return this.privilegeKeyAdd(enum_1.TokenType.ChannelGroup, group, channel, description, customset);
    }
    /**
     * Deletes an existing token matching the token key specified with token.
     * @param token the token which should be deleted
     */
    privilegeKeyDelete(token) {
        return this.execute("privilegekeydelete", { token });
    }
    /**
     * Use a token key gain access to a server or channel group.
     * Please note that the server will automatically delete the token after it has been used.
     * @param token the token which should be used
     */
    privilegeKeyUse(token) {
        return this.execute("privilegekeyuse", { token });
    }
    /**
     * Displays a list of offline messages you've received.
     * The output contains the senders unique identifier, the messages subject, etc.
     */
    messageList() {
        return this.execute("messagelist").then(TeamSpeak.toArray);
    }
    /**
     * Sends an offline message to the client specified by uid.
     * @param client client unique identifier
     * @param subject subject of the message
     * @param message message text
     */
    messageAdd(client, subject, message) {
        return this.execute("messageadd", { cluid: Client_1.TeamSpeakClient.getUid(client), subject, message });
    }
    /**
     * Sends an offline message to the client specified by uid.
     * @param msgid the message id which should be deleted
     */
    messageDel(msgid) {
        return this.execute("messagedel", { msgid });
    }
    /**
     * Displays an existing offline message with the given id from the inbox.
     * @param msgid the message id
     */
    messageGet(msgid) {
        return this.execute("messageget", { msgid }).then(TeamSpeak.singleResponse);
    }
    /**
     * Displays an existing offline message with the given id from the inbox.
     * @param msgid the message id
     * @param flag if flag is set to 1 the message will be marked as read
     */
    messageUpdate(msgid, flag = true) {
        return this.execute("messageupdateflag", { msgid, flag });
    }
    /**
     * Displays a list of complaints on the selected virtual server.
     * If dbid is specified, only complaints about the targeted client will be shown.
     * @param client filter only for certain client with the given database id
     */
    complainList(client) {
        return this.execute("complainlist", { cldbid: Client_1.TeamSpeakClient.getDbid(client) })
            .then(TeamSpeak.toArray);
    }
    /**
     * Submits a complaint about the client with database ID dbid to the server.
     * @param client filter only for certain client with the given database id
     * @param message the Message which should be added
     */
    complainAdd(client, message = "") {
        return this.execute("complainadd", { cldbid: Client_1.TeamSpeakClient.getDbid(client), message });
    }
    /**
     * Deletes the complaint about the client with ID tcldbid submitted by the client with ID fdbid from the server.
     * If fcldbid will be left empty all complaints for the tcldbid will be deleted
     * @param targetClient the target client database id
     * @param fromClient the client database id which filed the report
     */
    complainDel(targetClient, fromClient) {
        const cmd = fromClient ? "complaindel" : "complaindelall";
        const properties = { tcldbid: Client_1.TeamSpeakClient.getDbid(targetClient) };
        if (fromClient)
            properties.fcldbid = Client_1.TeamSpeakClient.getDbid(fromClient);
        return this.execute(cmd, properties);
    }
    /**
     * Displays a list of active bans on the selected virtual server.
     * @param start optional start from where clients should be listed
     * @param duration optional duration on how much ban entries should be retrieved
     */
    banList(start, duration) {
        return this.execute("banlist", { start, duration })
            .then(TeamSpeak.toArray);
    }
    /**
     * Adds a new ban rule on the selected virtual server.
     * All parameters are optional but at least one of the following must be set: ip, name, uid or mytsid.
     */
    ban(properties) {
        return this.execute("banadd", properties)
            .then(TeamSpeak.singleResponse);
    }
    /**
     * Bans the client specified with ID clid from the server.
     * Please note that this will create two separate ban rules for the targeted clients IP address and his unique identifier.
     */
    banClient(properties) {
        const flags = [];
        if (properties.continueOnError) {
            flags.push("-continueonerror");
            delete properties.continueOnError;
        }
        return this.execute("banclient", properties, flags)
            .then(TeamSpeak.singleResponse);
    }
    /**
     * Removes one or all bans from the server
     * @param banid the banid to remove, if not provided it will remove all bans
     */
    banDel(banid) {
        if (banid) {
            return this.execute("bandel", { banid });
        }
        else {
            return this.execute("bandelall");
        }
    }
    /**
     * Displays a specified number of entries from the servers log.
     * If instance is set to 1, the server will return lines from the master logfile (ts3server_0.log) instead of the selected virtual server logfile.
     * @param lines amount of lines to receive
     * @param reverse invert output (like Array.reverse)
     * @param instance instance or virtualserver log
     * @param beginPos begin at position
     */
    logView(lines = 1000, reverse = 0, instance = 0, beginPos = 0) {
        return this.execute("logview", { lines, reverse, instance, beginPos })
            .then(TeamSpeak.toArray);
    }
    /**
     * Writes a custom entry into the servers log.
     * Depending on your permissions, you'll be able to add entries into the server instance log and/or your virtual servers log.
     * The loglevel parameter specifies the type of the entry
     * @param loglevel level 1 to 4
     * @param logmsg message to log
     */
    logAdd(loglevel, logmsg) {
        return this.execute("logadd", { loglevel, logmsg });
    }
    /**
     * Sends a text message to all clients on all virtual servers in the TeamSpeak 3 Server instance.
     * @param msg message which will be sent to all instances
     */
    gm(msg) {
        return this.execute("gm", { msg });
    }
    /**
     * displays a list of clients matching a given name pattern
     * @param pattern the pattern to search clients
     */
    clientFind(pattern) {
        return this.execute("clientfind", { pattern });
    }
    /**
     * displays all client IDs matching the unique identifier specified by cluid
     * @param cluid the unique id to search for
     */
    clientGetIds(cluid) {
        return this.execute("clientgetids", { cluid })
            .then(TeamSpeak.toArray);
    }
    /**
     * displays the database ID matching the unique identifier specified by cluid
     * @param cluid the unique id to search for
     */
    clientGetDbidFromUid(cluid) {
        return this.execute("clientgetdbidfromuid", { cluid })
            .then(TeamSpeak.singleResponse);
    }
    /**
     * displays the database ID and nickname matching the unique identifier specified by cluid
     * @param cluid the unique id to search for
     */
    clientGetNameFromUid(cluid) {
        return this.execute("clientgetnamefromuid", { cluid })
            .then(TeamSpeak.singleResponse);
    }
    /**
     * displays the database ID and nickname matching the unique identifier specified by cluid
     * @param clid the client id to search from
     */
    clientGetUidFromClid(clid) {
        return this.execute("clientgetuidfromclid", { clid })
            .then(TeamSpeak.singleResponse);
    }
    /**
     * displays the unique identifier and nickname matching the database ID specified by cldbid
     * @param cldbid client database it to search from
     */
    clientGetNameFromDbid(cldbid) {
        return this.execute("clientgetnamefromdbid", { cldbid })
            .then(TeamSpeak.singleResponse);
    }
    /**
     * edits a specific client
     * @param client the client id to modify
     * @param properties the properties to change
     */
    clientEdit(client, properties) {
        return this.execute("clientedit", { clid: Client_1.TeamSpeakClient.getId(client), ...properties });
    }
    /**
     * Displays a list of client database IDs matching a given pattern.
     * You can either search for a clients last known nickname or his unique identity by using the -uid option.
     * @param pattern the pattern which should be searched for
     * @param isUid true when instead of the Name it should be searched for an uid
     */
    clientDbFind(pattern, isUid = false) {
        return this.execute("clientdbfind", { pattern }, [isUid ? "-uid" : null])
            .then(TeamSpeak.toArray);
    }
    /**
     * Changes a clients settings using given properties.
     * @param client the client database id which should be edited
     * @param properties the properties which should be modified
     */
    clientDbEdit(client, properties) {
        return this.execute("clientdbedit", { cldbid: Client_1.TeamSpeakClient.getDbid(client), ...properties });
    }
    /**
     * Deletes a clients properties from the database.
     * @param client the client database id which should be deleted
     */
    clientDbDelete(client) {
        return this.execute("clientdbdelete", { cldbid: Client_1.TeamSpeakClient.getDbid(client) });
    }
    /**
     * Displays a list of virtual servers including their ID, status, number of clients online, etc.
     */
    serverList(filter = {}) {
        return this.execute("serverlist", ["-uid", "-all"])
            .then(TeamSpeak.toArray)
            .then(servers => this.handleCache(this.servers, servers, "virtualserverId", Server_1.TeamSpeakServer))
            .then(servers => TeamSpeak.filter(servers, filter))
            .then(servers => servers.map(s => this.servers[s.virtualserverId]));
    }
    channelClientPermList(channel, client, permsid = false) {
        return this.execute("channelclientpermlist", { cid: Channel_1.TeamSpeakChannel.getId(channel), cldbid: Client_1.TeamSpeakClient.getDbid(client) }, [permsid ? "-permsid" : null]);
    }
    /**
     * Displays a list of channel groups available. Depending on your permissions, the output may also contain template groups.
     */
    channelGroupList(filter = {}) {
        return this.execute("channelgrouplist")
            .then(TeamSpeak.toArray)
            .then(groups => this.handleCache(this.channelgroups, groups, "cgid", ChannelGroup_1.TeamSpeakChannelGroup))
            .then(groups => TeamSpeak.filter(groups, filter))
            .then(groups => groups.map(g => this.channelgroups[g.cgid]));
    }
    /**
     * Displays a list of server groups available.
     * Depending on your permissions, the output may also contain global ServerQuery groups and template groups.
     */
    serverGroupList(filter = {}) {
        return this.execute("servergrouplist")
            .then(TeamSpeak.toArray)
            .then(groups => this.handleCache(this.servergroups, groups, "sgid", ServerGroup_1.TeamSpeakServerGroup))
            .then(groups => TeamSpeak.filter(groups, filter))
            .then(groups => groups.map(g => this.servergroups[g.sgid]));
    }
    /**
     * Lists all Channels with a given Filter
     */
    channelList(filter = {}) {
        return this.execute("channellist", ["-topic", "-flags", "-voice", "-limits", "-icon", "-secondsempty", "-banner"])
            .then(TeamSpeak.toArray)
            .then(channels => this.handleCache(this.channels, channels, "cid", Channel_1.TeamSpeakChannel))
            .then(channels => TeamSpeak.filter(channels, filter))
            .then(channels => channels.map(c => this.channels[c.cid]));
    }
    /**
     * Lists all Clients with a given Filter
     */
    clientList(filter = {}) {
        if (this.config.ignoreQueries)
            filter.clientType = enum_1.ClientType.Regular;
        const flags = ["-uid", "-away", "-voice", "-times", "-groups", "-info", "-icon", "-country", "-ip", "-location"];
        return this.execute("clientlist", flags)
            .then(TeamSpeak.toArray)
            .then(clients => this.handleCache(this.clients, clients, "clid", Client_1.TeamSpeakClient))
            .then(clients => TeamSpeak.filter(clients, filter))
            .then(clients => clients.map(c => this.clients[String(c.clid)]));
    }
    /**
     * Lists currently active file transfers
     */
    ftList() {
        return this.execute("ftlist")
            .then(TeamSpeak.toArray);
    }
    /**
     * Displays a list of files and directories stored in the specified channels file repository.
     * @param channel the channel id to check for
     * @param path the path to list
     * @param cpw the channel password
     */
    ftGetFileList(channel, path = "/", cpw) {
        return this.execute("ftgetfilelist", { cid: Channel_1.TeamSpeakChannel.getId(channel), path, cpw }).then(TeamSpeak.toArray);
    }
    /**
     * Displays detailed information about one or more specified files stored in a channels file repository.
     * @param channel the channel id to check for
     * @param name the filepath to receive
     * @param cpw the channel password
     */
    ftGetFileInfo(channel, name, cpw = "") {
        return this.execute("ftgetfileinfo", { cid: Channel_1.TeamSpeakChannel.getId(channel), name, cpw }).then(TeamSpeak.singleResponse);
    }
    /**
     * Stops the running file transfer with server-side ID serverftfid.
     * @param serverftfid server file transfer id
     * @param del
     */
    ftStop(serverftfid, del = 1) {
        return this.execute("ftstop", { serverftfid, delete: del });
    }
    /**
     * Deletes one or more files stored in a channels file repository
     * @param channel the channel id to check for
     * @param name path to the file to delete
     * @param cpw the channel password
     */
    ftDeleteFile(channel, name, cpw) {
        return this.execute("ftdeletefile", { cid: Channel_1.TeamSpeakChannel.getId(channel), name, cpw });
    }
    /**
     * Creates new directory in a channels file repository
     * @param channel the channel id to check for
     * @param dirname path to the directory
     * @param cpw the channel password
     */
    ftCreateDir(channel, dirname, cpw) {
        return this.execute("ftcreatedir", { cid: Channel_1.TeamSpeakChannel.getId(channel), dirname, cpw });
    }
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
    ftRenameFile(channel, oldname, newname, tcid, cpw, tcpw) {
        return this.execute("ftrenamefile", { cid: Channel_1.TeamSpeakChannel.getId(channel), oldname, newname, tcid, cpw, tcpw });
    }
    /**
     * Initializes a file transfer upload. clientftfid is an arbitrary ID to identify the file transfer on client-side.
     * On success, the server generates a new ftkey which is required to start uploading the file through TeamSpeak 3's file transfer interface.
     */
    ftInitUpload(transfer) {
        return this.execute("ftinitupload", {
            clientftfid: Math.floor(Math.random() * 10000),
            cid: "0",
            resume: 0,
            overwrite: 1,
            cpw: "",
            ...transfer
        }).then(TeamSpeak.singleResponse);
    }
    /**
     * Initializes a file transfer download. clientftfid is an arbitrary ID to identify the file transfer on client-side.
     * On success, the server generates a new ftkey which is required to start downloading the file through TeamSpeak 3's file transfer interface.
     */
    ftInitDownload(transfer) {
        return this.execute("ftinitdownload", {
            clientftfid: Math.floor(Math.random() * 10000),
            seekpos: 0,
            cpw: "",
            cid: "0",
            ...transfer
        }).then(TeamSpeak.singleResponse);
    }
    /**
     * uploads a file
     * @param path the path whith the filename where the file should be uploaded to
     * @param data the data to upload
     * @param channel channel id to upload to (0 = server)
     * @param cpw channel password of the channel which will be uploaded to
     */
    async uploadFile(path, data, channel = "0", cpw = "") {
        if (typeof data === "string")
            data = Buffer.from(data);
        const res = await this.ftInitUpload({ name: path, cid: Channel_1.TeamSpeakChannel.getId(channel), cpw, size: data.byteLength });
        if (res.size === 0)
            throw new Error(res.msg);
        await new FileTransfer_1.FileTransfer(this.config.host, res.port).upload(res.ftkey, data);
    }
    /**
     * returns the file in the channel with the given path
     * @param path the path whith the filename where the file should be uploaded to
     * @param channel channel id to download from (0 = server)
     * @param cpw channel password of the channel which will be uploaded to
     */
    async downloadFile(path, channel = "0", cpw = "") {
        const res = await this.ftInitDownload({ name: path, cid: Channel_1.TeamSpeakChannel.getId(channel), cpw });
        if (res.size === 0)
            throw new Error(res.msg);
        return await new FileTransfer_1.FileTransfer(this.config.host, res.port).download(res.ftkey, res.size);
    }
    /**
     * returns an icon with the given id
     * @param id the id of the icon to retrieve eg 262672952
     */
    downloadIcon(id) {
        return this.downloadFile(`/icon_${id}`);
    }
    /**
     * uploads an icon to the teamspeak server and returns its id
     * @param data icon buffer to upload
     */
    async uploadIcon(data) {
        const id = buffer_crc32_1.default.signed(data);
        await this.uploadFile(`/icon_${id}`, data, "0");
        return id;
    }
    /**
     * gets the icon id of a resolveable Perm List
     * @param permlist expects a promise which resolves to a permission list
     */
    getIconId(permlist) {
        return new Promise((fulfill, reject) => {
            permlist.then(perms => {
                const found = perms.some(perm => {
                    if (perm.getPerm() !== "i_icon_id")
                        return false;
                    const value = perm.getValue();
                    fulfill(value < 0 ? value >>> 0 : value);
                    return true;
                });
                if (!found)
                    reject(new Error("no icon found"));
            });
        });
    }
    /**
     * displays a snapshot of the selected virtual server containing all settings,
     * groups and known client identities. The data from a server snapshot can be
     * used to restore a virtual servers configuration, channels and permissions
     * using the serversnapshotdeploy command.
     * only supports version 2 (from server 3.10.0)
     * @param password the optional password to encrypt the snapshot
     */
    createSnapshot(password) {
        return this.execute("serversnapshotcreate", { password }, parsers => {
            parsers.response = ({ raw, cmd }) => cmd.parseSnapshotCreate({ raw });
            return parsers;
        }).then(([res]) => ({
            version: parseInt(res.version, 10),
            salt: res.salt,
            snapshot: res.snapshot
        }));
    }
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
    deploySnapshot(data, salt, password, keepfiles = true, version) {
        return this.execute("serversnapshotdeploy", [keepfiles ? "-keepfiles" : null, "-mapping"], { password, salt }, parsers => {
            parsers.request = cmd => {
                if (!this.serverVersion)
                    throw new Error("server version has not been determined yet");
                return Command_1.Command.buildSnapshotDeploy(data, cmd, this.serverVersion, version);
            };
            return parsers;
        });
    }
    logQueryTiming() {
        return this.execute("logquerytiminginterval");
    }
    /** closes the ServerQuery connection to the TeamSpeak server instance. */
    quit() {
        return this.execute("quit");
    }
    /** forcefully closes the socket connection */
    forceQuit() {
        return this.query.forceQuit();
    }
    /**
     * parses the whole cache by given objects
     * @param cache the cache object
     * @param list the list to check against the cache
     * @param key the key used to identify the object inside the cache
     * @param node the class which should be used
     */
    handleCache(cache, list, key, node) {
        const remainder = Object.keys(cache);
        list.forEach(entry => {
            const k = String(entry[key]);
            if (remainder.includes(k)) {
                cache[k].updateCache(entry);
                remainder.splice(remainder.indexOf(k), 1);
            }
            else {
                cache[k] = new node(this, entry);
            }
        });
        remainder.forEach(k => Reflect.deleteProperty(cache, k));
        return list;
    }
    /**
     * updates the context when the inner callback gets called
     * and returns the first parameter
     * @param context context data to update
     */
    updateContextResolve(context) {
        return (res) => {
            this.updateContext(context);
            return res;
        };
    }
    /**
     * updates the context when the inner callback gets called
     * and throws the first parameter which is an error
     * @param context context data to update
     */
    updateContextReject(context) {
        return (err) => {
            this.updateContext(context);
            throw err;
        };
    }
    /**
     * updates the context with new data
     * @param data the data to update the context with
     */
    updateContext(data) {
        if (!Array.isArray(data.events))
            data.events = [];
        this.context = {
            ...this.context,
            ...data,
            events: [...this.context.events, ...data.events]
        };
        return this;
    }
    /**
     * wether the query client should get handled or not
     * @param type the client type
     */
    ignoreQueryClient(type) {
        return this.config.ignoreQueries && type === enum_1.ClientType.ServerQuery;
    }
    /**
     * retrieves an instance of the Permission
     */
    getPermBuilder(init) {
        return new Permission_1.Permission({
            teamspeak: this,
            ...init
        });
    }
    /** creates a channel perm builder for the specified channel id */
    createChannelPermBuilder(cid) {
        return this.getPermBuilder({
            update: "channeladdperm",
            remove: "channeldelperm",
            allowSkipNegate: false,
            context: { cid }
        });
    }
    /** creates a channel group perm builder for the specified channel group id */
    createChannelGroupPermBuilder(cgid) {
        return this.getPermBuilder({
            update: "channelgroupaddperm",
            remove: "channelgroupdelperm",
            context: { cgid }
        });
    }
    /** creates a servergroup perm builder for the specified server group id */
    createServerGroupPermBuilder(sgid) {
        return this.getPermBuilder({
            update: "servergroupaddperm",
            remove: "servergroupdelperm",
            context: { sgid }
        });
    }
    /** creates a client perm builder for the specified client database id */
    createClientPermBuilder(cldbid) {
        return this.getPermBuilder({
            update: "clientaddperm",
            remove: "clientdelperm",
            context: { cldbid }
        });
    }
    /**
     * checks if the server is subscribed to a specific event
     * @param event event name which was subscribed to
     * @param id context to check
     */
    isSubscribedToEvent(event, id) {
        return this.context.events.some(ev => {
            if (ev.event === event)
                return id ? id === ev.id : true;
            return false;
        });
    }
    /**
     * filters an array with given filter
     * @param array the array which should get filtered
     * @param filter filter object
     */
    static filter(array, filter) {
        if (!Array.isArray(array))
            array = [array];
        if (Object.keys(filter).length === 0)
            return array;
        return array.filter(entry => Object.keys(filter).every(key => {
            if (filter[key] === undefined)
                return false;
            if (!Object.keys(entry).includes(key))
                return false;
            //@ts-ignore
            if (filter[key] instanceof RegExp)
                return filter[key].test(entry[key]);
            if (Array.isArray(filter[key])) {
                if (Array.isArray(entry[key])) {
                    //@ts-ignore
                    return filter[key].every((e) => entry[key].includes(e));
                }
                else {
                    //@ts-ignore
                    return filter[key].includes(entry[key]);
                }
            }
            else if (Array.isArray(entry[key])) {
                //@ts-ignore
                return entry[key].includes(filter[key]);
            }
            else {
                switch (typeof entry[key]) {
                    //@ts-ignore
                    case "number": return entry[key] === parseFloat(filter[key]);
                    case "string": return entry[key] === filter[key];
                    default: return false;
                }
            }
        }));
    }
    /**
     * Transforms an Input to an Array
     * @param input input data which should be converted to an array
     */
    static toArray(input) {
        if (typeof input === "undefined" || input === null)
            return [];
        if (!Array.isArray(input))
            return [input];
        return input;
    }
    /**
     * retrieves the first element of an array
     * @param input the response input
     */
    static singleResponse(input) {
        if (!Array.isArray(input))
            return input;
        return input[0];
    }
}
exports.TeamSpeak = TeamSpeak;
(function (TeamSpeak) {
    let QueryProtocol;
    (function (QueryProtocol) {
        QueryProtocol["RAW"] = "raw";
        QueryProtocol["SSH"] = "ssh";
    })(QueryProtocol = TeamSpeak.QueryProtocol || (TeamSpeak.QueryProtocol = {}));
})(TeamSpeak = exports.TeamSpeak || (exports.TeamSpeak = {}));
exports.QueryProtocol = TeamSpeak.QueryProtocol;
//# sourceMappingURL=TeamSpeak.js.map