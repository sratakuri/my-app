"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import WebApp from "@twa-dev/sdk";

type Player = {
  id: number;
  telegram_id: number;
  rank: number;
  role: string;
  mains: string;
};

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);

  const user = WebApp.initDataUnsafe?.user;

  // 📦 загрузка игроков
  const loadPlayers = async () => {
    const { data } = await supabase
      .from("players")
      .select("*")
      .order("rank", { ascending: false })
      .limit(10);

    if (data) setPlayers(data);
  };

  // 👤 автопрофиль
  const createProfile = async () => {
    if (!user) return;

    await supabase.from("players").upsert({
      telegram_id: user.id,
      rank: 1000,
      role: "newbie",
      mains: "none",
    });
  };

  useEffect(() => {
    loadPlayers();
    createProfile();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      
      {/* 🏆 Header */}
      <h1 className="text-2xl font-bold text-purple-300 mb-4">
        🏆 Leaderboard
      </h1>

      {/* 🎴 Cards */}
      <div className="flex flex-col gap-3">
        {players.length === 0 ? (
          <p className="text-gray-400">Нет игроков</p>
        ) : (
          players.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl border border-purple-500/30 
              bg-gradient-to-br from-purple-900/50 via-black to-purple-950 
              shadow-xl hover:scale-[1.02] transition"
            >
              <p className="text-xs text-purple-300">
                🆔 {p.telegram_id}
              </p>

              <p className="text-xl font-bold text-purple-200">
                🏆 Rank: {p.rank}
              </p>

              <p className="text-purple-300">
                🎭 Role: {p.role}
              </p>

              <p className="text-purple-300">
                🎮 Mains: {p.mains}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}