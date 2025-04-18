import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import { inMemory, resolveRelayAddressFromDIDWEB } from "./shared";
import { getResolver } from 'web-did-resolver';
import { Resolver } from "did-resolver";
import { Server } from "./server/index.js";
import SDK from '@hyperledger/identus-edge-agent-sdk';
import { ExportableEd25519PrivateKey, ExportableEd25519PublicKey } from "./core";

(async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  if (
    !process.env.HOST_PK ||
    !process.env.HOST_PU) {
    throw new Error("Please provide host ed25519keypair using HOST_PK and HOST_PU both as raw hex")
  }
  if (!process.env.HOST_RELAYS) {
    throw new Error("Please provide a list of relay didweb in HOST_RELAYS split by comma.")
  }
  const relays = process.env.HOST_RELAYS.split(",").map((value) => value.trim())
  if (relays.length <= 0) {
    throw new Error("No HOST_RELAYS have been provided, the user will not be able to communicate outside.")
  }
  const didResolver = new Resolver(await getResolver());
  const ed25519KeyPair: SDK.Domain.KeyPair = {
    curve: SDK.Domain.Curve.ED25519,
    privateKey: new ExportableEd25519PrivateKey(
      Buffer.from(
        process.env.HOST_PK,
        "hex"
      )
    ),
    publicKey: new ExportableEd25519PublicKey(
      Buffer.from(
        process.env.HOST_PU,
        "hex"
      )
    ),
  };
  const server = await Server.create({
    key: fs.readFileSync(process.env.SSL_KEY_PATH ?? path.resolve(__dirname, "ssl/key.pem")),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH ?? path.resolve(__dirname, "ssl/cert.pem")),
    domain: "djack.email",
    mail: {
      secure: false,
      port: parseInt(process.env.MAILPORT || `${587}`),
    },
    storage: inMemory,
    p2p: {
      keyPair: ed25519KeyPair,
    },
  });
  await server.start();
  const apollo = new SDK.Apollo();
  const castor = new SDK.Castor(apollo);
  await relays.map((didWeb) => {
    resolveRelayAddressFromDIDWEB(didWeb, didResolver.resolve, castor.resolveDID)
  })
  server.network.addEventListener("self:peer:update", (evt:any) => {
    const addresses = server.network.getMultiaddrs();
    addresses.forEach((address:any) => {
      console.log(`Advertising with a relay address of ${address.toString()}`);
    });
  });
})();
