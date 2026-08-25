import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { requireAdmin } from "@/lib/require-admin";
import { db } from "@/db/client";
import {
  btsGuardians,
  btsDependents,
  btsResourceAssignments,
  btsInventory,
  mdRegistrants,
} from "@/db/schema";
import { SITES, type SiteKey } from "@/sites/site-registry";
import { isInDistrictCommunity } from "@/lib/tobago-locations";
import { count, eq, and, isNull, inArray } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ExportScope = "all" | "district" | "outside";

const SCOPE_LABELS: Record<ExportScope, string> = {
  all: "Entire database",
  district: "In the district",
  outside: "Outside the district",
};

function scopeFromQuery(value: string | null): ExportScope {
  return value === "district" || value === "outside" ? value : "all";
}

/** Does this registration fall inside the requested export scope? */
function inScope(address: string | null, scope: ExportScope): boolean {
  if (scope === "all") return true;
  const inDistrict = isInDistrictCommunity(address ?? "");
  return scope === "district" ? inDistrict : !inDistrict;
}

function siteFromQuery(value: string | null): SiteKey | null {
  if (value === "bts" || value === "md") return value;
  return null;
}

function csvCell(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

function csvRow(cells: (string | number | null | undefined)[]): string {
  return cells.map(csvCell).join(",") + "\r\n";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const site = siteFromQuery(url.searchParams.get("site"));
  const format = url.searchParams.get("format") ?? "csv";
  const scope = scopeFromQuery(url.searchParams.get("scope"));
  const scopeSuffix = scope === "all" ? "full" : scope;
  const scopeLabel = SCOPE_LABELS[scope];

  if (!site) {
    return NextResponse.json({ error: "Missing or invalid `site` parameter." }, { status: 400 });
  }
  if (format !== "csv" && format !== "pdf") {
    return NextResponse.json({ error: "Unsupported `format`. Use csv or pdf." }, { status: 400 });
  }

  // Exports carry sensitive registration data — staff and above only.
  // Staff need it for on-site physical verification and after-event reporting.
  await requireAdmin(undefined, "staff");

  const cfg = SITES[site];

  if (format === "csv") {
    const csv =
      site === "bts" ? await buildBtsCsv(scope) : await buildMdCsv(scope);
    // BOM so Excel opens TT accents correctly.
    return new NextResponse("\uFEFF" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${site}-${scopeSuffix}-report.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const doc = new PDFDocument({ size: "LETTER", margins: { top: 56, bottom: 56, left: 56, right: 56 } });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));

  const headers = new Headers({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${site}-${scopeSuffix}-report.pdf"`,
    "Cache-Control": "no-store",
  });

  const stream = new ReadableStream({
    async start(controller) {
      doc.on("end", () => {
        controller.enqueue(Buffer.concat(chunks));
        controller.close();
      });
      try {
        if (site === "bts") {
          await buildBtsReport(doc, cfg, scope, scopeLabel);
        } else {
          await buildMdReport(doc, cfg, scope, scopeLabel);
        }
        doc.end();
      } catch (err) {
        console.error("[api/export] pdf build failed:", err);
        controller.error(err);
      }
    },
    cancel() {
      doc.destroy();
    },
  });

  return new Response(stream, { headers });
}

// ── Shared layout helpers ───────────────────────────────────────

function header(doc: PDFKit.PDFDocument, siteName: string, eventDate: string, scopeLabel: string) {
  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .text(siteName, { align: "center" });
  doc
    .fontSize(11)
    .font("Helvetica")
    .fillColor("#555")
    .text(`Event date: ${eventDate}`, { align: "center" });
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .fillColor("#000")
    .text("THA Community Programme Report", { align: "center" });
  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor("#666")
    .text(`Scope: ${scopeLabel}`, { align: "center" });
  doc.moveDown(0.5);
  doc.moveTo(56, doc.y).lineTo(doc.page.width - 56, doc.y).strokeColor("#ccc").stroke();
  doc.moveDown(0.8);
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.4);
  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .fillColor("#111")
    .text(title, { underline: false });
  doc.moveDown(0.15);
}

function statLine(doc: PDFKit.PDFDocument, label: string, value: string | number) {
  doc
    .fontSize(11)
    .font("Helvetica")
    .fillColor("#000")
    .text(`${label}: `, { continued: true })
    .font("Helvetica-Bold")
    .text(String(value));
}

function kvRow(doc: PDFKit.PDFDocument, key: string, value: string | number) {
  doc
    .fontSize(11)
    .font("Helvetica")
    .fillColor("#333")
    .text(`${key}  `, { continued: true, width: 260 })
    .font("Helvetica-Bold")
    .fillColor("#000")
    .text(String(value), { width: 260, align: "right" });
}

function footer(doc: PDFKit.PDFDocument) {
  doc.moveDown(1.5);
  doc.moveTo(56, doc.y).lineTo(doc.page.width - 56, doc.y).strokeColor("#ccc").stroke();
  doc.moveDown(0.3);
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#777")
    .text(`Generated: ${new Date().toISOString()}`, { align: "center" });
  doc.text("Generated by With Megan Platform", { align: "center" });
}

