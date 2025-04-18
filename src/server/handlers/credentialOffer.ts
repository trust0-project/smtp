import { pipe } from "it-pipe";


async function credentialOfferHandle(
  data: any /* IncomingStreamData */,
  network: any /* Network */
) {
  const { stream } = data;
  await pipe(stream, async (source) => {
    for await (const msg of source) {
      // const message = await network.unpack(msg.subarray());

      // const offerRequestMessage = await CredentialOfferRequestMessage.fromJSON(
      //   message.as_value()
      // );

      // const credentialOffer = CredentialOffer.create({
      //   schemaId: schemaId,
      //   credentialDefinitionId: credentialDefinitionId,
      //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      //   keyCorrectnessProof: credentialDefinition?.keyCorrectnessProof!,
      // });

      // const fromOfferIssuer = network.peerdid.toString();
      // // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      // const toOfferHolder = message.as_value().from!;

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
