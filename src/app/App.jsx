import { SessionProvider } from '../auth/useSession.jsx';
import { TournamentProvider } from '../tournament/useTournament.jsx';
import Router from './router.jsx';
import PinLogin from '../components/PinLogin.jsx';

/**
 * ROOT APPLICATION ORCHESTRATOR
 * Orchestrates global state providers and the tactical UI layer.
 * Enforces strict linting standards by omitting unused React imports.
 */
const App = () => {
  return (
    <SessionProvider>
      <TournamentProvider>
        <Router />
        <PinLogin />
      </TournamentProvider>
    </SessionProvider>
  );
};

export default App;
