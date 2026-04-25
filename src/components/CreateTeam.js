import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function CreateTeam({ onTeamCreated }) {
  const [name, setName] = useState("");
  const [players, setPlayers] = useState([
    { nick: "", fio: "", role: "captain" },
    { nick: "", fio: "", role: "player" },
    { nick: "", fio: "", role: "player" },
    { nick: "", fio: "", role: "player" },
    { nick: "", fio: "", role: "reserve" },
    { nick: "", fio: "", role: "reserve" },
  ]);
  const [alert, setAlert] = useState("");

  const updatePlayer = (index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    setPlayers(newPlayers);
  };

  const createTeam = async () => {
    if (!name.trim()) {
      setAlert("Введите название команды");
      return;
    }

    const mainPlayers = players.slice(0, 4).filter((p) => p.nick.trim());
    if (mainPlayers.length < 4) {
      setAlert("Заполните ники всех 4 основных игроков!");
      return;
    }

    setAlert("");
    const finalPlayers = players
      .filter((p) => p.nick.trim())
      .map((p) => ({
        ...p,
        nick: p.nick.trim(),
        fio: p.fio.trim(),
      }));

    await supabase
      .from("teams")
      .insert([{ name: name.trim(), players: finalPlayers }]);
    onTeamCreated();
    setName("");
    setPlayers([
      { nick: "", fio: "", role: "captain" },
      { nick: "", fio: "", role: "player" },
      { nick: "", fio: "", role: "player" },
      { nick: "", fio: "", role: "player" },
      { nick: "", fio: "", role: "reserve" },
      { nick: "", fio: "", role: "reserve" },
    ]);
  };

  const roles = [
    "КАПИТАН",
    "ИГРОК 1",
    "ИГРОК 2",
    "ИГРОК 3",
    "ЗАПАСНОЙ 1",
    "ЗАПАСНОЙ 2",
  ];

  return (
    <>
      <div className="section-head">
        <h2>СОЗДАТЬ КОМАНДУ ВРУЧНУЮ</h2>
        <div className="line"></div>
      </div>

      <div className="panel">
        <div className="panel-title">// ДАННЫЕ КОМАНДЫ</div>
        <div className="field-group">
          <label>Название команды</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ALPHA SQUAD"
          />
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">// ОСНОВНОЙ СОСТАВ (4 игрока)</div>
        {players.slice(0, 4).map((player, idx) => (
          <div key={idx} className="player-block">
            <div className="player-block-head">
              <span className="player-label">{roles[idx]}</span>
            </div>
            <div className="form-grid">
              <div className="field-group">
                <label>Игровой ник</label>
                <input
                  value={player.nick}
                  onChange={(e) => updatePlayer(idx, "nick", e.target.value)}
                  placeholder="GHOST_47"
                />
              </div>
              <div className="field-group">
                <label>ФИО</label>
                <input
                  value={player.fio}
                  onChange={(e) => updatePlayer(idx, "fio", e.target.value)}
                  placeholder="Иванов Иван"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-title">// ЗАПАСНЫЕ (до 2)</div>
        {players.slice(4, 6).map((player, idx) => (
          <div key={idx + 4} className="player-block">
            <div className="player-block-head">
              <span className="player-label">{roles[idx + 4]}</span>
            </div>
            <div className="form-grid">
              <div className="field-group">
                <label>Игровой ник</label>
                <input
                  value={player.nick}
                  onChange={(e) =>
                    updatePlayer(idx + 4, "nick", e.target.value)
                  }
                  placeholder="SUPPORT_88"
                />
              </div>
              <div className="field-group">
                <label>ФИО</label>
                <input
                  value={player.fio}
                  onChange={(e) => updatePlayer(idx + 4, "fio", e.target.value)}
                  placeholder="Петров Петр"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {alert && <div className="alert">{alert}</div>}
      <button className="btn btn-primary" onClick={createTeam}>
        ✓ ДОБАВИТЬ КОМАНДУ
      </button>
    </>
  );
}
