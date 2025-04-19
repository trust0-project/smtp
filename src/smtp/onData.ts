import { simpleParser } from "mailparser";
import { SMTPServerDataStream, SMTPServerSession } from "smtp-server";
import { peerIdFromString } from "@libp2p/peer-id";

import { AccountArray } from "../server/account";
import { AKEY,  } from "../types";
import { ExchangeDeliveryMessage, getPeerIDDID, Network, PROTOCOLS } from "@trust0/node";
import { v4 as uuidv4 } from 'uuid';

async function onData(
  stream: SMTPServerDataStream,
  accounts: AccountArray,
  network: Network
) {
  const mail = await simpleParser(stream, {});
  const peers = accounts.filter((account) => {
    if (Array.isArray(mail.to)) {
      return mail.to.find(({ value }) =>
        value.find(({ address }) => address === account[2])
      );
    } else {
      return mail.to?.value.find(({ address }) => address === account[2]);
    }
  });
  if (!peers.length) {
    throw new Error("No peers to deliver the email, rejecting.");
  }
  for (const [index, peer] of peers.entries()) {
    try {
      const issuer = await network.getDID();
      const holder = peer[AKEY.PEERDID];
      const emailMessage = await ExchangeDeliveryMessage.fromJSON({
        thid: uuidv4(),
        from: issuer,
        to: holder,
        body: mail,
      });
      const encryptedEmail = await network.packMessage(emailMessage);
      const peerId = peerIdFromString(peer[AKEY.PEERID]);
      await network.sendMessage(
        peerId,
        network.getServiceProtocol(PROTOCOLS.emailExchangeDelivery),
        encryptedEmail
      );
    } catch (err) {
      accounts.splice(index, 1);
      console.log("Failed to deliver email", err);
    }
  }
}

export function createOnData(accounts: AccountArray, network: Network) {
  return (
    stream: SMTPServerDataStream,
    _session: SMTPServerSession,
    callback: (err?: Error | null | undefined) => void
  ) => {
    onData(stream, accounts, network)
      .then(() => {
        return callback();
      })
      .catch((err) => {
        return callback(err as Error);
      });
    return callback();
  };
}
