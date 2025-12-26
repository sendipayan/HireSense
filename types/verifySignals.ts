export type VerificationSignals = {
  dns: {
    domain: string;
    exists: boolean;
    hasMx: boolean;
    freeDomain: boolean;
  };

  website: {
    reachable: boolean;
    real: boolean;
  };

  linkedinRecruiter: {
    valid: boolean;
    accessible: boolean;
  };

  linkedinCompany: {
    valid: boolean;
    accessible: boolean;
  };

  registry: {
    registered: boolean;
  };

  emailVerified: boolean;
};
