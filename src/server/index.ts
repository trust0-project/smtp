import { SMTPServer } from "smtp-server";
import { buildConfig, createNode, NodeServices } from '@trust0/node';
import { Libp2p } from '@libp2p/interface';

import { StorageManager,  Network , PROTOCOLS} from "@trust0/node";
import { registry, Registry } from "../registry";
import {  MailServerProps,  ServerConstructorProps } from "../types";
import {  createOnData } from "../smtp/onData";
import { createOnRcptTo } from "../smtp/onRcptTo";
import { createCredentialOfferHandler } from "./handlers/credentialOffer";
import { createCredentialIssueHandler } from "./handlers/credentialIssue";
import { createExchangeDelivery } from "./handlers/exchangeDelivery";
import HTTP from "../http";
import { createDIDRoute } from "../http/routes/did";
import { AccountArray } from "./account";

export class Server {
  private abortController;
  private instance: SMTPServer;
  public accounts = new AccountArray();

  static async create(options: ServerConstructorProps) {
    const storage = new StorageManager(options.storage);

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
      },
      sk: options.p2p.keyPair ? 
        Buffer.from(options.p2p.keyPair.privateKey.raw).toString('hex') : 
        undefined,
    });

    const { libp2p: node } = await createNode({
      ...config,
      websockets: {
        server: http.server,
        ws: http.websocket._opts
      }
    });

    options.mail.cert = options.cert;
    options.mail.key = options.key;


    return new Server(node, options.mail, storage, registry);
  }

  constructor(
    public node: Libp2p<NodeServices>,
    private mail: MailServerProps,
    public storage: StorageManager,
    private registry: Registry,
  ) {
    this.abortController = new AbortController();
    
    const network = new Network(this.storage, 'todo', this.node, this.abortController);
   
    this.instance = new SMTPServer({
      ...mail,
      authOptional: true,
      onRcptTo: createOnRcptTo(this.accounts, network, this.registry),
      onData: createOnData(this.accounts, network),
    });

    this.instance.on("error", (err) => {
      console.error("SMTP Server Error:", err);
    });

    network.p2p.handle(
      PROTOCOLS.credentialOfferRequest,
      createCredentialOfferHandler(network)
    );

    network.p2p.handle(
      PROTOCOLS.credentialIssue,
      createCredentialIssueHandler(network, this.accounts)
    );

    network.p2p.handle(
      PROTOCOLS.emailExchangeDelivery,
      createExchangeDelivery(network, this.accounts)
    );
  }

  public getServiceProtocol(protocol: PROTOCOLS) {
    //TODO, HASH DOMAIN, option 1 with the node pubKey encoded or just sha512 it or something
    return `/service/djack.email${protocol}`;
  }

  async start() {
    if (this.abortController.signal.aborted) {
      this.abortController = new AbortController();
    }
    const { port } = this.mail;
    await this.instance.listen(port);
    await this.node.start();
  }
}
