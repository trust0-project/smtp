import fs from "fs";
import path from "path";
import { inMemory } from "./shared";
import { Server } from "./server/index.js";
import SDK from '@hyperledger/identus-edge-agent-sdk';
import { ExportableEd25519PrivateKey, ExportableEd25519PublicKey } from "./core";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const __dirname = process.cwd();
  if (
    !process.env.HOST_PK ||
    !process.env.HOST_PU) {
    throw new Error("Please provide host ed25519keypair using HOST_PK and HOST_PU both as raw hex")
  }
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
    key: fs.readFileSync(process.env.SSL_KEY_PATH ?? path.resolve(__dirname, "certs/cert.pem")),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH ?? path.resolve(__dirname, "certa/cert.pem")),
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
  server.node.addEventListener("self:peer:update", (evt:any) => {
    const addresses = server.node.getMultiaddrs();
    addresses.forEach((address:any) => {
      console.log(`Advertising with a relay address of ${address.toString()}`);
    });
  });
})();
