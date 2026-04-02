# AppSheet Timesheet Application Implementation Guide

This guide details the steps to build a Timesheet Management application using a native AppSheet Database.

## 1. Application Structure (AppSheet Database)

First, create a new AppSheet Database and define the following tables and fields:

### Employees Table
- **Name**: Text
- **Email**: Email (Mark as Key)
- **Role**: Enum (Values: "Admin", "Employee")

### Projects Table
- **Project Name**: Text (Mark as Key)
- **Status**: Enum (Values: "Active", "Inactive")
- *Note: Only active projects should be selectable.*

### Timesheet Table
- **Timesheet ID**: Text (Mark as Key, use UniqueID() initial value)
- **Date**: Date
- **Employee Email**: Ref (Linked to Employees table)
- **Project**: Ref (Linked to Projects table)
- **Tasks Performed**: LongText
- **Hours Worked**: Decimal

## 2. Core Logic Configuration

After setting up the database, import it into a new AppSheet application and configure the following core logic components.

### 2.1 Validation
Ensure data integrity by configuring column constraints in the `Timesheet` table:

- **Date**: Set the `Initial value` to `TODAY()`.
- **Hours Worked**: Set the `Valid If` constraint to ensure it's a positive number (e.g., `[_THIS] > 0`).

### 2.2 Row-Level Security
To restrict users so they only see and edit their own timesheet entries:

- Navigate to Data -> Security -> Security Filters.
- For the `Timesheet` table, apply a security filter expression. The logic should check if the user's `USEREMAIL()` matches the 'Employee Email' column, or if the user has an "Admin" role in the Employees table.
  - *Example Expression: `OR(USEREMAIL() = [Employee Email], LOOKUP(USEREMAIL(), "Employees", "Email", "Role") = "Admin")`*

### 2.3 Admin Dashboard (Manager View)
Create a specific view for administrators:

- Create a Slice on the `Timesheet` table (or use the base table if the security filter allows admins full access).
- Create a Dashboard View named "Manager View".
- Include views (like tables or charts) based on the Timesheet data.
- Enable interactive filtering so Admins can filter by employee and filter by project easily.

### 2.4 PDF Automation
Set up an automation to generate a PDF summary for reporting:

- Navigate to Automation -> Bots.
- Create a new Bot triggered by a specific event (e.g., a button click, schedule, or specific data change).
- Add a Process with a "Create a new file" task.
- Set the file type to PDF.
- Create a Google Docs template that formats the filtered data as a summary report. Ensure the template iterates through the relevant Timesheet records.
