import { Case } from "@/types/globals";
import { Badge } from "./Badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface CaseRowProps {
  caseItem: Case;
}

export function CaseRow({ caseItem }: CaseRowProps) {
  const getTimeAgo = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };

  const truncateId = (id: string) => {
    return id.substring(0, 8);
  };

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
              #{truncateId(caseItem.id)} opened{" "}
              {getTimeAgo(caseItem.created_at)}
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Updated {getTimeAgo(caseItem.updated_at)}
          </div>
        </div>
      </div>
    </Link>
  );
}
