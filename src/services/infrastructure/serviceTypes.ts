
export const ServiceStateEnumeration = {
  Unknown: 0,
  Initialized: 1,
  Running: 2,
  Stopped: 3,
  Error: 4
} as const;
export type ServiceStateEnumeration = typeof ServiceStateEnumeration[keyof typeof ServiceStateEnumeration];

export interface IService {
  key: string;
  state: ServiceStateEnumeration;
  start: (serviceProvider?: IServiceProvider) => Promise<boolean>;
  stop: () => Promise<boolean>;
}

export interface IServiceProvider {
  addService: <T extends IService>(service: T, serviceKey: string) => void;
  getService: <T extends IService>(serviceKey: string) => T | undefined;
  startServices: () => Promise<boolean>;
  stopServices: () => Promise<boolean>;
}
