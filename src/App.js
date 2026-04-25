import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import RandomTeam from "./components/RandomTeam";
import CreateTeam from "./components/CreateTeam";
import BracketModal from "./components/BracketModal";

export default function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' or 'guest'
  const [teams, setTeams] = useState([]);
  const [tournamentData, setTournamentData] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showBracketModal, setShowBracketModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUserRole("admin");
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setUserRole("admin");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session || userRole === "guest") {
      loadTeams();
      loadTournamentData();
    }
  }, [session, userRole]);

  const loadTeams = async () => {
    const { data } = await supabase
      .from("teams")
      .select("*")
      .order("created_at");
    if (data) setTeams(data);
  };

  const loadTournamentData = async () => {
    const { data } = await supabase
      .from("tournaments")
      .select("data")
      .eq("id", "current")
      .single();
    if (data?.data) setTournamentData(data.data);
  };

  const saveTournamentData = async (data) => {
    setTournamentData(data);
    await supabase
      .from("tournaments")
      .upsert({ id: "current", data, updated_at: new Date() });
  };

  const handleGuestLogin = () => {
    setUserRole("guest");
    setSession(null);
  };

  const handleLogout = async () => {
    if (session) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUserRole(null);
    setActiveTab("dashboard");
  };

  if (!session && !userRole) {
    return <Auth onAdminLogin={() => {}} onGuestLogin={handleGuestLogin} />;
  }

  const isAdmin = !!session;

  return (
    <div className="app">
      <header className="header">
        <div>
          <div className="logo">
            WAR<span>POINT</span>
          </div>
          <div className="logo-sub">TOURNAMENT MANAGER // v3.0</div>
        </div>
        <div className="status-bar">
          <div className="status-dot"></div>
          <span>{teams.length} КОМАНД</span>
          <span className="role-badge">
            {isAdmin ? "👑 АДМИН" : "👥 ГОСТЬ"}
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            ВЫЙТИ
          </button>
        </div>
      </header>

      {/* Десктоп навигация */}
      <nav className="top-nav">
        <button
          className={`tab ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          ⬡ КОМАНДЫ
        </button>
        {isAdmin && (
          <>
            <button
              className={`tab ${activeTab === "random" ? "active" : ""}`}
              onClick={() => setActiveTab("random")}
            >
              ⟳ СФОРМИРОВАТЬ
            </button>
            <button
              className={`tab ${activeTab === "create" ? "active" : ""}`}
              onClick={() => setActiveTab("create")}
            >
              + СОЗДАТЬ
            </button>
          </>
        )}
      </nav>

      {/* Мобильная навигация */}
      <div className="bottom-nav">
        <button
          className={`bottom-nav-btn ${
            activeTab === "dashboard" ? "active" : ""
          }`}
          onClick={() => setActiveTab("dashboard")}
        >
          ⬡ КОМАНДЫ
        </button>
        {isAdmin && (
          <>
            <button
              className={`bottom-nav-btn ${
                activeTab === "random" ? "active" : ""
              }`}
              onClick={() => setActiveTab("random")}
            >
              ⟳ РАНДОМ
            </button>
            <button
              className={`bottom-nav-btn ${
                activeTab === "create" ? "active" : ""
              }`}
              onClick={() => setActiveTab("create")}
            >
              + СОЗДАТЬ
            </button>
          </>
        )}
      </div>

      <main className="main">
        {activeTab === "dashboard" && (
          <Dashboard
            teams={teams}
            isAdmin={isAdmin}
            onTeamsChange={loadTeams}
            onOpenBracket={() => setShowBracketModal(true)}
          />
        )}
        {isAdmin && activeTab === "random" && (
          <RandomTeam onTeamsGenerated={loadTeams} />
        )}
        {isAdmin && activeTab === "create" && (
          <CreateTeam onTeamCreated={loadTeams} />
        )}
      </main>

      {showBracketModal && (
        <BracketModal
          teams={teams}
          tournamentData={tournamentData}
          isAdmin={isAdmin}
          onSave={saveTournamentData}
          onClose={() => setShowBracketModal(false)}
        />
      )}
    </div>
  );
}
