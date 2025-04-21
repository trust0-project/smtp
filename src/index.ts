import fs from "fs";
import path from "path";
import SDK from '@hyperledger/identus-edge-agent-sdk';
import dotenv from "dotenv";

//@ts-ignore
import { ExportableEd25519PrivateKey, ExportableEd25519PublicKey, inMemory } from "@trust0/node";
import { HOST_PK, HOST_SK, SSL_KEY_PATH, SSL_CERT_PATH, MAIL_PORT } from "./Config";
import { Server } from "./server/index.js";


dotenv.config();

(async () => {
  const __dirname = process.cwd();
  if (!HOST_PK || !HOST_SK) {
    throw new Error("Please provide host ed25519keypair using HOST_PK and HOST_SK both as raw hex")
  }
  const ed25519KeyPair: SDK.Domain.KeyPair = {
    curve: SDK.Domain.Curve.ED25519,
    privateKey: new ExportableEd25519PrivateKey(
      Buffer.from(
        HOST_SK,
        "hex"
      )
    ),
    publicKey: new ExportableEd25519PublicKey(
      Buffer.from(
        HOST_PK,
        "hex"
      )
    ),
  };
  const server = await Server.create({
    key: fs.readFileSync(SSL_KEY_PATH ?? path.resolve(__dirname, "certs/cert.pem")),
    cert: fs.readFileSync(SSL_CERT_PATH ?? path.resolve(__dirname, "certs/cert.pem")),
    domain: "djack.email",
    mail: {
      secure: false,
      port: parseInt(MAIL_PORT || `${587}`),
    },
    storage: inMemory,
    p2p: {
      keyPair: ed25519KeyPair,
    },
  });
  await server.start();
  server.node.addEventListener("self:peer:update", (evt:any) => {
    const addresses = server.node.getMultiaddrs();
    addresses.forEach((address:any) => {
      console.log(`Advertising with a relay address of ${address.toString()}`);
    });
  });
})();
