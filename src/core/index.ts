import SDK from '@hyperledger/identus-edge-agent-sdk';
import type { PeerId } from "@libp2p/interface-peer-id";

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