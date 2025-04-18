import { ParsedMail } from "mailparser";

import SDK from "@hyperledger/identus-edge-agent-sdk";
import { AbstractStore } from "./core";
export type onMailType = (mail: ParsedMail) => void | Promise<void>;
export type MailServerProps = {
  key?: Buffer;
  cert?: Buffer;
  secure?: boolean;
  port?: number;
};
export type ServerConstructorProps = {
  key?: Buffer;
  cert?: Buffer;
  domain: string;
  storage: AbstractStore;
  mail: MailServerProps;
  p2p: {
    keyPair?: SDK.Domain.KeyPair;
  };
};

export enum AKEY {
  DID,
  PEERDID,
  EMAIL,
  CREDENDITAL_DEFINITION_ID,
  CREDENTIAL_SCHEMA_ID,
  PEERID,
  STATE,
}

export type Account<
  ACCOUNT_DID = SDK.Domain.DID,
  PEERDID = SDK.Domain.DID,
  EMAIL = string,
  CredentialDefinitionId = string,
  CredentialSchemaId = string,
  PeerId = string
> = [
    ACCOUNT_DID,
    PEERDID,
    EMAIL,
    CredentialDefinitionId,
    CredentialSchemaId,
    PeerId
  ];
