
import SDK from '@hyperledger/identus-edge-agent-sdk';
const registryData = {
  credentialSchemas: [] as any,
  credentialDefinitions: [] as any,
  credentialOffers: [] as any,
};

export class Registry {
  async fetchCredentialOffer(credentialOfferId: string) {
    const found = registryData.credentialOffers.find((schema: any) => true);
    if (found) {
      const message = SDK.Domain.Message.fromJson(found.credentialOffer);
      return SDK.OfferCredential.fromMessage(message);
    }
    return undefined;
  }
  

  async addCredentialOffer(id: string, offer: SDK.OfferCredential) {
    registryData.credentialOffers.push({
      id,
      credentialOffer: JSON.stringify(offer),
    });
  }
}

export const registry = new Registry();
