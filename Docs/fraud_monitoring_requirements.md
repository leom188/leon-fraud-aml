# B2B Bank Fraud Monitoring & Triage Dashboard

## 1. Major Challenges in a Layered BaaS Ecosystem
We operate in a layered BaaS (banking-as-a-service) ecosystem where the bank’s direct customer is usually a platform or payment facilitator that supports multiple sub-merchants, who then serve thousands of end customers.

This creates specific challenges for fraud monitoring:
* **Opacity of merchants and end-customers**: Bank’s KYC is not applicable there.
* **Lack of Direct PII**: Personally Identifiable Information is often abstracted.
* **Masked Activity**: Fraud or unwanted activities are hidden within hierarchies.

## 2. General Considerations & Ideas
* **Entity Grouping**: Clear definitions on how to group transactions belonging to the same entity.
  * e-Transfers: Grouped by creditor/debtor email or account.
  * EFT: Grouped by account.
  * Cards: Grouped by customer number.
  * *Note*: Good idea to implement modules by program/rail (CARD, EFT, WIRE, etc.).
* **Sub-merchant Identification**: Ideally, the system should be able to identify sub-merchants.
* **Multi-level Alerting**: Alerts should trigger not just at the transaction level, but also at the client and/or sub-merchant level.
* **Compliance Integration**: If built, the compliance team must become a user. Managing alerts via Excel files is inefficient.
* **Authentication & RBAC**: Integrated via LDAP. Implement strict Role-Based Access Control (RBAC) since different teams (Fraud Analysts, Compliance, Executives) require different view/edit permissions.
* **CRM Integration**: Connect the CRM and fraud system to pass data such as onboarding date, DBA (Doing Business As), Risk Rating, etc.

## 3. Main Functionalities

### 3.1 Executive Dashboard (Command Center)
* **Real-Time Analytics & Metrics**: Live visualization of fraud metrics, transaction volumes, and optional system health (IT may have a separate dashboard).
* **Performance Tracking**: Displays true/false positive rates, alert resolution times, and tracks the overall financial value of blocked vs. approved transactions.

### 3.2 Rule Management Engine
* **Self-Service Configuration**: No-code interface allowing non-technical users to create, edit, or disable rules instantly without IT/Dev intervention.
  * **Sub-rules**: Functionality to increase/reduce the score of a main rule based on additional conditions (e.g., reduce score for drug keywords if found in the Customer Name field).
* **Rule Versioning & Audit Trails**: Strict tracking of rule modifications (who changed it, when, and what the previous state was) to support regulatory audits.
* **Dynamic Thresholds & Lists**: 
  * Screens to manage dynamic thresholds (e.g., Daily limit amount on Cards from a certain Client).
  * Configure blocklists and allowlists to bypass friction for trusted B2B vendors.
  * Lists to support other scenarios (e.g., drug keyword lists).
* **Real-Time vs. Near Real-Time Rules**: 
  * *Real-Time*: Declines transactions, freezes cards, or blocks merchants (must generate a notification).
  * *Near Real-Time*: Generates alerts for manual review.

### 3.3 Alert Triage & Transaction Monitoring
*Filtered by Rail (Analyst data needs vary depending on the rail)*
* **Rail-Specific Queues**: Dedicated queues for different transaction types.
* **SLA Timers**: Visual tracking of Service Level Agreements to ensure alerts are reviewed within required compliance timeframes.
* **Real-Time Risk Scoring**: Displays a score (0-99) alongside specific AI/ML signals that triggered the alert, providing explainability.
  * *AI Strategy*: Consider using AI primarily at higher hierarchies (client or sub-merchant level) rather than just transaction level.

### 3.4 Case Management & Investigation (Internal Only)
*Dedicated workspace for analysts to resolve alerts.*
* **360-Degree Historical Baseline**: Displays historical activity to establish normal baseline behavior (e.g., Client: last 7 days; Merchant: 1 month; User: 3-6 months).
* **Entity Resolution View**: Allows the user to define alert treatment (e.g., False Positive, RFI - Request for Information, UTR, Compliance mail notification, other - if needed).
  * *Feedback Loop*: Analyst decisions (e.g., True Fraud vs. False Positive) should automatically feed back into the ML/AI model to improve Real-Time Risk Scoring accuracy.
* **Link Analysis / Network Graphs**: Interactive visual graphs mapping shared attributes (e.g., overlapping IP addresses, if connected to CRM we could check for same physical address, phone, etc.). This is highly critical in BaaS to catch coordinated fraud rings attempting to bypass limits via multiple sub-merchants.

### 3.5 Merchant / Entity Screening & Onboarding
*Centralized view, beneficial for Compliance.*
* **Company Profile & KYCC**: Dedicated view for Know Your Customer's Customer (KYCC) and ongoing due diligence. Centralizes business registration, Tax IDs, and UBO (Ultimate Beneficial Ownership) documentation.
* **Ongoing Monitoring**: Continuous screening of sub-merchants against global anti-fraud consortiums, sanctions, and adverse media to ensure compliance.

### 3.6 Dispute & Chargeback Management
*Centralized management of disputes.*
* **Dispute Tracking**: For Acquiring and Prepaid CARD rails, manages incoming disputes and tracks chargeback ratios to identify "friendly fraud" or problematic sub-merchants.

### 3.7 Audit, Compliance & Reporting
*CaaS (Compliance-as-a-Service) integration.*
* **Regulatory Workflows**: Dedicated screen for generating automated audit trails and seamlessly filing Suspicious Transaction Reports (STRs) with regulators, ensuring AML/fraud mandate compliance.

## 4. Minimum Viable Product (MVP) Phases
1. **Login**: Secure access via LDAP.
2. **Rule Management Engine**: Basic rule creation and threshold management.
3. **Alert Triage & Transaction Monitoring**: Focus initially on the **e-Transfer Rail** only.
4. **Case Management & Investigation**: Core workflows for reviewing and resolving alerts.
