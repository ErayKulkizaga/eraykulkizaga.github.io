"""Local static preview with single byte ranges for HTML video scrubbing."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import re

ROOT = Path(__file__).resolve().parents[1]


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        self.byte_range = None
        path = Path(self.translate_path(self.path))
        request = self.headers.get('Range')
        if not request or not path.is_file():
            return super().send_head()
        match = re.fullmatch(r'bytes=(\d*)-(\d*)', request)
        size = path.stat().st_size
        if not match or not any(match.groups()):
            self.send_error(400, 'Unsupported byte range')
            return None
        first, last = match.groups()
        start = int(first) if first else max(0, size - int(last))
        end = min(size - 1, int(last)) if first and last else size - 1
        if start > end or start >= size:
            self.send_response(416)
            self.send_header('Content-Range', f'bytes */{size}')
            self.send_header('Content-Length', '0')
            self.end_headers()
            return None
        file = path.open('rb')
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(str(path)))
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(end - start + 1))
        self.send_header('Last-Modified', self.date_time_string(path.stat().st_mtime))
        self.end_headers()
        file.seek(start)
        self.byte_range = end - start + 1
        return file

    def copyfile(self, source, outputfile):
        if self.byte_range is None:
            return super().copyfile(source, outputfile)
        remaining = self.byte_range
        try:
            while remaining:
                chunk = source.read(min(64 * 1024, remaining))
                if not chunk:
                    break
                outputfile.write(chunk)
                remaining -= len(chunk)
        except (BrokenPipeError, ConnectionResetError):
            pass  # Browser cancelled an obsolete seek.


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=4174)
    args = parser.parse_args()
    print(f'Portfolio preview: http://127.0.0.1:{args.port}', flush=True)
    ThreadingHTTPServer(('127.0.0.1', args.port), Handler).serve_forever()
