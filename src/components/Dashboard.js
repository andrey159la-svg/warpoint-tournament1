import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Dashboard({
  teams,
  isAdmin,
  onTeamsChange,
  onOpenBracket,
}) {
  const [editingTeam, setEditingTeam] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", players: [] });

  const deleteTeam = async (id) => {
    if (!isAdmin) return;
    if (!confirm("Удалить команду?")) return;
    await supabase.from("teams").delete().eq("id", id);
    onTeamsChange();
  };

  const clearAllTeams = async () => {
    if (!isAdmin) return;
    if (!confirm("Удалить ВСЕ команды?")) return;
    await supabase
      .from("teams")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    onTeamsChange();
  };

  const openEdit = (team) => {
    if (!isAdmin) return;
    setEditingTeam(team);
    setEditForm({
      name: team.name,
      players: JSON.parse(JSON.stringify(team.players)),
    });
  };

  const updatePlayer = (idx, field, value) => {
    const newPlayers = [...editForm.players];
    newPlayers[idx][field] = value;
    setEditForm({ ...editForm, players: newPlayers });
  };

  const saveEdit = async () => {
    await supabase
      .from("teams")
      .update({
        name: editForm.name,
        players: editForm.players,
      })
      .eq("id", editingTeam.id);
    setEditingTeam(null);
    onTeamsChange();
  };

  if (teams.length === 0) {
    return (
      <>
        <div className="empty">🎯 НЕТ КОМАНД</div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={onOpenBracket} disabled>
            ⚔ СФОРМИРОВАТЬ СЕТКУ
          </button>
        )}
      </>
    );
  }

  return (
    <>
      <div className="section-head">
        <h2>УЧАСТНИКИ ТУРНИРА</h2>
        <span className="role-badge">{teams.length} команд</span>
        <div className="line"></div>
      </div>

      <div className="teams-grid">
        {teams.map((team) => (
          <div key={team.id} className="team-card fade-in">
            <div className="team-name">{team.name}</div>
            {team.players?.map((p, idx) => (
              <div
                key={idx}
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
                  {p.fio && <div className="player-fio">{p.fio}</div>}
                </div>
              </div>
            ))}
            {isAdmin && (
              <div className="card-actions">
                <button
                  className="btn-sm btn-edit"
                  onClick={() => openEdit(team)}
                >
                  ✎ ПРАВКИ
                </button>
                <button
                  className="btn-sm btn-del"
                  onClick={() => deleteTeam(team.id)}
                >
                  ✕ УДАЛИТЬ
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isAdmin && (
        <div
          style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" }}
        >
          <button className="btn btn-primary" onClick={onOpenBracket}>
            ⚔ СФОРМИРОВАТЬ СЕТКУ
          </button>
          <button className="btn btn-danger" onClick={clearAllTeams}>
            🗑 ОЧИСТИТЬ ВСЕ
          </button>
        </div>
      )}

      {/* Модал редактирования */}
      {editingTeam && (
        <div className="modal-overlay" onClick={() => setEditingTeam(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">✎ РЕДАКТИРОВАТЬ КОМАНДУ</div>
            <div className="field-group">
              <label>Название команды</label>
              <input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            {editForm.players.map((p, idx) => (
              <div key={idx} className="player-block">
                <div className="player-block-head">
                  <span className="player-label">
                    {p.role === "captain"
                      ? "КАПИТАН"
                      : p.role === "reserve"
                      ? `ЗАПАСНОЙ`
                      : `ИГРОК`}
                  </span>
                </div>
                <div className="form-grid">
                  <div className="field-group">
                    <label>Игровой ник</label>
                    <input
                      value={p.nick}
                      onChange={(e) =>
                        updatePlayer(idx, "nick", e.target.value)
                      }
                    />
                  </div>
                  <div className="field-group">
                    <label>ФИО</label>
                    <input
                      value={p.fio || ""}
                      onChange={(e) => updatePlayer(idx, "fio", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setEditingTeam(null)}
              >
                ОТМЕНА
              </button>
              <button className="btn btn-primary" onClick={saveEdit}>
                СОХРАНИТЬ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
