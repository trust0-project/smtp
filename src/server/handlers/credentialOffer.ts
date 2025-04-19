import { pipe } from "it-pipe";
import { CredentialOfferRequestMessage, Network } from "@trust0/node";
import { IncomingStreamData } from "@libp2p/interface";

async function credentialOfferHandle(
  data: IncomingStreamData,
  network: Network
) {
  const { stream } = data;
  await pipe(stream, async (source) => {
    for await (const msg of source) {
      const message = await network.unpackMessage(msg.subarray());
      const offerRequestMessage = await CredentialOfferRequestMessage.fromJSON(
        message
      );
      //Create an offer for SD-JWT vs previous Anoncreds
      // const credentialOffer = CredentialOffer.create({
      //   schemaId: schemaId,
      //   credentialDefinitionId: credentialDefinitionId,
      //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      //   keyCorrectnessProof: credentialDefinition?.keyCorrectnessProof!,
      // });
      // const fromOfferIssuer = network.peerdid.toString();
      // const toOfferHolder = message.from!;
      // const offerMessage = offerRequestMessage.respond({
      //   from: fromOfferIssuer,
      //   to: [toOfferHolder],
      //   body: credentialOffer.toJson(),
      // });
      // const encryptedOffer = await network.packMessage(
      //   fromOfferIssuer,
      //   toOfferHolder,
      //   offerMessage.message
      // );
      // await network.sendMessage(
      //   connection.remoteAddr,
      //   network.getServiceProtocol(PROTOCOLS.credentialOffer),
      //   encryptedOffer
      // );
    }
  });
  await stream.close();
}

export function createCredentialOfferHandler(network: any /* Network */) {
  return (data: any /* IncomingStreamData */) => credentialOfferHandle(data, network);
}
