import { api } from '@/lib/axios';

export interface College {
  id: string;
  name: string;
  domain: string;
}

export const collegesApi = {
  list: async (): Promise<College[]> => {
    const { data } = await api.get<College[]>('/colleges');
    return data;
  },
};