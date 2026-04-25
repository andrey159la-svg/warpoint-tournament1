import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function BracketView({
  tournamentData,
  isAdmin,
  onUpdate,
  onClose,
}) {
  const bracketRef = useRef(null);

  const updateScore = (roundIdx, matchIdx, isTeam1, value) => {
    if (!isAdmin) return;
    if (!tournamentData) return;

    const newData = JSON.parse(JSON.stringify(tournamentData));
    const match = newData.rounds[roundIdx][matchIdx];
    const score = parseInt(value) || 0;

    if (isTeam1) match.score1 = score;
    else match.score2 = score;

    if (match.score1 !== match.score2 && match.team1 && match.team2) {
      const winner = match.score1 > match.score2 ? match.team1 : match.team2;
      match.winner = winner;

      if (roundIdx + 1 < newData.rounds.length) {
        const nextMatchIdx = Math.floor(matchIdx / 2);
        const nextMatch = newData.rounds[roundIdx + 1][nextMatchIdx];
        if (matchIdx % 2 === 0) {
          nextMatch.team1 = winner;
        } else {
          nextMatch.team2 = winner;
        }
        if (nextMatch.winner === winner) nextMatch.winner = null;
      }
    }

    onUpdate(newData);
  };

  const downloadPDF = async () => {
    if (!bracketRef.current) return;

    const element = bracketRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#0a0a0f",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(
      `warpoint_tournament_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-")}.pdf`
    );
  };

  if (!tournamentData || !tournamentData.rounds) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="empty">⚠️ ОШИБКА: НЕТ ДАННЫХ ДЛЯ СЕТКИ</div>
          <button className="btn btn-primary" onClick={onClose}>
            ЗАКРЫТЬ
          </button>
        </div>
      </div>
    );
  }

  const roundNames = [
    "1/8 ФИНАЛА",
    "ЧЕТВЕРТЬФИНАЛ",
    "ПОЛУФИНАЛ",
    "ФИНАЛ",
    "ЧЕМПИОН",
  ];

  // Для круговой системы
  if (tournamentData.format === "round") {
    const teamNames = tournamentData.teams
      .filter((t) => t !== null)
      .map((t) => t.name);
    return (
      <div className="modal-overlay">
        <div className="modal modal-full" style={{ overflow: "auto" }}>
          <div
            style={{
              position: "sticky",
              top: 0,
              background: "#0a0a0f",
              paddingBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <h2 className="modal-title">🔄 КРУГОВАЯ СИСТЕМА</h2>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-primary" onClick={downloadPDF}>
                📄 СКАЧАТЬ PDF
              </button>
              <button className="btn btn-danger" onClick={onClose}>
                ✕ ЗАКРЫТЬ
              </button>
            </div>
          </div>
          <div ref={bracketRef} style={{ padding: 20, overflowX: "auto" }}>
            <table className="rr-table">
              <thead>
                <tr>
                  <th>#</th>
                  {teamNames.map((name, i) => (
                    <th key={i}>{i + 1}</th>
                  ))}
                  <th>В</th>
                  <th>П</th>
                </tr>
              </thead>
              <tbody>
                {teamNames.map((name, i) => (
                  <tr key={i}>
                    <td>
                      <b>{i + 1}.</b> {name}
                    </td>
                    {teamNames.map((_, j) => (
                      <td key={j} className={i === j ? "self" : ""}>
                        {i === j ? "—" : "vs"}
                      </td>
                    ))}
                    <td>0</td>
                    <td>0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Single/Double elimination
  return (
    <div className="modal-overlay">
      <div
        className="modal modal-full"
        style={{ overflow: "auto", padding: 0 }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            background: "#0a0a0f",
            padding: 20,
            borderBottom: "1px solid var(--border)",
            zIndex: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <h2 className="modal-title">🏆 WARPOINT TOURNAMENT BRACKET</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={downloadPDF}>
              📄 СКАЧАТЬ PDF
            </button>
            <button className="btn btn-danger" onClick={onClose}>
              ✕ ЗАКРЫТЬ
            </button>
          </div>
        </div>

        <div ref={bracketRef} className="bracket-container">
          <div className="bracket">
            {tournamentData.rounds.map((round, ri) => (
              <div key={ri} className="round">
                <div className="round-title">
                  {roundNames[ri] || `РАУНД ${ri + 1}`}
                </div>
                {round.map((match, mi) => (
                  <div
                    key={mi}
                    className={`match ${match.winner ? "completed" : ""}`}
                  >
                    {[true, false].map((isTeam1, idx) => {
                      const team = isTeam1 ? match.team1 : match.team2;
                      const score = isTeam1 ? match.score1 : match.score2;
                      const isWinner =
                        match.winner && match.winner.id === team?.id;
                      return (
                        <div
                          key={idx}
                          className={`match-team ${isWinner ? "winner" : ""} ${
                            !team ? "tbd" : ""
                          }`}
                        >
                          <span style={{ fontWeight: 600 }}>
                            {team ? team.name : "TBD"}
                          </span>
                          {team ? (
                            isAdmin ? (
                              <input
                                type="number"
                                className="team-score-input"
                                value={score}
                                onChange={(e) =>
                                  updateScore(ri, mi, isTeam1, e.target.value)
                                }
                                min="0"
                                max="99"
                              />
                            ) : (
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: 16,
                                  fontWeight: 700,
                                }}
                              >
                                {score}
                              </span>
                            )
                          ) : (
                            <span style={{ opacity: 0.5 }}>—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
