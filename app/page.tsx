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

// 🏅 определяем тир
function getTier(rank: number) {
  if (rank >= 3000) return "A - Мифик";
  if (rank >= 2000) return "B - Легенда";
  return "C - Эпик";
}

// 🎨 цвет карточки по рангу
function getBorder(rank: number) {
  if (rank >= 3000) return "border-yellow-400";
  if (rank >= 2000) return "border-blue-400";
  return "border-purple-500";
}

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const user = WebApp.initDataUnsafe?.user;

  // 📥 загрузка игроков (TOP-10)
  const loadPlayers = async () => {
    const { data } = await supabase
      .from("players")
      .select("*")
      .order("rank", { ascending: false })
      .limit(10);

    if (data) setPlayers(data);
  };

  // 👤 автосоздание профиля
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
      <h1 className="text-2xl font-bold text-purple-300 mb-6">
        🏆 Leaderboard
      </h1>

      {/* 🎴 Cards */}
      <div className="flex flex-col gap-3">

        {players.length === 0 ? (
          <p className="text-gray-400">Нет игроков</p>
        ) : (
          players.map((p, index) => (
            <div
              key={p.id}
              className={`p-5 rounded-2xl border ${getBorder(p.rank)} 
              bg-gradient-to-br from-purple-900/40 via-black to-purple-950 
              shadow-xl hover:scale-[1.02] transition`}
            >

              {/* 👑 TOP 1 */}
              {index === 0 && (
                <div className="text-yellow-300 font-bold mb-2">
                  👑 TOP 1
                </div>
              )}

              <p className="text-xs text-purple-300">
                🆔 {p.telegram_id}
              </p>

              <p className="text-xl font-bold text-purple-200">
                🏆 Rank: {p.rank}
              </p>

              <p className="text-purple-300">
                🏅 {getTier(p.rank)}
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