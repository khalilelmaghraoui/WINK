export type InvitePersistenceMode = "supabase" | "memory";

export interface InvitePersistenceEnvironment {
  nodeEnv?: string;
  vercel?: string;
  vercelEnv?: string;
  supabaseUrl?: string;
  serviceRoleKey?: string;
}

export class InvitePersistenceConfigurationError extends Error {
  readonly code = "INVITE_PERSISTENCE_NOT_CONFIGURED";
  readonly missingVariables: string[];

  constructor(missingVariables: string[]) {
    super(
      `Invite persistence is not configured for this runtime. Missing required server environment variables: ${missingVariables.join(
        ", "
      )}.`
    );
    this.name = "InvitePersistenceConfigurationError";
    this.missingVariables = missingVariables;
  }
}

export function readInvitePersistenceEnvironment(
  env: Partial<NodeJS.ProcessEnv> = process.env
): InvitePersistenceEnvironment {
  return {
    nodeEnv: env.NODE_ENV,
    vercel: env.VERCEL,
    vercelEnv: env.VERCEL_ENV,
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY
  };
}

export function resolveInvitePersistenceMode(
  environment: InvitePersistenceEnvironment
): InvitePersistenceMode {
  const missingVariables = getMissingSupabaseVariables(environment);

  if (missingVariables.length === 0) {
    return "supabase";
  }

  if (isLocalMemoryAllowed(environment)) {
    return "memory";
  }

  throw new InvitePersistenceConfigurationError(missingVariables);
}

export function isInvitePersistenceConfigurationError(
  error: unknown
): error is InvitePersistenceConfigurationError {
  return (
    error instanceof InvitePersistenceConfigurationError ||
    (typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "INVITE_PERSISTENCE_NOT_CONFIGURED")
  );
}

function getMissingSupabaseVariables(
  environment: InvitePersistenceEnvironment
): string[] {
  const missingVariables: string[] = [];

  if (!environment.supabaseUrl?.trim()) {
    missingVariables.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!environment.serviceRoleKey?.trim()) {
    missingVariables.push("SUPABASE_SERVICE_ROLE_KEY");
  }

  return missingVariables;
}

function isLocalMemoryAllowed(
  environment: InvitePersistenceEnvironment
): boolean {
  if (environment.nodeEnv?.trim() === "test") {
    return true;
  }

  const vercel = environment.vercel?.trim();
  const vercelEnv = environment.vercelEnv?.trim();
  const nodeEnv = environment.nodeEnv?.trim();

  if (vercel === "1" || vercelEnv === "preview" || vercelEnv === "production") {
    return false;
  }

  return nodeEnv !== "production";
}
