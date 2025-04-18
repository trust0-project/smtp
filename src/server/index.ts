import { SMTPServer } from "smtp-server";
import { StorageManager } from "../shared";

import { Libp2p } from '@libp2p/interface';

import { type PeerId } from "@libp2p/interface-peer-id";
import type { Multiaddr } from "@multiformats/multiaddr";
import { registry, Registry } from "../registry";
import { AKEY, MailServerProps, ServerConstructorProps } from "../types";

import { AccountArray } from "./account";
import { buildConfig, createNode, NodeServices } from '@trust0/node';
import {  DIDFactory, PROTOCOLS } from "../core";
import HTTP from "../http";
import { createDIDRoute } from "../http/routes/did";
import {  createOnData } from "../smtp/onData";
import { createOnRcptTo } from "../smtp/onRcptTo";
import { createCredentialOfferHandler } from "./handlers/credentialOffer";
import { createCredentialIssueHandler } from "./handlers/credentialIssue";
import { createExchangeDelivery } from "./handlers/exchangeDelivery";


export class Server {
  private abortController;
  private instance: SMTPServer;
  public accounts = new AccountArray();

  static async create(options: ServerConstructorProps) {
    const storage = new StorageManager(options.storage);
    const factory = new DIDFactory(storage);

    const http = HTTP.create({
      cert: options.cert,
      key: options.key,
      routes: [
        {
          method: "get",
          url: "/peers/:peerId/did.json",
          route: createDIDRoute(storage, options.domain),
        },
      ],
    });
    // TODO: Restore this?¿
    // http.enableStatic("../../frontend/out");
    const config = buildConfig({
      type: 'browser',
      addresses: {
        listen: ['/p2p-circuit', '/webrtc']
      }
    });
    const { libp2p: node } = await createNode(config);
    options.mail.cert = options.cert;
    options.mail.key = options.key;
    return new Server(node, options.mail, factory, storage, registry, http);
  }

  constructor(
    public network: Libp2p<NodeServices>,
    private mail: MailServerProps,
    private factory: DIDFactory,
    public storage: StorageManager,
    private registry: Registry,
    private http: HTTP
  ) {
    this.abortController = new AbortController();
    this.instance = new SMTPServer({
      ...mail,
      authOptional: true,
      onRcptTo: createOnRcptTo(this.accounts, network, this.registry),
      onData: createOnData(this.accounts, network),
    });

    this.instance.on("error", (err) => {
      console.error("SMTP Server Error:", err);
    });

    network.handle(
      PROTOCOLS.credentialOfferRequest,
      createCredentialOfferHandler(network)
    );

    network.handle(
      PROTOCOLS.credentialIssue,
      createCredentialIssueHandler(network, this.accounts)
    );

    network.handle(
      PROTOCOLS.emailExchangeDelivery,
      createExchangeDelivery(network, this.accounts)
    );
  }

  public getServiceProtocol(protocol: PROTOCOLS) {
    //TODO, HASH DOMAIN, option 1 with the node pubKey encoded or just sha512 it or something
    return `/service/djack.email${protocol}`;
  }

  async start() {
    this.abortController = new AbortController();

    const serviceProtocol = this.getServiceProtocol(
      PROTOCOLS.credentialOfferRequest
    );

    // this.network.addEventListener("peer:identify", ({ detail }) => {
    //   const listenerAddress = detail.listenAddrs;
    //   this.network.onPeerDiscovery!({
    //     id: detail.peerId,
    //     multiaddrs: listenerAddress,
    //     protocols: detail.protocols,
    //   });
    // });
    // this.network.onPeerDiscovery = this.onPeerDiscovery.bind(this);

    console.log("Registering protocol", serviceProtocol);
    // await this.network.register(serviceProtocol, {
    //   onDisconnect: this.onPeerDisconnected.bind(this),
    // });

    await this.network.start();
    return new Promise<void>((resolve, reject) => {
      try {
        const { port } = this.mail;
        this.instance.listen(port, () => {
          console.log("Email Server Started on port", port);
          return resolve();
        });
      } catch (err) {
        return reject(err);
      }
    });
  }

  async onPeerDisconnected(peer: PeerId) {
    const index = this.accounts.findIndex(
      (account) => account[AKEY.PEERID] !== peer.toString()
    );
    if (index >= 0) {
      this.accounts.splice(index, 1);
    }
  }

  async onPeerDiscovery({
    id,
    multiaddrs,
    protocols,
  }: {
    id: PeerId;
    multiaddrs: Multiaddr[];
    protocols: string[];
  }) {
    this.network.peerStore.save(id as any, { multiaddrs, protocols });
  }
}
