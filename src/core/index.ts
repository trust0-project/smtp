import SDK from '@hyperledger/identus-edge-agent-sdk';
import type { PeerId } from "@libp2p/interface-peer-id";
import { privateKeyFromRaw } from "@libp2p/crypto/keys";
import { peerIdFromPrivateKey } from "@libp2p/peer-id";

const apollo = new SDK.Apollo();
const castor = new SDK.Castor(apollo);

export class DIDFactory implements DIDFactoryAbstract {
  apollo = apollo;
  castor = castor;
  
  constructor(
    public storage: StorageInterface,
  ) {}

  async createPeerDID(services: SDK.Domain.Service[] = []) {
    const edPrivate = await apollo.createPrivateKey({
      type: SDK.Domain.KeyTypes.EC,
      curve: SDK.Domain.Curve.ED25519,
    })
    const edKeyPair: SDK.Domain.KeyPair = {
      curve: SDK.Domain.Curve.ED25519,
      privateKey: edPrivate,
      publicKey: edPrivate.publicKey(),
    };
    const x25519Private = await apollo.createPrivateKey({
      type: SDK.Domain.KeyTypes.EC,
      curve: SDK.Domain.Curve.ED25519,
    })
    const xKeyPair: SDK.Domain.KeyPair = {
      curve: SDK.Domain.Curve.X25519,
      privateKey: x25519Private,
      publicKey: x25519Private.publicKey(),
    }
    const keyPairs = [edKeyPair, xKeyPair];
    const publicKeys = keyPairs.map((keyPair) => keyPair.publicKey);
    const privateKeys = keyPairs.map((keyPair) => keyPair.privateKey);
    const did = await this.castor.createPeerDID(publicKeys, services);
    const ed = privateKeyFromRaw(
      Buffer.concat([edKeyPair.privateKey.raw, edKeyPair.publicKey.raw])
    ) 
    const peerId = peerIdFromPrivateKey(ed) as unknown as PeerId
    for (const priv of privateKeys) {
      await this.storage.store.addDIDKey(did, peerId, priv);
    }
    return did;
  }

  async createPeerDIDWithKeys(keyPair: SDK.Domain.KeyPair, services: SDK.Domain.Service[] = []) {
    const {publicKey: pk, privateKey: sk} = keyPair;
    const did = await this.castor.createPeerDID([pk], services);
    const ed = privateKeyFromRaw(Buffer.concat([sk.raw, pk.raw]))
    const peerId = peerIdFromPrivateKey(ed) as unknown as PeerId
    await this.storage.store.addDIDKey(did, peerId, sk);
    return did;
  }
}


export abstract class AbstractStore {
  abstract findKeysByDID(search?: {
    did?: string | string[];
    peerId?: string | string[];
  }): Promise<SDK.Domain.PrivateKey[]>;
  abstract addDIDKey(did: SDK.Domain.DID, peerId: PeerId, key: SDK.Domain.PrivateKey): Promise<void>;
  abstract findAllDIDs(): Promise<SDK.PeerDID[]>;
}
export type StorageInterface = { store: AbstractStore };

export enum ExportFormats {
  JWK = "JWK",
}
export abstract class DIDFactoryAbstract {
   abstract  apollo: SDK.Apollo;
   abstract  castor: SDK.Domain.Castor;
  abstract createPeerDID(services: SDK.Domain.Service[]): Promise<SDK.Domain.DID>;
  abstract createPeerDIDWithKeys(keyPair: SDK.Domain.KeyPair, services: SDK.Domain.Service[]): Promise<SDK.Domain.DID>;
}

export enum PROTOCOLS {
  emailExchangeAuthenticate = "/email-exchange/v1/authenticate",
  emailExchangePresentation = "/email-exchange/v1/present-proof/3.0/presentation",
  emailExchangePresentationRequest = "/email-exchange/v1/present-proof/3.0/request-presentation",
  emailExchangeDelivery = "/email-exchange/v1/delivery",
  credentialOfferRequest = "/email-exchange/v1/issue-credential/3.0/offer-credential-request",
  credentialOffer = "/email-exchange/v1/issue-credential/3.0/offer-credential",
  credentialRequest = "/email-exchange/v1/issue-credential/3.0/request-credential",
  credentialIssue = "/email-exchange/v1/issue-credential/3.0/issue-credential",
}
export abstract class AbstractExportingKey extends SDK.Domain.Key {
  abstract export(format: ExportFormats): Uint8Array;
  abstract canExport(): this is AbstractExportingKey;
}

export class ExportableEd25519PublicKey extends SDK.Ed25519PublicKey implements AbstractExportingKey {
  canExport(): this is AbstractExportingKey {
    return "export" in this;
  }
  export(format: ExportFormats): Uint8Array {
    if (format === ExportFormats.JWK) {
      return Buffer.from(
        JSON.stringify({
          crv: this.curve,
          kty: "OKP",
          x: Buffer.from(this.getEncoded()).toString('base64url'),
        })
      );
    }
    throw new Error("Method not implemented.");
  }
}

export class ExportableEd25519PrivateKey extends SDK.Ed25519PrivateKey implements AbstractExportingKey {
  canExport(): this is AbstractExportingKey {
    return "export" in this;
  }
  export(format: ExportFormats): Uint8Array {
    if (format === ExportFormats.JWK) {
      return Buffer.from(
        JSON.stringify({
          crv: this.curve,
          kty: "OKP",
          x: Buffer.from(this.publicKey().getEncoded()).toString('base64url'),
          d: Buffer.from(this.getEncoded()).toString('base64url'),
        })
      );
    }
    throw new Error("Method not implemented.");
  }
}

export class ExportableX25519PublicKey extends SDK.X25519PublicKey implements AbstractExportingKey {
  canExport(): this is AbstractExportingKey {
    return "export" in this;
  }
  export(format: ExportFormats): Uint8Array {
    if (format === ExportFormats.JWK) {
      return Buffer.from(
        JSON.stringify({
          crv: this.curve,
          kty: "OKP",
          x: Buffer.from(this.getEncoded()).toString('base64url'),
        })
      );
    }
    throw new Error("Method not implemented.");
  }
}

export class ExportableX25519PrivateKey extends SDK.X25519PrivateKey implements AbstractExportingKey {
  canExport(): this is AbstractExportingKey {
    return "export" in this;
  }
  export(format: ExportFormats): Uint8Array {
    if (format === ExportFormats.JWK) {
      return Buffer.from(
        JSON.stringify({
          crv: this.curve,
          kty: "OKP",
          x: Buffer.from(this.publicKey().getEncoded()).toString('base64url'),
          d: Buffer.from(this.getEncoded()).toString('base64url'),
        })
      );
    }
    throw new Error("Method not implemented.");
  }
}