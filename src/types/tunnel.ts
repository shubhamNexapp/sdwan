export interface Tunnel {
  id: string;
  name: string;
  local: string[];
  remote: string[];
  enabled: "0" | "1";
  connected: boolean;
}

// export interface IpsecTunnel {
//   id: string;
//   name: string;
//   local: string[];
//   remote: string[];
//   enabled: "0" | "1";
//   connected: boolean;
// }

export interface SubnetEntry {
  local_subnet: string;
  remote_subnet: string;
}

// export interface IpsecTunnel {
//   id: string;
//   name: string;
//   local: string[];
//   remote: { ip: string }[];
//   enabled: "0" | "1";
//   connected: boolean;
//   dpdaction: string;
//   service: 'enable' | 'disable';
//   subnet: SubnetEntry[];

// }

export interface IpsecTunnel {
  id: string;
  name: string;
  local: string[];
  remote: string[];
  enabled: "0" | "1";
  connected: boolean;
  dpdaction?: string;
  service?: string;
  subnetts_plugin?: string;
  subnet?: {
    local_subnet: string;
    remote_subnet: string;
  }[];
}


export interface ClientIPSecTunnel {
  ip: string;
  status: string;
  subnet: string;
}

