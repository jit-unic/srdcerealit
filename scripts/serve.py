#!/usr/bin/env python3
"""Jednoduchý statický server pro lokální náhled webu.

Nepoužívá `python -m http.server`, protože jeho argparse volá os.getcwd()
ještě před startem, což v sandboxu náhledu selhává. Port bere z env PORT.
"""
import http.server
import os
import socketserver
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

PORT = int(os.environ.get("PORT", sys.argv[1] if len(sys.argv) > 1 else 8767))


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


class ReuseServer(socketserver.TCPServer):
    allow_reuse_address = True


with ReuseServer(("", PORT), Handler) as httpd:
    print(f"Serving {ROOT} at http://localhost:{PORT}", flush=True)
    httpd.serve_forever()
