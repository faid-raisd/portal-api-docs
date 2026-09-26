#!/usr/bin/env python3
"""Validate published design-system pages, capture metadata and local links."""
from __future__ import annotations

import json
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

PAGES = ["index", "foundations", "shared-controls", "shared-patterns", "student-components"]


class References(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []
        self.images: list[tuple[str, str]] = []
        self.assets: list[str] = []
        self.ids: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"] or "")
        if tag == "a" and a.get("href"):
            self.links.append(a["href"] or "")
        if tag == "img":
            self.images.append((a.get("src") or "", a.get("alt") or ""))
        if tag == "link" and a.get("href"):
            self.assets.append(a["href"] or "")
        if tag == "script" and a.get("src"):
            self.assets.append(a["src"] or "")


def validate(root: Path) -> list[str]:
    folder = root / "design-system"
    errors: list[str] = []
    manifest = json.loads((folder / "captures.json").read_text(encoding="utf-8"))
    if not manifest.get("packageVersion") or not manifest.get("studentPortalCommit"):
        errors.append("capture provenance is incomplete")
    if len(manifest["items"]) < 45:
        errors.append("capture inventory is unexpectedly incomplete")
    seen: set[str] = set()
    parsed: dict[str, References] = {}
    for name in PAGES:
        file = folder / f"{name}.html"
        if not file.is_file():
            errors.append(f"missing page: {file}")
            continue
        parser = References()
        parser.feed(file.read_text(encoding="utf-8"))
        parsed[name] = parser
        if not parser.images and name != "index":
            errors.append(f"page has no component captures: {file}")
        for src, alt in parser.images:
            if not alt.strip():
                errors.append(f"image has no alt text: {file} {src}")
            target = (file.parent / unquote(urlsplit(src).path)).resolve()
            if not target.is_file():
                errors.append(f"missing image: {file} {src}")
        for href in parser.links + parser.assets:
            url = urlsplit(href)
            if url.scheme or url.netloc:
                continue
            target = (file.parent / unquote(url.path)).resolve() if url.path else file
            if target.is_dir():
                target /= "index.html"
            if not target.is_file() and target.parent == root / "sdd":
                # control-plane keeps generated SDD HTML under _pages/html;
                # portal-api-docs publishes those files at sdd/.
                target = root / "sdd" / "_pages" / "html" / target.name
                if target.name == "index.html":
                    target = root / "sdd" / "_pages" / "html" / "README.html"
            if not target.is_file():
                errors.append(f"broken link: {file} {href}")
            elif url.fragment and target.parent == folder and target.stem in PAGES:
                target_parser = parsed.get(target.stem)
                if target_parser is None:
                    target_parser = References()
                    target_parser.feed(target.read_text(encoding="utf-8"))
                if unquote(url.fragment) not in target_parser.ids:
                    errors.append(f"missing anchor: {file} {href}")
    for item in manifest["items"]:
        if item["id"] in seen:
            errors.append(f"duplicate capture id: {item['id']}")
        seen.add(item["id"])
        if item["page"] not in PAGES[1:]:
            errors.append(f"invalid capture page: {item['id']}")
        if item["owner"] not in ("shared", "student"):
            errors.append(f"invalid capture owner: {item['id']}")
        if item.get("viewport") not in ("phone", "tablet", "desktop") or not isinstance(item.get("width"), int):
            errors.append(f"invalid capture viewport: {item['id']}")
        if item["owner"] == "shared" and not item.get("packageVersion", manifest.get("packageVersion")):
            errors.append(f"missing package version: {item['id']}")
        if item["owner"] == "student" and not item.get("studentPortalCommit", manifest.get("studentPortalCommit")):
            errors.append(f"missing student source commit: {item['id']}")
        image = folder / item["image"]
        if not image.is_file():
            errors.append(f"missing capture: {image}")
        page = folder / f"{item['page']}.html"
        if page.is_file() and item["image"] not in page.read_text(encoding="utf-8"):
            errors.append(f"capture is not shown on its page: {item['id']}")
    return errors


if __name__ == "__main__":
    site_root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    problems = validate(site_root)
    if problems:
        print("\n".join(problems), file=sys.stderr)
        raise SystemExit(1)
    print(f"Design system pages and {len(json.loads((site_root / 'design-system' / 'captures.json').read_text())['items'])} captures OK")
