# User Roles

MVP can start with simple authentication, but the data model should support roles.

| Role | Access |
| --- | --- |
| `admin` | Full system management. |
| `manager` | View and manage all offers. |
| `estimator` | Create and calculate offers. |
| `sales` | View and manage assigned or owned offers. |
| `viewer` | Read-only access. |

Open MVP decision:

- Whether role enforcement is required in the first release or only the schema should be prepared.
