#!/usr/bin/env python3
"""Download free yoga pose videos from YouTube and save to videos/ folder."""
import subprocess, sys, os, time

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'videos')
os.makedirs(OUT_DIR, exist_ok=True)

POSES = [
    ('tadasana.mp4',               'tadasana mountain pose yoga tutorial short'),
    ('adho-mukha-svanasana.mp4',   'downward dog pose yoga tutorial short'),
    ('virabhadrasana-i.mp4',       'warrior 1 pose yoga tutorial short'),
    ('virabhadrasana-ii.mp4',      'warrior 2 pose yoga tutorial short'),
    ('vrksasana.mp4',              'tree pose vrksasana yoga tutorial short'),
    ('balasana.mp4',               'child pose balasana yoga tutorial short'),
    ('bhujangasana.mp4',           'cobra pose bhujangasana yoga tutorial short'),
    ('setu-bandhasana.mp4',        'bridge pose setu bandhasana yoga tutorial short'),
    ('paschimottanasana.mp4',      'seated forward bend yoga tutorial short'),
    ('ardha-matsyendrasana.mp4',   'seated spinal twist yoga tutorial short'),
    ('trikonasana.mp4',            'triangle pose trikonasana yoga tutorial short'),
    ('garudasana.mp4',             'eagle pose garudasana yoga tutorial short'),
    ('dhanurasana.mp4',            'bow pose dhanurasana yoga tutorial short'),
    ('ardha-chandrasana.mp4',      'half moon pose yoga tutorial short'),
    ('dolphin-pose.mp4',           'dolphin pose yoga tutorial short'),
    ('savasana.mp4',               'savasana corpse pose yoga tutorial short'),
]

def download(filename, query):
    out_path = os.path.join(OUT_DIR, filename)
    if os.path.exists(out_path) and os.path.getsize(out_path) > 10000:
        print(f'[SKIP] {filename} already exists')
        return True

    print(f'[DOWN] {filename} <- "{query}"')
    cmd = [
        'python3', '-m', 'yt_dlp',
        f'ytsearch1:{query}',
        '--format', 'bestvideo[ext=mp4][height<=480]+bestaudio[ext=m4a]/best[ext=mp4][height<=480]/best[height<=480]',
        '--merge-output-format', 'mp4',
        '--output', out_path,
        '--no-playlist',
        '--max-filesize', '50M',
        '--match-filter', '!is_live & duration < 300',
        '--quiet',
        '--no-warnings',
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode == 0 and os.path.exists(out_path):
        size = os.path.getsize(out_path) / 1024 / 1024
        print(f'  OK  {size:.1f} MB')
        return True
    else:
        print(f'  FAIL: {result.stderr[:200]}')
        return False

ok, fail = 0, 0
for fname, query in POSES:
    try:
        if download(fname, query):
            ok += 1
        else:
            fail += 1
    except Exception as e:
        print(f'  ERROR: {e}')
        fail += 1
    time.sleep(1)

print(f'\nDone: {ok} OK, {fail} failed')
