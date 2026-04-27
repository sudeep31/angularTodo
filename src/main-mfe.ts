// MFE entry point — dynamic import defers execution until federation
// metadata has been negotiated, matching the pattern used by mfe-angular-app.
import('./bootstrap-mfe').catch((err) => console.error(err));
