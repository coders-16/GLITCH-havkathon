#!/usr/bin/env python3
"""
The Last Light - Local Play Runner
Starts a local web server and opens the browser to play the game.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

def run():
    web_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(web_dir)

    Handler = http.server.SimpleHTTPRequestHandler
    
    # Allow port reuse
    socketserver.TCPServer.allow_reuse_address = True
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            url = f"http://localhost:{PORT}/index.html"
            print("=" * 60)
            print("  ⚡ THE LAST LIGHT - 100-Hour Indie Connect Game Jam")
            print("  ★ Theme 1: Comic | Theme 2: Twist | Theme 3: Light")
            print(f"  Server running at: {url}")
            print("=" * 60)
            print("Press Ctrl+C to stop the server.\n")
            
            webbrowser.open(url)
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped. Thanks for playing!")
    except Exception as e:
        print(f"Error starting server: {e}")

if __name__ == "__main__":
    run()
