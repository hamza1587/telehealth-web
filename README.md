# Telehealth Web

Custom React frontend for the telehealth platform.

This app is the product experience layer for patients, doctors, admins, and compliance teams. It should talk to `telehealth-platform` first. Medplum should remain private/headless behind the .NET API except for carefully controlled clinical-data workflows.

## Local Commands

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
```

## Local URLs

- React app: `http://localhost:5173`
- .NET platform API: `http://localhost:5131`
- Medplum API: `http://localhost:8103`

## Environment

Copy `.env.example` to `.env.local` and adjust values if local ports change.

```env
VITE_PLATFORM_API_URL=http://localhost:5131
VITE_MEDPLUM_BASE_URL=http://localhost:8103
```

## Product Boundary

- React owns user experience.
- .NET owns product and business workflows.
- Medplum owns clinical/FHIR records.
