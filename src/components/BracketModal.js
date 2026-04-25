import React, { useState } from "react";
import BracketView from "./BracketView";

export default function BracketModal({
  teams,
  tournamentData,
  isAdmin,
  onSave,
  onClose,
}) {
  const [selectedFormat, setSelectedFormat] = useState("olympic");
  const [showBracket, setShowBracket] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);

  const generateBracket = () => {
    if (teams.length < 2) {
      alert("Нужно минимум 2 команды!");
      return;
    }

    const shuffled = [
      ...teams.map((t) => ({ id: t.id, name: t.name, score: 0 })),
    ];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    let size = 1;
    while (size < shuffled.length) size *= 2;
    while (shuffled.length < size) shuffled.push(null);

    const rounds = [];
    let currentRound = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      currentRound.push({
        team1: shuffled[i],
        team2: shuffled[i + 1],
        winner: null,
        score1: 0,
        score2: 0,
      });
    }
    rounds.push(currentRound);

    while (currentRound.length > 1) {
      const nextRound = [];
      for (let i = 0; i < currentRound.length; i += 2) {
        nextRound.push({
          team1: null,
          team2: null,
          winner: null,
          score1: 0,
          score2: 0,
        });
      }
      rounds.push(nextRound);
      currentRound = nextRound;
    }

    const newData = { rounds, teams: shuffled, format: selectedFormat };
    setGeneratedData(newData);
    onSave(newData);
    setShowBracket(true);
  };

  if (showBracket && generatedData) {
    return (
      <BracketView
        tournamentData={generatedData}
        isAdmin={isAdmin}
        onUpdate={(newData) => {
          setGeneratedData(newData);
          onSave(newData);
        }}
        onClose={() => {
          setShowBracket(false);
          onClose();
        }}
      />
    );
  }

  const formats = [
    {
      id: "olympic",
      icon: "🏆",
      name: "Олимпийская",
      desc: "Single Elimination • Проигравший выбывает",
    },
    {
      id: "double",
      icon: "⚡",
      name: "С нижней сеткой",
      desc: "Double Elimination • Два поражения = вылет",
    },
    {
      id: "round",
      icon: "🔄",
      name: "Круговая",
      desc: "Round Robin • Каждый с каждым",
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-full" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">⚔ ВЫБОР ФОРМАТА ТУРНИРА</div>

        <div className="bracket-options">
          {formats.map((f) => (
            <div
              key={f.id}
              className={`bracket-option ${
                selectedFormat === f.id ? "selected" : ""
              }`}
              onClick={() => setSelectedFormat(f.id)}
            >
              <div className="option-icon">{f.icon}</div>
              <div className="option-name">{f.name}</div>
              <div className="option-desc">{f.desc}</div>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            ОТМЕНА
          </button>
          <button className="btn btn-primary" onClick={generateBracket}>
            ⚔ ПОСТРОИТЬ СЕТКУ
          </button>
        </div>
      </div>
    </div>
  );
}
