"""Run the library's tts_zh.py (edge-tts) trusting an extra CA bundle (TTS_CA env), for networks that re-sign TLS."""
import os, sys, runpy, certifi
ca = os.environ.get("TTS_CA")
if ca:
    certifi.where = lambda: ca
script = sys.argv[1]
sys.argv = sys.argv[1:]
runpy.run_path(script, run_name="__main__")