// ── BTS report ──────────────────────────────────────────────────

async function buildBtsReport(doc: PDFKit.PDFDocument, cfg: (typeof SITES)[SiteKey], scope: ExportScope, scopeLabel: string) {
  // Scope applies at the guardian level; dependents and assignments follow.
  const allGuardians = await db.select().from(btsGuardians).where(isNull(btsGuardians.deletedAt));
  const guardians = allGuardians.filter((g) => inScope(g.address, scope));
  const guardianIds = guardians.map((g) => g.id);
  const dependents = guardianIds.length > 0
    ? await db.select().from(btsDependents).where(inArray(btsDependents.guardianId, guardianIds))
    : [];
  const dependentIds = dependents.map((d) => d.id);
  const assignments = dependentIds.length > 0
    ? await db.select().from(btsResourceAssignments).where(inArray(btsResourceAssignments.dependentId, dependentIds))
    : [];
  const inventory = await db.select().from(btsInventory);

  header(doc, cfg.name, cfg.eventDate, scopeLabel);

  // Summary stats
  sectionTitle(doc, "Summary");
  statLine(doc, "Total registrations (guardians)", guardians.length);
  statLine(doc, "Total dependents", dependents.length);
  statLine(doc, "Resource assignments tracked", assignments.length);
  const totalCollected = assignments.reduce((s, a) => s + a.quantityCollected, 0);
  const totalAssigned = assignments.reduce((s, a) => s + a.quantityAssigned, 0);
  statLine(doc, "Items assigned", totalAssigned);
  statLine(doc, "Items collected", totalCollected);
  statLine(doc, "Outstanding", Math.max(0, totalAssigned - totalCollected));

  // By community (guardian.address)
  sectionTitle(doc, "Registrations by Community");
  const communityCounts = new Map<string, number>();
  for (const g of guardians) {
    const c = g.address || "Unknown";
    communityCounts.set(c, (communityCounts.get(c) ?? 0) + 1);
  }
  if (communityCounts.size === 0) {
    doc.fontSize(11).font("Helvetica").fillColor("#555").text("No registrations recorded.");
  } else {
    for (const [community, n] of [...communityCounts.entries()].sort((a, b) => b[1] - a[1])) {
      kvRow(doc, community, n);
    }
  }

  // Dependents by grade level
  sectionTitle(doc, "Dependents by Grade Level");
  const gradeCounts = new Map<string, number>();
  for (const d of dependents) {
    const g = d.gradeLevel || "Unknown";
    gradeCounts.set(g, (gradeCounts.get(g) ?? 0) + 1);
  }
  if (gradeCounts.size === 0) {
    doc.fontSize(11).font("Helvetica").fillColor("#555").text("No dependents recorded.");
  } else {
    for (const [grade, n] of [...gradeCounts.entries()].sort((a, b) => b[1] - a[1])) {
      kvRow(doc, grade, n);
    }
  }

  // Schools represented
  sectionTitle(doc, "Schools Represented");
  const schoolCounts = new Map<string, number>();
  for (const d of dependents) {
    const s = d.schoolName || "Unknown";
    schoolCounts.set(s, (schoolCounts.get(s) ?? 0) + 1);
  }
  if (schoolCounts.size === 0) {
    doc.fontSize(11).font("Helvetica").fillColor("#555").text("No schools recorded.");
  } else {
    for (const [school, n] of [...schoolCounts.entries()].sort((a, b) => b[1] - a[1])) {
      kvRow(doc, school, n);
    }
  }

  footer(doc);
}

// ── MD report ───────────────────────────────────────────────────

