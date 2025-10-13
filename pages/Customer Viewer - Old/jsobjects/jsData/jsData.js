export default {
	diagram: [
  {
    "ID": 5,
    "title": "Appsmith Lightning Talk Flow",
    "script": "graph TD\nA(Organizer) --> |Launches Meeting| B(Meeting)\nC(Participants) --> |Join Meeting| B\nB --> D(New Features)\nB --> E(Incredible Apps)\nB --> F(Ingenious Hacks)\nB --> G(Participants Share)\nF --> |Do you <strong>BELIEVE?</strong>| I(Hack1)\nF --> |Useful| J(Hack2)\nG --> |whoever|H(Cool Template)",
    "createdAt": 1676374675773,
    "modifiedAt": null
  },
  {
    "ID": 3,
    "title": "GIT Desired Process",
    "script": "graph TD\n    A(AP - Appsmith Workspaces) --> B(<strong>STAGE</strong>: App)\n    B --> |AP-1 Git: <strong>develop</strong></br> to requirements| B\n    B --> |AP-2 Git: merges to <strong>master</strong></br>-Pull Changes</br>-QC Testing| C(<strong>STAGE</strong>: App)\n    C --> |AP-3. Git: Merge to <strong>master</strong></br>Pull Changes| D(<strong>PROD</strong>: App)\n    C --> |AP-4. Issues found| B\n    D --> |AP-5. Issues found in Production| B",
    "createdAt": 1675423852070,
    "modifiedAt": null
  },
  {
    "ID": 1,
    "title": "TCO:  Appsmith & Database Release Steps",
    "script": "graph TD\n    A(AP - Appsmith Workspaces) --> B(<strong>TCO-Dev</strong>: Office and Field)\n    B --> |AP-1 Git: <strong>develop</strong></br> to requirements| B\n    B --> |AP-2 Git: merges to <strong>stage</strong></br>-Pull Changes</br>-QC Testing| C(<strong>TCO-Stage</strong>: Office and Field)\n    C --> |AP-3. Git: Merge to <strong>master</strong></br>Pull Changes| H(<strong>TCO-Office Prod</strong>)\n    C --> |AP-3. Git: Merge to <strong>master</strong></br>Pull Changes| J(<strong>TCO-Field Prod</strong>)\n    \n\n    AA(DB - SQLServer Databases - suggested Names) -->\n    BB(<strong>TCO_DEV</strong>) --> |DB-2. Structure Changes| BB\n    BB --> |DB-3. Stage Changes| CC(<strong>TCO_STAGE</strong>)\n    CC --> |DB-4. Promote to Prod| DD(<strong>TCO_PROD</strong>)\n    DD --> |<strong>DB-1: Start</strong>. Copy TCO_PROD| BB\n\n",
    "createdAt": 1674398242713,
    "modifiedAt": null
  },
  {
    "ID": 0,
    "title": "TCO: Inspection Flow",
    "script": "graph TD\n    A(1. Select: Project -> Equip) --> |click| B(2. Start -> New Inspection)\n    B --> |click| C(3. Inspect)\n    C --> D(4. Inspection Tab: Enter Amounts & Inspect Points)\n    D --> E(5. Info Tab: Enter Form fields)\n    E --> F(6. Submit: Sends appropriate Emails)",
    "createdAt": 1674397267107,
    "modifiedAt": null
  },
  {
    "ID": 2,
    "title": "TCO: Release Stages",
    "script": "sequenceDiagram\n    participant Appsmith\n    participant Dev \n    participant Stage\n    participant Prod     \n    participant SQL Server\n    SQL Server ->> Dev:  1. SQL Copy TCO_PROD to TCO_DEV Prior to Development\n    Appsmith ->> Dev: 2. App TCO-Field (develop Branch)\n    Appsmith ->> Dev: 2. App TCO-Office (develop Branch)\n     Note right of Dev:  2. Paul and Chris<br/>unit test\n    Prod ->> Stage: 3. SQL TCO_PROD Structures/Data\n    Note right of Dev: Undetermined<br/> if we need a Git Stage<br/> branch\n    Dev ->> Stage: 3. SQL TCO_DEV Structure changes\n    Note right of Dev:  3. Chris tests functionality\n    Stage ->> Prod: 4. SQL Migrate TCO_STAGE structure change to Prod\n     Dev ->> Prod: 4. TCO-Field: Merge develop branch to master\n    Dev ->> Prod: 4. TCO-Office: Merge develop branch to master\n   \n     \n\n",
    "createdAt": 1674398322103,
    "modifiedAt": null
  },
  {
    "ID": 6,
    "title": "Try it Out!",
    "script": "graph TD\n    A(Name this Box in the Script<br>to the right) --> |Action| B(Now re-name this Box<br>in the script)\n",
    "createdAt": 1676462688440,
    "modifiedAt": null
  }
],
	
}