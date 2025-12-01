import csv
import os
from pathlib import Path

EXPORT_DIR = Path(os.getcwd()) / "exports"
EXPORT_DIR.mkdir(exist_ok=True)

class CSVExportService:
    def export_report_to_csv(self, report: dict, filename: str) -> str:
        """
        Exports the analysis report to CSV format.
        Dynamic fields based on report content.
        """
        csv_path = EXPORT_DIR / f"{filename}.csv"
        
        # Flatten nested structures if needed
        rows = []
        
        if isinstance(report, list):
            # If report is a list, assume it's a list of rows (dicts) or simple values
            if report and isinstance(report[0], dict):
                rows = report
            else:
                # List of strings or other primitives, treat as single column "Report"
                rows = [{"Report": str(item)} for item in report]
        elif isinstance(report, dict):
            # If report has list values, create rows
            # Check if dict is empty
            if not report:
                 return str(csv_path)

            max_len = max([len(v) if isinstance(v, list) else 1 for v in report.values()])
            
            for i in range(max_len):
                row = {}
                for key, value in report.items():
                    if isinstance(value, list):
                        row[key] = value[i] if i < len(value) else ""
                    else:
                        row[key] = value if i == 0 else ""
                rows.append(row)
        else:
             # Fallback for other types
             rows = [{"Report": str(report)}]
        
        # Write to CSV
        with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            if rows:
                fieldnames = list(rows[0].keys())
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(rows)
        
        return str(csv_path)

csv_export_service = CSVExportService()
