import SDK from '@hyperledger/identus-edge-agent-sdk';
import { AbstractExportingKey, ExportFormats } from '../types';

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
  