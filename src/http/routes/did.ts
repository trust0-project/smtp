import { Request, Response } from "express";
import SDK from '@hyperledger/identus-edge-agent-sdk';
import { StorageInterface, AbstractExportingKey, ExportFormats } from "@trust0/node";

async function did(
  request: Request,
  response: Response,
  storage: StorageInterface,
  domain: string
) {
  const { peerId } = request.params;
  const privateKeyRecords = await storage.store.findKeysByDID({ peerId });
  const records = privateKeyRecords.filter((record) => (record as unknown as AbstractExportingKey).canExport()) as unknown as AbstractExportingKey[]
  const domainDID = `did:web:${domain}:peers:${peerId}`;
  if (records.length <= 0) {
    return response.status(404).json({ success: false });
  }
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
  const services: SDK.Domain.Service[] = [];
  return response.json({
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/jws-2020/v1",
    ],
    id: domainDID,
    verificationMethod: verificationMethods,
    authentication: authentication,
    assertionMethod: assertionMethod,
    keyAgreement: keyAgreement,
    service: services,
  });
}

export function createDIDRoute(storage: StorageInterface, domain: string) {
  return (request: Request, response: Response) => did(request, response, storage, domain);
}
