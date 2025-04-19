import SDK from '@hyperledger/identus-edge-agent-sdk';
import { PROTOCOLS } from '../types';

const apollo = new SDK.Apollo();
const castor = new SDK.Castor(apollo);


const protocolDomain = "https://djack.email";


export function fromDIDCOMMType(type: string) {
  const convertProtocol = type.replace(protocolDomain, "");
  const protocolValue =
    Object.keys(PROTOCOLS)[
    Object.values(PROTOCOLS).findIndex((value) => value === convertProtocol)
    ];
  if (protocolValue in PROTOCOLS) {
    console.log(`Protocol from JSON ${protocolValue}`);
    return protocolValue as PROTOCOLS;
  }
  throw new Error(`Invalid protocol ${convertProtocol}`);
}

export function toDIDCOMMType(protocol: PROTOCOLS) {
  return `${protocolDomain}${protocol}`;
}
