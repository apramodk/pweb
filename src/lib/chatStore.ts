import { supabase } from './supabase';
import type { Trace } from './agent';

export type Msg = { role: 'user' | 'assistant'; content: string; trace?: Trace };
export type Chat = { id: string; title: string; messages: Msg[]; updated: number };

export interface ChatStore {
    list(): Promise<Chat[]>;
    save(chat: Chat): Promise<void>;
    remove(id: string): Promise<void>;
}

const KEY = 'pweb-chats';

export const localStore: ChatStore = {
    async list() {
        try {
            return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Chat[];
        } catch {
            return [];
        }
    },
    async save(chat) {
        const all = (await this.list()).filter((c) => c.id !== chat.id);
        all.unshift(chat);
        all.sort((a, b) => b.updated - a.updated);
        localStorage.setItem(KEY, JSON.stringify(all));
    },
    async remove(id) {
        const all = (await this.list()).filter((c) => c.id !== id);
        localStorage.setItem(KEY, JSON.stringify(all));
    }
};

export function remoteStore(): ChatStore {
    return {
        async list() {
            const { data } = await supabase
                .from('chats')
                .select('id,title,messages,updated_at')
                .order('updated_at', { ascending: false });
            return (data ?? []).map((r) => ({
                id: r.id as string,
                title: r.title as string,
                messages: (r.messages ?? []) as Msg[],
                updated: new Date(r.updated_at as string).getTime()
            }));
        },
        async save(chat) {
            await supabase.from('chats').upsert({
                id: chat.id,
                title: chat.title,
                messages: chat.messages,
                updated_at: new Date(chat.updated).toISOString()
            });
        },
        async remove(id) {
            await supabase.from('chats').delete().eq('id', id);
        }
    };
}
