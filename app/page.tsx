"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*");

      if (!error && data) {
        setPlayers(data);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl mb-4">🏆 Players</h1>

      {players.length === 0 ? (
        <p>Нет игроков</p>
      ) : (
        players.map((p) => (
          <div key={p.id} className="p-4 bg-gray-800 rounded-xl mb-3">
            <p>🆔 {p.telegram_id}</p>
            <p>🏆 Rank: {p.rank}</p>
            <p>🎭 Role: {p.role}</p>
            <p>🎮 Mains: {p.mains}</p>
          </div>
        ))
      )}
    </div>
  );
}