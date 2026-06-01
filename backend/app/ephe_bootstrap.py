import os
import swisseph as swe
from immanuel.setup import settings

# Dynamically resolve absolute path to bypass environment variable constraints.
_ephe_path = os.path.abspath(settings._file_path)

# Inject path into native C-extension memory.
swe.set_ephe_path(_ephe_path)
os.environ["SE_EPHE_PATH"] = _ephe_path
