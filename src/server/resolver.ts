import { ExportFormats, AbstractExportingKey, Network } from "@trust0/node";
import SDK from '@hyperledger/identus-edge-agent-sdk';

export async function resolveLocalDIDWEB(network: Network, did: string) {
  const privateKeyRecords = await network.storage.store.findKeysByDID({ did: did });
  const records = privateKeyRecords.filter((record: any) => (record as unknown as AbstractExportingKey).canExport()) as unknown as AbstractExportingKey[]
  if (records.length <= 0) {
    throw new Error("NOT FOUND");
  }
  const domainDID = `did:web:${network.didWebHostname}:peers:${network.p2p.peerId.toString()}`;
  const authentication: string[] = [];
  const keyAgreement: string[] = [];
  const assertionMethod: string[] = [];
  const verificationMethods: any[] = [];
  records.forEach((record, index) => {
    const JWK = record.export(ExportFormats.JWK);
    if (record.type === SDK.Domain.KeyTypes.EC) {
      if (record.isCurve(SDK.Domain.Curve.ED25519)) {
        authentication.push(`${domainDID}#key-${index}`);
        assertionMethod.push(`${domainDID}#key-${index}`);
        verificationMethods.push({
          id: `${domainDID}#key-${index}`,
          type: "JsonWebKey2020",
          controller: domainDID,
          publicKeyJwk: JSON.parse(Buffer.from(JWK).toString()),
        });
      }
    } else if (record.type === SDK.Domain.KeyTypes.Curve25519) {
      if (record.isCurve(SDK.Domain.Curve.X25519)) {
        keyAgreement.push(`${domainDID}#key-${index}`);
        verificationMethods.push({
          id: `${domainDID}#key-${index}`,
          type: "JsonWebKey2020",
          controller: domainDID,
          publicKeyJwk: JSON.parse(Buffer.from(JWK).toString()),
        });
      }
    }
  });
  const services: SDK.Domain.Service[] = [ ];
  return {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/jws-2020/v1",
    ],
    id: domainDID,
    verificationMethod: verificationMethods,
    authentication: authentication,
    assertionMethod: assertionMethod,
    keyAgreement: assertionMethod,
    services: services,
  };
}
