import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { supabase } from '../lib/supabase';
import { XP_REWARDS } from '../lib/constants';
import { useCharacterStore } from './useCharacterStore';
import { useUiStore } from './useUiStore';
import { useAchievementsStore } from './useAchievementsStore';

export const useContentStore = create(
  persist(
    (set, get) => ({
      posts: [], // { id, date, platform, format, title, body, status, xpEarned }

      addPost: ({ date, platform = 'telegram', format = 'post', title = '', body = '' }) => {
        const post = { id: nanoid(), date, platform, format, title, body, status: 'idea', xpEarned: false, createdAt: Date.now() };
        set((s) => ({ posts: [post, ...s.posts] }));
        get()._sync(post);
      },

      updatePost: (id, patch) => {
        set((s) => ({ posts: s.posts.map((p) => p.id === id ? { ...p, ...patch } : p) }));
        const post = get().posts.find((p) => p.id === id);
        if (post) get()._sync(post);
      },

      publishPost: (id) => {
        const post = get().posts.find((p) => p.id === id);
        if (!post || post.xpEarned) return;

        const xp = post.format === 'reel' || post.format === 'short' || post.format === 'video'
          ? XP_REWARDS.POST_REEL
          : post.format === 'story' ? XP_REWARDS.POST_STORY
          : XP_REWARDS.POST_TELEGRAM;

        const result = useCharacterStore.getState().addXp(xp, 'discipline');
        useUiStore.getState().showXpPopup(result.amount, result.multiplier);
        if (result.leveledUp) useUiStore.getState().showLevelUp(result.newLevel, result.newRank);

        const published = { ...post, status: 'published', xpEarned: true };
        set((s) => ({ posts: s.posts.map((p) => p.id === id ? published : p) }));
        get()._sync(published);

        const publishedCount = get().posts.filter((p) => p.status === 'published').length;
        useAchievementsStore.getState().checkContent(publishedCount);
      },

      deletePost: (id) => set((s) => ({ posts: s.posts.filter((p) => p.id !== id) })),

      _sync: async (post) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        await supabase.from('v2_content_posts').upsert({ ...post, user_id: session.user.id });
      },
    }),
    { name: 'sss.content.v2' }
  )
);
