export interface MockUser {
  id: string;
  email?: string;
  user_metadata?: {
    eva_onboarding_started?: boolean;
    eva_onboarding_complete?: boolean;
    eva_profile?: any;
    [key: string]: any;
  };
}

export interface MockPost {
  id: string;
  store_id: string;
  title: string;
  cover_url: string;
  body: string;
  product_ids: string[];
  blocks?: any;
  status?: string;
  published_at?: string;
}

export interface MockStore {
  id: string;
  name: string;
}

export async function createClientServer() {
  return {
    auth: {
      getUser: async (): Promise<{ data: { user: MockUser | null }; error: null }> => ({
        data: { user: null },
        error: null,
      }),
    },
    from: (table: string) => ({
      select: (..._args: any[]) => ({
        eq: (..._eqArgs: any[]) => ({
          order: (..._orderArgs: any[]) => ({
            limit: async (..._limitArgs: any[]): Promise<{ data: any[]; error: null }> => ({
              data: [] as any[],
              error: null,
            }),
          }),
        }),
        in: async (..._inArgs: any[]): Promise<{ data: any[]; error: null }> => ({
          data: [] as any[],
          error: null,
        }),
      }),
    }),
  };
}