async function buildMdReport(doc: PDFKit.PDFDocument, cfg: (typeof SITES)[SiteKey], scope: ExportScope, scopeLabel: string) {
  const allRegistrants = await db.select().from(mdRegistrants).where(isNull(mdRegistrants.deletedAt));
  const registrants = allRegistrants.filter((r) => inScope(r.address, scope));

  const redeemedN = registrants.filter((r) => r.redeemedAt !== null).length;
  const pendingN = registrants.length - redeemedN;
  const redemptionRate =
    registrants.length > 0 ? Math.round((redeemedN / registrants.length) * 100) : 0;

  header(doc, cfg.name, cfg.eventDate, scopeLabel);

  // Summary stats
  sectionTitle(doc, "Summary");
  statLine(doc, "Total registrations", registrants.length);
  statLine(doc, "Hampers collected", redeemedN);
  statLine(doc, "Pending collection", pendingN);
  statLine(doc, "Redemption rate", `${redemptionRate}%`);

  // By community (registrant.address)
  sectionTitle(doc, "Registrants by Community");
  const communityCounts = new Map<string, number>();
  for (const r of registrants) {
    const c = r.address || "Unknown";
    communityCounts.set(c, (communityCounts.get(c) ?? 0) + 1);
  }
  if (communityCounts.size === 0) {
    doc.fontSize(11).font("Helvetica").fillColor("#555").text("No registrants recorded.");
  } else {
    for (const [community, n] of [...communityCounts.entries()].sort((a, b) => b[1] - a[1])) {
      kvRow(doc, community, n);
    }
  }

  // Registrants by product category
  sectionTitle(doc, "Registrants by Product Category");
  const categoryCounts = new Map<string, number>();
  for (const r of registrants) {
    const c = r.productCategory || "Unspecified";
    categoryCounts.set(c, (categoryCounts.get(c) ?? 0) + 1);
  }
  if (categoryCounts.size === 0) {
    doc.fontSize(11).font("Helvetica").fillColor("#555").text("No product categories recorded.");
  } else {
    for (const [cat, n] of [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])) {
      kvRow(doc, cat, n);
    }
  }

  // Collection status breakdown
  sectionTitle(doc, "Collection Status Breakdown");
  const statusCounts = new Map<string, number>();
  for (const r of registrants) {
    const s = r.redeemedAt ? "collected" : "pending";
    statusCounts.set(s, (statusCounts.get(s) ?? 0) + 1);
  }
  if (statusCounts.size === 0) {
    doc.fontSize(11).font("Helvetica").fillColor("#555").text("No registrants recorded.");
  } else {
    for (const [status, n] of [...statusCounts.entries()].sort((a, b) => b[1] - a[1])) {
      kvRow(doc, status, n);
    }
  }

  footer(doc);
}

// ── CSV full-database sheets ───────────────────────────────────
// One row per dependent (BTS) / registrant (MD) with every field staff need
// to verify families physically on site and to report after the event.
// Deleted registrations are excluded — they are not part of the event.

async function buildBtsCsv(scope: ExportScope): Promise<string> {
  const guardians = (await db
    .select()
    .from(btsGuardians)
    .where(isNull(btsGuardians.deletedAt)))
    .filter((g) => inScope(g.address, scope));

  const guardianIds = guardians.map((g) => g.id);
  const dependents = guardianIds.length > 0
    ? await db.select().from(btsDependents).where(inArray(btsDependents.guardianId, guardianIds))
    : [];

  const dependentIds = dependents.map((d) => d.id);
  const assignments = dependentIds.length > 0
    ? await db.select().from(btsResourceAssignments).where(inArray(btsResourceAssignments.dependentId, dependentIds))
    : [];

  const assignmentText = new Map<string, string>();
  for (const a of assignments) {
    const current = assignmentText.get(a.dependentId) ?? "";
    const entry = `${a.itemName} x${a.quantityAssigned}`;
    assignmentText.set(a.dependentId, current ? `${current}; ${entry}` : entry);
  }

  const lines: string[] = [];
  lines.push(
    csvRow([
      "Application ID",
      "Parent/Guardian Name",
      "Phone",
      "Email",
      "Community",
      "Number of Children",
      "Child/Student Name",
      "School",
      "Grade or Form",
      "Request (items assigned)",
      "Notes",
      "Book List URL",
      "Collected Status",
      "Registered Date",
    ]),
  );

  for (const g of guardians) {
    const kids = dependents.filter((d) => d.guardianId === g.id);
    for (const d of kids) {
      lines.push(
        csvRow([
          g.thaId ?? "",
          g.fullName,
          g.contactNumber,
          g.email,
          g.address,
          kids.length,
          d.studentName,
          d.schoolName,
          d.gradeLevel,
          assignmentText.get(d.id) ?? "",
          d.notes ?? "",
          d.bookListUrl ?? "",
          "Collected",
          g.createdAt.toISOString().slice(0, 10),
        ]),
      );
    }
  }

  return lines.join("");
}

async function buildMdCsv(scope: ExportScope): Promise<string> {
  const registrants = (await db
    .select()
    .from(mdRegistrants)
    .where(isNull(mdRegistrants.deletedAt)))
    .filter((r) => inScope(r.address, scope));

  const lines: string[] = [];
  lines.push(
    csvRow([
      "Application ID",
      "Full Name",
      "National ID",
      "Date of Birth",
      "Community",
      "Phone",
      "Email",
      "Product Category",
      "Category Note",
      "Consent",
      "Status",
      "Registered Date",
      "Collected At",
    ]),
  );

  for (const r of registrants) {
    lines.push(
      csvRow([
        r.thaId ?? "",
        r.fullName,
        r.nationalId ?? "",
        r.dateOfBirth ?? "",
        r.address,
        r.phoneNumber,
        r.email ?? "",
        r.productCategory ?? "",
        r.productCategoryNote ?? "",
        r.consent ? "Given" : "Not given",
        r.redeemedAt ? "Collected" : "Pending",
        r.createdAt.toISOString().slice(0, 10),
        r.redeemedAt ? r.redeemedAt.toISOString() : "",
      ]),
    );
  }

  return lines.join("");
}