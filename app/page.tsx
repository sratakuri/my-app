"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Play, Swords, Trophy, Crown } from "lucide-react";

type Player = {
  id: number;
  telegram_id: number;
  rank: number;
  role: string;
  mains: string;
};

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 📱 Telegram safe init
  useEffect(() => {
    const init = async () => {
      if (typeof window !== "undefined") {
        const WebApp = (await import("@twa-dev/sdk")).default;
        setUser(WebApp.initDataUnsafe?.user || null);
      }
    };
    init();
  }, []);

  // 📦 load leaderboard
  const loadPlayers = async () => {
    const { data } = await supabase
      .from("players")
      .select("*")
      .order("rank", { ascending: false })
      .limit(10);

    if (data) setPlayers(data);
  };

  // 👤 auto profile
  const createProfile = async (tgUser: any) => {
    if (!tgUser) return;

    await supabase.from("players").upsert({
      telegram_id: tgUser.id,
      rank: 1000,
      role: "rookie",
      mains: "none",
    });
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  useEffect(() => {
    if (user) createProfile(user);
  }, [user]);

  // 🎮 join queue
  const joinQueue = async () => {
    if (!user) return;

    setLoading(true);

    const newPlayer = {
      telegram_id: user.id,
      rank: 1000,
      role: "player",
      mains: "none",
    };

    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("telegram_id", user.id)
      .single();

    if (data) {
      setQueue((q) => [...q, data]);
    }

    setLoading(false);
  };

  // ⚔️ simulate match
  const startMatch = async () => {
    if (queue.length < 2) return;

    const p1 = queue[0];
    const p2 = queue[1];

    const winner = Math.random() > 0.5 ? p1 : p2;
    const loser = winner.id === p1.id ? p2 : p1;

    // update ranks
    await supabase
      .from("players")
      .update({ rank: winner.rank + 50 })
      .eq("id", winner.id);

    await supabase
      .from("players")
      .update({ rank: loser.rank - 30 })
      .eq("id", loser.id);

    setQueue([]);
    loadPlayers();
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <h1 className="text-3xl font-bold text-purple-300 flex items-center gap-2 mb-4">
        <Trophy /> ARENA
      </h1>

      {/* PLAY BUTTON */}
      <button
        onClick={joinQueue}
        className="bg-purple-600 hover:bg-purple-500 px-5 py-3 rounded-xl flex items-center gap-2 mb-4"
      >
        <Play /> Play
      </button>

      {/* START MATCH */}
      <button
        onClick={startMatch}
        className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-xl flex items-center gap-2 mb-6"
      >
        <Swords /> Start Match
      </button>

      {/* QUEUE */}
      <div className="mb-6">
        <h2 className="text-purple-300 mb-2">⚔️ Queue</h2>

        {queue.length === 0 ? (
          <p className="text-gray-400">empty</p>
        ) : (
          queue.map((q) => (
            <div key={q.id} className="p-2 bg-purple-900/30 rounded mb-1">
              {q.telegram_id}
            </div>
          ))
        )}
      </div>

      {/* LEADERBOARD */}
      <h2 className="text-purple-300 mb-2">🏆 Leaderboard</h2>

      <div className="flex flex-col gap-3">
        {players.map((p, i) => (
          <div
            key={p.id}
            className="p-4 rounded-xl bg-white/5 border border-purple-500/30"
          >
            {i === 0 && (
              <div className="text-yellow-300 flex items-center gap-1">
                <Crown size={16} /> TOP 1
              </div>
            )}

            <div>ID: {p.telegram_id}</div>
            <div>Rank: {p.rank}</div>
          </div>
        ))}
      </div>

    </div>
  );
}