#!/usr/bin/env node

// src/templates/.claude/scripts/gallery-scan.ts
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
var VIDEO_DIR = path.resolve(process.cwd(), ".claude/video");
var MANIFEST_PATH = path.join(VIDEO_DIR, "manifest.json");
var DEMO_DIR = path.join(VIDEO_DIR, "demo");
var SURREAL_DIR = path.join(VIDEO_DIR, "surreal");
var DRY_RUN = process.argv.includes("--dry-run");
function getVideoDuration(videoPath) {
  try {
    const result = execSync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${videoPath}"`,
      { encoding: "utf-8", timeout: 1e4 }
    ).trim();
    return Math.round(parseFloat(result)) || 0;
  } catch {
    return 0;
  }
}
function generateThumbnail(videoPath, thumbPath) {
  try {
    execSync(
      `ffmpeg -y -i "${videoPath}" -vf "select=eq(n\\,90)" -vframes 1 -update 1 "${thumbPath}"`,
      { encoding: "utf-8", timeout: 3e4, stdio: "pipe" }
    );
    return fs.existsSync(thumbPath);
  } catch {
    return false;
  }
}
function idToTitle(id) {
  return id.replace(/^video-\d{8}-/, "").replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function getFileTimestamp(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.mtime.toISOString();
  } catch {
    return (/* @__PURE__ */ new Date()).toISOString();
  }
}
function scanDirectory(dir, type) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const runs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const id = entry.name;
    const videoPath = path.join(dir, id, "output.mp4");
    if (!fs.existsSync(videoPath)) continue;
    const relativeVideo = `${type}/${id}/output.mp4`;
    let thumbnailRel;
    const thumbPng = path.join(dir, id, "thumbnail.png");
    const thumbJpg = path.join(dir, id, "thumbnail.jpg");
    if (fs.existsSync(thumbPng)) {
      thumbnailRel = `${type}/${id}/thumbnail.png`;
    } else if (fs.existsSync(thumbJpg)) {
      thumbnailRel = `${type}/${id}/thumbnail.jpg`;
    } else {
      if (generateThumbnail(videoPath, thumbPng)) {
        thumbnailRel = `${type}/${id}/thumbnail.png`;
        console.log(`  [thumb] Generated thumbnail for ${id}`);
      }
    }
    const duration = getVideoDuration(videoPath);
    const timestamp = getFileTimestamp(videoPath);
    runs.push({
      id,
      type,
      timestamp,
      title: idToTitle(id),
      status: "complete",
      ...thumbnailRel && { thumbnail: thumbnailRel },
      video: relativeVideo,
      ...duration > 0 && { duration_seconds: duration },
      metadata: {
        resolution: "1920x1080"
      }
    });
  }
  return runs;
}
function main() {
  console.log("Gallery Scan" + (DRY_RUN ? " (dry run)" : ""));
  console.log("============");
  let manifest;
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
    } catch {
      console.error("Failed to parse manifest.json, creating fresh one.");
      manifest = { projectName: "unknown", runs: [] };
    }
  } else {
    console.log("No manifest.json found, creating new one.");
    manifest = { projectName: "unknown", runs: [] };
  }
  const existingIds = new Set(manifest.runs.map((r) => r.id));
  const demoRuns = scanDirectory(DEMO_DIR, "demo");
  const surrealRuns = scanDirectory(SURREAL_DIR, "surreal");
  const allScanned = [...demoRuns, ...surrealRuns];
  const newRuns = allScanned.filter((r) => !existingIds.has(r.id));
  if (newRuns.length === 0) {
    console.log(
      `
All ${allScanned.length} videos already in manifest. Nothing to add.`
    );
    return;
  }
  console.log(
    `
Found ${allScanned.length} videos on disk, ${newRuns.length} new:`
  );
  for (const run of newRuns) {
    const dur = run.duration_seconds ? ` (${Math.floor(run.duration_seconds / 60)}:${String(run.duration_seconds % 60).padStart(2, "0")})` : "";
    console.log(`  + [${run.type}] ${run.id}${dur}`);
  }
  if (DRY_RUN) {
    console.log("\nDry run \u2014 no changes written.");
    return;
  }
  manifest.runs = [...newRuns, ...manifest.runs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  console.log(
    `
Updated manifest.json: ${manifest.runs.length} total entries.`
  );
  console.log("Open .claude/video/gallery.html to view all videos.");
}
main();
