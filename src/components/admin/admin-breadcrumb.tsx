import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Crumb = { href?: string; label: string };

/**
 * Where you are in the admin, and the way back up.
 *
 * The sidebar can reach every list, but it cannot say "you are inside a record and this is
 * the thing you came from". An editor who opened a boat to fix one field has to work that
 * out from the heading alone, and on a narrow screen the sidebar collapses into a grid of
 * small links at the top where nothing is highlighted.
 *
 * The first link is repeated as a plain back arrow at the start, because on a form the
 * useful action is almost always "up one level", not "jump to the dashboard".
 */
export function AdminBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  const parent = [...crumbs].reverse().find((crumb) => crumb.href);

  return (
    <nav className="admin-breadcrumb" aria-label="เส้นทางหน้า">
      {parent && (
        <Link className="admin-breadcrumb-back" href={parent.href!}>
          <ChevronLeft aria-hidden="true" />
          <span className="sr-only">กลับไป{parent.label}</span>
        </Link>
      )}
      <ol>
        {crumbs.map((crumb, index) => (
          <li key={`${crumb.label}-${index}`}>
            {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
