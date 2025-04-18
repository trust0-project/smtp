
import SDK from '@hyperledger/identus-edge-agent-sdk';
import { RIDB, SchemaFieldType } from '@trust0/ridb';
import createLevelDB from '@trust0/ridb-level';

const offerSchema = {
  version: 0 as const,
  primaryKey: 'id',
  type: SchemaFieldType.object,
  encrypted:['data'],
  properties: {
    id: {
      type: SchemaFieldType.string,
      maxLength: 60
    },
    data: {
      type: SchemaFieldType.string,
      maxLength: 60
    }
  }
} 

export class Registry {
  private _registry!: RIDB<{offer: typeof offerSchema}>;
  
  private async loadInstance() {
    const level = await createLevelDB();
    const db = new RIDB(
      {
        dbName: "ridb-registry",
        schemas: {
          offer: offerSchema
        } as const
      }
    )
    await db.start({
      storageType: level,
      password: "test"
    });
    return db
  }
  private async load() {
    this._registry ??= await this.loadInstance();
  }

  get registry() {
    if (!this._registry) {
      throw new Error("Registry not loaded");
    }
    return this._registry;
  }

  async fetchCredentialOffer(credentialOfferId: string) {
    await this.load();
    const found = await this.registry.collections.offer.findById(credentialOfferId)
    if (found) {
      const message = SDK.Domain.Message.fromJson(found.data);
      return SDK.OfferCredential.fromMessage(message);
    }
    return undefined;
  }

  async addCredentialOffer(id: string, offer: SDK.OfferCredential) {
    await this.load();
    await this.registry.collections.offer.create({
      id,
      data: JSON.stringify(offer),
    })
  }
}

export const registry = new Registry();
