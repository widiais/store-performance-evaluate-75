
# Store Performance Dashboard

## Database Schema Update Required

Before using this application, please run the following SQL script to create the necessary views and update table schemas:

```sql
-- Run the SQL found in src/sql/create_views.sql
```

## Components

The application contains the following components:

- ComplaintReportDetail: Shows detailed information about complaint reports
- EmployeeSanctionForm: Allows entry of employee sanctions
- ChampReport: Displays a list of CHAMP evaluations
- ChampReportDetail: Shows detailed information about a CHAMP evaluation
- OperationalKPI: Displays operational KPI metrics for selected stores

## Database Tables and Views

This application relies on several key database tables and views:

- `employee_sanctions` - Stores employee sanction records
- `employee_sanctions_kpi` - View for calculating KPI scores based on sanctions
- `esp_findings` - Stores findings for ESP evaluations
- `champs_evaluation_report` - View for CHAMPS evaluation reports

## Other Files

- store-performance/types.ts: Contains TypeScript types for the application
- sql/create_views.sql: Contains SQL to create necessary views and update tables

## Troubleshooting

If you encounter database-related errors, please ensure:
1. All views in the SQL file have been created
2. The required table schemas match what the application expects
3. The `esp_findings` table exists and has the correct structure
4. The `employee_sanctions` table has all required columns
