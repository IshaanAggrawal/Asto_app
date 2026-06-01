"""
ephe_bootstrap.py
=================
Import this module FIRST in any entry point (main.py, runner.py, etc.)
before any other app or immanuel imports.

pyswisseph finds its ephemeris data via an internal path that is set
when the C extension is first loaded. The immanuel library ships its own
bundled .se1 files. This module tells pyswisseph to use those bundled files
so that no external ephe/ directory is needed on Windows or any platform.
"""
import os
import swisseph as swe
from immanuel.setup import settings

# Resolve to absolute path so it works regardless of working directory
_ephe_path = os.path.abspath(settings._file_path)

# Set via both mechanisms: Python API and OS env var (C extension reads both)
swe.set_ephe_path(_ephe_path)
os.environ["SE_EPHE_PATH"] = _ephe_path
