import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function RandomTeam({ onTeamsGenerated }) {
  const [participants, setParticipants] = useState("");
  const [prefix, setPrefix] = useState("WARPOINT");
  const [alert, setAlert] = useState("");
  const [preview, setPreview] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const shuffleArray = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const generateRandom = () => {
    const raw = participants.trim();
    if (!raw) {
      setAlert("Введите список участников!");
      return;
    }

    const list = raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length < 4) {
      setAlert(`Недостаточно участников (${list.length}). Минимум 4.`);
      return;
    }

    setAlert("");
    const shuffled = shuffleArray([...list]);
    const newTeams = [];
    let teamIndex = 1;

    while (shuffled.length >= 4) {
      const chunk = shuffled.splice(0, 4);
      const players = chunk.map((nick, i) => ({
        nick,
        fio: "",
        role: i === 0 ? "captain" : "player",
      }));
      newTeams.push({
        name: `${prefix} — Team ${teamIndex++}`,
        players,
      });
    }

    if (shuffled.length > 0 && newTeams.length > 0) {
      shuffled.forEach((nick) => {
        newTeams[newTeams.length - 1].players.push({
          nick,
          fio: "",
          role: "reserve",
        });
      });
    }

    setPreview(newTeams);
    setShowPreview(true);
  };

  const addToDashboard = async () => {
    for (const team of preview) {
      await supabase.from("teams").insert([team]);
    }
    setShowPreview(false);
    setParticipants("");
    onTeamsGenerated();
  };

  const regenerate = () => {
    generateRandom();
  };

  return (
    <>
      <div className="section-head">
        <h2>СЛУЧАЙНОЕ ФОРМИРОВАНИЕ</h2>
        <div className="line"></div>
      </div>

      <div className="panel">
        <div className="panel-title">// СПИСОК УЧАСТНИКОВ</div>
        <div className="field-group">
          <label>Введите имена / ники (каждый с новой строки)</label>
          <textarea
            rows={6}
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            placeholder="Игрок1&#10;Игрок2&#10;Игрок3&#10;..."
          />
        </div>
        <div className="field-group">
          <label>Префикс команды</label>
          <input
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="WARPOINT"
          />
        </div>
        {alert && <div className="alert">{alert}</div>}
        <button className="btn btn-primary" onClick={generateRandom}>
          ⟳ СФОРМИРОВАТЬ КОМАНДЫ
        </button>
      </div>

      {showPreview && preview.length > 0 && (
        <>
          <div className="section-head" style={{ marginTop: 24 }}>
            <h2>ПРЕДПРОСМОТР</h2>
            <div className="line"></div>
          </div>
          <div className="teams-grid">
            {preview.map((team, idx) => (
              <div key={idx} className="team-card">
                <div className="team-name">{team.name}</div>
                {team.players.map((p, pidx) => (
                  <div
                    key={pidx}
                    className={`player-row ${
                      p.role === "captain" ? "captain" : ""
                    }`}
                  >
                    <span
                      className={`player-badge ${
                        p.role === "captain"
                          ? "badge-cap"
                          : p.role === "reserve"
                          ? "badge-reserve"
                          : "badge-player"
                      }`}
                    >
                      {p.role === "captain"
                        ? "CAP"
                        : p.role === "reserve"
                        ? "RES"
                        : "MBR"}
                    </span>
                    <div className="player-info">
                      <div className="player-nick">{p.nick}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 24,
              flexWrap: "wrap",
            }}
          >
            <button className="btn btn-primary" onClick={addToDashboard}>
              ✓ ДОБАВИТЬ НА ДАШБОРД
            </button>
            <button className="btn btn-ghost" onClick={regenerate}>
              ⟳ ПЕРЕМЕШАТЬ ЗАНОВО
            </button>
          </div>
        </>
      )}
    </>
  );
}
