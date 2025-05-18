import { Case } from "@/types/globals";
import { Badge } from "./Badge";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const getLabelVariant = (
  category: string,
  label: string
)=> {
  if (category === "labels") {
    switch (label.toLowerCase()) {
      case "immediate":
      case "critical":
      case "emergency":
        return "danger";
      case "delayed":
        return "warning";
      case "minor":
        return "success";
      case "dermatology":
        return "success";
      case "orthopedics":
        return "info";
      case "cardiology":
        return "secondary";
      case "neurology":
        return "primary";  
      case "acute onset":
        return "warning";
      case "chronic":
        return "neutral";
      case "stable":
        return "success";
        case "integumentary":
        return "success";
      case "expectant":
        return "neutral";
      case "none":
        return "default";
    }
  }

  if (category.includes("symptom")) return "warning";
  if (category.includes("system")) return "success";
  if (category.includes("contextual")) return "neutral";
  if (category.includes("domain")) return "default";

  return "default";
};


interface CaseRowProps {
  caseItem: Case;
}

export function CaseRow({ caseItem }: CaseRowProps) {
    const [labelGroups, setLabelGroups] = useState<Record<string, string[]>>({});

  const getTimeAgo = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };

  const truncateId = (id: string) => {
    return id.substring(0, 8);
  };

  
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const res = await fetch(`/api/case?caseid=${caseItem.id}`);
        const json = await res.json();
        const results = json?.data?.triage_results;
        if (results && typeof results === "object") {
          const newLabels: Record<string, string[]> = {};
          Object.entries(results).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              newLabels[key] = value;
            }
          });
          setLabelGroups(newLabels);
        }
      } catch (err) {
        console.error("Failed to fetch labels", err);
      }
    };

    fetchLabels();
  }, [caseItem.id]);

 return (
    <Link href={`/case?caseid=${caseItem.id}`} className="no-underline">
      <div className="flex flex-col border-b border-gray-200 py-4 hover:bg-gray-50 transition-colors px-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-gray-900">
                {caseItem.input_text}
              </h3>
              <Badge
                variant={caseItem.status === "Opened" ? "success" : "neutral"}
                className="ml-2"
              >
                {caseItem.status}
              </Badge>
            </div>

            <div className="text-sm text-gray-500">
              #{truncateId(caseItem.id)} opened {getTimeAgo(caseItem.created_at)}
            </div>

            {/* ✅ Dynamically render all label groups */}
            {Object.entries(labelGroups).map(([category, labels]) => (
              <div key={category} className="mt-2 flex flex-wrap gap-2">
                {labels.map((label, idx) => (
                  <Badge
                    key={`${category}-${idx}`}
                    variant={getLabelVariant(category, label)}
                    className="text-xs"
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            ))}
          </div>

          <div className="text-sm text-gray-500">
            Updated {getTimeAgo(caseItem.updated_at)}
          </div>
        </div>
      </div>
    </Link>
  );
}

