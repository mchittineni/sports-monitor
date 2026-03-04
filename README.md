# sports-monitor
An AI-powered, cloud-native web application that visualizes live sports activity across the world in real time through an interactive map interface.

## 🚧 Security & Structure

The repository is organised with all project documentation located in the `docs/` folder to keep the root tidy. Sensitive configuration values are stored only in environment files (not checked in) and should be managed by a vault or secrets manager. JWT tokens, database passwords, and AWS credentials must never be committed, and HTTPS should always be enforced in production. Follow the security checklist in `docs/SETUP.md` before deployment.
