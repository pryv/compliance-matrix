# Glossary

| Term | Meaning |
|------|---------|
| **Scope** | A regulation (e.g., GDPR), standard (e.g., ISO 27001) or certification (e.g., HDS). |
| **Requirement** | The smallest officially-numbered unit inside a scope (e.g., `gdpr.Art.17`, `iso-27001.A.8.24`, `hipaa-security.164.312.a.1`). |
| **Coverage status** | One of `implemented`, `configurable`, `facilitated`, `documented`, `out-of-scope`. |
| **Evidence** | A test code, doc URL, config key, or tracked planned-feature reference that backs a coverage claim. |
| **`reqid`** | A functional spec identifier in `dev-site/src/_functional-specifications/requirements.yml` (e.g., `EVENT.BASE`, `STREAM.MGMT`). |
| **Test code** | A 4-character (sometimes longer) identifier in `[…]` brackets in open-pryv.io test descriptions (e.g., `[AC01]`, `[EVTC]`). |
| **`draft`** | A coverage claim authored but not yet user-reviewed. Marked with `draft: true` per row. |
| **Curated scope** | A scope where the matrix authors only requirements with non-`out-of-scope` coverage. Excluded clauses are listed in the scope YAML's `excluded_items:` for audit-traceability. |
| **Layered scope** | A scope that references other scopes as its foundation (e.g., DiGA layered on MDR layered on GDPR). |
| **QMS** | Quality Management System — the organizational framework required by ISO 13485 / 27001 / MDR. See [`../qms/`](../qms/). |
| **Matrix** | The dataset that connects scope requirements → coverage status → functional specs → tests → docs → QMS files. |
| **WAB** | Web App — the React UI in [`../wab/`](../wab/) for browsing the matrix. |
