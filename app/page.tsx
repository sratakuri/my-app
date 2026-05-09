"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Crown, User, Swords, BadgeCheck } from "lucide-react";

type Player = {
  id: number;
  telegram_id: number;
  rank: number;
  role: string;
  mains: string;
};

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [user, setUser] = useState<any>(null);

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
      role: "newbie",
      mains: "none",
    });
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  useEffect(() => {
    if (user) createProfile(user);
  }, [user]);

  // 🏅 tier system
  function getTier(rank: number) {
    if (rank >= 3000) return "A - Мифик";
    if (rank >= 2000) return "B - Легенда";
    return "C - Эпик";
  }

  // 🎨 border colors
  function getBorder(rank: number) {
    if (rank >= 3000) return "border-yellow-400";
    if (rank >= 2000) return "border-blue-400";
    return "border-purple-500";
  }

  return (
    <div className="min-h-screen text-white p-6 bg-gradient-to-br from-black via-purple-950 to-black">

      {/* 🏆 HEADER */}
      <h1 className="text-3xl font-bold text-purple-300 mb-6">
        🏆 Leaderboard
      </h1>

      {/* 🎴 CARDS */}
      <div className="flex flex-col gap-3">

        {players.length === 0 ? (
          <p className="text-gray-400">Нет игроков</p>
        ) : (
          players.map((p, index) => (
            <div
              key={p.id}
              className={`p-5 rounded-2xl border ${getBorder(p.rank)}
              bg-white/5 backdrop-blur-md
              shadow-lg hover:scale-[1.02] transition`}
            >

              {/* 👑 TOP 1 */}
              {index === 0 && (
                <div className="flex items-center gap-2 text-yellow-300 font-bold mb-2">
                  <Crown size={18} />
                  TOP 1
                </div>
              )}

              <p className="flex items-center gap-2 text-purple-300 text-sm">
                <User size={14} />
                {p.telegram_id}
              </p>

              <p className="flex items-center gap-2 text-purple-200 font-bold text-lg mt-1">
                <BadgeCheck size={16} />
                Rank: {p.rank}
              </p>

              <p className="text-purple-300 mt-1">
                🏅 {getTier(p.rank)}
              </p>

              <p className="flex items-center gap-2 text-purple-300 mt-1">
                <Swords size={14} />
                Role: {p.role}
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