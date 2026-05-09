"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Player = {
  id: number;
  telegram_id: number;
  rank: number;
  role: string;
  mains: string;
};

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("players")
        .select("*")
        .order("rank", { ascending: false });

      if (data) setPlayers(data);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl mb-4">🏆 Players</h1>

      <div className="flex flex-col gap-3">
        {players.length === 0 && (
          <p className="text-gray-400">Нет игроков</p>
        )}

        {players.map((p) => (
          <div key={p.id} className="p-4 bg-gray-800 rounded-xl">
            <p>🆔 {p.telegram_id}</p>
            <p>🏆 Rank: {p.rank}</p>
            <p>🎭 Role: {p.role}</p>
            <p>🎮 Mains: {p.mains}</p>
          </div>
        ))}
      </div>
    </div>
  );
}